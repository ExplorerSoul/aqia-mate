// SpeechService.js
class SpeechService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.voices = [];
    this.speakQueue = [];
    this.finalTranscript = "";

    this.initializeSpeechRecognition();
    this.loadVoices();
  }

  initializeSpeechRecognition() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.warn("⚠️ Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = true;     // keep listening until stopped
    this.recognition.interimResults = true; // get live results
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 1;
  }

  loadVoices() {
    const load = () => {
      const voices = this.synthesis.getVoices();
      if (voices.length > 0) {
        this.voices = voices;
        this.synthesis.removeEventListener("voiceschanged", load);
      }
    };

    load();
    if (this.voices.length === 0) {
      this.synthesis.addEventListener("voiceschanged", load);
    }
  }

  getPreferredVoice(genderPreference = "female") {
    const englishVoices = this.voices.filter((v) => v.lang.startsWith("en"));
    if (genderPreference === "female") {
      const female = englishVoices.find((v) =>
        v.name.toLowerCase().includes("female")
      );
      if (female) return female;
    }
    return (
      englishVoices.find((v) => v.default) ||
      englishVoices[0] ||
      this.voices[0] ||
      null
    );
  }

  // ✅ Text-to-Speech
  async speak(text, { interrupt = true } = {}) {
    return new Promise((resolve, reject) => {
      if (!text || typeof text !== "string") return resolve();

      const cleanText = text.replace(/[*_`~]/g, "").replace(/\s{2,}/g, " ").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);

      const voice = this.getPreferredVoice();
      if (voice) utterance.voice = voice;

      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      utterance.onstart = () => {
        this.isSpeaking = true;
      };
      utterance.onend = () => {
        this.isSpeaking = false;
        this._dequeueNext();
        resolve();
      };
      utterance.onerror = (err) => {
        this.isSpeaking = false;
        this._dequeueNext();
        reject(err);
      };

      if (interrupt) {
        this.synthesis.cancel();
        this.speakQueue = [];
      }

      this.speakQueue.push(utterance);
      if (!this.isSpeaking) {
        this._dequeueNext();
      }
    });
  }

  _dequeueNext() {
    if (this.speakQueue.length > 0) {
      const next = this.speakQueue.shift();
      this.synthesis.speak(next);
    } else {
      this.isSpeaking = false;
    }
  }

  stopSpeaking(force = false) {
    if (force) {
      this.synthesis.cancel();
      this.speakQueue = [];
      this.isSpeaking = false;
    } else {
      this.speakQueue = [];
    }
  }

  // ✅ Start Listening (supports partial + final callbacks)
  async startListening({ onPartial, onFinal } = {}) {
    return new Promise((resolve, reject) => {
      if (!this.recognition) return reject(new Error("Speech recognition not supported."));
      if (this.isListening) return reject(new Error("Already listening."));

      this.finalTranscript = "";

      this.recognition.onstart = () => {
        this.isListening = true;
        console.log("🎙️ Listening started...");
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.finalTranscript += transcript + " ";
            if (onFinal) onFinal(this._normalizeTranscript(this.finalTranscript));
          } else {
            interimTranscript += transcript;
          }
        }

        const combined = (this.finalTranscript + " " + interimTranscript).trim();
        if (onPartial) onPartial(this._normalizeTranscript(combined));
      };

      this.recognition.onend = () => {
        console.log("🛑 Listening stopped.");
        this.isListening = false;
        this.finalTranscript = this._normalizeTranscript(this.finalTranscript);

        if (!this.finalTranscript) {
          reject(new Error("No clear speech detected."));
        } else {
          resolve(this.finalTranscript);
        }
      };

      this.recognition.onerror = (err) => {
        console.error("Speech recognition error:", err);
        this.isListening = false;
        reject(err);
      };

      try {
        this.recognition.start();
      } catch (err) {
        reject(new Error("Failed to start speech recognition."));
      }
    });
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.isListening = false;
        this.recognition.stop();
      } catch (err) {
        console.warn("Speech recognition stop error:", err);
      }
    }
  }

  _normalizeTranscript(text) {
    if (!text) return "";
    return text
      .replace(/\b(um+|uh+|like)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  static isSupported() {
    const speechRecognitionSupported =
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    const speechSynthesisSupported = "speechSynthesis" in window;
    return {
      recognition: speechRecognitionSupported,
      synthesis: speechSynthesisSupported,
      both: speechRecognitionSupported && speechSynthesisSupported,
    };
  }

  static async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      return false;
    }
  }
}

// ✅ Export singleton
const speechService = new SpeechService();
export default speechService;
