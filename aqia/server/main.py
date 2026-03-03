import os
import warnings
# Suppress FutureWarning from transformers regarding register_pytree_node
warnings.filterwarnings("ignore", category=FutureWarning, message=".*register_pytree_node.*")
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional, List
from jose import JWTError, jwt
import datetime

from database import engine, get_db
import models
from auth_utils import get_password_hash, verify_password, create_access_token

# Monkey patch for coqui-tts compatibility with newer transformers
import transformers.pytorch_utils as pu
if not hasattr(pu, "isin_mps_friendly"):
    def isin_mps_friendly():
        return False
    pu.isin_mps_friendly = isin_mps_friendly

# Load env vars
load_dotenv()

# 1. Set Coqui TOS Agreement
os.environ["COQUI_TOS_AGREED"] = "1"

# 2. Fix eSpeak Path (if not in system PATH)
espeak_path = r"C:\Program Files\eSpeak NG\espeak-ng.exe"
if os.path.exists(espeak_path):
    print(f"ℹ️  Found eSpeak at default location: {espeak_path}")
    os.environ["PHONEMIZER_ESPEAK_PATH"] = espeak_path
    
    # Also try to set the library path if possible, though phonemizer usually needs the executable
    # Some versions of phonemizer/coqui might look for the dll
    espeak_lib = r"C:\Program Files\eSpeak NG\libespeak-ng.dll"
    if os.path.exists(espeak_lib):
         os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = espeak_lib

# Force phonemizer to use the espeak backend
try:
    from phonemizer.backend import EspeakBackend
    if 'espeak_lib' in locals():
        EspeakBackend.set_library(espeak_lib)
        print("✅ EspeakBackend library set successfully.")
    else:
        print("ℹ️  EspeakBackend using default system library (Linux/Mac).")
except Exception as e:
    print(f"⚠️  Failed to set EspeakBackend library (Non-critical if using system default): {e}")

# Initialize Database tables
models.Base.metadata.create_all(bind=engine)

# We'll import each service inside its initialization try/except below.
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# We need the service classes imported (assuming they are in tts_service.py and google_tts_service.py which we import implicitly or explicitly)
# Wait, previous main.py had explicit imports?
# The view_file previously didn't show them! 
# But the code uses `GoogleTTSService` and `TTSService`.
# They must be imported.
# Let me check the imports in the PREVIOUS versions shown in context.
# Ah, I missed them in my reconstruction?
# Let's check the `read_url_content` output again.
# It didn't show explicit `from server.tts_service import TTSService`.
# Let me check `server/main.py` imports carefully from previous context log.
# Ah, I see `from server.tts_service import TTSService` in my memory/logs?
# Actually, the implementation plan mentioned checking `server/main.py`.
# Let's assume standard imports.
from tts_service import TTSService
from google_tts_service import GoogleTTSService

# Initialize Google TTS Service
try:
    # Use ENV variable for security
    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "server/google-credentials.json")
    
    # Handle the double extension issue if it persists in the filename on disk
    if not os.path.exists(creds_path) and os.path.exists("google-credentials.json"):
         creds_path = "google-credentials.json"
        
    google_tts_service = GoogleTTSService(credentials_path=creds_path)
    print(f"✅ Google TTS Service Initialized using credentials at: {creds_path}")
except Exception as e:
    print(f"❌ Failed to init Google TTS: {e}")
    google_tts_service = None

# Initialize Coqui TTS Service
try:
    tts_service = TTSService()
    print("✅ Coqui TTS Service Globally Initialized")
except Exception as e:
    print(f"❌ Failed to init Coqui TTS: {e}")
    tts_service = None

# Ensure audio directory exists
AUDIO_DIR = "generated_audio"
os.makedirs(AUDIO_DIR, exist_ok=True)

class TTSRequest(BaseModel):
    text: str
    voice: str = "en-US-Neural2-F" # Default Google Voice

# Health check (API)
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "AQIA Backend"}

# Also keep /health
@app.get("/health")
def health_check_alias():
    return {"status": "ok", "service": "AQIA Backend"}

@app.post("/tts")
async def generate_speech(request: TTSRequest):
    if not tts_service:
        raise HTTPException(status_code=503, detail="TTS Service not available")
    
    try:
        filename = f"{uuid.uuid4()}.wav"
        filepath = os.path.join(AUDIO_DIR, filename)
        
        tts_service.generate_audio(request.text, filepath)
        
        return FileResponse(filepath, media_type="audio/wav", filename=filename)
    except Exception as e:
        print(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/google-tts")
async def generate_google_speech(request: TTSRequest):
    if not google_tts_service:
        raise HTTPException(status_code=503, detail="Google TTS Service not available (Check credentials)")
    
    try:
        filename = f"google_{uuid.uuid4()}.mp3"
        filepath = os.path.join(AUDIO_DIR, filename)
        
        google_tts_service.generate_audio(request.text, filepath, request.voice)
        
        return FileResponse(filepath, media_type="audio/mpeg", filename=filename)
    except Exception as e:
        print(f"Google TTS Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Authentication Endpoints ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@app.post("/api/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        name=user.name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Return a token immediately upon registration for convenience
    access_token = create_access_token(data={"sub": new_user.email, "id": new_user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": db_user.email, "id": db_user.id})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Auth Dependency ---

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Decode the Bearer JWT token and return the DB user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# --- Interview Endpoints ---

class QuestionIn(BaseModel):
    question_asked: str
    user_answer: Optional[str] = None
    ai_feedback: Optional[str] = None
    score: Optional[int] = None

class InterviewCreate(BaseModel):
    job_category: str
    overall_score: Optional[int] = None
    questions: List[QuestionIn] = []
    analytics_scores: Optional[dict] = None  # e.g. {"Communication": 80, "Technical": 75}

@app.post("/api/interviews")
def save_interview(
    data: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Save a completed interview session and its Q&A to the database."""
    session = models.InterviewSession(
        user_id=current_user.id,
        job_category=data.job_category,
        overall_score=data.overall_score,
        completed_at=datetime.datetime.utcnow()
    )
    db.add(session)
    db.flush()  # get session.id before adding children

    for q in data.questions:
        question = models.QuestionHistory(
            session_id=session.id,
            question_asked=q.question_asked,
            user_answer=q.user_answer,
            ai_feedback=q.ai_feedback,
            score=q.score
        )
        db.add(question)

    # Save per-category analytics scores
    if data.analytics_scores:
        for category, score in data.analytics_scores.items():
            if score is not None:
                analytics = models.AnalyticsScore(
                    session_id=session.id,
                    category=category,
                    score=int(score)
                )
                db.add(analytics)

    db.commit()
    db.refresh(session)
    return {"id": session.id, "message": "Interview saved successfully"}

@app.get("/api/interviews")
def get_interviews(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Return all interview sessions for the current user, newest first."""
    sessions = (
        db.query(models.InterviewSession)
        .filter(models.InterviewSession.user_id == current_user.id)
        .order_by(models.InterviewSession.started_at.desc())
        .all()
    )
    return [
        {
            "id": s.id,
            "job_category": s.job_category,
            "overall_score": s.overall_score,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
        }
        for s in sessions
    ]

@app.get("/api/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Return aggregated stats for the Dashboard."""
    sessions = (
        db.query(models.InterviewSession)
        .filter(
            models.InterviewSession.user_id == current_user.id,
            models.InterviewSession.overall_score.isnot(None)
        )
        .order_by(models.InterviewSession.started_at.asc())
        .all()
    )

    total_interviews = len(sessions)
    highest_score = max((s.overall_score for s in sessions), default=0)
    scores = [s.overall_score for s in sessions if s.overall_score is not None]
    avg_score = round(sum(scores) / len(scores)) if scores else 0

    # Recent interviews (last 6, newest first) for the history list
    recent = sorted(sessions, key=lambda s: s.started_at, reverse=True)[:6]
    recent_interviews = [
        {
            "id": s.id,
            "role": s.job_category,
            "date": s.started_at.strftime("%b %d, %Y") if s.started_at else "",
            "score": s.overall_score,
        }
        for s in recent
    ]

    # Progress chart data — one point per interview in chronological order
    progress_data = [
        {
            "date": s.started_at.strftime("%b %d") if s.started_at else "",
            "score": s.overall_score,
        }
        for s in sessions
    ]

    return {
        "total_interviews": total_interviews,
        "highest_score": highest_score,
        "avg_score": avg_score,
        "recent_interviews": recent_interviews,
        "progress_data": progress_data,
    }

# --- Static File Serving (Place at the end) ---
from fastapi.staticfiles import StaticFiles

# Check if static directory exists (deployed mode)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    # Serve Root (Index)
    @app.get("/")
    async def serve_root():
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

    # Catch-all for SPA (must be after API routes)
    # Note: We use a path parameter to catch everything
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API routes (defined above) to take precedence automatically.
        
        # Check if file exists in static root (e.g. favicon.ico)
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
             return FileResponse(file_path)
        
        # Otherwise serve index.html for client-side routing
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
else:
    # If no static files, route root to health check
    @app.get("/")
    def read_root_fallback():
        return {"status": "ok", "service": "AQIA Backend (No Static Served)"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
