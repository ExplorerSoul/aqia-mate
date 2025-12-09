import os
import warnings
# Suppress FutureWarning from transformers regarding register_pytree_node
warnings.filterwarnings("ignore", category=FutureWarning, message=".*register_pytree_node.*")
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException

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
from phonemizer.backend import EspeakBackend
try:
    if 'espeak_lib' in locals():
        EspeakBackend.set_library(espeak_lib)
        print("✅ EspeakBackend library set successfully.")
    else:
        print("ℹ️  EspeakBackend using default system library (Linux/Mac).")
except Exception as e:
    print(f"⚠️  Failed to set EspeakBackend library: {e}")
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Monkey patch for coqui-tts compatibility with newer transformers
import transformers.pytorch_utils as pu
if not hasattr(pu, "isin_mps_friendly"):
    def isin_mps_friendly():
        return False
    pu.isin_mps_friendly = isin_mps_friendly

from tts_service import TTSService
from google_tts_service import GoogleTTSService

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Initialize Google TTS Service

try:
    # Use ENV variable for security
    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "server/google-credentials.json")
    
    # Handle the double extension issue if it persists in the filename on disk
    if not os.path.exists(creds_path) and os.path.exists(creds_path + ".json"):
         creds_path += ".json"
        
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

@app.get("/")
def read_root():
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

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

# --- Static File Serving (Place at the end) ---
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check if static directory exists (deployed mode)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

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

