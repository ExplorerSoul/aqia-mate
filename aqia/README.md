# AQIA — AI Interview Assistant

Practice technical interviews with an AI that reads your resume, asks domain-specific questions, listens to your answers, and gives you a detailed performance report.

**Live → [aqia-mate.vercel.app](https://aqia-mate.vercel.app)**

---

## What it does

1. **Upload your resume** (PDF) and pick an interview domain
2. **AI interviews you** — asks questions tailored to your background, reads them aloud
3. **Answer by voice or text** — speech-to-text transcription via Groq Whisper
4. **Get a full report** — scores (0–100), strengths, weaknesses, suggested answers, speech metrics (WPM, filler words)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 5, deployed on Vercel |
| Backend | FastAPI (Python 3.12), deployed on Render |
| AI / LLM | Groq — Llama-3.3-70b-versatile |
| Speech-to-Text | Browser SpeechRecognition + Groq Whisper |
| Text-to-Speech | Google Cloud TTS (Chirp3-HD Neural voice) |
| Database | PostgreSQL on Neon |
| Queue | RQ + Upstash Redis |
| Auth | JWT + bcrypt |

---

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free)
- A [Google Cloud service account](https://console.cloud.google.com) with Text-to-Speech enabled

### Backend

```bash
cd aqia/server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `aqia/server/.env`:
```
SECRET_KEY=any-long-random-string
DATABASE_URL=sqlite:///./aqia_data.db
GROQ_API_KEY=gsk_your_key_here
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
ALLOWED_ORIGINS=http://localhost:5173
```

Place your Google credentials file at `aqia/server/google-credentials.json`, then:

```bash
uvicorn main:app --reload --port 8000
```

API docs available at `http://127.0.0.1:8000/api/docs`

### Frontend

```bash
cd aqia
npm install
```

Create `aqia/.env`:
```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

```bash
npm run dev
# → http://localhost:5173
```

### System Tests

With both servers running, open:
```
http://localhost:5173/test/
```
Click **Run All Automated Tests** to verify every endpoint.

---

## Deployment

The app is split across two free-tier platforms:

| Service | Platform | Notes |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Set root directory to `aqia`, add `VITE_API_BASE_URL` env var |
| Backend | [Render](https://render.com) | Set root directory to `aqia`, use `render.yaml` config |
| Database | [Neon](https://neon.tech) | Free PostgreSQL, set as `DATABASE_URL` |
| Queue | [Upstash](https://upstash.com) | Free Redis, set as `REDIS_URL` |

### Render env vars to set manually

| Key | Value |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `REDIS_URL` | Upstash Redis URL |
| `GROQ_API_KEY` | Your Groq key |
| `SECRET_KEY` | Any long random string |
| `ALLOWED_ORIGINS` | Your Vercel URL |
| `GOOGLE_APPLICATION_CREDENTIALS` | `/etc/secrets/google-credentials.json` |

Upload `google-credentials.json` as a **Secret File** in the Render dashboard at path `/etc/secrets/google-credentials.json`.

---

## Project Structure

```
aqia/
├── src/
│   ├── components/       # React pages (Auth, Dashboard, Interview, Review)
│   ├── contexts/         # Auth context + JWT state
│   ├── utils/            # AI service, speech, prompt builder
│   └── styles.css        # Global styles
├── server/
│   ├── main.py           # FastAPI app + all endpoints
│   ├── models.py         # SQLAlchemy ORM models
│   ├── database.py       # DB engine + Alembic config
│   ├── jobs.py           # RQ background jobs
│   ├── worker.py         # RQ worker
│   ├── google_tts_service.py
│   ├── migrations/       # Alembic schema migrations
│   └── start.sh          # Render startup script
├── public/test/
│   └── index.html        # System test dashboard
├── render.yaml           # Render deployment config
├── vercel.json           # Vercel SPA routing
└── vite.config.js        # Vite + dev proxy
```

---

## License

MIT
