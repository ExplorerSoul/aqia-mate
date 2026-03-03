class SpeechService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.isPlaying = false;
    this.audioElement = new Audio();
    this.apiKey = sessionStorage.getItem('user_api_key');
    this._stopped = false; // Global abort flag

    // AbortController for in-flight TTS fetch
    this._fetchController = null;

    // Web Speech API for backup/live transcript
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  // ─── Full stop: call this on navigate away / early exit ───
  stopAll() {
    this._stopped = true;
    this.stopSpeaking();
    this._forceStopListening();
  }

  // Reset stopped flag when starting a new interview
  reset() {
    this._stopped = false;
  }

  // Text-to-Speech (Hybrid: Backend -> Browser Fallback)
  async speak(text) {
    if (!text || this._stopped) return;
    this.stopSpeaking();

    // Tiny delay to ensure cancellation finishes
    await new Promise(r => setTimeout(r, 50));
    if (this._stopped) return; // Check again after delay

    this.isPlaying = true;

    // 1. Try Backend TTS (Google -> Coqui)
    try {
      await this._speakViaBackend(text);
    } catch (backendError) {
      if (this._stopped) return; // Aborted during fetch — do not fall back
      console.warn("Backend TTS failed. Falling back to Browser TTS.", backendError);
      await this._speakViaBrowser(text);
    }

    this.isPlaying = false;
  }

  async _speakViaBackend(text) {
    const TIMEOUT_MS = 5000;

    // 1. Try Google TTS First
    try {
        console.log("Attempting Google TTS...");
        await this._fetchAudio(text, '/google-tts', {
            voice: 'en-US-Neural2-F'
        }, TIMEOUT_MS);
        return;
    } catch (googleError) {
        if (this._stopped) throw new Error('stopped');
        console.warn("Google TTS failed, falling back to Local Coqui TTS:", googleError);
    }

    // 2. Fallback to Local Coqui TTS
    try {
        console.log("Attempting Local Coqui TTS...");
        await this._fetchAudio(text, '/tts', {}, TIMEOUT_MS);
        return;
    } catch (localError) {
        if (this._stopped) throw new Error('stopped');
        console.warn("Local TTS failed:", localError);
    }

    throw new Error("All backend TTS failed");
  }

  async _fetchAudio(text, endpoint, extras, timeoutMs) {
    // Each fetch gets its own AbortController so we can cancel it
    this._fetchController = new AbortController();
    const timeoutId = setTimeout(() => this._fetchController.abort(), timeoutMs);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, ...extras }),
          signal: this._fetchController.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Backend Error ${response.status}`);

      const blob = await response.blob();
      if (this._stopped) return; // Don't play if already stopped

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
    if (this._stopped) return Promise.resolve();
    return new Promise((resolve) => {
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
        const preferred = voices.find(v =>
          v.name.includes("Microsoft Zira") ||
          v.name.includes("Google US English") ||
          v.lang === 'en-US'
        );
        if (preferred) this.currentUtterance.voice = preferred;
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
    // Abort any in-flight TTS network request
    if (this._fetchController) {
      this._fetchController.abort();
      this._fetchController = null;
    }
    // Stop audio playback immediately
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement.currentTime = 0;
      this.audioElement.onended = null;
      this.audioElement.onerror = null;
    }
    // Stop browser speech synthesis
    window.speechSynthesis.cancel();
    this.currentUtterance = null;
    this.isPlaying = false;
  }

  // Speech-to-Text (Hybrid: Live Web Speech + High-Res Whisper)
  async startListening(onLiveTranscript) {
    if (this.isRecording || this._stopped) return;

    this.isRecording = true;
    this.audioChunks = [];

    // Start Web Speech API for live feedback
    if (this.recognition) {
      this.recognition.onresult = (event) => {
        if (this._stopped) return;
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
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
    }
  }

  // Force stop without transcribing — used on unmount/exit
  _forceStopListening() {
    if (this.recognition) {
      this.recognition.onresult = null;
      try { this.recognition.stop(); } catch(_) {}
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      // Detach onstop so Whisper transcription never runs
      this.mediaRecorder.onstop = null;
      this.mediaRecorder.ondataavailable = null;
      try { this.mediaRecorder.stop(); } catch(_) {}
      try {
        this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
      } catch(_) {}
    }
    this.isRecording = false;
    this.audioChunks = [];
  }

  stopListening() {
    return new Promise((resolve) => {
      // Stop Web Speech
      if (this.recognition) {
        this.recognition.onresult = null;
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

        // Use Whisper for the final authoritative transcript
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
    if (this._stopped) return ''; // Don't transcribe if we've already exited
    if (!this.apiKey) this.apiKey = sessionStorage.getItem('user_api_key');
    if (audioBlob.size < 1000) return '';

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    formData.append('model', 'whisper-large-v3');

    // Retry Logic for Whisper
    for (let i = 0; i < 3; i++) {
        if (this._stopped) return '';
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