import os
import json
import hashlib
import numpy as np
import faiss
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

EMOTION_COLORS = {
    "sadness": "#AFA9EC", "longing": "#C4A5E8", "grief": "#9B8FD4",
    "love": "#F4C0D1", "joy": "#5DCAA5", "gratitude": "#9FE1CB",
    "regret": "#B4B2A9", "anger": "#F0997B", "guilt": "#FAC775", "peace": "#85B7EB",
}

MEMORY_SYSTEM = """Extract memory fragments from the utterance.
Return ONLY valid JSON:
{"memories":[{"text":"<max 8 words>","emotion":"<word>","weight":<1-5>}]}
If no memory present return {"memories":[]}"""

def _embed(text: str) -> list:
    h = hashlib.sha256(text.encode()).digest()
    vec = [(b / 255.0) * 2 - 1 for b in h]
    vec = vec * (1536 // len(vec) + 1)
    return vec[:1536]

class MemoryStore:
    def __init__(self):
        self.memories = []
        self.index = faiss.IndexFlatL2(1536)

    async def extract_and_store(self, utterance: str) -> list:
        try:
            response = await client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=300,
                system=MEMORY_SYSTEM,
                messages=[{"role": "user", "content": utterance}],
            )
            result = json.loads(response.content[0].text)
            new_memories = result.get("memories", [])
        except Exception as e:
            print(f"Memory extract error: {e}")
            new_memories = []

        for mem in new_memories:
            self.memories.append(mem)
            vec = np.array([_embed(mem["text"])], dtype=np.float32)
            self.index.add(vec)

        return new_memories

    def get_memories(self) -> list:
        return self.memories

    def get_nodes(self) -> list:
        nodes = []
        for i, mem in enumerate(self.memories):
            color = EMOTION_COLORS.get(mem["emotion"].lower(), "#888780")
            nodes.append({"id": i, "text": mem["text"], "emotion": mem["emotion"],
                          "weight": mem["weight"], "color": color})
        return nodes
