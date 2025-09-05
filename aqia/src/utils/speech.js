// // SpeechService.js
// class SpeechService {
//   constructor() {
//     this.recognition = null;
//     this.synthesis = window.speechSynthesis;
//     this.isListening = false;
//     this.isSpeaking = false;
//     this.voices = [];
//     this.speakQueue = [];
//     this.finalTranscript = "";

//     this.initializeSpeechRecognition();
//     this.loadVoices();
//   }

//   initializeSpeechRecognition() {
//     if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
//       console.warn("⚠️ Speech recognition not supported in this browser.");
//       return;
//     }

//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     this.recognition = new SpeechRecognition();

//     this.recognition.continuous = true;     // keep listening until stopped
//     this.recognition.interimResults = true; // get live results
//     this.recognition.lang = "en-US";
//     this.recognition.maxAlternatives = 1;
//   }

//   loadVoices() {
//     const load = () => {
//       const voices = this.synthesis.getVoices();
//       if (voices.length > 0) {
//         this.voices = voices;
//         this.synthesis.removeEventListener("voiceschanged", load);
//       }
//     };

//     load();
//     if (this.voices.length === 0) {
//       this.synthesis.addEventListener("voiceschanged", load);
//     }
//   }

//   getPreferredVoice(genderPreference = "female") {
//     const englishVoices = this.voices.filter((v) => v.lang.startsWith("en"));
//     if (genderPreference === "female") {
//       const female = englishVoices.find((v) =>
//         v.name.toLowerCase().includes("female")
//       );
//       if (female) return female;
//     }
//     return (
//       englishVoices.find((v) => v.default) ||
//       englishVoices[0] ||
//       this.voices[0] ||
//       null
//     );
//   }

//   // ✅ Text-to-Speech
//   async speak(text, { interrupt = true } = {}) {
//     return new Promise((resolve, reject) => {
//       if (!text || typeof text !== "string") return resolve();

//       const cleanText = text.replace(/[*_`~]/g, "").replace(/\s{2,}/g, " ").trim();
//       const utterance = new SpeechSynthesisUtterance(cleanText);

//       const voice = this.getPreferredVoice();
//       if (voice) utterance.voice = voice;

//       utterance.rate = 0.95;
//       utterance.pitch = 1.0;
//       utterance.volume = 0.9;

//       utterance.onstart = () => {
//         this.isSpeaking = true;
//       };
//       utterance.onend = () => {
//         this.isSpeaking = false;
//         this._dequeueNext();
//         resolve();
//       };
//       utterance.onerror = (err) => {
//         this.isSpeaking = false;
//         this._dequeueNext();
//         reject(err);
//       };

//       if (interrupt) {
//         this.synthesis.cancel();
//         this.speakQueue = [];
//       }

//       this.speakQueue.push(utterance);
//       if (!this.isSpeaking) {
//         this._dequeueNext();
//       }
//     });
//   }

//   _dequeueNext() {
//     if (this.speakQueue.length > 0) {
//       const next = this.speakQueue.shift();
//       this.synthesis.speak(next);
//     } else {
//       this.isSpeaking = false;
//     }
//   }

//   stopSpeaking(force = false) {
//     if (force) {
//       this.synthesis.cancel();
//       this.speakQueue = [];
//       this.isSpeaking = false;
//     } else {
//       this.speakQueue = [];
//     }
//   }

//   // ✅ Start Listening (supports partial + final callbacks)
//   async startListening({ onPartial, onFinal } = {}) {
//     return new Promise((resolve, reject) => {
//       if (!this.recognition) return reject(new Error("Speech recognition not supported."));
//       if (this.isListening) return reject(new Error("Already listening."));

//       this.finalTranscript = "";

//       this.recognition.onstart = () => {
//         this.isListening = true;
//         console.log("🎙️ Listening started...");
//       };

//       this.recognition.onresult = (event) => {
//         let interimTranscript = "";

//         for (let i = event.resultIndex; i < event.results.length; ++i) {
//           const transcript = event.results[i][0].transcript;
//           if (event.results[i].isFinal) {
//             this.finalTranscript += transcript + " ";
//             if (onFinal) onFinal(this._normalizeTranscript(this.finalTranscript));
//           } else {
//             interimTranscript += transcript;
//           }
//         }

//         const combined = (this.finalTranscript + " " + interimTranscript).trim();
//         if (onPartial) onPartial(this._normalizeTranscript(combined));
//       };

//       this.recognition.onend = () => {
//         console.log("🛑 Listening stopped.");
//         this.isListening = false;
//         this.finalTranscript = this._normalizeTranscript(this.finalTranscript);

//         if (!this.finalTranscript) {
//           reject(new Error("No clear speech detected."));
//         } else {
//           resolve(this.finalTranscript);
//         }
//       };

//       this.recognition.onerror = (err) => {
//         console.error("Speech recognition error:", err);
//         this.isListening = false;
//         reject(err);
//       };

//       try {
//         this.recognition.start();
//       } catch (err) {
//         reject(new Error("Failed to start speech recognition."));
//       }
//     });
//   }

//   stopListening() {
//     if (this.recognition) {
//       try {
//         this.isListening = false;
//         this.recognition.stop();
//       } catch (err) {
//         console.warn("Speech recognition stop error:", err);
//       }
//     }
//   }

//   _normalizeTranscript(text) {
//     if (!text) return "";
//     return text
//       .replace(/\b(um+|uh+|like)\b/gi, "")
//       .replace(/\s+/g, " ")
//       .trim();
//   }

//   static isSupported() {
//     const speechRecognitionSupported =
//       "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
//     const speechSynthesisSupported = "speechSynthesis" in window;
//     return {
//       recognition: speechRecognitionSupported,
//       synthesis: speechSynthesisSupported,
//       both: speechRecognitionSupported && speechSynthesisSupported,
//     };
//   }

//   static async requestMicrophonePermission() {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       stream.getTracks().forEach((track) => track.stop());
//       return true;
//     } catch (error) {
//       console.error("Microphone permission denied:", error);
//       return false;
//     }
//   }
// }

// // ✅ Export singleton
// const speechService = new SpeechService();
// export default speechService;


// SpeechService.js
// SpeechService.js
// class SpeechService {
//   constructor() {
//     this.recognition = null;
//     this.synthesis = window.speechSynthesis;
//     this.isListening = false;
//     this.isSpeaking = false;
//     this.voices = [];
//     this.speakQueue = [];
//     this.finalTranscript = "";
//     this.isInitializing = false;
//     this.lastStopTime = 0;
//     this.minRestartDelay = 1000; // 1 second minimum between restarts

//     this.initializeSpeechRecognition();
//     this.loadVoices();
//   }

//   initializeSpeechRecognition() {
//     if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
//       console.warn("⚠️ Speech recognition not supported in this browser.");
//       return;
//     }

//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     this.recognition = new SpeechRecognition();

//     // ✅ Optimized settings for better reliability
//     this.recognition.continuous = true;
//     this.recognition.interimResults = true;
//     this.recognition.lang = "en-US";
//     this.recognition.maxAlternatives = 1;
//   }

//   loadVoices() {
//     const load = () => {
//       const voices = this.synthesis.getVoices();
//       if (voices.length > 0) {
//         this.voices = voices;
//         this.synthesis.removeEventListener("voiceschanged", load);
//       }
//     };

//     load();
//     if (this.voices.length === 0) {
//       this.synthesis.addEventListener("voiceschanged", load);
//     }
//   }

//   getPreferredVoice(genderPreference = "female") {
//     const englishVoices = this.voices.filter((v) => v.lang.startsWith("en"));
//     if (genderPreference === "female") {
//       const female = englishVoices.find((v) =>
//         v.name.toLowerCase().includes("female")
//       );
//       if (female) return female;
//     }
//     return (
//       englishVoices.find((v) => v.default) ||
//       englishVoices[0] ||
//       this.voices[0] ||
//       null
//     );
//   }

//   // ✅ Text-to-Speech (unchanged - working fine)
//   async speak(text, { interrupt = true } = {}) {
//     return new Promise((resolve, reject) => {
//       if (!text || typeof text !== "string") return resolve();

//       const cleanText = text.replace(/[*_`~]/g, "").replace(/\s{2,}/g, " ").trim();
//       const utterance = new SpeechSynthesisUtterance(cleanText);

//       const voice = this.getPreferredVoice();
//       if (voice) utterance.voice = voice;

//       utterance.rate = 0.95;
//       utterance.pitch = 1.0;
//       utterance.volume = 0.9;

//       utterance.onstart = () => {
//         this.isSpeaking = true;
//       };
//       utterance.onend = () => {
//         this.isSpeaking = false;
//         this._dequeueNext();
//         resolve();
//       };
//       utterance.onerror = (err) => {
//         this.isSpeaking = false;
//         this._dequeueNext();
//         reject(err);
//       };

//       if (interrupt) {
//         this.synthesis.cancel();
//         this.speakQueue = [];
//       }

//       this.speakQueue.push(utterance);
//       if (!this.isSpeaking) {
//         this._dequeueNext();
//       }
//     });
//   }

//   _dequeueNext() {
//     if (this.speakQueue.length > 0) {
//       const next = this.speakQueue.shift();
//       this.synthesis.speak(next);
//     } else {
//       this.isSpeaking = false;
//     }
//   }

//   stopSpeaking(force = false) {
//     if (force) {
//       this.synthesis.cancel();
//       this.speakQueue = [];
//       this.isSpeaking = false;
//     } else {
//       this.speakQueue = [];
//     }
//   }

//   // ✅ IMPROVED: Start Listening with better error handling and restart logic
//   async startListening({ onPartial, onFinal, timeout = 30000 } = {}) {
//     return new Promise(async (resolve, reject) => {
//       if (!this.recognition) {
//         return reject(new Error("Speech recognition not supported."));
//       }

//       // ✅ Prevent multiple simultaneous initialization attempts
//       if (this.isInitializing || this.isListening) {
//         console.warn("Already initializing or listening...");
//         return reject(new Error("Speech recognition already active."));
//       }

//       // ✅ Enforce minimum delay between restart attempts
//       const now = Date.now();
//       const timeSinceLastStop = now - this.lastStopTime;
//       if (timeSinceLastStop < this.minRestartDelay) {
//         const waitTime = this.minRestartDelay - timeSinceLastStop;
//         console.log(`⏳ Waiting ${waitTime}ms before restart...`);
//         await this._delay(waitTime);
//       }

//       this.isInitializing = true;
//       this.finalTranscript = "";

//       // ✅ Clear any existing event listeners to prevent conflicts
//       this._removeAllListeners();

//       // ✅ Setup timeout to prevent hanging
//       const timeoutId = setTimeout(() => {
//         if (this.isListening || this.isInitializing) {
//           console.warn("⏰ Speech recognition timeout - forcing stop");
//           this.stopListening();
//           reject(new Error("Speech recognition timeout"));
//         }
//       }, timeout);

//       this.recognition.onstart = () => {
//         this.isListening = true;
//         this.isInitializing = false;
//         console.log("🎙️ Listening started successfully");
//       };

//       this.recognition.onresult = (event) => {
//         let interimTranscript = "";

//         for (let i = event.resultIndex; i < event.results.length; ++i) {
//           const transcript = event.results[i][0].transcript;
//           if (event.results[i].isFinal) {
//             this.finalTranscript += transcript + " ";
//             if (onFinal) onFinal(this._normalizeTranscript(this.finalTranscript));
//           } else {
//             interimTranscript += transcript;
//           }
//         }

//         const combined = (this.finalTranscript + " " + interimTranscript).trim();
//         if (onPartial) onPartial(this._normalizeTranscript(combined));
//       };

//       this.recognition.onend = () => {
//         console.log("🛑 Speech recognition ended");
//         clearTimeout(timeoutId);
//         this.isListening = false;
//         this.isInitializing = false;
//         this.lastStopTime = Date.now();
        
//         this.finalTranscript = this._normalizeTranscript(this.finalTranscript);

//         if (!this.finalTranscript.trim()) {
//           reject(new Error("No clear speech detected."));
//         } else {
//           resolve(this.finalTranscript);
//         }
//       };

//       this.recognition.onerror = (event) => {
//         console.error("🚨 Speech recognition error:", event.error, event);
//         clearTimeout(timeoutId);
//         this.isListening = false;
//         this.isInitializing = false;
//         this.lastStopTime = Date.now();

//         // ✅ Handle specific error types
//         let errorMessage = "Speech recognition failed";
//         switch (event.error) {
//           case 'network':
//             errorMessage = "Network error - check internet connection";
//             break;
//           case 'not-allowed':
//             errorMessage = "Microphone permission denied";
//             break;
//           case 'no-speech':
//             errorMessage = "No speech detected";
//             break;
//           case 'aborted':
//             errorMessage = "Speech recognition was aborted";
//             break;
//           case 'audio-capture':
//             errorMessage = "Audio capture failed - check microphone";
//             break;
//           case 'service-not-allowed':
//             errorMessage = "Speech service not allowed";
//             break;
//           default:
//             errorMessage = `Speech recognition error: ${event.error}`;
//         }

//         reject(new Error(errorMessage));
//       };

//       // ✅ Enhanced startup with retry mechanism
//       try {
//         // Ensure microphone access first
//         const hasPermission = await this._ensureMicrophoneAccess();
//         if (!hasPermission) {
//           throw new Error("Microphone access denied");
//         }

//         console.log("🎙️ Starting speech recognition...");
//         this.recognition.start();
//       } catch (err) {
//         console.error("Failed to start recognition:", err);
//         clearTimeout(timeoutId);
//         this.isInitializing = false;
//         this.lastStopTime = Date.now();
//         reject(new Error("Failed to start speech recognition: " + err.message));
//       }
//     });
//   }

//   // ✅ Enhanced stop with proper cleanup
//   stopListening() {
//     if (this.recognition && (this.isListening || this.isInitializing)) {
//       try {
//         console.log("🛑 Stopping speech recognition...");
//         this.isListening = false;
//         this.isInitializing = false;
//         this.recognition.stop();
//         this.lastStopTime = Date.now();
//       } catch (err) {
//         console.warn("Error stopping speech recognition:", err);
//         this.isListening = false;
//         this.isInitializing = false;
//         this.lastStopTime = Date.now();
//       }
//     }
//   }

//   // ✅ Helper method to ensure microphone access
//   async _ensureMicrophoneAccess() {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true
//         }
//       });
//       // Close the stream immediately - we just wanted to check permission
//       stream.getTracks().forEach(track => track.stop());
//       return true;
//     } catch (error) {
//       console.error("Microphone access failed:", error);
//       return false;
//     }
//   }

//   // ✅ Clean up event listeners to prevent conflicts
//   _removeAllListeners() {
//     if (this.recognition) {
//       this.recognition.onstart = null;
//       this.recognition.onresult = null;
//       this.recognition.onend = null;
//       this.recognition.onerror = null;
//     }
//   }

//   // ✅ Utility delay function
//   _delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }

//   _normalizeTranscript(text) {
//     if (!text) return "";
//     return text
//       .replace(/\b(um+|uh+|like)\b/gi, "")
//       .replace(/\s+/g, " ")
//       .trim();
//   }

//   // ✅ Enhanced restart method for recovery
//   async restartListening(options = {}) {
//     console.log("🔄 Restarting speech recognition...");
//     this.stopListening();
    
//     // Wait a bit before restarting
//     await this._delay(this.minRestartDelay);
    
//     return this.startListening(options);
//   }

//   // ✅ Health check method
//   isHealthy() {
//     return {
//       recognitionSupported: !!this.recognition,
//       synthesisSupported: !!this.synthesis,
//       isListening: this.isListening,
//       isSpeaking: this.isSpeaking,
//       isInitializing: this.isInitializing,
//       voicesLoaded: this.voices.length > 0
//     };
//   }

//   static isSupported() {
//     const speechRecognitionSupported =
//       "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
//     const speechSynthesisSupported = "speechSynthesis" in window;
//     const mediaDevicesSupported = "mediaDevices" in navigator;
    
//     return {
//       recognition: speechRecognitionSupported,
//       synthesis: speechSynthesisSupported,
//       mediaDevices: mediaDevicesSupported,
//       both: speechRecognitionSupported && speechSynthesisSupported,
//     };
//   }

//   static async requestMicrophonePermission() {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true
//         }
//       });
//       stream.getTracks().forEach((track) => track.stop());
//       return true;
//     } catch (error) {
//       console.error("Microphone permission denied:", error);
//       return false;
//     }
//   }
// }

// // ✅ Export singleton
// const speechService = new SpeechService();
// export default speechService;


class SpeechService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.voices = [];
    this.speakQueue = [];
    this.finalTranscript = "";
    this.isInitializing = false;
    this.lastStopTime = 0;
    this.minRestartDelay = 1000; // 1 second minimum between restarts

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

    // ✅ Optimized settings for better reliability
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
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

  // ✅ Text-to-Speech (unchanged - working fine)
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

  // ✅ FIXED: Start Listening with proper state management
  async startListening({ onPartial, onFinal, timeout = 30000 } = {}) {
    return new Promise(async (resolve, reject) => {
      if (!this.recognition) {
        return reject(new Error("Speech recognition not supported."));
      }

      // ✅ FIXED: Always stop existing recognition first if it's running
      if (this.isListening || this.isInitializing) {
        console.log("🔄 Stopping existing recognition before starting new one...");
        await this._forceStop();
        // Wait a bit longer to ensure complete cleanup
        await this._delay(500);
      }

      // ✅ Enforce minimum delay between restart attempts
      const now = Date.now();
      const timeSinceLastStop = now - this.lastStopTime;
      if (timeSinceLastStop < this.minRestartDelay) {
        const waitTime = this.minRestartDelay - timeSinceLastStop;
        console.log(`⏳ Waiting ${waitTime}ms before restart...`);
        await this._delay(waitTime);
      }

      this.isInitializing = true;
      this.finalTranscript = "";

      // ✅ FIXED: Create fresh recognition instance to avoid state issues
      this._createFreshRecognition();

      // ✅ Setup timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        if (this.isListening || this.isInitializing) {
          console.warn("⏰ Speech recognition timeout - forcing stop");
          this._forceStop();
          reject(new Error("Speech recognition timeout"));
        }
      }, timeout);

      this.recognition.onstart = () => {
        this.isListening = true;
        this.isInitializing = false;
        console.log("🎙️ Listening started successfully");
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
        console.log("🛑 Speech recognition ended");
        clearTimeout(timeoutId);
        this.isListening = false;
        this.isInitializing = false;
        this.lastStopTime = Date.now();
        
        this.finalTranscript = this._normalizeTranscript(this.finalTranscript);

        if (!this.finalTranscript.trim()) {
          reject(new Error("No clear speech detected."));
        } else {
          resolve(this.finalTranscript);
        }
      };

      this.recognition.onerror = (event) => {
        console.error("🚨 Speech recognition error:", event.error, event);
        clearTimeout(timeoutId);
        this.isListening = false;
        this.isInitializing = false;
        this.lastStopTime = Date.now();

        // ✅ Handle specific error types
        let errorMessage = "Speech recognition failed";
        switch (event.error) {
          case 'network':
            errorMessage = "Network error - check internet connection";
            break;
          case 'not-allowed':
            errorMessage = "Microphone permission denied";
            break;
          case 'no-speech':
            errorMessage = "No speech detected";
            break;
          case 'aborted':
            errorMessage = "Speech recognition was aborted";
            break;
          case 'audio-capture':
            errorMessage = "Audio capture failed - check microphone";
            break;
          case 'service-not-allowed':
            errorMessage = "Speech service not allowed";
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        reject(new Error(errorMessage));
      };

      // ✅ Enhanced startup with retry mechanism
      try {
        // Ensure microphone access first
        const hasPermission = await this._ensureMicrophoneAccess();
        if (!hasPermission) {
          throw new Error("Microphone access denied");
        }

        console.log("🎙️ Starting speech recognition...");
        this.recognition.start();
      } catch (err) {
        console.error("Failed to start recognition:", err);
        clearTimeout(timeoutId);
        this.isInitializing = false;
        this.lastStopTime = Date.now();
        reject(new Error("Failed to start speech recognition: " + err.message));
      }
    });
  }

  // ✅ FIXED: Create fresh recognition instance to avoid state conflicts
  _createFreshRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 1;
  }

  // ✅ FIXED: Force stop with complete cleanup
  async _forceStop() {
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onend = null;
        this.recognition.onerror = null;
        
        this.recognition.stop();
        this.recognition.abort(); // Force abort as backup
        
        this.isListening = false;
        this.isInitializing = false;
        this.lastStopTime = Date.now();
        
        console.log("🛑 Force stopped speech recognition");
      } catch (err) {
        console.warn("Error during force stop:", err);
        this.isListening = false;
        this.isInitializing = false;
        this.lastStopTime = Date.now();
      }
    }
  }

  // ✅ Enhanced stop with proper cleanup
  stopListening() {
    if (this.recognition && (this.isListening || this.isInitializing)) {
      try {
        console.log("🛑 Stopping speech recognition...");
        this.isListening = false;
        this.isInitializing = false;
        this.recognition.stop();
        this.lastStopTime = Date.now();
      } catch (err) {
        console.warn("Error stopping speech recognition:", err);
        this.isListening = false;
        this.isInitializing = false;
        this.lastStopTime = Date.now();
      }
    }
  }

  // ✅ Helper method to ensure microphone access
  async _ensureMicrophoneAccess() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      // Close the stream immediately - we just wanted to check permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone access failed:", error);
      return false;
    }
  }

  // ✅ Clean up event listeners to prevent conflicts
  _removeAllListeners() {
    if (this.recognition) {
      this.recognition.onstart = null;
      this.recognition.onresult = null;
      this.recognition.onend = null;
      this.recognition.onerror = null;
    }
  }

  // ✅ Utility delay function
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _normalizeTranscript(text) {
    if (!text) return "";
    return text
      .replace(/\b(um+|uh+|like)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ✅ FIXED: Enhanced restart method with force stop
  async restartListening(options = {}) {
    console.log("🔄 Restarting speech recognition...");
    await this._forceStop();
    
    // Wait a bit before restarting
    await this._delay(this.minRestartDelay);
    
    return this.startListening(options);
  }

  // ✅ Health check method
  isHealthy() {
    return {
      recognitionSupported: !!this.recognition,
      synthesisSupported: !!this.synthesis,
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      isInitializing: this.isInitializing,
      voicesLoaded: this.voices.length > 0
    };
  }

  static isSupported() {
    const speechRecognitionSupported =
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    const speechSynthesisSupported = "speechSynthesis" in window;
    const mediaDevicesSupported = "mediaDevices" in navigator;
    
    return {
      recognition: speechRecognitionSupported,
      synthesis: speechSynthesisSupported,
      mediaDevices: mediaDevicesSupported,
      both: speechRecognitionSupported && speechSynthesisSupported,
    };
  }

  static async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
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