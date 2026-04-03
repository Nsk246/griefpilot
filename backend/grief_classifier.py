import os
import json
import librosa
import numpy as np
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

GRIEF_SYSTEM = """You are a clinical grief analysis engine trained on Worden's Four Tasks of Mourning.
Analyze the utterance and return ONLY a raw JSON object — no markdown, no backticks, no explanation.

Stages:
- accepting_loss: grappling with the reality the person is gone
- working_through_pain: expressing emotional pain, crying, anger, despair  
- adjusting: describing changed routines, new roles, changed identity
- reinvesting: finding meaning, reconnecting with life, honoring memory
- shock: numbness, disbelief, feeling unreal

Return exactly this structure:
{"stage":"working_through_pain","intensity":3,"dominant_emotion":"sadness","memory_hint":null}"""

def extract_prosody(audio_bytes: bytes) -> dict:
    if not audio_bytes or len(audio_bytes) < 1000:
        return {"energy": 0.5, "speech_rate_proxy": 0.5}
    try:
        audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        if len(audio_np) < 512:
            return {"energy": 0.5, "speech_rate_proxy": 0.5}
        rms = float(np.sqrt(np.mean(audio_np ** 2)))
        zcr = float(np.mean(librosa.feature.zero_crossing_rate(audio_np)))
        return {"energy": min(rms * 10, 1.0), "speech_rate_proxy": min(zcr * 20, 1.0)}
    except Exception:
        return {"energy": 0.5, "speech_rate_proxy": 0.5}

def safe_parse_json(text: str) -> dict:
    """Try multiple strategies to extract JSON from model output."""
    text = text.strip()
    # Direct parse
    try:
        return json.loads(text)
    except Exception:
        pass
    # Strip markdown fences
    if "```" in text:
        text = text.split("```")[-2] if text.count("```") >= 2 else text.replace("```json","").replace("```","")
        try:
            return json.loads(text.strip())
        except Exception:
            pass
    # Find first { ... }
    try:
        start = text.index("{")
        end = text.rindex("}") + 1
        return json.loads(text[start:end])
    except Exception:
        pass
    return None

async def classify_grief(utterance: str, audio_bytes: bytes) -> dict:
    prosody = extract_prosody(audio_bytes)
    default = {"stage": "working_through_pain", "intensity": 3,
                "dominant_emotion": "sadness", "memory_hint": None}
    try:
        response = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=200,
            system=GRIEF_SYSTEM,
            messages=[{"role": "user", "content": utterance}],
        )
        raw = response.content[0].text
        semantic = safe_parse_json(raw)
        if not semantic:
            print(f"Could not parse classifier output: {repr(raw)}")
            semantic = default
    except Exception as e:
        print(f"Classifier API error: {e}")
        semantic = default

    fused = max(1, min(5, round(0.4 * prosody["energy"] * 5 + 0.6 * semantic.get("intensity", 3))))
    return {
        "stage": semantic.get("stage", "working_through_pain"),
        "intensity": fused,
        "dominant_emotion": semantic.get("dominant_emotion", "sadness"),
        "memory_hint": semantic.get("memory_hint"),
        "prosody": prosody,
    }
