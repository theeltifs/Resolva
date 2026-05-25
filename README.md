# Resolva — AI Customer Support Agent

Confidence-based AI support with automatic human escalation. Built on a 100% free stack for portfolio/demo use.

## Stack

| Layer | Tool |
|-------|------|
| LLM | Groq (LLaMA 3.1 70B) — 14,400 req/day free |
| Embeddings | sentence-transformers (local, CPU) |
| Vector DB | ChromaDB (local persistent) |
| Agent | LangGraph 0.3.x |
| Backend | FastAPI + SQLAlchemy + SQLite |
| Email | Resend.com (3,000/month free) |
| Frontend | React + Vite |

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

cp .env.example .env
# Edit .env — set GROQ_API_KEY at minimum

uvicorn main:app --reload
```

Backend runs at http://localhost:8000  
API docs at http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

### 3. Ingest your knowledge base

In the app, go to **Upload KB** tab:
- Set Company ID (e.g. `my-company`)
- Set API Key (matches `UPLOAD_API_KEY` in .env)
- Upload a `.pdf` or `.txt` file

Or via curl:
```bash
curl -X POST "http://localhost:8000/upload?company_id=my-company" \
  -H "x-api-key: your-upload-key" \
  -F "file=@docs/faq.pdf"
```

### 4. Chat

In the app, go to **Chat** tab:
- Set Company ID to match what you uploaded
- Ask questions — confident answers go through, low-confidence ones escalate

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | ✅ | — | Get free at groq.com |
| `RESEND_API_KEY` | ❌ | — | For escalation emails |
| `HUMAN_AGENT_EMAIL` | ❌ | — | Who gets escalation emails |
| `UPLOAD_API_KEY` | ✅ | changeme | Protects the upload endpoint |
| `CONFIDENCE_THRESHOLD` | ❌ | 0.65 | 0.0–1.0, higher = more escalations |
| `DATABASE_URL` | ❌ | sqlite:///./resolva.db | SQLAlchemy URL |
| `CHROMA_DB_PATH` | ❌ | ./chroma_db | Vector store path |
| `MAX_UPLOAD_SIZE_MB` | ❌ | 10 | Max upload file size |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/chat` | Send a message, get AI response |
| POST | `/upload` | Upload knowledge base document |
| GET | `/tickets` | List escalated tickets |
| PATCH | `/tickets/{id}/resolve` | Mark ticket resolved |
| GET | `/analytics` | Get stats (total, escalated, avg confidence) |
| GET | `/health` | Health check |

## Deployment Note

> **Warning:** Railway/Render free tier has ephemeral storage. ChromaDB and SQLite data resets on every restart. For persistence without cost, use [Chroma Cloud](https://trychroma.com) free tier and swap `PersistentClient` for `HttpClient` in `backend/rag/embedder.py`.

## How Escalation Works

```
User message
    ↓
Retrieve top-4 docs from ChromaDB
    ↓
Generate answer with Groq LLaMA 3.1
    ↓
Calculate confidence score (0.0–1.0)
    ├── score >= 0.65 → Return answer directly
    └── score < 0.65  → Wrap answer + create ticket + send email
```

Confidence is calculated from:
- Semantic similarity between answer and retrieved docs (50%)
- Semantic relevance between answer and original query (30%)
- Number of docs retrieved (20%)
