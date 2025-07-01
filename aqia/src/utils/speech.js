class SpeechService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.voices = [];

    this.initializeSpeechRecognition();
    this.loadVoices();
  }

  initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported in this browser');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
  }

  loadVoices() {
    const load = () => {
      const voices = this.synthesis.getVoices();
      if (voices.length > 0) this.voices = voices;
    };

    load(); // Try immediately

    if (this.voices.length === 0) {
      this.synthesis.addEventListener('voiceschanged', load);
    }
  }

  getPreferredVoice() {
    const englishVoices = this.voices.filter(
      voice => voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
    );
    return englishVoices[0] || this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
  }

  async speak(text) {
    return new Promise((resolve, reject) => {
      if (!text || typeof text !== 'string') return resolve();

      if (this.isSpeaking) {
        this.synthesis.cancel();
        this.isSpeaking = false;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getPreferredVoice();
      if (voice) utterance.voice = voice;

      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };

      utterance.onerror = (err) => {
        this.isSpeaking = false;
        reject(err);
      };

      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    if (this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  async startListening(idleTimeout = null, maxTotalTime = null) {
    return new Promise((resolve, reject) => {
      if (this.isListening) return;

      let idleTimer = null;
      let totalTimer = null;

      this.recognition.onstart = () => {
        this.isListening = true;

        // Optional: Idle timeout (e.g., no voice for 20s)
        if (idleTimeout) {
          idleTimer = setTimeout(() => {
            this.stopListening();
            reject(new Error('Idle timeout: No speech detected.'));
          }, idleTimeout);
        }

        // Optional: Max total listening time
        if (maxTotalTime) {
          totalTimer = setTimeout(() => {
            this.stopListening();
            reject(new Error('Max listen time exceeded.'));
          }, maxTotalTime);
        }
      };

      this.recognition.onresult = (event) => {
        clearTimeout(idleTimer);
        clearTimeout(totalTimer);

        const transcript = event.results?.[0]?.[0]?.transcript;
        this.isListening = false;

        if (!transcript || transcript.trim() === '') {
          reject(new Error('No speech detected.'));
        } else {
          resolve(transcript.trim());
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        clearTimeout(idleTimer);
        clearTimeout(totalTimer);
      };

      this.recognition.onerror = (err) => {
        this.isListening = false;
        clearTimeout(idleTimer);
        clearTimeout(totalTimer);
        reject(err);
      };

      try {
        this.recognition.start();
      } catch (err) {
        reject(new Error('Failed to start speech recognition.'));
      }
    });
  }

  stopListening() {
    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Speech recognition stop error:', err);
      }
      this.isListening = false;
    }
  }

  static isSupported() {
    const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const speechSynthesisSupported = 'speechSynthesis' in window;
    return {
      recognition: speechRecognitionSupported,
      synthesis: speechSynthesisSupported,
      both: speechRecognitionSupported && speechSynthesisSupported
    };
  }

  static async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }
}

// ✅ Export singleton instance
const speechService = new SpeechService();
export default speechService;
