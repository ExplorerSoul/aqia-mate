# AQIA — Project Context & Launch Checklist
> *Last updated: May 2026 | Owner: ExplorerSoul/aqia-mate*

---

## 🧠 What Is AQIA?

**AQIA (AI Qualified Interview Assistant)** is a web application that conducts AI-powered mock technical interviews. The user uploads their resume (PDF), picks an interview domain, and AQIA acts as a human interviewer — asking domain-relevant questions, listening to voice answers, and at the end generating a detailed performance report with scores, strengths, weaknesses, and suggested model answers.

**Target users:** Job seekers, students, and professionals who want to practice technical interviews.

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│  FRONTEND  (React 19 + Vite 5)                        │
│  Served as: Static site or via FastAPI static mount   │
│                                                       │
│  /login        → AuthPage.jsx                        │
│  /             → Dashboard.jsx       (protected)     │
│  /setup        → Onboarding.jsx      (protected)     │
│  /interview    → InterviewFlow.jsx   (protected)     │
│  /review       → FinalReview.jsx     (protected)     │
└──────────────────────────────────────────────────────┘
           │  REST API calls (JWT Bearer token)
           ▼
┌──────────────────────────────────────────────────────┐
│  BACKEND  (FastAPI + Python)                          │
│  server/main.py  — runs on port 8000                 │
│                                                       │
│  POST /api/register  → Create user account           │
│  POST /api/login     → Login, return JWT             │
│  GET  /api/dashboard → Aggregated stats for user     │
│  POST /api/interviews → Save a completed interview   │
│  GET  /api/interviews → List user's interviews       │
│  POST /google-tts    → Google Cloud TTS (mp3)        │
│  POST /tts           → Coqui TTS fallback (wav)      │
│  GET  /api/health    → Health probe                  │
└──────────────────────────────────────────────────────┘
           │  SQLAlchemy ORM
           ▼
┌──────────────────────────────────────────────────────┐
│  DATABASE: PostgreSQL (Neon) — dev falls back to SQLite│
│  Tables: users, interview_sessions, question_history, │
│          analytics_scores, progress_tracking          │
└──────────────────────────────────────────────────────┘
           │  External APIs
           ▼
   Groq API (Llama-3.3-70b) — question generation & review
   Google Cloud TTS          — voice synthesis (primary)
   Coqui TTS (local)         — voice synthesis (fallback, requires torch)
   Browser SpeechRecognition — speech-to-text (STT)
```

---

## 📁 File Map

| Path | Purpose |
|---|---|
| `aqia/src/App.jsx` | Router + route protection (`PrivateRoute`) |
| `aqia/src/contexts/AuthContext.jsx` | JWT auth state (login / register / logout) |
| `aqia/src/components/AuthPage.jsx` | Login / Sign-up form UI |
| `aqia/src/components/Dashboard.jsx` | Home screen with stats + history chart |
| `aqia/src/components/Onboarding.jsx` | Resume upload, domain & question count setup |
| `aqia/src/components/InterviewFlow.jsx` | The live interview state machine |
| `aqia/src/components/FinalReview.jsx` | Post-interview detailed report |
| `aqia/src/utils/AIservice.js` | Groq API wrapper, conversation history |
| `aqia/src/utils/promptBuilder.js` | System prompt generator, domain list |
| `aqia/src/utils/speech.js` | Browser TTS + STT wrapper |
| `aqia/src/styles.css` | Global styles (all CSS — no Tailwind) |
| `aqia/server/main.py` | FastAPI app — all endpoints |
| `aqia/server/models.py` | SQLAlchemy ORM models |
| `aqia/server/database.py` | DB engine & session factory |
| `aqia/server/auth_utils.py` | bcrypt hashing + JWT creation |
| `aqia/server/google_tts_service.py` | Google Cloud TTS integration |
| `aqia/server/tts_service.py` | Coqui TTS integration (requires torch) |
| `aqia/server/jobs.py` | RQ job definitions for async tasks |
| `aqia/server/worker.py` | RQ worker entry point |
| `aqia/server/queue_client.py` | Upstash Redis / RQ queue client |
| `aqia/server/migrations/` | Alembic DB migration scripts |
| `aqia/render.yaml` | Render.com deployment config |
| `aqia/Dockerfile` | Docker build (monolith: Vite build + FastAPI) |
| `aqia/cloudbuild.yaml` | GCP Cloud Build CI/CD config |
| `aqia/test/test_backend.html` | Backend API connection tests (auth, dashboard, TTS) |
| `aqia/test/test_browser_tts.html` | Browser Web Speech TTS test |
| `aqia/test/test_stt.html` | Groq Whisper STT test |
| `aqia/test/test_tts.html` | Local backend TTS endpoint test |
| `aqia/test/review_snippet.html` | Static FinalReview UI preview |

---

## 🔄 User Flow (Step by Step)

```
1. User lands on /login
   → Registers or logs in
   → JWT stored in localStorage

2. Redirected to / (Dashboard)
   → Stats fetched from GET /api/dashboard
   → Shows: Total Interviews, Highest Score, Avg Score
   → Progress line chart + recent interview history

3. User clicks "New Interview"
   → Goes to /setup (Onboarding)
   → Uploads resume PDF (parsed client-side via pdfjs)
   → Picks a domain (Frontend, Backend, Data Science, etc.)
   → Sets number of questions (3–20, default 8)

4. Goes to /interview (InterviewFlow)
   → Groq Llama-3.3 generates questions from resume + domain
   → AI reads question aloud (Google TTS → Browser TTS fallback)
   → User answers by voice (browser SpeechRecognition) or text
   → Loop repeats for N questions
   → Speech metrics tracked: WPM, filler word count

5. After last question → /review (FinalReview)
   → Groq generates JSON report: scores (0–100), summary,
     strengths, weaknesses, per-question feedback + suggested answers
   → Report saved to DB via POST /api/interviews
   → User clicks "Go to Dashboard" → navigates to / (Dashboard)
```

---

## 🔑 Environment Variables

### Frontend (`aqia/.env`)
```
VITE_API_BASE_URL=http://127.0.0.1:8000      # Backend URL
```

### Backend (`aqia/server/.env`)
```
SECRET_KEY=your_jwt_secret
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/aqia?sslmode=require
REDIS_URL=rediss://default:password@your-upstash-endpoint:6380
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GROQ_API_KEY=gsk_...          # Server-side only — never sent to browser
```

---

## 🐛 Known Issues / Technical Debt

| # | Issue | Severity | Status | Location |
|---|---|---|---|---|
| 1 | **Groq API key exposed on client side** | 🔴 Critical | ⏳ Pending | `Onboarding.jsx`, `AIservice.js` |
| 2 | **FinalReview "Go to Dashboard" broken route** `/dashboard` → `/` | 🔴 Critical | ✅ Fixed | `FinalReview.jsx` |
| 3 | **Onboarding UI unpolished** — bare HTML inputs | 🟡 High | ✅ Done | `Onboarding.jsx` |
| 4 | **InterviewFlow Tailwind classes** — Tailwind not installed | 🟡 High | ✅ Fixed | `InterviewFlow.jsx` |
| 5 | **CORS `allow_origins=["*"]`** — unsafe for production | 🟡 High | ✅ Fixed (env-driven) | `server/main.py` |
| 6 | **SQLite in production** — not suitable for multi-user | 🟡 High | ✅ Done (Neon PostgreSQL) | `server/database.py` |
| 7 | **No password strength validation** on register | 🟠 Medium | ✅ Done | `AuthPage.jsx` |
| 8 | **Loading state bare divs** — no spinner | 🟠 Medium | ✅ Fixed | `App.jsx` |
| 9 | **Coqui TTS requires torch** — disabled when torch missing | 🟠 Medium | ✅ Handled gracefully | `server/main.py` |
| 10 | **ProgressTracking model** defined but never used | 🟢 Low | ⏳ Pending | `models.py` |
| 11 | **FinalReview button hover** uses inline JS instead of CSS | 🟢 Low | ✅ Done | `FinalReview.jsx` |

---

## 🚀 What's Left To Launch

### 🔴 CRITICAL — Must Fix Before Any Users

- [ ] **Move Groq API calls to backend** — create a `POST /api/chat` endpoint in FastAPI that proxies to Groq, so the API key never touches the browser. Update `AIservice.js` to call this endpoint.

---

### 🟡 IMPORTANT — Needed for a Good User Experience

- [ ] **Restyle `Onboarding.jsx`** — add `Onboarding.css` with the same glassmorphism/dark-mode design language as the rest of the app.

- [ ] **Add a public landing page** — hero page at `/` for non-logged-in users explaining the product before sign-up.

- [ ] **Upgrade SQLite → PostgreSQL** for any hosted/cloud deployment. Update `DATABASE_URL` and `requirements.txt` (add `psycopg2-binary`).

- [ ] **Add email + password validation** on the sign-up form (min password length, email format feedback).

- [ ] **Error handling UX** — replace `alert()` in `InterviewFlow` with toast notifications or inline error UI.

---

### 🟠 POLISH — For a Great Launch

- [ ] **Dark mode / responsive design audit** — test on mobile, tablet.

- [ ] **Add a "loading" skeleton** to the Dashboard while `fetchDashboard` is pending.

- [ ] **User profile page** — show name, account creation date, ability to change password.

- [ ] **Implement `ProgressTracking` table** — currently in schema but unused.

- [ ] **Interview history detail view** — clicking a past interview shows its full Q&A review.

- [ ] **"Download Report as PDF" button** in `FinalReview.jsx`.

- [ ] **Microphone permission UX** — guide user if mic access is denied.

- [ ] **SEO & meta tags** in `index.html`.

---

## 🧪 Testing Without LLM Tokens

To test the app without consuming Groq API tokens, use the standalone HTML test files in `aqia/test/`:

| File | What it tests |
|---|---|
| `test/test_backend.html` | All backend API endpoints: health, register, login, dashboard, Google TTS, interviews |
| `test/test_browser_tts.html` | Browser Web Speech API (no backend needed) |
| `test/test_stt.html` | Groq Whisper STT (uses mic + Groq API — minimal tokens) |
| `test/test_tts.html` | Local backend `/tts` endpoint (Coqui TTS) |
| `test/review_snippet.html` | Static preview of FinalReview UI layout |

Open any of these directly in a browser — no build step needed.

---

## 🛠️ How to Run Locally

### Backend
```bash
cd aqia_web/aqia/server
venv/bin/python3 -m uvicorn main:app --reload --port 8000
```

### Background Worker (RQ)
```bash
cd aqia_web/aqia/server
venv/bin/python3 worker.py
```

### Frontend
```bash
cd aqia_web/aqia
npm run dev
# Opens at http://localhost:5173
```

### Reset Database
Delete `aqia_web/aqia/server/aqia_data.db` and restart the backend — it auto-recreates all tables.

---

## ☁️ Deployment Options

| Platform | Config File | Status |
|---|---|---|
| **Render.com** | `render.yaml` | Configured (separate frontend static + backend web service) |
| **Google Cloud Run** | `Dockerfile` + `cloudbuild.yaml` | Configured (monolith: FastAPI serves built React) |

> [!IMPORTANT]
> For **Render.com**: Set `VITE_API_BASE_URL` env var to your backend service URL before the frontend build runs. Also add `google-credentials.json` as a Secret File. Set `GROQ_API_KEY` as a secret env var in the Render dashboard.

---

## 📦 Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + Vite 5 (Node 18 compatible) |
| Routing | React Router v6 |
| State / Auth | React Context API + JWT (jose, jwt-decode) |
| Charts | Recharts |
| Icons | Lucide React |
| PDF parsing | pdfjs-dist v4 (client-side) |
| AI / LLM | Groq API — Llama-3.3-70b-versatile |
| STT | Browser Web Speech API + Groq Whisper |
| TTS (primary) | Google Cloud Text-to-Speech (Neural2) |
| TTS (fallback) | Coqui TTS (local, requires torch) → Browser SpeechSynthesis |
| Backend | FastAPI (Python 3.12) |
| ORM | SQLAlchemy 2.x |
| Database | PostgreSQL (Neon) — dev falls back to SQLite |
| Auth | bcrypt passwords + JWT tokens (python-jose) |
| Deployment | Google Cloud Run / Render.com |

---

## 🎯 Recommended Launch Order

```
Phase 1 — Fix & Stabilize ✅ DONE
  ✅ Fix /dashboard → / route bug (FinalReview.jsx)
  ✅ Fix Tailwind classes in InterviewFlow (replaced with CSS)
  ✅ Add spinner for loading states (App.jsx)
  ✅ Fix CORS to use env-var driven origins
  ✅ Fix Coqui TTS graceful degradation (no torch = warning, not crash)
  ✅ Downgrade packages to Node 18 compatible versions

Phase 2 — Polish UI (next)
  ✅ Style Onboarding page
  ✅ SEO meta tags added (index.html)
  ⏳ Add landing/hero page for new visitors
  ⏳ Mobile responsive audit

Phase 3 — Production Readiness
  ⏳ Move Groq key to backend proxy
  ✅ Switch to PostgreSQL (Neon)
  ✅ Message queue (RQ + Upstash Redis)
  ⏳ Deploy to Render or GCP

Phase 4 — Growth Features (after launch)
  ⏳ Interview history detail view
  ⏳ PDF report download
  ⏳ User profile page
  ⏳ Weekly progress tracking chart
```
