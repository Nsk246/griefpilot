# HearMe

> A voice-first emotional companion that listens without judgment, reflects what you carry, and helps you feel less alone.

HearMe is a real-time AI-powered emotional support companion. You speak and it listens, understands, and responds like a present, caring friend. No advice. No platitudes. Just genuine presence.

---

## What it does

- **Listens to you speak** in real time via microphone
- **Understands your emotional state** using a dual-signal classifier (prosody + semantic analysis)
- **Responds warmly** with short, specific reflections grounded in wellbeing research
- **Builds a memory constellation** — a live D3 force graph of the emotional fragments you share, growing as you speak
- **Detects crisis signals** on every utterance and surfaces emergency resources immediately if needed
- **Closes each session with a letter** — a short, specific reflection written from what you actually shared

---

## Tech stack

### Backend
| Layer | Technology |
|---|---|
| Web framework | FastAPI + Uvicorn |
| WebSocket server | FastAPI native WebSocket |
| Speech-to-text | AssemblyAI Universal Streaming (real-time, PCM16, 300ms latency) |
| Language model | Anthropic Claude claude-sonnet-4-6 |
| RAG corpus | FAISS in-memory vector index |
| Embeddings | SHA-256 pseudo-embedding (demo) |
| Grief/emotion classifier | Claude claude-sonnet-4-6 with structured JSON output |
| Memory extraction | Claude claude-sonnet-4-6 with structured JSON output |
| Crisis detection | Claude claude-sonnet-4-6 binary classifier |
| Letter composer | Claude claude-sonnet-4-6 |
| Language | Python 3.12 |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Audio capture | Web Audio API (ScriptProcessorNode → PCM16 at 16kHz) |
| Data visualization | D3.js v7 (force-directed memory constellation) |
| WebSocket client | Native browser WebSocket |

### Infrastructure
| Layer | Technology |
|---|---|
| Development environment | GitHub Codespaces |
| Backend deployment | Uvicorn (local / Railway) |
| Frontend deployment | Vite dev server (local / Vercel) |

---

## APIs used

| API | Purpose | Pricing |
|---|---|---|
| **Anthropic Claude claude-sonnet-4-6** | Emotion classification, RAG responses, memory extraction, crisis detection, letter composition | Pay per token |
| **AssemblyAI Universal Streaming** | Real-time speech-to-text at ~300ms latency | Per minute of audio |
| **Groq Whisper** (fallback) | Batch audio transcription | Free tier available |

---

## System architecture

```
Browser mic
    │
    │ PCM16 audio @ 16kHz
    ▼
FastAPI WebSocket (/ws/session)
    │
    ├── AssemblyAI Streaming ──► Final transcript
    │                               │
    │              ┌────────────────┼────────────────┐
    │              ▼                ▼                ▼
    │         Crisis check    Grief classifier   Memory extractor
    │         (Claude)        (Claude + prosody)  (Claude)
    │              │                │                │
    │              │           Grief state       Memory nodes
    │              │                │                │
    │              └────────────────┼────────────────┘
    │                               ▼
    │                      RAG Responder
    │                      (Claude + FAISS corpus)
    │                               │
    │                          Response text
    │                               │
    ▼                               ▼
Frontend ◄──────────────── WebSocket JSON event
    │
    ├── Transcript display
    ├── Grief compass (radial stage indicator)
    ├── Memory constellation (D3 force graph)
    └── Session end → Letter composer (Claude)
```

---

## Key features

### Real-time emotion classification
Every utterance is analyzed across two independent signals:
- **Prosodic features** — energy, zero-crossing rate, spectral centroid extracted via librosa
- **Semantic classification** — Claude maps the utterance to Worden's Four Tasks of Mourning + broader emotional states

The two signals are fused with a weighted average (40% prosody, 60% semantic) to produce a final emotional intensity score.

### RAG-grounded responses
Responses are grounded in a curated corpus of peer-reviewed grief and emotional wellbeing research (Worden, Kübler-Ross, Klass et al.). The corpus is embedded at startup into a FAISS index. Each response retrieves the 3 most relevant passages before generating.

### Memory constellation
As you speak, named memory fragments are extracted and rendered as a live D3 force-directed graph. Nodes are sized by emotional weight, colored by emotion family, and connected by thematic similarity. The constellation grows in real time as new memories arrive.

### Crisis safety layer
A parallel Claude classifier runs on every single utterance — independently of the main response pipeline. If crisis indicators are detected, the normal response is discarded and hardcoded emergency resources are displayed. The session ends. No AI response is shown in crisis mode.

### Closing letter
At session end, all extracted memories are passed to a final Claude call that writes a 3-4 sentence closing reflection. If the person shared grief about someone who died, it reads as a gentle letter from that person. If the person shared their own pain (depression, loneliness, breakup), it reads as a warm reflection honoring their courage in speaking.

---

## Safety design

| Layer | Implementation |
|---|---|
| Informed consent | Onboarding modal — cannot be dismissed without checkbox confirmation |
| Crisis detection | Parallel Claude classifier on every utterance, hardcoded override |
| No data storage | Audio never stored. Transcripts held in memory only, wiped on session end |
| Persistent footer | Crisis resources visible throughout every session |
| Not-therapy framing | Explicit in UI, disclaimer, and checkbox |

---

## Project structure

```
hearme/
├── backend/
│   ├── main.py                 # FastAPI app, WebSocket session handler
│   ├── grief_classifier.py     # Dual-signal emotion classifier
│   ├── memory_store.py         # FAISS memory graph
│   ├── rag_responder.py        # Claude RAG response chain
│   ├── letter_composer.py      # Closing letter generator
│   ├── crisis_detector.py      # Safety override classifier
│   ├── data/corpus.txt         # Wellbeing research corpus
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx             # Main layout + session flow
    │   ├── hooks/useSession.js # WebSocket + audio capture
    │   └── components/
    │       ├── Disclaimer.jsx      # Consent gate
    │       ├── GriefCompass.jsx    # Radial emotion indicator
    │       ├── Constellation.jsx   # D3 memory force graph
    │       ├── TheLetter.jsx       # Closing letter overlay
    │       └── CrisisCard.jsx      # Safety override UI
    ├── package.json
    └── vite.config.js
```

---

## Running locally

### Prerequisites
- Python 3.12+
- Node.js 18+
- Anthropic API key
- AssemblyAI API key

### Backend
```bash
cd backend
pip install -r requirements.txt
# Add keys to .env:
# ANTHROPIC_API_KEY=sk-ant-...
# ASSEMBLYAI_API_KEY=...
uvicorn main:app --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` (or the Codespaces forwarded URL).

---

