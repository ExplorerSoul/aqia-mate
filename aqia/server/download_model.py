# Monkey patch for coqui-tts compatibility
import transformers.pytorch_utils as pu
if not hasattr(pu, "isin_mps_friendly"):
    def isin_mps_friendly():
        return False
    pu.isin_mps_friendly = isin_mps_friendly

from TTS.api import TTS

print("Attempting to load TTS model...")
try:
    tts = TTS("tts_models/en/ljspeech/vits")
    print("SUCCESS: Model loaded.")
except Exception as e:
    print(f"FAILURE: {e}")
