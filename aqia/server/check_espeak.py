import os
import sys

# Set environment variables as we do in main.py
espeak_path = r"C:\Program Files\eSpeak NG\espeak-ng.exe"
espeak_lib = r"C:\Program Files\eSpeak NG\libespeak-ng.dll"

os.environ["PHONEMIZER_ESPEAK_PATH"] = espeak_path
os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = espeak_lib

print(f"Checking eSpeak at: {espeak_path}")
print(f"Checking Library at: {espeak_lib}")

try:
    from phonemizer.backend import EspeakBackend
    print("Attempting to initialize EspeakBackend...")
    backend = EspeakBackend(language='en-us', preserve_punctuation=True, with_stress=True)
    print("SUCCESS: EspeakBackend initialized.")
    phonemes = backend.phonemize(["hello world"])
    print(f"Phonemes: {phonemes}")
except Exception as e:
    print(f"FAILURE: {e}")
    # Print detailed error if available
    import traceback
    traceback.print_exc()
