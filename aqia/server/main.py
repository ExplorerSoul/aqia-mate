import os
import warnings
from dotenv import load_dotenv
load_dotenv()

warnings.filterwarnings("ignore", category=FutureWarning, message=".*register_pytree_node.*")

import uuid
import datetime
import httpx

from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from jose import JWTError, jwt

from database import engine, get_db
import models
from auth_utils import get_password_hash, verify_password, create_access_token
from queue_client import enqueue_or_run
from jobs import save_interview_job

# ── Optional: Coqui TTS torch monkey-patch ───────────────────────────────────
try:
    import transformers.pytorch_utils as pu
    if not hasattr(pu, "isin_mps_friendly"):
        pu.isin_mps_friendly = lambda: False
except (ImportError, ModuleNotFoundError):
    print("⚠️  torch/transformers not available — Coqui TTS will be disabled.")

# ── eSpeak path (Windows only) ────────────────────────────────────────────────
os.environ["COQUI_TOS_AGREED"] = "1"
_espeak = r"C:\Program Files\eSpeak NG\espeak-ng.exe"
if os.path.exists(_espeak):
    os.environ["PHONEMIZER_ESPEAK_PATH"] = _espeak
    _espeak_lib = r"C:\Program Files\eSpeak NG\libespeak-ng.dll"
    if os.path.exists(_espeak_lib):
        os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = _espeak_lib

try:
    from phonemizer.backend import EspeakBackend
    EspeakBackend.set_library(_espeak_lib) if '_espeak_lib' in dir() else None
except Exception as e:
    print(f"⚠️  EspeakBackend: {e}")

# ── Database setup ────────────────────────────────────────────────────────────
try:
    from alembic.config import Config as AlembicConfig
    from alembic import command as alembic_command
    _cfg = AlembicConfig(os.path.join(os.path.dirname(__file__), "alembic.ini"))
    _cfg.set_main_option("script_location",
                         os.path.join(os.path.dirname(__file__), "migrations"))
    alembic_command.upgrade(_cfg, "head")
    print("✅ Database migrations applied (Alembic)")
except Exception as _e:
    print(f"⚠️  Alembic migration failed ({_e}), falling back to create_all")
    models.Base.metadata.create_all(bind=engine)

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="AQIA API",
    description="AI Qualified Interview Assistant — backend API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
_allowed_origins = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,https://aqia-mate.vercel.app"
    ).split(",")
    if o.strip() and o.strip() != "null"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── TTS services ──────────────────────────────────────────────────────────────
from google_tts_service import GoogleTTSService

try:
    from tts_service import TTSService
    _coqui_available = True
except (ImportError, ModuleNotFoundError) as e:
    print(f"⚠️  Coqui TTS unavailable ({e}). Local TTS disabled.")
    TTSService = None
    _coqui_available = False

try:
    _creds = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "google-credentials.json")
    if not os.path.exists(_creds):
        _creds = "google-credentials.json"
    google_tts_service = GoogleTTSService(credentials_path=_creds)
    print(f"✅ Google TTS initialised ({_creds})")
except Exception as e:
    print(f"❌ Google TTS failed: {e}")
    google_tts_service = None

try:
    tts_service = TTSService() if _coqui_available else None
    if tts_service:
        print("✅ Coqui TTS initialised")
except Exception as e:
    print(f"❌ Coqui TTS failed: {e}")
    tts_service = None

AUDIO_DIR = "generated_audio"
os.makedirs(AUDIO_DIR, exist_ok=True)

GROQ_API_KEY        = os.getenv("GROQ_API_KEY", "")
GROQ_CHAT_URL       = "https://api.groq.com/openai/v1/chat/completions"
GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
SECRET_KEY          = os.getenv("SECRET_KEY")
ALGORITHM           = "HS256"

# =============================================================================
# AUTH DEPENDENCY
# =============================================================================

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> models.User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def _require_admin(secret: str):
    admin_secret = os.getenv("ADMIN_SECRET", "")
    if not admin_secret or secret != admin_secret:
        raise HTTPException(status_code=403, detail="Forbidden")

# =============================================================================
# HEALTH
# =============================================================================

@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "AQIA Backend"}

@app.get("/health", include_in_schema=False)
def health_alias():
    return {"status": "ok"}

# =============================================================================
# ADMIN
# =============================================================================

@app.get("/api/admin/users", tags=["Admin"])
def admin_list_users(secret: str, db: Session = Depends(get_db)):
    """List all users."""
    _require_admin(secret)
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    return [{"id": u.id, "email": u.email, "name": u.name, "created_at": str(u.created_at)} for u in users]

@app.get("/api/admin/user/{email}", tags=["Admin"])
def admin_get_user(email: str, secret: str, db: Session = Depends(get_db)):
    """Check if a user exists."""
    _require_admin(secret)
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return {"exists": False, "email": email}
    return {"exists": True, "id": user.id, "email": user.email, "name": user.name, "created_at": str(user.created_at)}

@app.get("/api/admin/user/{email}/full", tags=["Admin"])
def admin_get_user_full(email: str, secret: str, db: Session = Depends(get_db)):
    """Return full user data including all interviews, questions, analytics."""
    _require_admin(secret)
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return {"exists": False, "email": email}
    sessions = (
        db.query(models.InterviewSession)
        .filter(models.InterviewSession.user_id == user.id)
        .order_by(models.InterviewSession.started_at.desc())
        .all()
    )
    return {
        "user": {"id": user.id, "email": user.email, "name": user.name, "created_at": str(user.created_at)},
        "total_interviews": len(sessions),
        "interviews": [
            {
                "id": s.id,
                "domain": s.job_category,
                "overall_score": s.overall_score,
                "started_at": str(s.started_at),
                "completed_at": str(s.completed_at),
                "questions": [
                    {"question": q.question_asked, "answer": q.user_answer,
                     "feedback": q.ai_feedback, "score": q.score}
                    for q in s.questions
                ],
                "analytics": [{"category": a.category, "score": a.score} for a in s.analytics],
            }
            for s in sessions
        ],
    }

@app.delete("/api/admin/user/{email}", tags=["Admin"])
def admin_delete_user(email: str, secret: str, db: Session = Depends(get_db)):
    """Delete a user and all their data (CASCADE)."""
    _require_admin(secret)
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User {email} not found")
    db.delete(user)
    db.commit()
    return {"deleted": email}

@app.delete("/api/admin/cleanup", tags=["Admin"])
def admin_cleanup(secret: str, db: Session = Depends(get_db)):
    """
    Delete ALL users except amitrancho65@gmail.com and prodtest accounts.
    Returns list of deleted emails.
    """
    _require_admin(secret)
    KEEP = {"amitrancho65@gmail.com"}
    # Keep any email containing 'prodtest'
    users_to_delete = (
        db.query(models.User)
        .filter(
            ~models.User.email.in_(KEEP),
            ~models.User.email.contains("prodtest"),
        )
        .all()
    )
    deleted = []
    for user in users_to_delete:
        deleted.append(user.email)
        db.delete(user)
    db.commit()
    return {"deleted_count": len(deleted), "deleted": deleted}

# =============================================================================
# PROFILE
# =============================================================================

@app.get("/api/me", tags=["Auth"])
def get_me(current_user: models.User = Depends(get_current_user)):
    """Return the current user's profile."""
    display_name = (
        current_user.name
        or current_user.email.split('@')[0].replace('.', ' ').replace('_', ' ').title()
    )
    return {"id": current_user.id, "email": current_user.email, "name": display_name}

@app.patch("/api/me", tags=["Auth"])
def update_me(data: dict, db: Session = Depends(get_db),
              current_user: models.User = Depends(get_current_user)):
    """Update the current user's name."""
    name = data.get("name", "").strip()
    if name:
        current_user.name = name
        db.commit()
    return {"id": current_user.id, "email": current_user.email, "name": current_user.name or ""}

# =============================================================================
# AUTH
# =============================================================================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@app.post("/api/register", tags=["Auth"])
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(
        email=user.email,
        password_hash=get_password_hash(user.password),
        name=user.name,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    token = create_access_token(data={"sub": new_user.email, "id": new_user.id})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/api/login", tags=["Auth"])
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(data={"sub": db_user.email, "id": db_user.id})
    return {"access_token": token, "token_type": "bearer"}

# =============================================================================
# GROQ PROXY
# =============================================================================

class ChatRequest(BaseModel):
    messages: List[dict]
    model: str = "llama-3.3-70b-versatile"
    temperature: float = 0.6
    max_tokens: int = 1024
    response_format: Optional[dict] = None

@app.post("/api/chat", tags=["AI Proxy"])
async def proxy_chat(request: ChatRequest, _: models.User = Depends(get_current_user)):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="Groq API key not configured on server.")
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            GROQ_CHAT_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json=request.model_dump(exclude_none=True),
        )
    if not resp.is_success:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()

@app.post("/api/transcribe", tags=["AI Proxy"])
async def proxy_transcribe(
    file: UploadFile = File(...),
    model: str = Form(default="whisper-large-v3"),
    _: models.User = Depends(get_current_user),
):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="Groq API key not configured on server.")
    audio_bytes = await file.read()
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            GROQ_TRANSCRIBE_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            files={"file": (file.filename or "recording.wav", audio_bytes,
                            file.content_type or "audio/wav")},
            data={"model": model},
        )
    if not resp.is_success:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()

# =============================================================================
# TTS
# =============================================================================

class TTSRequest(BaseModel):
    text: str
    voice: str = "en-US-Neural2-F"

@app.post("/google-tts", tags=["TTS"])
async def google_tts(request: TTSRequest):
    if not google_tts_service:
        raise HTTPException(status_code=503, detail="Google TTS not available")
    try:
        path = os.path.join(AUDIO_DIR, f"google_{uuid.uuid4()}.mp3")
        google_tts_service.generate_audio(request.text, path, request.voice)
        return FileResponse(path, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tts", tags=["TTS"])
async def coqui_tts(request: TTSRequest):
    if not tts_service:
        raise HTTPException(status_code=503, detail="Coqui TTS not available")
    try:
        path = os.path.join(AUDIO_DIR, f"{uuid.uuid4()}.wav")
        tts_service.generate_audio(request.text, path)
        return FileResponse(path, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# INTERVIEWS
# =============================================================================

class QuestionIn(BaseModel):
    question_asked: str
    user_answer: Optional[str] = None
    ai_feedback: Optional[str] = None
    score: Optional[int] = None

class InterviewCreate(BaseModel):
    job_category: str
    overall_score: Optional[int] = None
    questions: List[QuestionIn] = []
    analytics_scores: Optional[dict] = None

@app.post("/api/interviews", tags=["Interviews"])
def save_interview(
    data: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = (
        db.query(func.count(models.InterviewSession.id))
        .filter(
            models.InterviewSession.user_id == current_user.id,
            models.InterviewSession.completed_at >= today_start,
            models.InterviewSession.overall_score.isnot(None),
        )
        .scalar()
    )
    if today_count >= 1:
        raise HTTPException(status_code=429,
                            detail="Daily interview limit reached. You can take one interview per day.")

    job_id, result = enqueue_or_run(
        save_interview_job,
        user_id=current_user.id,
        job_category=data.job_category,
        overall_score=data.overall_score,
        questions=[q.model_dump() for q in data.questions],
        analytics_scores=data.analytics_scores,
    )

    if job_id:
        return {"status": "queued", "job_id": job_id, "message": "Interview is being saved in the background."}
    return {"status": "saved", "job_id": None, "session_id": result.get("session_id"),
            "message": "Interview saved successfully."}

@app.get("/api/interviews", tags=["Interviews"])
def list_interviews(db: Session = Depends(get_db),
                    current_user: models.User = Depends(get_current_user)):
    sessions = (
        db.query(models.InterviewSession)
        .filter(models.InterviewSession.user_id == current_user.id)
        .order_by(models.InterviewSession.started_at.desc())
        .all()
    )
    return [
        {
            "id": s.id, "job_category": s.job_category, "overall_score": s.overall_score,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
        }
        for s in sessions
    ]

@app.get("/api/jobs/{job_id}", tags=["Interviews"])
def get_job_status(job_id: str, _: models.User = Depends(get_current_user)):
    from queue_client import get_queue
    if get_queue() is None:
        raise HTTPException(status_code=404, detail="Queue not configured")
    try:
        from rq.job import Job
        from redis import Redis
        conn = Redis.from_url(os.getenv("REDIS_URL", ""))
        job = Job.fetch(job_id, connection=conn)
        return {
            "job_id": job_id, "status": job.get_status().value,
            "result": job.result if job.is_finished else None,
            "error": str(job.exc_info) if job.is_failed else None,
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Job not found: {e}")

# =============================================================================
# DASHBOARD
# =============================================================================

@app.get("/api/dashboard", tags=["Dashboard"])
def get_dashboard(db: Session = Depends(get_db),
                  current_user: models.User = Depends(get_current_user)):
    uid = current_user.id

    agg = (
        db.query(
            func.count(models.InterviewSession.id).label("total"),
            func.max(models.InterviewSession.overall_score).label("highest"),
            func.avg(models.InterviewSession.overall_score).label("avg"),
        )
        .filter(models.InterviewSession.user_id == uid,
                models.InterviewSession.overall_score.isnot(None))
        .one()
    )

    recent_rows = (
        db.query(models.InterviewSession.id, models.InterviewSession.job_category,
                 models.InterviewSession.overall_score, models.InterviewSession.started_at)
        .filter(models.InterviewSession.user_id == uid,
                models.InterviewSession.overall_score.isnot(None))
        .order_by(models.InterviewSession.started_at.desc())
        .limit(6).all()
    )

    chart_rows = (
        db.query(models.InterviewSession.started_at, models.InterviewSession.overall_score)
        .filter(models.InterviewSession.user_id == uid,
                models.InterviewSession.overall_score.isnot(None))
        .order_by(models.InterviewSession.started_at.asc())
        .limit(30).all()
    )

    return {
        "total_interviews": agg.total or 0,
        "highest_score":    agg.highest or 0,
        "avg_score":        round(agg.avg) if agg.avg else 0,
        "recent_interviews": [
            {"id": r.id, "role": r.job_category,
             "date": r.started_at.strftime("%b %d, %Y") if r.started_at else "",
             "score": r.overall_score}
            for r in recent_rows
        ],
        "progress_data": [
            {"date": r.started_at.strftime("%b %d") if r.started_at else "",
             "score": r.overall_score}
            for r in chart_rows
        ],
    }

# =============================================================================
# STATIC FILE SERVING
# =============================================================================

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/", include_in_schema=False)
    async def serve_root():
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
else:
    @app.get("/", include_in_schema=False)
    def root_fallback():
        return {"status": "ok", "service": "AQIA Backend", "docs": "/api/docs"}

# =============================================================================
# ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
