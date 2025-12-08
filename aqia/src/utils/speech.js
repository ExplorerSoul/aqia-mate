class SpeechService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.isPlaying = false;
    this.audioElement = new Audio();
    this.apiKey = sessionStorage.getItem('user_api_key');
    
    // Web Speech API for backup/live transcript
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  // Text-to-Speech (Hybrid: Backend -> Browser Fallback)
  async speak(text) {
    if (!text) return;
    this.stopSpeaking();
    
    // Tiny delay to ensure cancellation finishes
    await new Promise(r => setTimeout(r, 50));
    
    this.isPlaying = true;

    // 1. Try Backend TTS (Google Only)
    try {
      await this._speakViaBackend(text);
    } catch (backendError) {
      console.warn("Backend TTS failed. Falling back to Browser TTS.", backendError);
      await this._speakViaBrowser(text);
    }
    
    this.isPlaying = false;
  }

  async _speakViaBackend(text) {
    const MAX_RETRIES = 1; // Try once, fail fast
    const TIMEOUT_MS = 5000; // Increased timeout for initial load

    // 1. Try Google TTS First
    try {
        console.log("Attempting Google TTS...");
        await this._fetchAudio(text, '/google-tts', { 
            voice: 'en-US-Neural2-F' 
        }, TIMEOUT_MS);
        return;
    } catch (googleError) {
        console.warn("Google TTS failed, falling back to Local Coqui TTS:", googleError);
    }

    // 2. Fallback to Local Coqui TTS
    try {
        console.log("Attempting Local Coqui TTS...");
        await this._fetchAudio(text, '/tts', {}, TIMEOUT_MS);
        return; 
    } catch (localError) {
        console.warn("Local TTS failed, falling back to Browser TTS:", localError);
        throw localError; // Throwing here triggers the fallback in speak() if we structured it that way,
                          // but speak() currently catches and logs.
                          // Let's rely on speak()'s catch block or handle browser fallback here? 
                          // The `speak` method catches exceptions but doesn't do browser fallback.
                          // So we should probably do browser fallback in `speak` or here.
                          // Actually, simpler to just throw and let `speak` fallback if we modify `speak` too?
                          // Reviewing `speak`: it does NOT have browser fallback in the catch block currently.
                          // I should probably implement the browser fallback logic in `speak` catch block 
                          // or call it here.
    }
    // Re-throw to signal failure to `speak` method
    throw new Error("All backend TTS failed");
  }

  async _fetchAudio(text, endpoint, extras, timeoutMs) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, ...extras }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`Backend Error ${response.status}`);

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        await new Promise((resolve, reject) => {
            this.audioElement.src = url;
            this.audioElement.onended = resolve;
            this.audioElement.onerror = reject;
            this.audioElement.play().catch(reject);
        });
      } catch(e) {
          clearTimeout(timeoutId);
          throw e;
      }
  }

  _speakViaBrowser(text) {
    return new Promise((resolve) => {
      // FIX: Store utterance in `this` to prevent garbage collection
      this.currentUtterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };
      this.currentUtterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') {
           console.log("Browser TTS interrupted (intentional or overlap)");
        } else {
           console.error("Browser TTS error", e);
        }
        this.currentUtterance = null;
        resolve();
      };
      
      const setVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        // Microsoft voices often sound better on Windows
        const preferred = voices.find(v => 
          v.name.includes("Microsoft Zira") || 
          v.name.includes("Google US English") || 
          v.lang === 'en-US'
        );
        if (preferred) this.currentUtterance.voice = preferred;
        
        // Slightly faster rate for better flow
        this.currentUtterance.rate = 1.1; 
        
        window.speechSynthesis.speak(this.currentUtterance);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        setVoiceAndSpeak();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
           setVoiceAndSpeak();
           window.speechSynthesis.onvoiceschanged = null;
        };
      }
    });
  }

  stopSpeaking() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    this.currentUtterance = null; // Clear reference
    this.isPlaying = false;
  }

  // Speech-to-Text (Hybrid: Live Web Speech + High-Res Whisper)
  async startListening(onLiveTranscript) {
    if (this.isRecording) return;
    
    this.isRecording = true;
    this.audioChunks = [];

    // Start Web Speech API for live feedback
    if (this.recognition) {
      this.recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        // Send combined view to UI
        if (onLiveTranscript) onLiveTranscript(final + (interim ? ' ' + interim : ''));
      };
      try {
        this.recognition.start();
      } catch (err) {
        if (err.name === 'InvalidStateError' || err.message.includes('already started')) {
           console.log("Recognition already active, reusing session.");
        } else {
           throw err;
        }
      }
    }

    // Start Audio Recording for Whisper
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);
      this.mediaRecorder.start();
      console.log("Mic started (Hybrid Mode)");
      
    } catch (e) {
      console.error("Mic access denied:", e);
      // If mic fails, we might still have Web Speech if it doesn't strictly require getUserMedia (it usually does internal handling)
      // But typically both need permissions. 
    }
  }

  stopListening() {
    return new Promise((resolve) => {
      // Stop Web Speech
      if (this.recognition) {
        this.recognition.onresult = null; // Clean up listener to prevent ghost updates
        this.recognition.stop();
      }

      // Stop Audio Recorder & Transcribe via Whisper
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.isRecording = false;
        resolve('');
        return;
      }

      this.mediaRecorder.onstop = async () => {
        this.isRecording = false;
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        
        // Use Whisper for the *final* authoritative transcript
        console.log("Fetching Whisper transcript...");
        const whisperText = await this._transcribeAudio(audioBlob);
        resolve(whisperText);
        
        // Stop tracks
        this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
      };

      this.mediaRecorder.stop();
    });
  }

  async _transcribeAudio(audioBlob) {
    if (!this.apiKey) this.apiKey = sessionStorage.getItem('user_api_key');
    if (audioBlob.size < 1000) return ''; 

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    formData.append('model', 'whisper-large-v3');

    // Retry Logic for Whisper
    for (let i = 0; i < 3; i++) {
        try {
            const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.apiKey}` },
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                return data.text;
            }
        } catch (e) {
            console.warn("Whisper attempt failed", e);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    return '';
  }
}

export default new SpeechService();