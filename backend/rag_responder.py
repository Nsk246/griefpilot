import os
import hashlib
import numpy as np
import faiss
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

COMPANION_SYSTEM = """You are GriefPilot — a grief companion, not a therapist.
Rules:
- NEVER give advice or tell the person what to do
- NEVER use platitudes
- DO reflect back what you hear with warmth and specificity
- DO ask one gentle open question at the end — never more than one
- Keep responses to 2-3 sentences maximum
- Speak as a present, caring human companion"""

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
