import os
import torch
from TTS.api import TTS

class TTSService:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🔄 Initializing Coqui TTS on {self.device}...")
        # Using a fast, decent quality model. 
        # 'tts_models/en/ljspeech/vits' is a good balance.
        # Or 'tts_models/en/vctk/vits' for multi-speaker.
        # Let's use a standard one for now.
        self.tts = TTS("tts_models/en/ljspeech/vits").to(self.device)
        print("✅ Coqui TTS Initialized.")

    def generate_audio(self, text: str, output_path: str):
        self.tts.tts_to_file(text=text, file_path=output_path)
        return output_path
