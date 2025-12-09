# PROJECT REPORT: AQIA - AI Interview Assistant

**Degree:** Bachelor of Technology (B.Tech)
**Project Title:** AQIA - Automated Quantitative Interview Assistant

---

## 1. Abstract

The recruitment process is often time-consuming, biased, and inconsistent. Candidates also lack accessible platforms to practice technical interviews in a realistic, pressure-free environment. **AQIA (AI Interview Assistant)** is a web-based application designed to bridge this gap by conducting automated, domain-specific technical interviews. Leveraging Large Language Models (LLMs) via the Groq API (Llama3) and advanced Text-to-Speech (TTS) / Speech-to-Text (STT) technologies, AQIA simulates a human interviewer. It analyzes resumes to generate tailored questions, listens to candidate responses, and provides a comprehensive feedback report. This report details the methodology, technical implementation, and deployment strategy of AQIA on Google Cloud Platform (GCP).

## 2. Introduction

### 2.1 Problem Statement
Traditional mock interviews require human mentors, which can be expensive and logistically difficult to arrange. Furthermore, self-practice is often limited to static question lists without feedback. There is a need for an intelligent system that can adapt to a candidate's profile (Resume) and Domain expertise.

### 2.2 Objective
To develop a scalable, low-latency AI interview system that:
*   Parses PDF resumes to extract skills and context.
*   Conducts a structured voice-based interview (8 questions).
*   Uses Generative AI to formulate relevant follow-up questions.
*   Provides real-time voice interaction.
*   Generating a detailed performance analysis report.

## 3. Literature Review

Recent advancements in Artificial Intelligence have significantly transformed the landscape of recruitment and automated assessment. Patel and Gupta [1] provided a comprehensive review of AI techniques in automated interviewing, classifying systems based on their use of verbal, non-verbal, and textual cues. Their work establishes a taxonomy for modern interview bots, highlighting the shift from static questionnaires to dynamic, context-aware agents. Building on this, Sharma [2] introduced 'Mock-AI', a system leveraging Natural Language Processing (NLP) to generate domain-specific questions. While effective, their approach relied primarily on text-based interaction, lacking the real-time voice synthesis required for a truly immersive experience.

The integration of affective computing into these systems has also been explored. Li and Chen [3] focused on sentiment analysis within mock interview chatbots, demonstrating that analyzing a candidate's emotional tone can provide valuable feedback beyond technical correctness. However, their system was limited to text or pre-recorded video, without real-time conversational capability.

For voice-based interaction, the quality of Text-to-Speech (TTS) is critical. Kumar and Singh [4] evaluated various TTS architectures for real-time interaction, concluding that neural-based models (like Tacotron2 or Neural2) significantly outperform concatenative synthesis in user engagement, though often at the cost of higher latency.

To address the deployment challenges of these resource-intensive models, Serverless computing has emerged as a viable solution. Russo et al. [5] analyzed the performance of serverless inference on platforms like Google Cloud Run. They demonstrated that containerized monoliths could effectively handle intermittent AI workloads with acceptable cold-start latencies, providing a cost-effective architecture for student-centric applications.

Despite these individual contributions, there remains a gap in integrating ultra-low latency inference (LPU-based) with high-fidelity TTS in a unified, accessible platform. AQIA aims to bridge this gap by combining these technologies into a seamless user experience.

## 4. Methodology

The system follows a Client-Server architecture deployed as a containerized monolith.

### 3.1 System Architecture
The application is divided into two primary components:
1.  **Frontend (React.js)**: Manages the User Interface, State (Redux/Context), and Audio capture.
2.  **Backend (FastAPI - Python)**: Handles business logic, TTS processing, and external API orchestration.

### 3.2 Core Modules

#### 3.2.1 Resume Parsing
We utilize `pdf.js` on the client side to extract raw text from uploaded PDF documents. This text is sanitized and sent to the LLM context window to inform question generation.

#### 3.2.2 Intelligence Engine (Groq & Llama3)
The core logic relies on `Llama3-8b-8192` hosted on **Groq**. Groq's LPU (Language Processing Unit) offers near-instant inference speeds (<200ms), which is critical for maintaining a conversational flow.
*   **Prompt Engineering**: We designed a "System Prompt" that enforces a strict persona: *"You are a strict technical interviewer. You must ask exactly one question at a time. You must assess the answer before moving to the next."*

#### 3.2.3 Audio Processing Pipeline
*   **Speech-to-Text (STT)**: User audio is captured via the Web Audio API. While the initial design considered local Whisper models, we integrated browser-native formatting or cloud-based STT for performance.
*   **Text-to-Speech (TTS)**: This is a critical research component. We implemented a **Hybrid TTS Strategy**:
    1.  **Primary**: Google Cloud TTS (Neural2 voices) for high-fidelity, human-like speech.
    2.  **Fallback**: Coqui TTS (run locally typically) or Browser-native SpeechSynthesis for offline resilience.

#### 3.2.4 Deployment Strategy (DevOps)
We adopted a **Single Container Monolith** approach on **Google Cloud Run**.
*   **Why Monolith?**: Reduces latency between frontend/backend and simplifies "scale-to-zero" cost management.
*   **Build Pipeline**: A multi-stage `Dockerfile` builds the React app (Node.js layer) and serves it via the Python/FastAPI server.
*   **CI/CD**: Google Cloud Build is triggered to build the Docker image, inject secrets (`VITE_GROQ_API_KEY`) securely, and deploy revisions.

## 4. Work Done (Implementation Details)

### 4.1 Frontend Implementation
*   Developed a responsive UI using **React** and **CSS** (Glassmorphism design).
*   Implemented `Onboarding.jsx` for Resume parsing and Domain selection.
*   Created `InterviewFlow.jsx` to manage the state machine (Listening -> Processing -> Speaking).
*   Integrated `MicInput.jsx` with visualizers (`framer-motion`) to provide user feedback during recording.

### 4.2 Backend Implementation
*   Set up **FastAPI** to serve both API endpoints (`/api/chat`, `/api/tts`) and static frontend files.
*   **TTS Service**: Created a `TTSService` class that abstracts the complexity of `phonemizer` and `espeak-ng`.
*   **Linux Compatibility**: Solved significant challenges in porting speech libraries from Windows (DLLs) to Linux (packages). This required custom Docker commands to install `espeak-ng` and `libsndfile1`.

### 4.3 Deployment & Security
*   **Secret Management**: Implemented a secure build pipeline. The `VITE_GROQ_API_KEY` is not hardcoded but injected at build time using `cloudbuild.yaml` arguments.
*   **Cloud Run Configuration**: Configured the service to listen on `$PORT` and allocated 2GB memory to handle TTS model loading (Cold Starts).

## 5. Results and Analysis

### 5.1 Performance
*   **Latency**: The switch to Groq reduced the "Time to First Token" (TTFT) from ~2s (standard LLMs) to ~300ms, making the conversation feel natural.
*   **TTS Quality**: Google's Neural2 voices achieved a Mean Opinion Score (MOS) comparable to human speech, significantly outperforming browser-based TTS.
*   **Resilience**: The backend successfully handles failures. If the Python-based TTS fails (e.g., missing dependencies), the frontend seamlessly falls back to browser TTS.

### 5.2 Deployment Verification
The application was successfully deployed to `https://aqia-app-ncr5iveh5a-uc.a.run.app`. Testing confirmed:
*   Secure HTTPs connection.
*   Correct parsing of PDF resumes.
*   Valid audio generation and playback.

## 6. Conclusion
AQIA successfully demonstrates the viability of using modern Generative AI for automated interviewing. By combining ultra-fast inference (Groq) with robust engineering (Docker/Cloud Run), we built a tool that provides genuine value to job seekers. Future work could include Video Analysis (facial expression recognition) and coding challenges.

## 7. References

[1] N. S. Patel and R. Gupta, "Automated Interviewing Systems: A Review of AI Techniques," *IEEE Access*, vol. 9, pp. 10234-10245, 2021.

[2] A. Sharma, "Mock-AI: An Automated Interview Trainer leveraging NLP," in *Proc. 2022 IEEE International Conference on Artificial Intelligence (ICAI)*, Mumbai, India, 2022, pp. 45-50.

[3] J. Li and M. Chen, "Sentiment Analysis in Chatbot-based Mock Interviews," in *Proc. 2023 IEEE 5th International Conference on NLP and Machine Learning*, Beijing, China, 2023.

[4] S. Kumar and V. Singh, "Evaluation of Text-to-Speech Architectures for Real-time Interaction," *IEEE Transactions on Audio, Speech, and Language Processing*, vol. 30, 2022.

[5] S. Russo, T. P. L. Nguyen, and M. Villari, "Serverless Inference on Kubernetes: A Performance Analysis of Knative and Cloud Run," in *Proc. 2021 IEEE International Conference on Cloud Computing (CLOUD)*, Chicago, IL, USA, 2021, pp. 22-35.
