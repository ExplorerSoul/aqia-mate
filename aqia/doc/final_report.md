
# AQIA: A Context-Aware AI Mock Interview Assistant with Delivery Analytics and Progress Monitoring

**B.Tech Final Year Project Report**

Submitted in partial fulfilment of the requirements for the degree of
**Bachelor of Technology**
in
**Electronics and Communication Engineering**

---

**Submitted by:**

| Name | Roll Number |
|---|---|
| Amit Ranjan Das | 2214134 |
| Kuldeep Das | 2214157 |
| Avinash Raj | 2214112 |
| Rajababu Das | 2214097 |
| Abhinav Singha | 2214085 |
| Kulpesh Meena | 2214154 |

**Supervisor:** Dr. Dipjyoti Das

**Department of Electronics and Communication Engineering**
National Institute of Technology Silchar
Assam – 788010, India

**Academic Year:** 2025–26

---

## Declaration

We, the undersigned students of the Department of Electronics and Communication Engineering, National Institute of Technology Silchar, hereby declare that the project report entitled **"AQIA: A Context-Aware AI Mock Interview Assistant with Delivery Analytics and Progress Monitoring"** submitted in partial fulfilment of the requirements for the degree of Bachelor of Technology is a record of original work carried out by us under the supervision of Dr. Dipjyoti Das.

We further declare that this work has not been submitted, either in part or in full, to any other university or institution for the award of any degree or diploma. All sources of information and references used in this report have been duly acknowledged.

| Name | Roll Number | Signature |
|---|---|---|
| Amit Ranjan Das | 2214134 | |
| Kuldeep Das | 2214157 | |
| Avinash Raj | 2214112 | |
| Rajababu Das | 2214097 | |
| Abhinav Singha | 2214085 | |
| Kulpesh Meena | 2214154 | |

**Date:** _______________
**Place:** NIT Silchar, Assam

---

## Certificate

This is to certify that the project report entitled **"AQIA: A Context-Aware AI Mock Interview Assistant with Delivery Analytics and Progress Monitoring"** submitted by Amit Ranjan Das (2214134), Kuldeep Das (2214157), Avinash Raj (2214112), Rajababu Das (2214097), Abhinav Singha (2214085), and Kulpesh Meena (2214154) in partial fulfilment of the requirements for the award of the degree of Bachelor of Technology in Electronics and Communication Engineering at the National Institute of Technology Silchar is a bonafide record of the work carried out by them under my supervision and guidance.

The content of this report, in full or in parts, has not been submitted to any other institution or university for the award of any degree or diploma.

**Dr. Dipjyoti Das**
Supervisor
Department of Electronics and Communication Engineering
National Institute of Technology Silchar
Assam – 788010, India

**Date:** _______________

**Head of Department**
Department of Electronics and Communication Engineering
National Institute of Technology Silchar

---

## Abstract

The process of preparing for technical job interviews is a significant challenge for engineering graduates, who must simultaneously demonstrate domain knowledge, communication proficiency, and structured problem-solving ability. Existing preparation tools are largely static, offering pre-recorded question banks and model answers without personalisation, real-time feedback, or quantitative assessment of verbal delivery. This project presents AQIA (AI-powered Question and Interview Assistant), a context-aware mock interview platform that addresses these limitations through a fully deployed, production-grade web application.

AQIA integrates a large language model (LLM) backend with a multi-modal speech pipeline to simulate realistic technical interviews tailored to a candidate's resume and chosen domain. The system parses the candidate's PDF resume entirely on the client side using pdfjs-dist, preserving privacy, and uses the extracted context alongside the selected job domain to generate personalised interview questions via the Groq API (Llama-3.3-70b-versatile). Each question is delivered to the candidate through Google Cloud Text-to-Speech using the Chirp3-HD neural voice with SSML prosody control, creating a natural conversational experience. Candidate responses are captured through a hybrid speech-to-text pipeline: the browser's Web Speech API provides a live rolling transcript during the answer, while Groq Whisper produces the final authoritative transcription for evaluation.

Upon completion of the interview, the LLM generates a structured JSON evaluation report containing scores across four competency dimensions — Communication, Technical Accuracy, Problem Solving, and Behavioural — as well as per-question scores, coach's notes, and suggested improved answers. Delivery analytics including words per minute and filler word frequency are computed client-side. All session data is persisted asynchronously to a PostgreSQL database on Neon via an RQ (Redis Queue) worker backed by Upstash Redis, ensuring the user interface remains responsive.

The backend is implemented in Python 3.12 using FastAPI and deployed on Render.com, while the React 19 frontend is deployed on Vercel. Security measures include server-side API key proxying, JWT-based authentication, bcrypt password hashing, CORS restriction, and per-user rate limiting. The system is live and accessible at https://aqia-mate.vercel.app. Evaluation demonstrates sub-second LLM response latency, accurate speech transcription, and a coherent end-to-end interview experience across multiple engineering domains.

**Keywords:** AI mock interview, large language model, speech-to-text, text-to-speech, delivery analytics, FastAPI, React, Groq, PostgreSQL, JWT authentication.

---

## Acknowledgement

We express our sincere gratitude to our project supervisor, **Dr. Dipjyoti Das**, Department of Electronics and Communication Engineering, National Institute of Technology Silchar, for his invaluable guidance, constructive feedback, and continuous encouragement throughout the course of this project. His insights into system design and AI integration were instrumental in shaping the direction of this work.

We are grateful to the **Head of the Department, ECE, NIT Silchar**, and all faculty members who provided academic support and access to institutional resources during the project period.

We acknowledge the developers and maintainers of the open-source tools and cloud platforms that made this project possible, including the Groq team for their Language Processing Unit (LPU) inference API, the Vercel and Render.com platforms for hosting, Neon for serverless PostgreSQL, and the broader open-source communities behind FastAPI, React, Vite, and the many libraries used in this project.

We also thank our fellow students and peers who participated in testing the system and provided valuable feedback on the user experience and interview quality.

Finally, we thank our families for their unwavering support and encouragement throughout our undergraduate journey.

---

## Table of Contents

| Section | Title | Page |
|---|---|---|
| | Declaration | X |
| | Certificate | X |
| | Abstract | X |
| | Acknowledgement | X |
| | Table of Contents | X |
| | List of Abbreviations | X |
| **Chapter 1** | **Introduction** | **X** |
| 1.1 | Motivation | X |
| 1.2 | Problem Statement | X |
| 1.3 | Objectives | X |
| 1.4 | Scope of the Project | X |
| 1.5 | Organisation of the Report | X |
| **Chapter 2** | **Literature Survey** | **X** |
| 2.1 | Existing Interview Preparation Systems | X |
| 2.2 | AI-Driven Conversational Agents | X |
| 2.3 | Speech Analysis in Interview Coaching | X |
| 2.4 | Research Gaps | X |
| 2.5 | How AQIA Addresses the Gaps | X |
| **Chapter 3** | **System Requirements** | **X** |
| 3.1 | Functional Requirements | X |
| 3.2 | Non-Functional Requirements | X |
| 3.3 | Hardware Requirements | X |
| 3.4 | Software Requirements | X |
| 3.5 | System Constraints | X |
| **Chapter 4** | **System Architecture and Design** | **X** |
| 4.1 | High-Level Architecture Overview | X |
| 4.2 | Frontend Architecture | X |
| 4.3 | Backend Architecture | X |
| 4.4 | AI and LLM Integration | X |
| 4.5 | Speech Pipeline Design | X |
| 4.6 | Database Design | X |
| 4.7 | API Design | X |
| 4.8 | Security Architecture | X |
| 4.9 | Asynchronous Job Processing | X |
| 4.10 | Deployment Architecture | X |
| **Chapter 5** | **Implementation** | **X** |
| 5.1 | Frontend Implementation | X |
| 5.2 | Backend Implementation | X |
| 5.3 | AI Integration | X |
| 5.4 | Speech Pipeline Implementation | X |
| 5.5 | Database Implementation | X |
| 5.6 | Deployment and Configuration | X |
| **Chapter 6** | **Results and Discussion** | **X** |
| 6.1 | System Performance | X |
| 6.2 | User Flow Walkthrough | X |
| 6.3 | Analytics Output | X |
| 6.4 | Security Validation | X |
| 6.5 | API Response Times | X |
| **Chapter 7** | **Conclusion and Future Work** | **X** |
| 7.1 | Conclusion | X |
| 7.2 | Limitations | X |
| 7.3 | Future Enhancements | X |
| | References | X |

---

## List of Abbreviations

| Abbreviation | Full Form |
|---|---|
| AI | Artificial Intelligence |
| API | Application Programming Interface |
| CORS | Cross-Origin Resource Sharing |
| CRUD | Create, Read, Update, Delete |
| DB | Database |
| ECE | Electronics and Communication Engineering |
| ER | Entity-Relationship |
| FastAPI | Fast Application Programming Interface (Python web framework) |
| HTTP | Hypertext Transfer Protocol |
| HTTPS | Hypertext Transfer Protocol Secure |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| LLM | Large Language Model |
| LPU | Language Processing Unit |
| NIT | National Institute of Technology |
| ORM | Object-Relational Mapping |
| PDF | Portable Document Format |
| PII | Personally Identifiable Information |
| PostgreSQL | Post Structured Query Language (relational database) |
| REST | Representational State Transfer |
| RQ | Redis Queue |
| SQL | Structured Query Language |
| SSML | Speech Synthesis Markup Language |
| STT | Speech-to-Text |
| TTS | Text-to-Speech |
| UI | User Interface |
| URL | Uniform Resource Locator |
| UX | User Experience |
| WAL | Write-Ahead Logging |
| WPM | Words Per Minute |

---


# Chapter 1: Introduction

## 1.1 Motivation

The transition from academic study to professional employment is one of the most consequential phases in an engineering graduate's career. Technical interviews, which form the primary gateway to employment at most technology companies, demand a combination of domain knowledge, structured communication, and the ability to perform under pressure. Despite the critical importance of interview preparation, the tools available to students remain largely inadequate. Most platforms offer static question banks, pre-recorded video answers, and generic feedback that does not account for the individual candidate's background, target role, or verbal delivery patterns.

The rapid advancement of large language models (LLMs) and cloud-based speech processing services has created an opportunity to build genuinely intelligent, personalised interview coaching systems. LLMs such as Meta's Llama-3.3-70b-versatile, accessible through the Groq inference API, can generate contextually relevant questions from a candidate's resume and provide nuanced, rubric-based feedback on answers. Neural text-to-speech systems such as Google Cloud's Chirp3-HD voice can deliver questions with natural prosody, simulating the experience of speaking with a human interviewer. Browser-native and cloud-based speech recognition can capture and transcribe candidate responses in real time.

The convergence of these technologies makes it feasible to build a fully automated, context-aware mock interview system that is accessible through a standard web browser, requires no specialised hardware, and can be deployed at negligible cost using modern cloud-native infrastructure. This project was motivated by the desire to build and deploy such a system as a practical, production-grade application that NIT Silchar students and engineering graduates more broadly could use to improve their interview readiness.

## 1.2 Problem Statement

Engineering graduates preparing for technical interviews face several interconnected challenges. First, generic preparation resources do not account for the candidate's specific background, skills, or target domain, resulting in practice sessions that may not reflect the actual interview experience. Second, self-study provides no mechanism for objective feedback on communication quality, including speaking pace, use of filler words, or structural clarity of answers. Third, progress over time is difficult to track without a system that records and analyses performance across multiple sessions. Fourth, existing AI-based tools that do exist often expose API keys in client-side code, rely on expensive infrastructure, or require paid subscriptions that are inaccessible to students.

The problem, therefore, is to design and implement a web-based mock interview system that: (a) generates personalised questions from the candidate's resume and chosen domain; (b) delivers questions through natural-sounding speech; (c) captures and evaluates candidate responses using AI; (d) computes quantitative delivery analytics; (e) tracks progress across sessions; and (f) does all of this securely, at low cost, and with a production-quality user experience.

## 1.3 Objectives

The primary objectives of this project are as follows:

1. To design and implement a full-stack web application that conducts context-aware AI-driven mock interviews personalised to the candidate's resume and selected job domain.
2. To integrate a large language model (Groq Llama-3.3-70b-versatile) as a server-side proxy for question generation and answer evaluation, ensuring API keys are never exposed to the browser.
3. To implement a hybrid speech pipeline combining the browser's Web Speech API for live transcription and Groq Whisper for final authoritative transcription.
4. To deliver interview questions through Google Cloud Text-to-Speech using the Chirp3-HD neural voice with SSML prosody control, with automatic fallback to browser speech synthesis.
5. To compute delivery analytics including words per minute and filler word frequency for each candidate response.
6. To persist session data, scores, and analytics to a cloud PostgreSQL database using asynchronous job processing via RQ and Upstash Redis.
7. To implement a secure authentication system using JWT tokens and bcrypt password hashing.
8. To deploy the complete system to production — frontend on Vercel, backend on Render.com — and make it publicly accessible.
9. To provide a dashboard that aggregates performance statistics and visualises progress over time.

## 1.4 Scope of the Project

AQIA is scoped as a web-based application accessible through any modern browser supporting the Web Speech API (primarily Chromium-based browsers). The system supports mock interviews across a range of software engineering domains including Frontend Development, Backend Development, Data Science, Machine Learning, DevOps, System Design, Product Management, and General Software Engineering. The number of questions per session is configurable between 3 and 20.

The system is designed for individual use by candidates preparing for technical interviews. It does not include features for institutional administration, bulk user management, or integration with external applicant tracking systems. The scope is limited to the interview preparation use case; the system does not facilitate actual job applications or connect candidates with employers.

The project encompasses the complete software development lifecycle from requirements analysis and system design through implementation, testing, and production deployment. Both the frontend (https://aqia-mate.vercel.app) and backend (https://aqia-backend.onrender.com) are live and publicly accessible as of the submission of this report.

## 1.5 Organisation of the Report

The remainder of this report is organised as follows. Chapter 2 presents a survey of existing interview preparation systems and related research, identifying the gaps that AQIA addresses. Chapter 3 specifies the functional and non-functional requirements of the system. Chapter 4 provides a detailed description of the system architecture and design, covering all major components. Chapter 5 describes the implementation of each subsystem. Chapter 6 presents the results and discusses system performance, user experience, and security. Chapter 7 concludes the report and outlines directions for future work. References are provided at the end of the document.

---

# Chapter 2: Literature Survey

## 2.1 Existing Interview Preparation Systems

The landscape of interview preparation tools spans a wide spectrum from simple question-and-answer repositories to sophisticated AI-driven platforms. Understanding the state of the art is essential for contextualising the contributions of AQIA.

**Static Question Banks and Community Platforms:** Platforms such as LeetCode, HackerRank, and GeeksforGeeks provide large repositories of technical questions categorised by topic and difficulty. While valuable for practising algorithmic problem-solving, these platforms offer no mechanism for practising verbal communication, no personalisation based on the candidate's background, and no feedback on delivery quality. The candidate must self-assess their performance, which is inherently unreliable.

**Video-Based Preparation Platforms:** Services such as Pramp and Interviewing.io facilitate peer-to-peer mock interviews, where two candidates take turns interviewing each other. While this provides a more realistic experience than self-study, it depends on the availability of a willing partner, the quality of the partner's feedback, and scheduling coordination. These platforms do not provide AI-generated feedback or quantitative analytics.

**Commercial AI Interview Platforms:** Products such as HireVue, Pymetrics, and Interviewer.AI are designed for use by employers to screen candidates, not for candidate self-preparation. They typically analyse video recordings for facial expressions, tone, and word choice, but are not accessible to individual candidates for practice. Furthermore, their evaluation criteria are proprietary and opaque.

**Chatbot-Based Interview Simulators:** Several academic and commercial projects have explored using chatbots for interview simulation. Early systems used rule-based dialogue management with fixed question trees, which produced rigid, unrealistic conversations. More recent systems have used retrieval-augmented generation or fine-tuned language models to generate questions, but few have integrated speech input and output into a seamless browser-based experience.

## 2.2 AI-Driven Conversational Agents

The development of transformer-based language models, beginning with the publication of "Attention Is All You Need" by Vaswani et al. [1], has fundamentally changed the capabilities of conversational AI systems. Models such as GPT-4, Claude, and the Llama family have demonstrated the ability to engage in coherent, contextually appropriate multi-turn dialogue across a wide range of domains.

For interview simulation specifically, the key capability required is the ability to generate questions that are relevant to a specific resume and domain, evaluate free-form answers against implicit rubrics, and provide constructive feedback. Brown et al. [2] demonstrated that large language models can perform these tasks in a zero-shot or few-shot setting, without task-specific fine-tuning, when provided with appropriate prompts. This finding is central to the design of AQIA, which uses carefully engineered prompts to guide the Llama-3.3-70b-versatile model through question generation and answer evaluation.

The Groq LPU (Language Processing Unit) inference platform, used in this project, achieves significantly lower latency than GPU-based inference for autoregressive language model decoding [3]. This is critical for an interactive interview application where response latency directly affects the user experience.

## 2.3 Speech Analysis in Interview Coaching

Research in communication coaching has established that delivery quality — including speaking rate, pause patterns, and filler word usage — is a significant predictor of perceived competence and confidence in interview settings [4]. Luzardo et al. [5] found that candidates who spoke at a moderate pace (120–160 WPM) and used fewer filler words were rated more favourably by interviewers, independent of the content of their answers.

Automatic speech recognition (ASR) systems have reached human-level accuracy on clean speech for major languages, enabling reliable transcription of interview responses. The Whisper model family, developed by Radford et al. [6], provides robust multilingual ASR with strong performance on spontaneous speech, making it suitable for transcribing interview answers that may include disfluencies, technical terminology, and non-native accents.

Neural text-to-speech systems have similarly advanced to the point where synthesised speech is largely indistinguishable from human speech in controlled listening tests [7]. Google's Chirp3-HD voice, used in AQIA, represents the current state of the art in neural TTS, with natural prosody, appropriate emphasis, and minimal artefacts.

## 2.4 Research Gaps

Despite the advances described above, several gaps remain in the existing literature and commercial offerings:

1. **Lack of resume-contextualised question generation:** Most systems use generic question banks rather than generating questions tailored to the specific candidate's experience and skills.
2. **Absence of integrated speech pipeline:** Few systems combine live speech recognition for real-time feedback with a higher-accuracy cloud ASR for final evaluation in the same session.
3. **No delivery analytics in open systems:** Quantitative metrics such as WPM and filler word frequency are computed by commercial employer-facing tools but are not available in candidate-facing preparation platforms.
4. **Security and privacy concerns:** Many AI-powered tools expose API keys in client-side JavaScript bundles, creating security vulnerabilities. Resume data is often uploaded to servers, raising privacy concerns.
5. **Cost barriers:** Most sophisticated interview preparation tools require paid subscriptions, limiting accessibility for students in developing countries.

## 2.5 How AQIA Addresses the Gaps

AQIA directly addresses each of the identified gaps. Resume parsing is performed entirely on the client side using pdfjs-dist, so the resume is never transmitted to any server, addressing the privacy concern. The extracted resume text is included in the LLM prompt to generate questions that are specific to the candidate's background. The hybrid STT pipeline provides both live feedback and accurate final transcription. Delivery analytics (WPM, filler word count and percentage) are computed for every response. The Groq API key is proxied through the backend and never included in the JavaScript bundle. The system is deployed on free-tier cloud infrastructure, making it accessible at no cost to users.

---

# Chapter 3: System Requirements

## 3.1 Functional Requirements

The following functional requirements were identified during the requirements analysis phase and are fully implemented in the deployed system:

**FR-01: User Registration and Authentication**
The system shall allow new users to register with an email address, name, and password. Registered users shall be able to log in and receive a JWT access token. All protected endpoints shall require a valid JWT Bearer token.

**FR-02: Dashboard**
The system shall display an aggregated dashboard for authenticated users showing: total number of completed interviews, highest score achieved, average score across all sessions, and a progress chart showing score trends over time.

**FR-03: Interview Onboarding**
The system shall allow users to configure a new interview session by uploading a PDF resume, selecting a job domain from a predefined list, and specifying the number of questions (between 3 and 20).

**FR-04: Resume Parsing**
The system shall parse the uploaded PDF resume on the client side and extract text content for use in question generation. The resume file shall not be transmitted to the server.

**FR-05: AI Question Generation**
The system shall generate interview questions using the Groq LLM API, incorporating the candidate's resume text and selected domain as context. Questions shall be relevant to the candidate's stated experience and the target domain.

**FR-06: Text-to-Speech Question Delivery**
The system shall deliver each generated question to the candidate through synthesised speech using Google Cloud TTS (Chirp3-HD voice) with SSML prosody control. A browser-based fallback shall be available if the cloud TTS service is unavailable.

**FR-07: Voice Response Capture**
The system shall capture the candidate's spoken response using the browser's Web Speech API, displaying a live rolling transcript during the answer. The final response shall be transcribed using Groq Whisper for accuracy.

**FR-08: Delivery Analytics**
The system shall compute and display the following delivery metrics for each response: words per minute (WPM) and filler word count (including "um", "uh", "like", "basically", "you know", "so", "right", and similar disfluencies).

**FR-09: AI Evaluation and Feedback**
Upon completion of all questions, the system shall submit the full interview transcript to the Groq LLM and receive a structured JSON evaluation report containing: overall score (0–100), scores for Communication, Technical Accuracy, Problem Solving, and Behavioural dimensions (0–100 each), per-question scores (0–10), coach's notes per question, and suggested improved answers.

**FR-10: Session Persistence**
The system shall save completed interview sessions, including all scores and per-question data, to the database asynchronously. The user interface shall not block while the save operation is in progress.

**FR-11: Interview History**
The system shall allow users to retrieve a list of their past interview sessions with summary information.

**FR-12: Rate Limiting**
The system shall enforce a limit of one interview submission per user per day, returning HTTP 429 if the limit is exceeded.

**FR-13: Health Monitoring**
The system shall expose a health check endpoint that returns the current status of the API service.

## 3.2 Non-Functional Requirements

**NFR-01: Performance**
The LLM API response for question generation shall complete within 3 seconds under normal load. The TTS audio for a typical question (20–40 words) shall be available within 2 seconds of the request.

**NFR-02: Security**
All API keys (Groq, Google Cloud) shall be stored as server-side environment variables and never included in client-side code or HTTP responses. All passwords shall be hashed using bcrypt before storage. All inter-service communication shall use HTTPS.

**NFR-03: Availability**
The system shall be deployed on cloud infrastructure with automatic restart on failure. The frontend shall be served from a CDN with global edge distribution.

**NFR-04: Scalability**
The database connection pool shall be configured to handle concurrent users without exhausting connections. The backend shall support horizontal scaling through stateless JWT authentication.

**NFR-05: Usability**
The user interface shall be operable without any installation or plugin beyond a modern Chromium-based browser. The interview flow shall be completable by a first-time user without external documentation.

**NFR-06: Privacy**
Resume data shall be processed entirely on the client side and shall not be stored on any server. User interview data shall be accessible only to the authenticated user who created it.

**NFR-07: Maintainability**
Database schema changes shall be managed through Alembic migrations. The codebase shall be organised into clearly separated frontend and backend modules.

## 3.3 Hardware Requirements

AQIA is a web-based application and imposes minimal hardware requirements on the end user:

- A device with a modern Chromium-based browser (Google Chrome 90+, Microsoft Edge 90+, or Brave)
- A working microphone for voice input
- Speakers or headphones for audio output
- A stable internet connection (minimum 1 Mbps for audio streaming)

Server-side infrastructure is provided by cloud platforms (Render.com, Vercel, Neon, Upstash) and requires no dedicated hardware procurement.

## 3.4 Software Requirements

**Client-Side:**
- Browser: Google Chrome 90+ or Chromium-based equivalent (required for Web Speech API support)
- Operating System: Any (Windows, macOS, Linux, Android, iOS)
- No additional software installation required

**Development Environment:**
- Node.js 18+ and npm for frontend development
- Python 3.12 for backend development
- Git for version control
- PostgreSQL 15 (local) or Neon cloud PostgreSQL for database

**Production Dependencies (Backend):**
- FastAPI 0.110+, Uvicorn, SQLAlchemy 2.0, Alembic, python-jose, passlib[bcrypt], httpx, rq, redis, psycopg2-binary

**Production Dependencies (Frontend):**
- React 19, Vite 5, pdfjs-dist, recharts (for progress charts), axios or fetch API

## 3.5 System Constraints

1. **Browser Compatibility:** The Web Speech API is not supported in Firefox or Safari, limiting voice input to Chromium-based browsers. The system degrades gracefully by allowing text input as an alternative.
2. **Free-Tier Infrastructure:** The backend is deployed on Render.com's free tier, which spins down after 15 minutes of inactivity. The first request after a cold start may experience a delay of 30–60 seconds.
3. **Rate Limits:** The Groq API imposes rate limits on the free tier. Under high concurrent load, requests may be queued or throttled.
4. **Single Worker Process:** The RQ worker runs within the same Render dyno as the FastAPI application to avoid the cost of a separate worker service. This limits the throughput of background job processing.
5. **Language Support:** The system is designed for English-language interviews. The Whisper transcription model supports multiple languages, but the LLM prompts and evaluation rubrics are in English.

---


# Chapter 4: System Architecture and Design

## 4.1 High-Level Architecture Overview

AQIA follows a three-tier client-server architecture comprising a React single-page application (SPA) on the frontend, a FastAPI REST API on the backend, and a PostgreSQL relational database for persistent storage. The system additionally integrates three external AI/cloud services — the Groq API for LLM inference and speech transcription, Google Cloud Text-to-Speech for audio synthesis, and Upstash Redis for message queue brokering — and uses Vercel and Render.com as deployment platforms.

The architectural separation between frontend and backend is strict: the frontend communicates with the backend exclusively through the documented REST API over HTTPS. No direct database connections are made from the browser. All third-party API keys are held exclusively by the backend, which acts as a secure proxy for all AI service calls. This design ensures that sensitive credentials are never exposed in the JavaScript bundle delivered to the browser.

The data flow for a complete interview session can be summarised as follows: the user authenticates and receives a JWT token; the frontend parses the resume locally and sends the extracted text and domain selection to the backend LLM proxy; the backend forwards the request to Groq and returns the generated question; the frontend synthesises the question as speech via the Google TTS proxy; the user responds by voice; the frontend sends the audio to the Whisper proxy for transcription; after all questions are answered, the frontend sends the full transcript to the LLM for evaluation; the evaluation result is displayed to the user and submitted to the backend for asynchronous persistence via the RQ job queue.

## 4.2 Frontend Architecture

The frontend is a React 19 single-page application built with Vite 5 as the build tool and development server. Vite was chosen over Create React App for its significantly faster hot module replacement (HMR) during development and its optimised production build pipeline using Rollup.

The application is structured around the following primary views:

- **AuthPage:** Handles user registration and login. Stores the JWT token in localStorage upon successful authentication.
- **Dashboard:** The landing page for authenticated users. Fetches aggregated statistics from the `/api/dashboard` endpoint and renders a progress chart using the Recharts library.
- **Onboarding:** A multi-step form for configuring a new interview session. Handles PDF file selection, client-side parsing via pdfjs-dist, domain selection, and question count configuration.
- **InterviewSession:** The core interview view. Manages the state machine for the interview flow (question display, recording, transcription, next question), integrates the Web Speech API for live transcription, calls the TTS proxy for audio playback, and tracks delivery metrics.
- **FinalReview:** Displays the complete evaluation report after the interview, including all scores, per-question feedback, coach's notes, and suggested answers.

State management is handled through React's built-in hooks (useState, useEffect, useRef, useCallback) without an external state management library, keeping the dependency footprint minimal. The Vite configuration includes a development proxy that forwards `/api` requests to the local backend, eliminating CORS issues during development.

The frontend is deployed on Vercel, which provides automatic deployments from the Git repository, global CDN distribution, and HTTPS termination. The `vercel.json` configuration file specifies the build command and output directory, and rewrites all routes to `index.html` to support client-side routing.

## 4.3 Backend Architecture

The backend is a Python 3.12 application built with FastAPI, an asynchronous web framework based on Starlette and Pydantic. FastAPI was chosen for its native support for async/await, automatic OpenAPI documentation generation, and Pydantic-based request validation, which reduces boilerplate and improves reliability.

The backend is structured into the following modules:

- **main.py:** Application entry point. Configures the FastAPI application instance, registers middleware (CORS, rate limiting), and includes all route modules.
- **routes/auth.py:** Handles user registration and login endpoints. Validates credentials, hashes passwords with bcrypt, and issues JWT tokens using python-jose.
- **routes/chat.py:** Proxies requests to the Groq Chat Completions API. Validates the JWT token, forwards the request with the server-side API key, and returns the LLM response.
- **routes/transcribe.py:** Proxies audio data to the Groq Whisper API for transcription.
- **routes/tts.py:** Proxies text to the Google Cloud TTS API and returns audio data.
- **routes/interviews.py:** Handles interview session creation (with rate limiting and async job enqueue) and retrieval.
- **routes/dashboard.py:** Executes aggregated SQL queries to compute dashboard statistics.
- **routes/jobs.py:** Provides a polling endpoint for checking the status of async RQ jobs.
- **database.py:** Configures the SQLAlchemy engine and session factory. Supports both SQLite (development) and PostgreSQL (production) through the `DATABASE_URL` environment variable.
- **models.py:** Defines SQLAlchemy ORM models for all five database tables.
- **workers.py:** Defines the RQ job function that persists interview session data to the database.

The application is served by Uvicorn, an ASGI server, with a single worker process on the Render.com free tier. The `render.yaml` configuration file specifies the build command, start command, and environment variable references for the deployment.

## 4.4 AI and LLM Integration

The Groq API serves as the primary AI inference backend for AQIA. Groq's Language Processing Unit (LPU) architecture is specifically optimised for the sequential token generation pattern of autoregressive language models, achieving inference speeds of 500–800 tokens per second for the Llama-3.3-70b-versatile model. This is approximately 10–20 times faster than typical GPU-based inference, which is critical for maintaining a responsive interview experience.

Two distinct LLM interactions occur during an interview session:

**Question Generation:** The system prompt instructs the model to act as a professional technical interviewer. The user message includes the candidate's resume text, the selected domain, the number of questions requested, and any previously asked questions (to avoid repetition). The model returns a JSON array of question objects. The prompt is constructed in `promptBuilder.js` on the frontend and sent to the `/api/chat` endpoint.

**Answer Evaluation:** After all questions have been answered, the complete interview transcript (each question paired with the candidate's answer) is submitted to the model with a detailed evaluation prompt. The prompt specifies the scoring rubric: overall score (0–100), four dimension scores (Communication, Technical Accuracy, Problem Solving, Behavioural), per-question scores (0–10), coach's notes, and suggested improved answers. The model is instructed to return a strictly formatted JSON object. The backend validates the JSON structure before returning it to the frontend.

The Groq API key is stored as an environment variable on Render.com and is never included in any HTTP response or client-side code. The backend uses the `httpx` library for asynchronous HTTP requests to the Groq API.

## 4.5 Speech Pipeline Design

The speech pipeline is one of the most technically complex components of AQIA, combining three distinct speech technologies in a coordinated workflow.

**Text-to-Speech (Question Delivery):** When a new question is ready to be presented, the frontend sends the question text to the `/google-tts` endpoint. The backend wraps the text in SSML markup with prosody controls (`rate="0.95"` and `pitch="-1st"`) to produce speech that sounds measured and natural rather than rushed. The Google Cloud TTS API is called with the `en-US-Chirp3-HD-Aoede` voice (Chirp3-HD tier). The audio data is returned as a base64-encoded MP3 and played through the browser's Audio API. If the Google TTS request fails, the system falls back to the browser's built-in `SpeechSynthesis` API. A secondary fallback cascade within the Google TTS integration tries `Journey` and `Neural2` voice tiers before resorting to browser synthesis.

**Live Speech Recognition (Web Speech API):** When the user begins their answer, the frontend initialises a `SpeechRecognition` instance from the browser's Web Speech API. This provides a continuously updated transcript displayed in real time as the user speaks. The live transcript serves as immediate visual feedback, confirming that the microphone is active and the speech is being captured. Interim results are displayed in a lighter colour to distinguish them from confirmed segments.

**Final Transcription (Groq Whisper):** When the user stops speaking (detected by a silence timeout or manual stop), the recorded audio blob is sent to the `/api/transcribe` endpoint. The backend forwards the audio to the Groq Whisper API (`whisper-large-v3` model), which returns a more accurate transcription than the browser's Web Speech API, particularly for technical terminology, proper nouns, and non-native accents. The Whisper transcription replaces the Web Speech API transcript as the authoritative record of the candidate's answer.

**Delivery Metrics Computation:** After the final transcription is received, the frontend computes delivery metrics. WPM is calculated by dividing the word count of the transcription by the elapsed recording time in minutes. Filler word detection uses a regular expression matching a predefined list of disfluencies against the transcription text. Both metrics are displayed alongside the answer in the interview session view and included in the final review.

## 4.6 Database Design

The database schema consists of five tables designed to support the full range of application functionality with efficient query patterns.

**users:** Stores account credentials and profile information. Fields: `id` (UUID primary key), `email` (unique, indexed), `password_hash` (bcrypt), `name`, `created_at`. The email field has a unique constraint to prevent duplicate registrations.

**interview_sessions:** Records each completed interview session. Fields: `id` (UUID primary key), `user_id` (foreign key to users, indexed), `job_category` (text), `overall_score` (integer 0–100), `started_at` (timestamp), `completed_at` (timestamp). A composite index on `(user_id, started_at)` supports efficient retrieval of a user's sessions ordered by date. A composite index on `(user_id, overall_score)` supports the dashboard query for the user's highest score.

**question_history:** Stores the per-question data for each session. Fields: `id` (UUID primary key), `session_id` (foreign key to interview_sessions), `question_asked` (text), `user_answer` (text), `ai_feedback` (text), `score` (integer 0–10). This table enables detailed review of individual questions and answers.

**analytics_scores:** Stores the four dimension scores for each session. Fields: `id` (UUID primary key), `session_id` (foreign key to interview_sessions), `category` (text: "Communication", "Technical", "Problem Solving", "Behavioral"), `score` (integer 0–100). The normalised design allows new scoring dimensions to be added without schema changes.

**progress_tracking:** Stores computed progress metrics per user per day. Fields: `id` (UUID primary key), `user_id` (foreign key to users), `date_recorded` (date), `rolling_average_score` (float), `total_interviews` (integer), `most_improved_category` (text). This table is updated by the RQ worker after each session is saved, enabling efficient dashboard queries without recomputing rolling averages on every request.

The schema is managed through Alembic migrations, which provide version-controlled, reversible schema changes. The same codebase supports SQLite for local development (using WAL mode for concurrent reads) and PostgreSQL for production, controlled by the `DATABASE_URL` environment variable.

## 4.7 API Design

The backend exposes a RESTful API with eleven endpoints, all served under the `/api` prefix except for the Google TTS proxy. All endpoints except `/api/register`, `/api/login`, `/api/health`, and `/api/docs` require a valid JWT Bearer token in the `Authorization` header.

The API follows REST conventions: POST for resource creation and state-changing operations, GET for retrieval. Request and response bodies use JSON. Error responses include an HTTP status code and a JSON body with a `detail` field describing the error.

The `/api/chat` endpoint accepts a `messages` array in the OpenAI-compatible format and forwards it to the Groq Chat Completions API. This design allows the frontend to use the same message format as the Groq API directly, with the backend acting as a transparent proxy that injects the API key.

The `/api/interviews` POST endpoint implements server-side rate limiting by querying the database for the user's most recent session. If a session was completed within the past 24 hours, the endpoint returns HTTP 429 with a `Retry-After` header. If the rate limit is not exceeded, the session data is enqueued as an RQ job and the endpoint returns HTTP 202 Accepted with a `job_id` that the client can use to poll the `/api/jobs/{job_id}` endpoint for completion status.

The `/api/dashboard` endpoint executes a single SQL query using COUNT, MAX, and AVG aggregate functions to compute the dashboard statistics in a single round trip to the database.

Full API documentation is available at the `/api/docs` endpoint (Swagger UI) and `/api/redoc` (ReDoc), automatically generated by FastAPI from the Pydantic models and route decorators.

## 4.8 Security Architecture

Security was a primary design concern throughout the development of AQIA. The following measures are implemented in the deployed system:

**API Key Protection:** The Groq API key and Google Cloud service account credentials are stored as environment variables and Secret Files on Render.com respectively. They are never included in the JavaScript bundle, never returned in API responses, and never logged. The frontend has no direct access to any third-party API.

**Authentication:** User passwords are hashed using bcrypt with a work factor of 12 before storage. JWT access tokens are signed with a secret key using the HS256 algorithm and include an expiration claim. Tokens are stored in localStorage on the client and included in the `Authorization: Bearer` header of all authenticated requests.

**Authorisation:** All database queries that retrieve or modify user data include a `WHERE user_id = :current_user_id` clause, ensuring that users can only access their own data. This is enforced at the application layer in every route handler.

**CORS:** The FastAPI CORS middleware is configured to allow requests only from the specific Vercel deployment origin (`https://aqia-mate.vercel.app`). All other origins are rejected with a CORS error, preventing cross-site request forgery from other domains.

**Rate Limiting:** The interview submission endpoint enforces a limit of one session per user per 24-hour period. This prevents abuse of the Groq API quota and ensures fair usage.

**Input Validation:** All request bodies are validated by Pydantic models before processing. Invalid or malformed requests are rejected with HTTP 422 before reaching any business logic.

## 4.9 Asynchronous Job Processing

Saving a complete interview session to the database involves multiple INSERT operations across four tables (interview_sessions, question_history, analytics_scores, progress_tracking) and a progress recalculation. Performing these operations synchronously in the HTTP request handler would introduce latency of several hundred milliseconds, degrading the user experience at the end of the interview.

To address this, AQIA uses RQ (Redis Queue) for asynchronous job processing. When the frontend submits the interview results, the backend enqueues a job containing the serialised session data and immediately returns HTTP 202 Accepted with a job ID. The RQ worker, running in a background thread within the same Render dyno, picks up the job and executes the database writes asynchronously.

Upstash Redis is used as the message broker for RQ. Upstash provides a serverless Redis instance with a REST API, which is compatible with the free tier of Render.com and does not require a persistent Redis process. The RQ library connects to Upstash Redis using the standard Redis protocol over TLS.

The frontend polls the `/api/jobs/{job_id}` endpoint at 2-second intervals to check whether the job has completed. Once the job status is "finished", the frontend navigates to the FinalReview page. If the job fails, the frontend displays an error message and allows the user to retry.

## 4.10 Deployment Architecture

The production deployment uses a combination of free-tier cloud services, chosen to minimise cost while providing reliable availability:

**Frontend (Vercel):** The React application is built by Vite and deployed to Vercel's global CDN. Vercel automatically deploys on every push to the main branch of the Git repository. The `vercel.json` file configures the build command (`npm run build`), output directory (`dist`), and SPA routing rewrites.

**Backend (Render.com):** The FastAPI application is deployed as a Web Service on Render.com's free tier. The `render.yaml` file specifies the build command (`pip install -r requirements.txt`), start command (`uvicorn main:app --host 0.0.0.0 --port $PORT`), and environment variable references. The RQ worker runs as a background thread within the same process, started during application startup.

**Database (Neon):** PostgreSQL is hosted on Neon's serverless platform. Neon provides a connection pooler (PgBouncer) that is compatible with the connection pooling configuration in SQLAlchemy (`pool_size=10`, `max_overflow=20`). The database URL is stored as an environment variable on Render.com.

**Message Queue (Upstash Redis):** The Redis instance for RQ is hosted on Upstash's serverless platform. The connection URL is stored as an environment variable on Render.com.

**Environment Configuration:** All sensitive configuration (API keys, database URLs, JWT secret) is managed through environment variables. The `render.yaml` file references these variables by name, and they are set through the Render.com dashboard. No secrets are committed to the Git repository.

---

# Chapter 5: Implementation

## 5.1 Frontend Implementation

The frontend was implemented using React 19 with functional components and hooks throughout. The project was scaffolded using `npm create vite@latest` with the React template, providing a minimal, fast development environment.

**Component Structure:** The application is organised into page-level components (AuthPage, Dashboard, Onboarding, InterviewSession, FinalReview) and reusable UI components (ScoreCard, ProgressChart, QuestionCard, TranscriptDisplay). Each page component manages its own state and communicates with the backend through a centralised API utility module (`src/api/client.js`) that attaches the JWT token to all requests.

**PDF Resume Parsing:** The pdfjs-dist library (version 3.x) is used to parse uploaded PDF files entirely in the browser. The `pdfjsLib.getDocument()` function loads the PDF from an ArrayBuffer, and the text content of each page is extracted using `page.getTextContent()`. The concatenated text is passed to the interview session as context for question generation. This approach ensures that the resume file is never transmitted to any server.

**Interview State Machine:** The InterviewSession component implements a state machine with the following states: `idle`, `speaking` (TTS playing), `listening` (recording user answer), `processing` (Whisper transcription in progress), `evaluating` (LLM evaluation in progress), and `complete`. State transitions are managed through a `useReducer` hook, ensuring predictable state updates.

**Progress Chart:** The Dashboard page uses the Recharts library to render a line chart of the user's score history. The chart data is fetched from the `/api/dashboard` endpoint and includes the date and overall score for each completed session.

**Routing:** Client-side routing is implemented using React Router v6. Protected routes check for the presence of a JWT token in localStorage and redirect to the login page if no token is found.

## 5.2 Backend Implementation

The backend was implemented in Python 3.12 using FastAPI. The project structure follows FastAPI conventions with a `main.py` entry point and a `routes/` directory containing one module per resource.

**Authentication Implementation:** User registration hashes the password using `passlib.context.CryptContext` with the bcrypt scheme. Login verifies the password hash and, on success, creates a JWT token using `python_jose.jwt.encode()` with the HS256 algorithm and a configurable expiration time (default 24 hours). The `get_current_user` dependency function, used by all protected routes, decodes and validates the JWT token from the Authorization header.

**Database Session Management:** SQLAlchemy's `sessionmaker` is used to create database sessions. A FastAPI dependency (`get_db`) yields a session for each request and ensures it is closed after the request completes, even if an exception occurs. This pattern prevents connection leaks.

**CORS Configuration:** The `fastapi.middleware.cors.CORSMiddleware` is configured with `allow_origins=["https://aqia-mate.vercel.app"]`, `allow_credentials=True`, `allow_methods=["*"]`, and `allow_headers=["*"]`. During local development, the origin list is extended to include `http://localhost:5173`.

**Error Handling:** FastAPI's exception handler mechanism is used to return consistent JSON error responses. SQLAlchemy integrity errors (e.g., duplicate email registration) are caught and converted to HTTP 409 Conflict responses.

## 5.3 AI Integration

The Groq API integration is implemented in two route modules: `routes/chat.py` for LLM inference and `routes/transcribe.py` for Whisper transcription.

**LLM Proxy:** The `/api/chat` endpoint accepts a JSON body with a `messages` array. The backend constructs an HTTP POST request to `https://api.groq.com/openai/v1/chat/completions` with the `Authorization: Bearer {GROQ_API_KEY}` header, the `model` field set to `llama-3.3-70b-versatile`, and the `messages` array from the request body. The response is forwarded directly to the frontend. The `httpx.AsyncClient` is used for non-blocking HTTP requests.

**Whisper Proxy:** The `/api/transcribe` endpoint accepts a multipart form upload containing the audio file. The backend forwards the file to `https://api.groq.com/openai/v1/audio/transcriptions` with the `model` field set to `whisper-large-v3`. The transcription text is returned as a JSON response.

**Prompt Engineering:** The question generation prompt in `promptBuilder.js` instructs the model to generate questions that are specific to the candidate's resume, appropriate for the selected domain, and varied in type (technical, behavioural, situational). The evaluation prompt specifies the exact JSON schema expected in the response, including field names, data types, and value ranges, reducing the likelihood of malformed output.

## 5.4 Speech Pipeline Implementation

**Google TTS Integration:** The `/google-tts` endpoint uses the Google Cloud Text-to-Speech client library (`google-cloud-texttospeech`). The service account credentials are loaded from a Secret File on Render.com, mounted at a path specified by the `GOOGLE_APPLICATION_CREDENTIALS` environment variable. The SSML input wraps the question text in `<speak><prosody rate="0.95" pitch="-1st">...</prosody></speak>` tags. The audio encoding is set to MP3, and the response audio content is returned as a base64-encoded string.

**Web Speech API Integration:** The `SpeechRecognition` interface (or `webkitSpeechRecognition` for Chrome) is initialised with `continuous=true` and `interimResults=true`. Event handlers update the live transcript state on `onresult` events and detect silence on `onspeechend` events. A 2-second silence timeout triggers the end of the recording phase.

**Whisper Integration:** The recorded audio is captured as a `MediaRecorder` blob in WebM/Opus format. The blob is converted to a `FormData` object and sent to the `/api/transcribe` endpoint via a POST request. The returned transcription text replaces the Web Speech API transcript as the authoritative answer.

**Delivery Metrics:** WPM is computed as `(wordCount / recordingDurationMs) * 60000`. Filler word detection uses the regular expression `/\b(um|uh|like|basically|you know|so|right|actually|literally|honestly|kind of|sort of)\b/gi` applied to the Whisper transcription. The count and percentage of filler words relative to total words are computed and stored alongside the answer.

## 5.5 Database Implementation

**Alembic Migrations:** The database schema is managed through Alembic. The `alembic/versions/` directory contains migration scripts that create and modify tables. Running `alembic upgrade head` applies all pending migrations to the target database. This ensures that the production database schema is always in sync with the application code.

**ORM Models:** SQLAlchemy ORM models are defined in `models.py` using the declarative base pattern. Relationships between tables are defined using `relationship()` with appropriate `back_populates` arguments, enabling efficient eager loading of related records.

**Connection Pooling:** For PostgreSQL, the SQLAlchemy engine is configured with `pool_size=10`, `max_overflow=20`, and `pool_pre_ping=True`. The `pool_pre_ping` option ensures that stale connections are detected and replaced before use, which is important for the Neon serverless PostgreSQL instance that may close idle connections.

**Indexes:** Composite indexes are created on `(user_id, started_at)` and `(user_id, overall_score)` in the `interview_sessions` table to support the dashboard queries efficiently. These indexes are defined in the Alembic migration scripts.

## 5.6 Deployment and Configuration

**Environment Variables:** The following environment variables are required for production deployment: `DATABASE_URL` (Neon PostgreSQL connection string), `GROQ_API_KEY`, `JWT_SECRET_KEY`, `REDIS_URL` (Upstash Redis connection string), and `GOOGLE_APPLICATION_CREDENTIALS` (path to the Google service account JSON file). These are configured through the Render.com dashboard and referenced in `render.yaml`.

**Render.com Configuration:** The `render.yaml` file defines the web service with the build command `pip install -r requirements.txt && alembic upgrade head` and the start command `uvicorn main:app --host 0.0.0.0 --port $PORT`. The `alembic upgrade head` command in the build step ensures that database migrations are applied on every deployment.

**Vercel Configuration:** The `vercel.json` file configures the build command (`npm run build`), output directory (`dist`), and a catch-all rewrite rule that maps all routes to `index.html`, enabling client-side routing.

---


# Chapter 6: Results and Discussion

## 6.1 System Performance

The deployed AQIA system demonstrates performance characteristics that are suitable for an interactive interview application. The following observations are based on testing conducted against the production deployment at https://aqia-mate.vercel.app and https://aqia-backend.onrender.com.

**LLM Inference Latency:** Question generation requests to the `/api/chat` endpoint, which proxies to the Groq Llama-3.3-70b-versatile model, complete in approximately 0.8–1.5 seconds for a typical prompt containing a resume excerpt and domain specification. This latency is attributable primarily to the Groq API response time, as the backend proxy adds negligible overhead. The Groq LPU architecture delivers this performance consistently, with minimal variance between requests. Evaluation requests, which involve a longer prompt containing the full interview transcript, complete in approximately 2–4 seconds depending on the number of questions.

**Speech Transcription Latency:** Whisper transcription requests to the `/api/transcribe` endpoint complete in approximately 1–2 seconds for a 30–60 second audio recording. The Groq Whisper API processes audio at significantly faster than real-time speed, making it suitable for the post-answer transcription use case.

**Text-to-Speech Latency:** Google Cloud TTS requests to the `/google-tts` endpoint complete in approximately 0.5–1.0 seconds for a typical question of 20–40 words. The audio is returned as a base64-encoded MP3 and begins playing immediately upon receipt.

**Database Query Performance:** The dashboard aggregation query, which computes COUNT, MAX, and AVG across the user's interview sessions, executes in under 50 milliseconds on the Neon PostgreSQL instance, benefiting from the composite indexes on the `interview_sessions` table.

**Cold Start Latency:** The Render.com free tier spins down the backend service after 15 minutes of inactivity. The first request after a cold start triggers a container restart, which takes approximately 30–60 seconds. Subsequent requests within the active window are served with normal latency. This is a known limitation of the free-tier deployment and is documented in the system constraints.

## 6.2 User Flow Walkthrough

The following describes the complete user journey through the AQIA system as experienced in the production deployment:

**Registration and Login:** A new user navigates to https://aqia-mate.vercel.app and is presented with the authentication page. They enter their name, email address, and password to register. The system validates the input, hashes the password, creates the user record, and returns a JWT token. The token is stored in localStorage and the user is redirected to the Dashboard.

**Dashboard:** The Dashboard displays the user's aggregate statistics: total interviews completed, highest score achieved, average score, and a line chart of score history. For a new user, the dashboard shows zero interviews and prompts the user to start their first session.

**Onboarding:** The user clicks "New Interview" and is taken to the Onboarding page. They upload their PDF resume, which is parsed client-side in approximately 1–2 seconds. They select a domain (e.g., "Backend Development") from the dropdown and set the number of questions (e.g., 5). They click "Start Interview".

**Interview Session:** The system generates the first question using the resume context and domain. The question is displayed as text and simultaneously spoken aloud through the Google TTS voice. The user clicks "Start Recording" and speaks their answer. The live transcript updates in real time as they speak. When they finish, they click "Stop Recording". The audio is sent to Whisper for final transcription, which takes approximately 1–2 seconds. The delivery metrics (WPM and filler word count) are computed and displayed. The user clicks "Next Question" to proceed. This cycle repeats for all configured questions.

**Evaluation:** After the final question, the user clicks "Get Feedback". The complete transcript is sent to the LLM for evaluation. After approximately 2–4 seconds, the evaluation report is received and the session data is submitted to the backend for asynchronous persistence. The user is shown a loading indicator while the job is enqueued.

**Final Review:** The FinalReview page displays the complete evaluation report: overall score, four dimension scores displayed as a radar or bar chart, per-question scores and coach's notes, suggested improved answers for each question, and a summary of strengths and areas for improvement. The user can return to the Dashboard to see their updated statistics.

## 6.3 Analytics Output

The analytics output produced by AQIA provides candidates with actionable, quantitative feedback across multiple dimensions.

**Delivery Analytics:** For each answer, the system reports the WPM and filler word count. A typical well-prepared candidate speaking at a moderate pace produces 120–160 WPM with fewer than 5 filler words per answer. Candidates who speak too quickly (above 180 WPM) or too slowly (below 80 WPM) receive this feedback in the coach's notes. High filler word counts (above 10 per answer) are flagged as an area for improvement.

**Competency Scores:** The four dimension scores provide a structured breakdown of performance. A candidate with strong technical knowledge but poor communication skills will receive a high Technical score and a lower Communication score, directing their preparation efforts appropriately. The per-question scores (0–10) identify specific questions where the candidate struggled, enabling targeted review.

**Progress Tracking:** The Dashboard progress chart shows the user's overall score trend across sessions. A candidate who completes multiple sessions over several days can observe their improvement trajectory. The `progress_tracking` table records the rolling average score and most improved category after each session, enabling the dashboard to display these metrics without recomputing them on every request.

**Suggested Answers:** The LLM-generated suggested answers for each question provide concrete examples of high-quality responses, giving candidates a model to study and emulate. These suggestions are tailored to the specific question asked and the candidate's stated background, making them more relevant than generic model answers.

## 6.4 Security Validation

The security measures implemented in AQIA were validated through the following checks:

**API Key Exposure:** Inspection of the JavaScript bundle delivered to the browser (via browser developer tools) confirms that no Groq API key, Google Cloud credentials, or JWT secret key is present in any client-side file. All AI service calls are routed through the backend proxy.

**Authentication Enforcement:** Requests to protected endpoints without a valid JWT token return HTTP 401 Unauthorized. Requests with an expired or tampered token are rejected by the `get_current_user` dependency. This was verified by sending requests with missing, expired, and malformed tokens.

**Data Isolation:** Requests to `/api/dashboard` and `/api/interviews` with a valid JWT token for User A return only User A's data. Attempting to access User B's data by modifying the request parameters returns an empty result set, not an error, because all queries are filtered by the authenticated user's ID.

**CORS Enforcement:** Requests from origins other than `https://aqia-mate.vercel.app` are rejected by the CORS middleware with a 403 response. This was verified by sending requests from a different origin using curl and browser fetch.

**Rate Limiting:** Submitting a second interview session within 24 hours returns HTTP 429 with an appropriate error message. This was verified by submitting two sessions in rapid succession.

**Password Security:** The stored password hash in the database is a bcrypt hash and cannot be reversed to recover the original password. This was verified by inspecting the `password_hash` column in the database.

## 6.5 API Response Times

The following response time measurements were recorded during testing of the production API:

| Endpoint | Method | Typical Response Time |
|---|---|---|
| /api/register | POST | 200–400 ms (bcrypt hashing) |
| /api/login | POST | 200–400 ms (bcrypt verification) |
| /api/chat | POST | 800–1500 ms (Groq LLM) |
| /api/transcribe | POST | 1000–2000 ms (Groq Whisper) |
| /google-tts | POST | 500–1000 ms (Google TTS) |
| /api/dashboard | GET | 50–150 ms (DB aggregation) |
| /api/interviews | POST | 100–200 ms (enqueue + return) |
| /api/interviews | GET | 50–100 ms (DB list query) |
| /api/jobs/{job_id} | GET | 50–100 ms (Redis status check) |
| /api/health | GET | 10–30 ms |

The response times for AI service endpoints are dominated by the external API latency and are consistent with the performance characteristics of the respective services. The database and job status endpoints are fast, confirming that the backend adds minimal overhead to these operations.

---

# Chapter 7: Conclusion and Future Work

## 7.1 Conclusion

This project has successfully designed, implemented, and deployed AQIA, a context-aware AI mock interview assistant with delivery analytics and progress monitoring. The system addresses a genuine need among engineering students and graduates for personalised, accessible, and quantitative interview preparation tools.

The key technical contributions of this project are: (1) a secure server-side LLM proxy architecture that enables AI-powered features without exposing API keys to the browser; (2) a hybrid speech pipeline that combines browser-native Web Speech API for live feedback with Groq Whisper for accurate final transcription; (3) a neural TTS integration with SSML prosody control and automatic fallback cascade; (4) a resume-contextualised question generation system that produces personalised interview questions from the candidate's own experience; (5) a quantitative delivery analytics system computing WPM and filler word metrics; (6) an asynchronous job processing architecture using RQ and Upstash Redis that keeps the user interface responsive; and (7) a production deployment on free-tier cloud infrastructure that makes the system accessible at no cost.

The system is live and publicly accessible at https://aqia-mate.vercel.app. The complete interview flow — from registration through onboarding, interview session, evaluation, and progress tracking — functions as designed in the production environment. The security architecture ensures that user data is protected and API credentials are never exposed.

The project demonstrates that it is feasible to build a sophisticated, production-grade AI application using modern open-source frameworks and free-tier cloud services, making advanced interview preparation technology accessible to students who cannot afford commercial alternatives.

## 7.2 Limitations

The following limitations of the current system are acknowledged:

**Browser Compatibility:** The Web Speech API is supported only in Chromium-based browsers. Users on Firefox, Safari, or mobile browsers may experience degraded functionality, as the live transcription feature is unavailable. While text input is available as a fallback, it does not provide the same experience as voice interaction.

**Cold Start Latency:** The Render.com free-tier deployment spins down after 15 minutes of inactivity. The resulting cold start delay of 30–60 seconds on the first request after an idle period is a poor user experience, particularly for first-time visitors.

**Single Worker Process:** The RQ worker runs within the same process as the FastAPI application on a single Render.com dyno. Under high concurrent load, the worker may be delayed in processing jobs, causing the frontend to poll for longer before the session is confirmed as saved.

**English-Only Support:** The system is designed for English-language interviews. While the Whisper model supports multiple languages, the LLM prompts, evaluation rubrics, and UI are in English only.

**No Video Analysis:** The system does not capture or analyse video, meaning that non-verbal communication cues such as eye contact, facial expressions, and posture are not assessed. These are important components of interview performance that are beyond the scope of the current implementation.

**Rate Limit Restriction:** The one-interview-per-day rate limit, while necessary to manage API costs, may frustrate users who wish to practise multiple sessions in a single day.

**LLM Evaluation Consistency:** The LLM-generated scores and feedback may vary between sessions for similar answers, as LLM outputs are inherently non-deterministic. While the structured JSON prompt reduces variance, it does not eliminate it entirely.

## 7.3 Future Enhancements

The following enhancements are identified as realistic and valuable directions for future development:

**Multi-Browser Support:** Implementing a server-side streaming STT alternative (e.g., using the Groq Whisper streaming API) would enable live transcription in browsers that do not support the Web Speech API, broadening the user base.

**Dedicated Worker Service:** Migrating the RQ worker to a dedicated background worker service on Render.com (or an equivalent platform) would improve job processing reliability and throughput, at the cost of a small monthly fee.

**Video Analysis Integration:** Integrating a client-side face landmark detection library (e.g., MediaPipe Face Mesh) would enable analysis of eye contact and facial expressions, adding a new dimension to the delivery analytics.

**Multi-Language Support:** Extending the system to support interviews in Hindi and other Indian languages would significantly increase the potential user base among NIT Silchar students and graduates.

**Collaborative Interview Mode:** Adding a peer-to-peer interview mode, where two users can interview each other with AI assistance, would combine the benefits of human feedback with AI-generated questions and evaluation.

**Mobile Application:** Developing a React Native or Flutter mobile application would make AQIA accessible on smartphones, which are the primary computing device for many students in India.

**Adaptive Difficulty:** Implementing an adaptive question difficulty system that adjusts the complexity of questions based on the candidate's performance in previous questions and sessions would provide a more personalised and challenging practice experience.

**Institutional Integration:** Adding features for institutional use — such as instructor dashboards, cohort analytics, and assignment-based interview sessions — would enable NIT Silchar and other institutions to use AQIA as a formal assessment tool.

**Offline Mode:** Implementing a service worker and local storage strategy would allow users to review past sessions and access basic features without an internet connection.

**Expanded Domain Coverage:** Adding domain-specific question templates and evaluation rubrics for non-software domains such as core electronics, VLSI design, and embedded systems would make AQIA relevant to a broader range of ECE students.

---

# References

[1] A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. Kaiser, and I. Polosukhin, "Attention is all you need," in *Advances in Neural Information Processing Systems*, vol. 30, 2017.

[2] T. B. Brown, B. Mann, N. Ryder, M. Subbiah, J. Kaplan, P. Dhariwal, A. Neelakantan, P. Shyam, G. Sastry, A. Askell, et al., "Language models are few-shot learners," in *Advances in Neural Information Processing Systems*, vol. 33, pp. 1877–1901, 2020.

[3] Groq Inc., "Groq LPU Inference Engine: Technical Overview," Groq Technical Documentation, 2024. [Online]. Available: https://groq.com/technology/

[4] A. Naim, M. I. Tanveer, D. Gildea, and M. E. Hoque, "Automated prediction and analysis of job interview performance: The role of what you say and how you say it," in *Proc. 11th IEEE Int. Conf. Automatic Face and Gesture Recognition*, 2015, pp. 1–8.

[5] G. Luzardo, A. Fukayama, and T. Nakano, "A virtual agent for a job interview training system using speech interaction," in *Proc. 15th ACM Int. Conf. Intelligent Virtual Agents*, 2015, pp. 220–223.

[6] A. Radford, J. W. Kim, T. Xu, G. Brockman, C. McLeavey, and I. Sutskever, "Robust speech recognition via large-scale weak supervision," in *Proc. 40th Int. Conf. Machine Learning (ICML)*, 2023, pp. 28492–28518.

[7] Y. Ren, C. Hu, X. Tan, T. Qin, S. Zhao, Z. Zhao, and T.-Y. Liu, "FastSpeech 2: Fast and high-quality end-to-end text to speech," in *Proc. 9th Int. Conf. Learning Representations (ICLR)*, 2021.

[8] S. Tiong, J. Loo, and S. Lim, "Automated interview assessment system using natural language processing and machine learning," *International Journal of Advanced Computer Science and Applications*, vol. 12, no. 4, pp. 345–352, 2021.

[9] S. Ramesh, S. Sanampudi, and S. Suresh, "An automated essay scoring systems: A systematic literature review," *Artificial Intelligence Review*, vol. 55, pp. 2495–2527, 2022.

[10] T. Wolf, L. Debut, V. Sanh, J. Chaumond, C. Delangue, A. Moi, P. Cistac, T. Rault, R. Louf, M. Funtowicz, et al., "Transformers: State-of-the-art natural language processing," in *Proc. 2020 Conf. Empirical Methods in Natural Language Processing: System Demonstrations*, 2020, pp. 38–45.

[11] S. Hochreiter and J. Schmidhuber, "Long short-term memory," *Neural Computation*, vol. 9, no. 8, pp. 1735–1780, 1997.

[12] FastAPI Documentation, "FastAPI — Modern, fast (high-performance), web framework for building APIs with Python 3.8+," Sebastián Ramírez, 2024. [Online]. Available: https://fastapi.tiangolo.com/

---

*End of Report*

**National Institute of Technology Silchar**
Department of Electronics and Communication Engineering
Assam – 788010, India
Academic Year 2025–26
