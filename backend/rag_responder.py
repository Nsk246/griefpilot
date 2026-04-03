import os
import hashlib
import numpy as np
import faiss
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

COMPANION_SYSTEM = """You are a quiet, deeply present grief companion sitting beside someone who has lost someone they loved.

Your voice is warm, unhurried, and specific — not clinical, not cheerful, not therapeutic.
You speak the way a trusted friend who has also known grief would speak: plainly, without rushing to fix anything.

How you respond:
- Receive what was just said fully. Name something *specific* from what they shared — not a vague summary.
- Let the weight of what they said land before you say anything. Grief is not a problem to solve.
- Sometimes the most powerful thing is simple witness: "That's a lot to carry." or "Of course you miss that."
- If you ask a question, it is one quiet question about something they actually mentioned. Never a generic opener.
- You do not always need to ask a question. Sometimes presence is enough.
- 1–3 sentences only. Never more. Shorter is almost always better.

What you never say:
- "I hear you" as an opener
- "It sounds like..." / "It seems like..."
- "It's okay to feel..." / "Your feelings are valid"
- "Grief is a journey" or any grief cliché
- "They would want you to..."
- Any advice, suggestion, or reframe
- Anything that minimizes, redirects, or problem-solves

You do not perform empathy. You are simply present with what was shared.
Respond directly to the specific thing they just said — the image, the memory, the moment, the absence."""

def _embed(text: str) -> list:
    h = hashlib.sha256(text.encode()).digest()
    vec = [(b / 255.0) * 2 - 1 for b in h]
    vec = vec * (1536 // len(vec) + 1)
    return vec[:1536]

class RagResponder:
    def __init__(self):
        self.chunks = []
        self.index = faiss.IndexFlatL2(1536)

    async def build_index(self):
        corpus_path = os.path.join(os.path.dirname(__file__), "data", "corpus.txt")
        with open(corpus_path, "r") as f:
            text = f.read()
        self.chunks = [c.strip() for c in text.split("\n\n") if len(c.strip()) > 80]
        if self.chunks:
            vecs = np.array([_embed(c) for c in self.chunks], dtype=np.float32)
            self.index.add(vecs)
        print(f"Indexed {len(self.chunks)} corpus chunks")

    def _retrieve(self, query: str, k: int = 3) -> list:
        if not self.chunks:
            return []
        q = np.array([_embed(query)], dtype=np.float32)
        _, idx = self.index.search(q, min(k, len(self.chunks)))
        return [self.chunks[i] for i in idx[0] if i < len(self.chunks)]

    async def respond(self, utterance: str, grief_state: dict, history: list) -> str:
        retrieved = self._retrieve(utterance)
        context = "\n\n".join(retrieved)
        stage_note = f"[Stage: {grief_state.get('stage','unknown')}, intensity {grief_state.get('intensity',3)}/5]"
        messages = history[-6:] + [{"role": "user",
            "content": f"{stage_note}\n\nResearch context:\n{context}\n\nUser said: {utterance}"}]
        try:
            response = await client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=150,
                system=COMPANION_SYSTEM,
                messages=messages,
            )
            return response.content[0].text.strip()
        except Exception as e:
            print(f"RAG error: {e}")
            return "I hear you. Can you tell me more about that?"
