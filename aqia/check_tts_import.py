print("Importing os...")
import os
print("Importing torch...")
import torch
print(f"Torch imported. CUDA available: {torch.cuda.is_available()}")
print("Importing TTS.api...")
from TTS.api import TTS
print("TTS imported successfully.")
