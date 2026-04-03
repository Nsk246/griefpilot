import os, json, asyncio
import assemblyai as aai
from assemblyai.streaming.v3 import (
    StreamingClient, StreamingClientOptions,
    StreamingEvents, StreamingParameters, TurnEvent,
)
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import threading

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from grief_classifier import classify_grief
from memory_store import MemoryStore
from rag_responder import RagResponder
from letter_composer import compose_letter
from crisis_detector import is_crisis

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
rag = RagResponder()
aai.settings.api_key = os.environ["ASSEMBLYAI_API_KEY"]

@app.on_event("startup")
async def startup():
    await rag.build_index()
    print("RAG index ready")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.websocket("/ws/session")
async def session_ws(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")

    session_memory = MemoryStore()
    conversation_history = []
    loop = asyncio.get_event_loop()
    transcript_queue = asyncio.Queue()
    aai_ready = asyncio.Event()
    stop_event = threading.Event()

    client = StreamingClient(
        StreamingClientOptions(api_key=os.environ["ASSEMBLYAI_API_KEY"])
    )

    def on_begin(c, event):
        print(f"AAI open: {getattr(event, 'id', '?')}")
        loop.call_soon_threadsafe(aai_ready.set)

    def on_turn(c, event: TurnEvent):
        if stop_event.is_set():
            return
        text = event.transcript.strip()
        if not text:
            return
        if event.end_of_turn:
            print(f"Final: {text}")
            asyncio.run_coroutine_threadsafe(transcript_queue.put(text), loop)
        else:
            asyncio.run_coroutine_threadsafe(
                websocket.send_json({"type": "partial", "text": text}), loop
            )

    def on_error(c, error):
        print(f"AAI error: {error}")
        stop_event.set()
        loop.call_soon_threadsafe(aai_ready.set)

    def on_termination(c, event=None):
        print("AAI terminated")
        stop_event.set()

    client.on(StreamingEvents.Begin, on_begin)
    client.on(StreamingEvents.Turn, on_turn)
    client.on(StreamingEvents.Error, on_error)
    client.on(StreamingEvents.Termination, on_termination)

    params = StreamingParameters(
        sample_rate=16000,
        encoding="pcm_s16le",
        speech_model="universal-streaming-english",
        format_turns=True,
        min_turn_silence=300,
        max_turn_silence=1200,
    )

    # Run AAI in executor thread — non-blocking
    def run_aai():
        print("AAI thread starting connect...")
        try:
            client.connect(params)
            print("AAI connect returned")
            stop_event.wait()  # block until on_termination or on_error sets it
        except Exception as e:
            if "disconnect" not in str(e).lower():
                print(f"AAI thread: {e}")
        finally:
            stop_event.set()
            loop.call_soon_threadsafe(aai_ready.set)
            try:
                client.disconnect(terminate=True)
            except Exception:
                pass
            print("AAI thread done")

    aai_thread = threading.Thread(target=run_aai, daemon=True)
    aai_thread.start()

    try:
        await asyncio.wait_for(aai_ready.wait(), timeout=15)
        print("AAI ready")
    except asyncio.TimeoutError:
        print("AAI timeout")

    async def processor():
        while not stop_event.is_set():
            try:
                sentence = await asyncio.wait_for(
                    transcript_queue.get(), timeout=1.0
                )
                print(f"Processing: {sentence}")

                crisis_flag, grief_state, memory = await asyncio.gather(
                    is_crisis(sentence),
                    classify_grief(sentence, b""),
                    session_memory.extract_and_store(sentence),
                )

                if crisis_flag:
                    await websocket.send_json({"type": "crisis_override"})
                    return

                response = await rag.respond(
                    sentence, grief_state, conversation_history
                )
                conversation_history.append({"role": "user", "content": sentence})
                conversation_history.append({"role": "assistant", "content": response})
                if len(conversation_history) > 12:
                    conversation_history.pop(0)
                    conversation_history.pop(0)

                await websocket.send_json({
                    "type": "turn",
                    "transcript": sentence,
                    "grief_state": grief_state,
                    "memory": memory,
                    "response": response,
                    "nodes": session_memory.get_nodes(),
                })
                print("Response sent.")

            except asyncio.TimeoutError:
                continue
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"Processor error: {e}")

    proc_task = asyncio.create_task(processor())

    try:
        while True:
            data = await websocket.receive()
            if "bytes" in data:
                if not stop_event.is_set():
                    try:
                        client.stream(data["bytes"])
                    except Exception:
                        pass
            elif "text" in data:
                msg = json.loads(data["text"])
                if msg.get("type") == "end_session":
                    await asyncio.sleep(1)
                    letter = await compose_letter(session_memory.get_memories())
                    await websocket.send_json({"type": "letter", "text": letter})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        if "disconnect" not in str(e).lower():
            print(f"WS error: {e}")
    finally:
        stop_event.set()
        proc_task.cancel()
        print("Session ended cleanly")
