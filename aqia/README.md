# 🧠 AQIA Mate – AI Voice Interviewer

A smart, voice-based mock interview platform powered by **Groq LLaMA-3** and the **Web Speech API**.  
It simulates a professional interviewer, asks domain-specific questions based on your resume, and evaluates your performance — all through voice.

---

## 🎯 Features

- 🎤 **Mic-based Q&A**: Answer questions using your voice (SpeechRecognition)
- 📄 **Resume-aware questions**: Upload your resume to guide the AI's questions
- 🧠 **Groq LLM**: Uses blazing-fast LLaMA-3 (via OpenAI-compatible API)
- 📊 **10-question format**: Includes intro, skills, deep-dive, and project queries
- 🧾 **AI evaluation**: Get feedback, score, strengths & areas of improvement
- 🔊 **Speech output**: AI speaks each question out loud
- 🔐 **Bring Your Own API Key**: Supports user-supplied Groq keys for free use

---

## 🧪 Tech Stack

| Frontend        | Backend/API         | AI/LLM                     | Voice |
|----------------|---------------------|----------------------------|-------|
| React + Vite   | No backend required | Groq LLaMA-3 (`llama3-70b`) | Web Speech API (TTS + STT) |

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/ExplorerSoul/aqia-mate.git
cd aqia-mate
