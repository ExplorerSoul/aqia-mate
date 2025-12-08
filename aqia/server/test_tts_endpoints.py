import requests
import time
import os

BASE_URL = "http://localhost:8000"

def test_google_tts():
    print("Testing Google TTS endpoint...")
    try:
        response = requests.post(f"{BASE_URL}/google-tts", json={"text": "Hello form Google TTS verification."})
        if response.status_code == 200:
            print("✅ Google TTS Success")
            with open("test_google.mp3", "wb") as f:
                f.write(response.content)
        else:
            print(f"❌ Google TTS Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Google TTS Exception: {e}")

def test_coqui_tts():
    print("Testing Coqui TTS endpoint...")
    try:
        response = requests.post(f"{BASE_URL}/tts", json={"text": "Hello from Coqui TTS verification."})
        if response.status_code == 200:
            print("✅ Coqui TTS Success")
            with open("test_coqui.wav", "wb") as f:
                f.write(response.content)
        else:
            print(f"❌ Coqui TTS Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Coqui TTS Exception: {e}")

if __name__ == "__main__":
    # Wait for server to potentially start if run immediately after
    print("Waiting 5s for server warmup...")
    time.sleep(5) 
    
    test_google_tts()
    test_coqui_tts()
