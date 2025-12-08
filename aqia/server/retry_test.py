import requests
import time
import sys

BASE_URL = "http://localhost:8000"

def wait_for_server(timeout=120):
    start = time.time()
    print("Waiting for server to be responsive...")
    while time.time() - start < timeout:
        try:
            requests.get(BASE_URL)
            print("Server is up!")
            return True
        except requests.exceptions.ConnectionError:
            time.sleep(2)
            print(".", end="", flush=True)
    return False

def test_endpoints():
    print("\nTesting Endpoints...")
    
    # Test Google
    try:
        print("Testing Google TTS...")
        res = requests.post(f"{BASE_URL}/google-tts", json={"text": "Google test"})
        if res.status_code == 200:
            print("✅ Google TTS OK")
        else:
            print(f"❌ Google TTS Failed: {res.status_code}")
    except Exception as e:
        print(f"❌ Google TTS Error: {e}")

    # Test Coqui
    try:
        print("Testing Coqui TTS...")
        res = requests.post(f"{BASE_URL}/tts", json={"text": "Coqui test"})
        if res.status_code == 200:
            print("✅ Coqui TTS OK")
        else:
            print(f"❌ Coqui TTS Failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"❌ Coqui TTS Error: {e}")

if __name__ == "__main__":
    if wait_for_server():
        test_endpoints()
    else:
        print("\nTimed out waiting for server.")
