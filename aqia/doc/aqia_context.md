# AQIA — Project Context & Reference
> *Last updated: May 2026 | Owner: ExplorerSoul/aqia-mate*
> *Live: https://aqia-mate.vercel.app | API: https://aqia-backend.onrender.com*

---

## What Is AQIA?

**AQIA (AI Qualified Interview Assistant)** is a web application that conducts AI-powered mock technical interviews. The user uploads their resume (PDF), picks an interview domain, and AQIA acts as a human interviewer — asking domain-relevant questions, listening to voice answers, and generating a detailed performance report with scores, strengths, weaknesses, and suggested model answers.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  FRONTEND  (React 19 + Vite 5) — Vercel              │
│                                                       │
│  /login        → AuthPage.jsx                        │
│  /             → Dashboard.jsx       (protected)     │
│  /setup        → Onboarding.jsx      (protected)     │
│  /interview    → InterviewFlow.jsx   (protected)     │
│  /review       → FinalReview.jsx     (protected)     │
└──────────────────────────────────────────────────────┘
           │  REST API (JWT Bearer token)
           ▼
┌──────────────────────────────────────────────────────┐
│  BACKEND  (FastAPI + Python) — Render.com            │
│                                                       │
│  POST /api/register    → Create user account         │
│  POST /api/login       → Login, return JWT           │
│  POST /api/chat        → Groq LLM proxy              │
│  POST /api/transcribe  → Groq Whisper proxy          │
│  GET  /api/dashboard   → Aggregated stats            │
│  POST /api/interviews  → Save completed interview    │
│  GET  /api/interviews  → List user's interviews      │
│  POST /google-tts      → Google Cloud TTS (mp3)      │
│  GET  /api/health      → Health probe                │
│  GET  /api/docs        → OpenAPI docs                │
└──────────────────────────────────────────────────────┘
           │
           ├── PostgreSQL (Neon) — users, sessions, Q&A
           ├── Redis (Upstash) — async job queue
           └── RQ Worker — runs inside same Render dyno
```

---

## File Map

| Path | Purpose |
|---|---|
| `src/App.jsx` | Router + PrivateRoute auth guard |
| `src/contexts/AuthContext.jsx` | JWT auth state |
| `src/components/AuthPage.jsx` | Login / Sign-up |
| `src/components/Dashboard.jsx` | Stats + history chart |
| `src/components/Onboarding.jsx` | Resume upload + domain setup |
| `src/components/InterviewFlow.jsx` | Live interview state machine |
| `src/components/FinalReview.jsx` | Post-interview report |
| `src/utils/AIservice.js` | Groq chat proxy client |
| `src/utils/promptBuilder.js` | System prompt + domain list |
| `src/utils/speech.js` | TTS + STT wrapper |
| `src/styles.css` | Global CSS (no Tailwind) |
| `server/main.py` | FastAPI app — all endpoints |
| `server/models.py` | SQLAlchemy ORM models |
| `server/database.py` | DB engine + session factory |
| `server/auth_utils.py` | bcrypt + JWT |
| `server/google_tts_service.py` | Google Cloud TTS (Chirp3-HD) |
| `server/jobs.py` | RQ background job definitions |
| `server/worker.py` | RQ worker entry point |
| `server/queue_client.py` | Redis/RQ client with sync fallback |
| `server/start.sh` | Render startup — uvicorn + worker |
| `server/migrations/` | Alembic DB migration scripts |
| `public/test/index.html` | Single-page system test dashboard |
| `render.yaml` | Render.com deployment config |
| `vercel.json` | Vercel SPA routing config |
| `vite.config.js` | Vite + dev proxy config |

---

## Environment Variables

### Frontend (`aqia/.env`) — local dev only
```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Backend (`aqia/server/.env`)
```
SECRET_KEY=<random string>
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
REDIS_URL=rediss://default:pass@xxx.upstash.io:6379
ALLOWED_ORIGINS=https://aqia-mate.vercel.app
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GROQ_API_KEY=gsk_...
```

> Groq API key is **server-side only** — never sent to the browser.

---

## Known Issues / Technical Debt

| # | Issue | Severity | Status |
|---|---|---|---|
| 1 | Groq API key exposed on client | 🔴 Critical | ✅ Fixed — server-side proxy |
| 2 | FinalReview broken `/dashboard` route | 🔴 Critical | ✅ Fixed |
| 3 | Onboarding UI unpolished | 🟡 High | ✅ Done |
| 4 | InterviewFlow Tailwind classes | 🟡 High | ✅ Fixed |
| 5 | CORS `allow_origins=["*"]` | 🟡 High | ✅ Fixed |
| 6 | SQLite in production | 🟡 High | ✅ Done — Neon PostgreSQL |
| 7 | No password validation | 🟠 Medium | ✅ Done |
| 8 | Loading state bare divs | 🟠 Medium | ✅ Fixed |
| 9 | Coqui TTS requires torch | 🟠 Medium | ✅ Graceful fallback |
| 10 | ProgressTracking unused | 🟢 Low | ⏳ Pending |
| 11 | FinalReview hover inline JS | 🟢 Low | ✅ Fixed |

---

## Pending Features

- [ ] Landing/hero page for non-logged-in visitors
- [ ] Interview history detail view (click past interview → see full Q&A)
- [ ] Download report as PDF
- [ ] User profile page (name, password change)
- [ ] Mobile responsive audit
- [ ] ProgressTracking weekly chart

---

## How to Run Locally

```bash
# Backend
cd aqia_web/aqia/server
venv/bin/python3 -m uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd aqia_web/aqia
npm run dev
# → http://localhost:5173

# System tests
# Open http://localhost:5173/test/ in browser
```

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://aqia-mate.vercel.app |
| Backend + Worker | Render | https://aqia-backend.onrender.com |
| Database | Neon | PostgreSQL |
| Queue | Upstash | Redis |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 5 |
| Routing | React Router v6 |
| Charts | Recharts |
| PDF parsing | pdfjs-dist v4 |
| AI / LLM | Groq — Llama-3.3-70b |
| STT | Browser SpeechRecognition + Groq Whisper |
| TTS | Google Cloud TTS Chirp3-HD → Browser fallback |
| Backend | FastAPI (Python 3.12) |
| ORM | SQLAlchemy 2.x + Alembic |
| Database | PostgreSQL (Neon) |
| Queue | RQ + Upstash Redis |
| Auth | bcrypt + JWT (python-jose) |
