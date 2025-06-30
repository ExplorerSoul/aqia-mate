// /utils/speech.js
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

  // Initialize speech recognition
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

  // Load available voices
 loadVoices() {
    const load = () => {
      const voices = this.synthesis.getVoices();
      if (voices.length > 0) {
        this.voices = voices;
      }
    };

    load(); // Try immediately

    // Listen again if not loaded
    if (this.voices.length === 0) {
      this.synthesis.addEventListener('voiceschanged', load);
    }
  }


  // Get a professional voice (prefer female, English)
  getPreferredVoice() {
    // Try to find a good English voice
    const englishVoices = this.voices.filter(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Female')
    );
    
    if (englishVoices.length > 0) {
      return englishVoices[0];
    }
    
    // Fallback to any English voice
    const anyEnglish = this.voices.find(voice => voice.lang.startsWith('en'));
    return anyEnglish || this.voices[0];
  }

  // Text-to-speech
  async speak(text) {
    return new Promise((resolve, reject) => {
      if (this.isSpeaking) {
        this.synthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const preferredVoice = this.getPreferredVoice();
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
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

      utterance.onerror = (error) => {
        this.isSpeaking = false;
        reject(error);
      };

      this.synthesis.speak(utterance);
    });
  }

  // Stop speaking
  stopSpeaking() {
    if (this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // Start listening for speech
  async startListening(timeout = 10000) {
    return new Promise((resolve, reject) => {
      if (this.isListening) return;

      let timeoutId;

      this.recognition.onstart = () => {
        this.isListening = true;
        timeoutId = setTimeout(() => {
          this.stopListening();
          reject(new Error('Listening timeout'));
        }, timeout);
      };

      this.recognition.onresult = (event) => {
        clearTimeout(timeoutId);
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        clearTimeout(timeoutId);
      };

      this.recognition.onerror = (error) => {
        clearTimeout(timeoutId);
        this.isListening = false;
        reject(error);
      };

      this.recognition.start();
    });
  }


  // Stop listening
  stopListening() {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Check if browser supports speech features
  static isSupported() {
    const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const speechSynthesisSupported = 'speechSynthesis' in window;
    
    return {
      recognition: speechRecognitionSupported,
      synthesis: speechSynthesisSupported,
      both: speechRecognitionSupported && speechSynthesisSupported
    };
  }

  // Get microphone permission
  static async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }
}

// Optionally at the end:
const speechService = new SpeechService();
export default speechService;
