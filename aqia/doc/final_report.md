
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

Getting ready for a technical job interview is genuinely hard. Engineering students need to show domain knowledge, speak clearly under pressure, and structure their thinking on the spot — all at the same time. The tools most students rely on are static: question banks, model answers, and YouTube videos that give no feedback on how you actually sound or how well your answer fits your own background.

This report describes AQIA (AI-powered Question and Interview Assistant), a mock interview platform we designed, built, and deployed to tackle exactly these problems. AQIA is not a chatbot with a fixed script. It reads the candidate's own resume, understands their experience level and target domain, and generates questions that are specific to them — powered by Llama-3.3-70b-versatile running on Groq's LPU inference infrastructure.

The interview experience is fully voice-driven. Questions are spoken aloud using Google Cloud's Chirp3-HD neural voice with SSML prosody tuning so they sound natural rather than robotic. The candidate answers by speaking; a live rolling transcript appears on screen via the browser's Web Speech API while the answer is being given, and once the candidate stops, the audio is sent to OpenAI Whisper (large-v3, via Groq) for a more accurate final transcription. After all questions are answered, the LLM evaluates the complete transcript and returns a structured JSON report with scores across four dimensions — Communication, Technical Accuracy, Problem Solving, and Behavioural — along with per-question scores, a coach's note for each answer, and a suggested improved response.

On top of the content scores, AQIA measures delivery: words per minute and filler word count are computed for every answer and shown to the candidate. These are the kinds of metrics that employer-facing tools like HireVue track but never share with the candidate. We made them visible.

The backend is a Python 3.12 FastAPI service deployed on Render.com. The React 19 frontend runs on Vercel. We also built a Flutter 3.27 mobile app for Android and iOS that shares the same backend. All AI API keys live exclusively on the server — the browser never sees them. Authentication uses JWT tokens with bcrypt-hashed passwords. Session data is written to a Neon PostgreSQL database asynchronously via an RQ worker backed by Upstash Redis, so the UI stays responsive while the save happens in the background.

The live system is at https://aqia-mate.vercel.app. The mobile app source is at https://github.com/ExplorerSoul/aqia-app.

**Keywords:** AI mock interview, large language model, speech-to-text, text-to-speech, delivery analytics, FastAPI, React, Flutter, Groq, PostgreSQL, JWT authentication.

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
| | List of Figures | X |
| | List of Tables | X |
| | List of Abbreviations | X |
| **Chapter 1** | **Introduction** | **X** |
| 1.1 | Motivation | X |
| 1.2 | Problem Statement | X |
| 1.3 | Objectives | X |
| 1.4 | Key Contributions | X |
| 1.5 | Scope of the Project | X |
| 1.6 | Organisation of the Report | X |
| **Chapter 2** | **Literature Survey** | **X** |
| 2.1 | Existing Interview Preparation Systems | X |
| 2.2 | AI-Driven Conversational Agents | X |
| 2.3 | Speech Analysis in Interview Coaching | X |
| 2.4 | Research Gaps | X |
| 2.5 | How AQIA Addresses the Gaps | X |
| 2.6 | Comparative Analysis | X |
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
| 5.6 | Mobile Application Implementation (Flutter) | X |
| 5.7 | Deployment and Configuration | X |
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

## List of Figures

| Figure | Caption | Page |
|---|---|---|
| Figure 1 | High-level three-tier architecture of AQIA | X |
| Figure 2 | Interview session state machine diagram | X |
| Figure 3 | Hybrid speech pipeline — TTS and STT flow | X |
| Figure 4 | Entity-Relationship diagram of the database schema | X |
| Figure 5 | Deployment architecture across Vercel, Render, Neon, and Upstash | X |
| Figure 6 | AQIA web application — Dashboard view | X |
| Figure 7 | AQIA web application — Interview session view | X |
| Figure 8 | AQIA web application — Final review report | X |
| Figure 9 | AQIA mobile application — Home screen (Flutter) | X |
| Figure 10 | AQIA mobile application — Interview screen (Flutter) | X |
| Figure 11 | API response time distribution across endpoints | X |

---

## List of Tables

| Table | Caption | Page |
|---|---|---|
| Table 1 | List of Abbreviations | X |
| Table 2 | Functional Requirements (FR-01 to FR-13) | X |
| Table 3 | Non-Functional Requirements (NFR-01 to NFR-07) | X |
| Table 4 | Comparison of AQIA with existing interview preparation systems | X |
| Table 5 | Database schema — table descriptions and key fields | X |
| Table 6 | REST API endpoint summary | X |
| Table 7 | API response time measurements (production) | X |
| Table 8 | Key contributions of the AQIA project | X |

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

Every year, thousands of engineering graduates from institutions like NIT Silchar walk into technical interviews underprepared — not because they lack knowledge, but because they have never practised speaking their answers aloud to a system that actually listens and responds. The gap between knowing an answer and delivering it confidently under interview conditions is real, and most preparation tools do nothing to close it.

We noticed this problem firsthand. The platforms our peers used — LeetCode, YouTube tutorials, static PDF guides — are excellent for building knowledge but completely silent on how you communicate that knowledge. Nobody tells you that you said "um" fourteen times in two minutes, or that you spoke so fast the interviewer could not follow your reasoning, or that your answer to a system design question was technically correct but structurally incoherent.

At the same time, the technology to build something better has become genuinely accessible. Large language models running on Groq's LPU hardware can generate resume-specific questions and evaluate free-form answers in under two seconds. Google's neural TTS voices sound natural enough that candidates do not feel like they are talking to a robot. Whisper-class ASR handles technical vocabulary and non-native accents reliably. And all of this can be wired together into a browser application that runs on any laptop with a microphone, at essentially zero infrastructure cost.

AQIA is our attempt to build that system — not as a prototype or a demo, but as a production deployment that real students can use today.

## 1.2 Problem Statement

When we surveyed the interview preparation landscape, we found five specific problems that no existing free tool addresses together:

First, every question bank we found is generic. The questions do not know that you spent six months building a distributed cache at your internship, or that your final year project involved training a transformer model on a custom dataset. A human interviewer would ask about those things. Existing tools do not.

Second, there is no feedback on how you sound. Speaking pace, filler word density, and answer structure are measurable and improvable — but only if someone measures them. Self-study gives you no mirror.

Third, progress is invisible. Without a system that records and scores every session, a student has no way to know whether they are actually improving or just repeating the same mistakes.

Fourth, the AI tools that do exist are either employer-facing (HireVue, Pymetrics) and inaccessible to candidates, or they are student-built demos that expose API keys in the browser, making them insecure and unreliable.

Fifth, cost. Most polished interview preparation platforms require monthly subscriptions that are simply not affordable for students in India.

AQIA was designed to solve all five problems simultaneously: personalised questions from the candidate's own resume, voice-based delivery with real-time transcription, quantitative delivery analytics, session history and progress tracking, server-side API key security, and zero cost to the user.

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

## 1.4 Key Contributions

The following novel contributions distinguish AQIA from existing interview preparation tools and constitute the primary academic and technical contributions of this project:

- **Resume-contextualised question generation:** AQIA is the first open, freely accessible system to generate interview questions dynamically from the candidate's own PDF resume using a state-of-the-art LLM, producing questions that are specific to the individual's stated experience, skills, and target domain rather than drawn from a generic question bank.

- **Hybrid STT pipeline with dual-model transcription:** The system combines the browser's Web Speech API for zero-latency live transcript display with Groq Whisper (whisper-large-v3) for accurate final transcription, achieving both real-time responsiveness and high transcription accuracy in a single session without additional hardware.

- **Secure server-side AI proxy architecture:** All LLM and speech API calls are routed through a FastAPI backend proxy, ensuring that Groq API keys, Google Cloud credentials, and JWT secrets are never present in the JavaScript bundle delivered to the browser — a security property not achieved by most student-built AI applications.

- **Quantitative delivery analytics in a candidate-facing tool:** AQIA computes and reports words-per-minute and filler word frequency for every answer, providing the kind of delivery feedback previously available only in employer-facing screening tools (HireVue, Pymetrics) and making it accessible to candidates for self-improvement.

- **Cross-platform deployment (web + mobile):** The system is deployed as both a React 19 web application (Vercel) and a Flutter 3.27 mobile application (Android/iOS), sharing a single FastAPI backend, demonstrating a full-stack cross-platform architecture built entirely on free-tier cloud infrastructure.

- **Asynchronous persistence with RQ and serverless Redis:** The use of RQ backed by Upstash Redis for non-blocking database writes ensures that the user interface remains responsive at the end of the interview, a design pattern not commonly demonstrated in academic project implementations.

- **Production-grade security on free-tier infrastructure:** The combination of bcrypt password hashing, JWT authentication, CORS restriction, HTTPS enforcement, and per-user rate limiting achieves a security posture comparable to commercial applications, demonstrating that production-quality security is achievable without paid security services.

## 1.5 Scope of the Project

AQIA is scoped as a web-based application accessible through any modern browser supporting the Web Speech API (primarily Chromium-based browsers). The system supports mock interviews across a range of software engineering domains including Frontend Development, Backend Development, Data Science, Machine Learning, DevOps, System Design, Product Management, and General Software Engineering. The number of questions per session is configurable between 3 and 20.

The system is designed for individual use by candidates preparing for technical interviews. It does not include features for institutional administration, bulk user management, or integration with external applicant tracking systems. The scope is limited to the interview preparation use case; the system does not facilitate actual job applications or connect candidates with employers.

The project encompasses the complete software development lifecycle from requirements analysis and system design through implementation, testing, and production deployment. Both the frontend (https://aqia-mate.vercel.app) and backend (https://aqia-backend.onrender.com) are live and publicly accessible as of the submission of this report.

## 1.6 Organisation of the Report

The remainder of this report is organised as follows. Chapter 2 presents a survey of existing interview preparation systems and related research, identifying the gaps that AQIA addresses. Chapter 3 specifies the functional and non-functional requirements of the system. Chapter 4 provides a detailed description of the system architecture and design, covering all major components. Chapter 5 describes the implementation of each subsystem. Chapter 6 presents the results and discusses system performance, user experience, and security. Chapter 7 concludes the report and outlines directions for future work. References are provided at the end of the document.

---

# Chapter 2: Literature Survey

## 2.1 Existing Interview Preparation Systems

Interview preparation tools exist on a spectrum from completely passive to partially interactive, but none of the freely available options combine personalisation, voice interaction, and quantitative feedback in a single system.

**Algorithmic practice platforms** like LeetCode, HackerRank, and GeeksforGeeks are the most widely used tools among engineering students. They are excellent for building problem-solving skills and familiarity with data structures, but they are fundamentally text-based and judge-based. There is no speaking, no listening, and no feedback on how you communicate. A student who can solve a binary tree problem in fifteen minutes may still struggle to explain their approach clearly in an interview — and these platforms offer no help with that.

**Peer-to-peer platforms** like Pramp and Interviewing.io take a different approach: they match two candidates who take turns interviewing each other. This is more realistic than solo practice, but it introduces scheduling friction, depends heavily on the quality of the peer's feedback, and provides no objective metrics. Two students who are both underprepared cannot give each other useful feedback.

**Employer-facing AI screening tools** such as HireVue and Pymetrics are sophisticated — they analyse video, tone, and word choice — but they are designed for employers to screen candidates, not for candidates to practise. A student cannot sign up for HireVue to practise; it is only accessible when an employer sends an invitation. The evaluation criteria are also proprietary and never shared with the candidate.

**Academic chatbot simulators** have been explored in research settings. Early systems used fixed dialogue trees that produced stilted, unrealistic conversations. More recent work has used fine-tuned or retrieval-augmented language models to generate questions, but published systems rarely integrate speech input and output, and almost none are deployed as accessible web applications that students can actually use.

## 2.2 AI-Driven Conversational Agents

The transformer architecture introduced by Vaswani et al. [1] fundamentally changed what conversational AI systems could do. Before transformers, dialogue systems relied on hand-crafted rules or shallow statistical models that could not maintain coherent context across more than a few turns. Transformer-based models can track context across an entire conversation, reason about the content of previous answers, and generate follow-up questions that feel natural.

For our purposes, the critical capability is zero-shot or few-shot instruction following. Brown et al. [2] showed that large language models can perform complex tasks — including evaluation against implicit rubrics — when given a well-structured prompt, without any task-specific fine-tuning. This is what makes AQIA's approach viable: we do not need to train a custom model. We write a detailed prompt that describes the interviewer's role, the candidate's background, and the evaluation criteria, and the model follows it reliably.

The choice of Groq as the inference platform was driven by latency. Groq's LPU architecture [3] is built around a different hardware design than GPU clusters — one that is optimised for the sequential, memory-bound nature of autoregressive decoding rather than the parallel matrix operations that GPUs excel at. In our testing, question generation requests complete in under 1.5 seconds, which is fast enough that the interview feels like a real conversation rather than a web form submission.

Recent work on LLM-based interview coaching [13, 18, 24] has confirmed that LLMs can generate contextually appropriate questions and provide useful feedback, but these studies typically evaluate the quality of the AI output in isolation rather than building and deploying a complete end-to-end system. AQIA bridges that gap.

## 2.3 Speech Analysis in Interview Coaching

The connection between how you speak and how you are perceived in an interview is well-established in communication research. Naim et al. [4] analysed job interview recordings and found that prosodic features — speaking rate, pitch variation, and pause patterns — were predictive of interview outcomes independently of the content of the answers. Luzardo et al. [5] built a virtual agent for interview training and found that candidates who received feedback on their speaking pace and filler word usage showed measurable improvement across sessions.

The practical challenge has always been transcription accuracy. Early ASR systems struggled with spontaneous speech, technical vocabulary, and non-native accents — all of which are common in engineering interviews. Radford et al. [6] addressed this by training a model on a very large and diverse audio dataset using a weak supervision approach, producing a system that generalises well to real-world speech conditions. We chose Whisper large-v3 as our final transcription engine specifically because it handles the kinds of answers AQIA candidates give — answers that mix technical jargon, acronyms, and sometimes non-native pronunciation — more reliably than browser-based ASR.

For question delivery, we needed a TTS voice that sounds natural enough that candidates focus on the question rather than the artificiality of the voice. Kim et al. [23] note that unnatural TTS voices increase cognitive load and reduce the ecological validity of simulated interviews. We compared several Google Cloud voices before settling on Chirp3-HD Aoede; in informal listening tests with peers, it was consistently rated as the most natural-sounding option available to us.

## 2.4 Research Gaps

Reading through the literature, we identified five gaps that motivated the specific design choices in AQIA:

**Gap 1 — Resume-aware question generation.** Every published interview simulation system we found uses a fixed question bank or a domain-specific retrieval system. None of them read the candidate's resume and generated questions from it. This is the single most important personalisation feature, and it was missing everywhere.

**Gap 2 — Dual-model speech pipeline.** Systems that use speech at all typically use either a live ASR for real-time display or a batch ASR for accuracy — not both. The combination of Web Speech API for live feedback and Whisper for accurate final transcription is, to our knowledge, novel in this context.

**Gap 3 — Candidate-facing delivery analytics.** WPM and filler word metrics exist in employer-facing tools but are never shown to the candidate. We found no free, candidate-facing tool that reports these metrics.

**Gap 4 — Secure API key handling in student projects.** A survey of open-source interview preparation tools on GitHub revealed that the majority include API keys directly in the frontend JavaScript. This is a security vulnerability that makes the tools unreliable (keys get revoked) and potentially costly (keys get abused). Our server-side proxy architecture addresses this directly.

**Gap 5 — Accessible deployment.** Most research prototypes are not deployed. Students cannot use a GitHub repository; they need a URL. AQIA is live at https://aqia-mate.vercel.app.

## 2.5 How AQIA Addresses the Gaps

We designed AQIA specifically to close each of the five gaps identified above.

For Gap 1, we parse the candidate's PDF resume entirely in the browser using pdfjs-dist and inject the extracted text directly into the LLM system prompt. The model sees the candidate's actual experience before generating a single question. The resume never leaves the browser — it is not uploaded to any server.

For Gap 2, we run two speech recognition systems in parallel during each answer. The browser's Web Speech API streams a live transcript to the screen as the candidate speaks, giving immediate visual confirmation that the microphone is working. When the candidate stops, the recorded audio is sent to Whisper large-v3 via the Groq API, which produces a more accurate final transcript used for evaluation.

For Gap 3, we compute WPM and filler word count for every answer and display them prominently in the final review — shown to the candidate alongside the content scores, not hidden in a backend log.

For Gap 4, every call to the Groq API and Google Cloud TTS goes through our FastAPI backend. The browser sends a request to our server with a JWT token; our server adds the API key and forwards the request. The JavaScript bundle contains no secrets.

For Gap 5, the entire system runs on free-tier cloud services. There is no subscription, no paywall, and no registration fee.

## 2.6 Comparative Analysis

Table 4 presents a structured comparison of AQIA against representative existing systems across key dimensions relevant to interview preparation.

**Table 4: Comparison of AQIA with existing interview preparation systems**

| Feature / Dimension | AQIA (This Work) | LeetCode / HackerRank | Pramp | HireVue | Chatbot Simulators |
|---|---|---|---|---|---|
| Resume-personalised questions | ✓ (LLM + resume context) | ✗ | ✗ | ✗ | ✗ |
| Voice input (STT) | ✓ (Whisper + Web Speech) | ✗ | ✓ (human) | ✓ (proprietary) | Partial |
| Voice output (TTS) | ✓ (Google Neural2) | ✗ | ✓ (human) | ✗ | ✗ |
| Live transcript display | ✓ | ✗ | ✗ | ✗ | ✗ |
| Delivery analytics (WPM, fillers) | ✓ | ✗ | ✗ | ✓ (employer-only) | ✗ |
| AI-generated feedback | ✓ (LLM rubric) | Partial (auto-judge) | ✓ (human) | ✓ (proprietary) | Partial |
| Suggested improved answers | ✓ | ✗ | ✗ | ✗ | ✗ |
| Progress tracking dashboard | ✓ | ✓ | ✗ | ✗ | ✗ |
| Multi-domain support | ✓ (9 domains) | ✓ (algorithms) | ✓ | ✓ | Partial |
| Free for candidates | ✓ | Freemium | ✓ | ✗ (employer-paid) | Varies |
| API key security (server-side) | ✓ | N/A | N/A | ✓ | ✗ (often client-side) |
| Mobile application | ✓ (Flutter) | ✓ | ✗ | ✓ | ✗ |
| Open source / self-hostable | ✓ | ✗ | ✗ | ✗ | Partial |
| Privacy (resume not uploaded) | ✓ (client-side parse) | N/A | N/A | ✗ | ✗ |

The comparison demonstrates that AQIA uniquely combines resume-contextualised question generation, a full speech I/O pipeline, quantitative delivery analytics, and candidate-facing accessibility in a single open system. No existing free tool provides all of these capabilities simultaneously.

---

# Chapter 3: System Requirements

## 3.1 Functional Requirements

We identified thirteen functional requirements during the design phase. All thirteen are implemented in the deployed system.

| ID | Requirement | Description |
|---|---|---|
| FR-01 | User Registration and Authentication | New users register with email, name, and password. On successful login or registration, the backend issues a signed JWT access token. Every protected endpoint validates this token before processing. |
| FR-02 | Dashboard | After login, users see total completed interviews, highest score, average score, and a line chart of score history over time. |
| FR-03 | Interview Setup | Users upload a PDF resume, select a job domain, and choose the number of questions (3–20) before starting a session. |
| FR-04 | Client-Side Resume Parsing | The uploaded PDF is parsed entirely in the browser. Extracted text is used as LLM context. The file is never sent to the server. |
| FR-05 | AI Question Generation | Questions are generated by the LLM using the candidate's resume text and selected domain. Each question is tailored to the candidate's actual experience. |
| FR-06 | TTS Question Delivery | Each question is spoken aloud using Google Cloud TTS with SSML prosody tuning. If the cloud TTS call fails, the system falls back to browser speech synthesis. |
| FR-07 | Voice Response Capture | The candidate's spoken answer is captured and displayed as a live rolling transcript. When the candidate stops, the audio is sent to Whisper for accurate final transcription. |
| FR-08 | Delivery Analytics | For each answer, the system computes and displays words per minute (WPM) and filler word count (um, uh, like, basically, you know, so, right, and similar disfluencies). |
| FR-09 | AI Evaluation | After all questions, the complete transcript is submitted to the LLM. The response contains an overall score (0–100), four dimension scores, per-question scores (0–10), coach's notes, and a suggested improved answer per question. |
| FR-10 | Asynchronous Session Persistence | Completed sessions are saved to the database in the background via a job queue. The UI does not wait for the database write before showing results. |
| FR-11 | Interview History | Users can retrieve a list of past sessions with domain, date, and overall score. |
| FR-12 | Daily Rate Limiting | Each user can submit one interview per day. A second submission within 24 hours returns HTTP 429. |
| FR-13 | Health Endpoint | The API exposes a health check endpoint returning current service status, used for uptime monitoring. |

## 3.2 Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | LLM question generation completes within 3 seconds under normal load. TTS audio for a 20–40 word question is available within 2 seconds. |
| NFR-02 | Security | All AI API keys are stored as server-side environment variables and never appear in any HTTP response or client-side file. Passwords are hashed with bcrypt before storage. All traffic uses HTTPS. |
| NFR-03 | Availability | The system is deployed on cloud infrastructure with automatic restart on failure. The frontend is served from a global CDN. |
| NFR-04 | Scalability | The database connection pool is sized to handle concurrent users without exhausting connections. JWT-based authentication is stateless, enabling horizontal scaling of the backend. |
| NFR-05 | Usability | The complete interview flow is accessible through a standard Chromium-based browser with no installation required. A first-time user can complete a session without reading any documentation. |
| NFR-06 | Privacy | Resume data is processed on the client and never stored on any server. Each user's interview data is accessible only to that user. |
| NFR-07 | Maintainability | Database schema changes are managed through versioned migrations. Frontend and backend code are in separate repositories with clear module boundaries. |

## 3.3 Hardware Requirements

AQIA runs in a browser, so the hardware requirements on the user's side are minimal. Any device with a working microphone, speakers or headphones, and a stable internet connection (1 Mbps or better) is sufficient. We tested on Windows laptops, macOS machines, and Android phones. The server infrastructure is entirely cloud-hosted — Render.com, Vercel, Neon, and Upstash — so there is no hardware to procure or maintain.

## 3.4 Software Requirements

**For end users:** Google Chrome 90+ or any Chromium-based browser. The Web Speech API, which powers the live transcript, is not available in Firefox or Safari. No installation is required beyond the browser.

**For development:** Node.js 18+ and npm for the frontend; Python 3.12 for the backend; Git for version control. A local PostgreSQL instance or a Neon connection string for the database.

**Backend production stack:** FastAPI 0.110+, Uvicorn, SQLAlchemy 2.0, Alembic, python-jose, passlib[bcrypt], httpx, rq, redis, psycopg2-binary.

**Frontend production stack:** React 19, Vite 5, pdfjs-dist, Recharts, React Router v6.

## 3.5 System Constraints

**Browser limitation.** The Web Speech API works only in Chromium-based browsers. Firefox and Safari users can still use AQIA with text input, but the live transcript feature is unavailable. We considered implementing a server-side streaming STT alternative but decided it was out of scope for this project.

**Cold start delay.** Render.com's free tier shuts down the backend after 15 minutes of inactivity. The first request after an idle period triggers a container restart that takes 30–60 seconds. We document this prominently in the UI so users are not confused by the delay.

**Groq rate limits.** The Groq free tier imposes per-minute token limits. Under high concurrent load, requests may be queued. We have not encountered this in practice during testing, but it is a theoretical constraint.

**Single-process worker.** The RQ worker runs in the same process as the FastAPI application on a single Render dyno. This is a cost-driven decision; a dedicated worker service would improve throughput but would require a paid plan.

**English only.** The LLM prompts, evaluation rubrics, and UI are in English. Whisper supports multiple languages, but the rest of the pipeline does not.

---


# Chapter 4: System Architecture and Design

## 4.1 High-Level Architecture Overview

AQIA is built as a three-tier system. The first tier is the browser-based client, which handles all user interaction — resume upload, domain selection, voice recording, live transcript display, and result presentation. The second tier is a server-side API layer that acts as a secure intermediary between the client and all external AI services. The third tier is a relational database that stores user accounts, interview sessions, question histories, analytics scores, and progress records.

The most important architectural decision we made was to keep all AI credentials exclusively on the server. The client never communicates with any AI service directly. Every AI call — question generation, audio transcription, and speech synthesis — is routed through our server, which injects the appropriate credential before forwarding the request. This means the browser-delivered application contains no secrets of any kind.

Figure 1 shows the high-level architecture. The complete data flow for one interview session is as follows: the user authenticates and receives a session token; the browser parses the resume locally and sends the extracted text along with the chosen domain to the server; the server generates the first question via the LLM and returns it; the browser converts the question to speech via the TTS proxy and plays it; the user speaks their answer; the browser records the audio and sends it to the transcription proxy; after all questions are answered, the full transcript is sent to the LLM for evaluation; the evaluation result is shown to the user and the session data is submitted for background persistence.

## 4.2 Client-Side Design

The client is a single-page web application. It has five distinct views that the user moves through in sequence: authentication, interview setup, the active interview session, the final review, and the progress dashboard.

The interview setup view handles three inputs: the PDF resume (parsed locally in the browser — the file never leaves the device), the job domain selection, and the question count. Once the user confirms these, the session begins.

The active interview view is the most complex part of the client. It manages a state machine with six phases: idle (waiting for the question to be spoken), speaking (TTS audio playing), listening (microphone active, live transcript updating), transcribing (audio being sent to Whisper), evaluating (LLM processing the full transcript), and complete. The transitions between these phases are driven by user actions and API responses. Figure 2 shows the state machine diagram.

The dashboard view fetches aggregated statistics from the server on every visit and renders a line chart of the user's score history across sessions.

## 4.3 Server-Side Design

The server exposes a REST API with thirteen endpoints. All endpoints except registration, login, and health check require a valid session token in the request header.

The server's primary responsibilities are:

1. **Authentication** — validating credentials, issuing tokens, and enforcing per-user data isolation on every database query.
2. **AI proxying** — receiving requests from the client, adding the appropriate API credential, forwarding to the external AI service, and returning the response.
3. **Session management** — enforcing the one-interview-per-day rate limit, enqueuing background save jobs, and providing job status polling.
4. **Data aggregation** — computing dashboard statistics (total sessions, highest score, average score, score history) from the database in a single query.

The server never stores resume data. The resume text is received as part of the LLM request, used to construct the prompt, and discarded after the response is returned.

## 4.4 AI Integration Design

Two distinct AI interactions occur during each interview session.

**Question generation** happens at the start of each turn. The server constructs a prompt that includes: a system instruction describing the interviewer's role and the evaluation domain; the candidate's resume text (up to 1,500 characters); the list of questions already asked in this session (to prevent repetition); and an instruction to return the next question as plain text. The LLM returns a single question, which is sent back to the client.

**Answer evaluation** happens once after all questions are answered. The server constructs a prompt that includes the complete interview transcript — each question paired with the candidate's Whisper-transcribed answer and their measured speech metrics (WPM and filler word count). The prompt specifies a strict JSON output schema with five score fields, a summary paragraph, strength and weakness lists, and per-question analysis. The server validates the returned JSON structure before forwarding it to the client.

The prompt design was the most iterative part of the project. Early versions produced inconsistent JSON formatting, repeated questions, and scores that did not reflect the actual answer quality. We refined the prompts over approximately twenty test sessions before the output became reliable enough for production use.

## 4.5 Speech Pipeline Design

The speech pipeline coordinates three components that handle different parts of the voice interaction.

**Speech synthesis (question delivery):** When a question is ready, the client sends the question text to the server's TTS endpoint. The server wraps the text in SSML markup with prosody controls — a slightly reduced speaking rate and a marginally lower pitch — to produce speech that sounds measured and natural rather than rushed. The server calls the neural TTS API and returns the audio. The client plays it immediately. If the TTS call fails, the client falls back to the browser's built-in speech synthesis. Figure 3 shows the full TTS and STT flow.

**Live speech recognition (answer capture):** While the user is speaking, the browser's built-in speech recognition interface streams a continuously updated transcript to the screen. This gives the candidate immediate visual confirmation that the microphone is working and their words are being captured. This transcript is for display only — it is not used for evaluation.

**Final transcription (answer evaluation):** When the user stops speaking, the recorded audio is sent to the server's transcription endpoint. The server forwards it to a cloud ASR model (Whisper large-v3) that handles technical vocabulary, acronyms, and non-native accents more reliably than browser-based recognition. The Whisper transcript replaces the live transcript as the authoritative text that the LLM evaluates.

The reason for running two recognition systems in parallel is the trade-off between latency and accuracy. Browser-based recognition is instant but less accurate on technical speech. Cloud-based Whisper is more accurate but takes 1–2 seconds after the answer ends. By showing the browser transcript live and replacing it with the Whisper result after the fact, we get both responsiveness and accuracy.

## 4.6 Database Design

The database has five tables, all linked by the user's unique identifier as the primary bridge key. Table 5 describes each table, its key fields, and its purpose.

**Table 5: Database schema — table descriptions and key fields**

| Table | Key Fields | Purpose |
|---|---|---|
| users | id (8-char hex, PK), email (unique), password_hash, name, created_at | Stores user account credentials. The 8-character hex ID is the foreign key used in all other tables. Email has a unique constraint to prevent duplicate registrations. |
| interview_sessions | id (PK), user_id (FK → users), job_category, overall_score, started_at, completed_at | Records each completed interview session. Composite indexes on (user_id, started_at) and (user_id, overall_score) support fast dashboard aggregation queries. |
| question_history | id (PK), session_id (FK → interview_sessions), question_asked, user_answer, ai_feedback, score | Stores each question-answer pair from a session with the AI-generated feedback note and per-question score (0–10). Enables the detailed Q&A review in the final report. |
| analytics_scores | id (PK), session_id (FK → interview_sessions), category, score | Stores the four dimension scores (Communication, Technical Accuracy, Problem Solving, Behavioural) as separate rows. Normalised design allows new scoring dimensions to be added without schema changes. |
| progress_tracking | id (PK), user_id (FK → users), date_recorded, rolling_average_score, total_interviews, most_improved_category | Stores pre-computed progress metrics per user, updated by the background worker after each session. Avoids recomputing rolling averages on every dashboard page load. |

All foreign keys use cascading deletion — removing a user account automatically removes all their sessions, questions, scores, and progress records. Figure 4 shows the entity-relationship diagram.

## 4.7 API Design

The API follows REST conventions. POST is used for resource creation and state-changing operations; GET is used for retrieval. Every error response includes an HTTP status code and a machine-readable detail message.

Table 6 summarises the eleven endpoints.

**Table 6: REST API endpoint summary**

| Endpoint | Method | Auth Required | Purpose |
|---|---|---|---|
| /api/register | POST | No | Create a new user account |
| /api/login | POST | No | Authenticate and receive a session token |
| /api/me | GET | Yes | Retrieve the current user's profile |
| /api/chat | POST | Yes | Proxy LLM request to Groq (question generation or evaluation) |
| /api/transcribe | POST | Yes | Proxy audio to Whisper for transcription |
| /google-tts | POST | No | Proxy text to Google Cloud TTS for speech synthesis |
| /api/interviews | POST | Yes | Submit a completed session for background persistence |
| /api/interviews | GET | Yes | Retrieve the user's session history |
| /api/jobs/{id} | GET | Yes | Poll the status of a background save job |
| /api/dashboard | GET | Yes | Retrieve aggregated dashboard statistics |
| /api/health | GET | No | Service health check |

The `/api/chat` endpoint is the most critical. It accepts a messages array in the standard LLM conversation format, injects the server-side API key, forwards the request to the LLM provider, and returns the response. The client constructs the messages array — including the system prompt with resume context — and the server adds only the credential. This design keeps the prompt logic on the client while keeping the key on the server.

## 4.8 Security Design

Security was treated as a first-class requirement throughout the design process, not added at the end.

**Credential isolation:** All AI API keys and the database connection string are stored as server-side environment variables. They are never written to any source file, never returned in any API response, and never logged. The JavaScript bundle delivered to the browser contains no secrets.

**Password storage:** User passwords are hashed using bcrypt with a work factor of 12 before being stored in the database. The original password is never stored and cannot be recovered from the hash.

**Session tokens:** Authentication tokens are cryptographically signed and include an expiration timestamp. Every protected endpoint validates the token signature and expiry before executing any logic.

**Data isolation:** Every database query that reads or modifies user data includes a filter on the authenticated user's ID. A user cannot access another user's sessions, scores, or history regardless of what they send in the request.

**Origin restriction:** The server's CORS policy allows requests only from the production frontend domain. Requests from any other origin are rejected before reaching any route handler.

**Rate limiting:** The interview submission endpoint enforces a one-session-per-day limit per user. This prevents API quota exhaustion and ensures fair access.

## 4.9 Asynchronous Job Processing Design

Saving a completed interview involves writing to four tables simultaneously: one session record, multiple question-answer records, four analytics score records, and one progress tracking record. Performing all of these writes synchronously in the HTTP response cycle would add several hundred milliseconds of latency at the exact moment the user is waiting to see their evaluation results.

We addressed this by decoupling the save operation from the HTTP response. When the client submits the interview data, the server serialises it, places it in a job queue, and immediately returns a job identifier. The client then polls a status endpoint every two seconds. A background worker picks up the job and performs all database writes asynchronously. Once the worker reports completion, the client navigates to the final review screen.

This design keeps the user-facing response time under 200 milliseconds for the submission step, regardless of how long the database writes take.

## 4.10 Deployment Design

The system is deployed across four cloud services, all on free tiers. Figure 5 shows the deployment architecture.

The web frontend is served from a global CDN with automatic HTTPS. The server runs on a cloud platform that rebuilds and redeploys automatically on every push to the main branch of the repository. Database migrations are applied automatically as part of the build step, so the production schema is always in sync with the application code. The message queue uses a serverless Redis instance that requires no persistent process management.

All credentials are stored in the deployment platform's environment variable store and are never committed to the source repository.

---

# Chapter 5: Implementation

## 5.1 Resume Parsing and Context Injection

The first implementation challenge was getting the candidate's resume into the LLM prompt without uploading the file to our server. We solved this by parsing the PDF entirely in the browser using a JavaScript PDF library. When the user selects a file, the browser reads it as a binary buffer, extracts the text content page by page, and concatenates it into a single string. This string is then stored in the browser's session state and included in every LLM request for the duration of the interview.

The extracted text is truncated to 1,500 characters before being inserted into the prompt. This limit was chosen after testing: shorter excerpts produced generic questions, while longer excerpts caused the model to focus too narrowly on a single section of the resume. At 1,500 characters, the model consistently produced questions that referenced the candidate's actual experience without becoming repetitive.

We also implemented a lightweight resume analysis step that runs before the first question is generated. This step scans the extracted text for experience-level indicators (years of experience, seniority keywords), technical skills, and achievement patterns. The analysis result is included in the system prompt to help the model calibrate the difficulty and focus of its questions.

## 5.2 Interview State Management

The active interview session is the most stateful part of the application. At any given moment, the session is in one of six phases: waiting for the question to be spoken, speaking the question aloud, listening to the candidate's answer, transcribing the recorded audio, evaluating the full transcript, or complete. Each phase has a distinct UI state and a defined set of valid transitions.

We implemented this as a state machine driven by a reducer function. The reducer takes the current phase and an action, and returns the new phase along with any associated state updates (current question text, live transcript, collected Q&A pairs, speech metrics). This design made the session logic easy to test and debug — we could replay any sequence of actions and verify the resulting state.

One non-obvious implementation detail: the live transcript and the Whisper transcript are stored separately. The live transcript updates continuously while the user speaks and is shown on screen. The Whisper transcript arrives 1–2 seconds after the user stops and silently replaces the live transcript in the data structure that gets sent to the LLM. The user sees the live transcript throughout; the LLM evaluates the Whisper transcript. This distinction was important for evaluation quality.

## 5.3 Prompt Engineering

The quality of the interview experience depends almost entirely on the prompts we send to the LLM. We went through approximately twenty iterations before settling on the final prompt structure.

**Question generation prompt:** The system prompt establishes the interviewer's persona, specifies the domain focus areas, and includes the candidate's resume excerpt and experience level. The user message includes the list of questions already asked in this session (to prevent repetition) and an instruction to return exactly one question as plain text. Early versions returned multiple questions, added preamble text, or repeated questions from earlier in the session. We fixed these by adding explicit constraints to the prompt.

**Evaluation prompt:** The evaluation prompt includes the complete interview transcript with speech metrics for each answer. It specifies a strict JSON output schema with named fields, value ranges, and minimum list lengths. It also explicitly instructs the model to comment on speech delivery (pace and filler words) in the summary paragraph. Early versions produced inconsistent JSON formatting and scores that did not correlate with answer quality. We addressed this by adding few-shot examples of good and poor answers with their expected scores, which significantly improved consistency.

**Domain templates:** We created separate prompt templates for each of the nine supported domains (Software Engineering, Data Science, Product Management, UI/UX Design, Cybersecurity, Cloud Computing, DevOps, Machine Learning, AI Research). Each template specifies the focus areas and the interviewer persona appropriate for that domain. A Software Engineering interview focuses on system design, code quality, and debugging; a Product Management interview focuses on prioritisation, user empathy, and business impact. These templates are selected at session start based on the user's domain choice.

## 5.4 Delivery Analytics Implementation

Delivery analytics are computed client-side immediately after the Whisper transcript arrives for each answer.

**Words per minute:** We record a timestamp when the TTS audio finishes playing (the moment the candidate should start answering) and another when the user clicks "Stop Recording". The elapsed time in minutes is divided into the word count of the Whisper transcript to produce WPM. We clamp the result to a reasonable range (20–300 WPM) to handle edge cases where the timing is inaccurate.

**Filler word detection:** We apply a regular expression to the Whisper transcript that matches a predefined list of disfluencies: um, uh, like, basically, you know, so, right, actually, literally, honestly, kind of, and sort of. The match is case-insensitive and uses word boundaries to avoid false positives (e.g., "likely" should not match "like"). The count is stored alongside the answer and summed across all answers for the session-level total shown in the final review.

Both metrics are included in the evaluation prompt so the LLM can comment on them in the coach's notes. This creates a feedback loop where the quantitative metrics inform the qualitative feedback.

## 5.5 Background Job Processing

When the user submits their completed interview, the server needs to write to four database tables: the session record, the question history, the analytics scores, and the progress tracking entry. We implemented this as a background job rather than a synchronous operation.

The job function receives the serialised session data, opens a database connection, and performs all writes within a single transaction. If any write fails, the entire transaction is rolled back and the job is marked as failed. The client polls a status endpoint every two seconds and navigates to the final review screen once the job reports success.

The progress tracking entry is computed inside the job function rather than on the client. After writing the session data, the job queries the database for the user's complete session history, computes the rolling average score, and identifies the most-improved category by comparing the current session's dimension scores against the previous session's. This computation happens in the background so it does not affect the user-facing response time.

## 5.6 Mobile Application

The mobile application implements the same interview flow as the web application but adapted for a touch-based interface on Android and iOS. It shares the same server-side API — all LLM calls, transcription, TTS, and data persistence go through the same endpoints.

The key implementation differences from the web version are:

**Audio recording:** The mobile app uses a native audio recording library to capture the candidate's answer in AAC format at 16 kHz. The recorded file is uploaded to the transcription endpoint as a multipart form submission. This differs from the web version, which captures audio as a browser MediaRecorder blob.

**Token persistence:** The session token is stored in the device's secure local storage and loaded on app startup. If the token is valid and not expired, the app navigates directly to the dashboard without showing the login screen.

**Local question bank:** After each completed session, the mobile app saves all questions and their suggested answers to local device storage. This creates a personal question bank that the user can browse offline for revision. The web version does not have this feature.

**Mock mode:** The mobile app includes a compile-time flag that substitutes a mock AI service for the real one. When this flag is set, the app generates instant fake responses without making any network calls. This was essential for UI testing and development without consuming API quota.

The mobile app was built using Flutter (Dart) and targets Android (minimum API level 23) and iOS. It is published as open source at https://github.com/ExplorerSoul/aqia-app.

## 5.7 Security Implementation

Three security properties required specific implementation effort.

**API key isolation:** Every AI service call in the application goes through a server-side proxy endpoint. The client sends a request to our server with its session token; the server validates the token, adds the AI service credential, and forwards the request. The client-side JavaScript bundle contains no API keys. We verified this by inspecting the built bundle with browser developer tools.

**Data isolation:** Every database query that reads user data includes a filter on the authenticated user's identifier. This is enforced by a shared authentication dependency that all protected endpoints use. The dependency resolves the user from the database using the identifier embedded in the session token, so even if a client sends a manipulated token, the query will return no data for a non-existent user.

**Password security:** Passwords are hashed using bcrypt before storage. The hash is one-way — the original password cannot be recovered from it. We verified this by checking that the stored value in the database is a bcrypt hash string and that login fails when an incorrect password is provided.

---


# Chapter 6: Results and Discussion

## 6.1 System Performance

We tested the deployed system at https://aqia-mate.vercel.app over multiple sessions and recorded the following observations.

Question generation completes in 0.8–1.5 seconds from the moment the user submits their previous answer. This latency is short enough that the interview feels conversational — the pause between an answer and the next question is comparable to a natural human pause. Evaluation of the full transcript (after all questions are answered) takes 2–4 seconds depending on the number of questions, which is acceptable given that the user expects a brief wait at this point.

Audio transcription completes in 1–2 seconds for a 30–60 second answer. The transcription result arrives before the user has finished reading the live transcript on screen, so the replacement is seamless.

Speech synthesis for a typical 20–40 word question takes 0.5–1.0 seconds. The audio begins playing immediately when it arrives, so the user perceives no gap between the question appearing on screen and being spoken aloud.

Dashboard statistics load in under 150 milliseconds. The composite indexes on the sessions table make the aggregation query fast even as the session count grows.

The one performance limitation we could not eliminate is the cold start delay on the free-tier server. After 15 minutes of inactivity, the server shuts down. The first request after a cold start takes 30–60 seconds while the server restarts. We display a loading message during this period so users understand what is happening.

## 6.2 User Flow Walkthrough

A complete session through AQIA proceeds as follows.

A new user registers with their name, email, and password. The system creates their account, issues a session token, and redirects them to the dashboard. The dashboard shows zero interviews and a prompt to start their first session.

The user clicks "New Interview" and arrives at the setup screen. They upload their PDF resume — the browser parses it in 1–2 seconds and confirms the word count extracted. They select a domain (for example, Software Engineering) and set the number of questions to five. They click "Start Interview".

The system generates the first question using the resume context. The question appears on screen and is spoken aloud. The user clicks "Start Recording" and speaks their answer. A live transcript updates on screen as they speak. When they finish, they click "Stop Recording". The audio is transcribed by Whisper in 1–2 seconds. The delivery metrics (WPM and filler word count) are computed and displayed. The user clicks "Next Question" and the cycle repeats.

After the fifth answer, the user clicks "Get Feedback". The complete transcript is sent to the LLM for evaluation. After 2–4 seconds, the evaluation report appears. The session data is saved to the database in the background.

The final review screen shows the overall score, four dimension scores, per-question scores and coach's notes, suggested improved answers for each question, speech analytics (average WPM and total filler words), and a summary paragraph. The user can download the report as a PDF or return to the dashboard to see their updated statistics.

## 6.3 Evaluation Output Quality

We assessed the quality of the LLM-generated evaluation by reviewing outputs from twenty test sessions across five domains.

The question generation was consistently relevant to the resume content. When a resume mentioned a specific project (for example, a distributed caching system), the LLM asked about that project in the resume deep-dive phase. When the resume indicated a junior experience level, the questions were appropriately scoped — they did not ask for architectural decisions that would only be relevant to a senior engineer.

The evaluation scores showed reasonable discrimination. Answers that were detailed, structured, and used specific examples received scores in the 7–9 range. Answers that were vague, brief, or off-topic received scores in the 2–4 range. The four dimension scores (Communication, Technical, Problem Solving, Behavioural) were not always correlated — a candidate could score high on Technical and low on Communication, which is the intended behaviour.

The suggested improved answers were the most consistently useful output. They demonstrated the STAR method (Situation, Task, Action, Result) structure for behavioural questions and showed how to add quantitative specifics to vague answers. Candidates who reviewed these suggestions before their next session showed measurable improvement in their answer structure.

The speech analytics were accurate for answers longer than 30 words. For very short answers (under 10 words), the WPM calculation was unreliable because the timing precision was insufficient. We added a minimum word count check that suppresses WPM display for very short answers.

## 6.4 Security Validation

We verified the security properties of the deployed system through the following checks.

We inspected the JavaScript bundle delivered to the browser using browser developer tools. No API keys, database credentials, or JWT secrets were present in any client-side file. All AI service calls in the network tab showed requests to our own server endpoints, not to external AI services directly.

We sent requests to protected endpoints without a session token and confirmed that they returned HTTP 401. We sent requests with an expired token and confirmed that they were rejected. We sent requests with a valid token for User A and attempted to retrieve User B's data by modifying query parameters — the server returned an empty result set, not User B's data.

We sent requests from a browser origin other than the production frontend domain and confirmed that they were rejected by the CORS policy before reaching any route handler.

We submitted two interview sessions within 24 hours from the same account and confirmed that the second submission returned HTTP 429 with an appropriate error message.

## 6.5 API Response Time Summary

Table 7 summarises the response times measured during production testing.

**Table 7: API response time measurements (production)**

| Endpoint | Operation | Typical Response Time |
|---|---|---|
| /api/register | Account creation | 200–400 ms |
| /api/login | Authentication | 200–400 ms |
| /api/chat | LLM question generation | 800–1500 ms |
| /api/chat | LLM evaluation (full transcript) | 2000–4000 ms |
| /api/transcribe | Audio transcription (30–60 s audio) | 1000–2000 ms |
| /google-tts | Speech synthesis (20–40 words) | 500–1000 ms |
| /api/dashboard | Statistics aggregation | 50–150 ms |
| /api/interviews | Session submission (enqueue) | 100–200 ms |
| /api/jobs/{id} | Job status poll | 50–100 ms |
| /api/health | Health check | 10–30 ms |

The AI service endpoints dominate the response time budget, as expected. The database and job management endpoints are fast, confirming that the server adds minimal overhead beyond the external API latency.

---

# Chapter 7: Conclusion and Future Work

## 7.1 Conclusion

We set out to build a mock interview system that actually knows who you are, listens to how you answer, and tells you something useful about both. AQIA does that.

The system reads your resume, generates questions from it, speaks them to you, listens to your answers, transcribes them accurately, measures how fast you spoke and how many filler words you used, and then produces a structured evaluation with scores, coach's notes, and suggested improved answers — all in a single browser session, at no cost, with no API keys exposed to the client.

Building this required solving several non-trivial engineering problems simultaneously. The server-side proxy architecture keeps credentials secure while maintaining low latency. The dual-model speech pipeline — Web Speech API for live display, Whisper for accurate evaluation — gives candidates real-time feedback without sacrificing transcription quality. The asynchronous job queue keeps the UI responsive even while multiple database writes are happening in the background. And the Flutter mobile app extends the same experience to Android and iOS without duplicating the backend.

The system is live. Real students at NIT Silchar have used it. The interview flow works end-to-end in production, not just in a demo environment.

More broadly, this project demonstrates something we think is worth stating explicitly: a small team of undergraduate students can build and deploy a production-grade AI application using entirely free-tier infrastructure. The barrier to building useful AI tools is no longer compute or cost — it is knowing how to put the pieces together correctly. We hope this project serves as a useful reference for future teams who want to do the same.

## 7.2 Limitations

We want to be honest about what AQIA does not do well yet.

The most significant limitation is browser compatibility. The live transcript feature depends on the Web Speech API, which only works in Chromium-based browsers. Firefox and Safari users get a degraded experience. We worked around this by providing text input as a fallback, but it is not the same.

The cold start problem on Render.com's free tier is genuinely annoying. The first request after 15 minutes of inactivity takes 30–60 seconds to respond. We document this in the UI, but it still creates a bad first impression for new users.

The one-interview-per-day rate limit is a practical necessity — Groq's free tier has token limits, and an unrestricted system would exhaust them quickly — but it frustrates users who want to practise multiple sessions in a day.

LLM evaluation is inherently non-deterministic. Two identical answers submitted on different days may receive slightly different scores. The structured JSON prompt reduces this variance, but it does not eliminate it. For a formal assessment tool, this would be a serious problem; for a practice tool, it is acceptable.

Finally, AQIA does not analyse video. Eye contact, posture, and facial expressions are real components of interview performance that we simply do not measure. This is a scope limitation, not a technical one.

## 7.3 Future Enhancements

The most impactful near-term improvement would be replacing the Web Speech API with a server-side streaming STT solution, which would make the live transcript work in all browsers. The Groq Whisper streaming API could support this.

For the mobile app, the next step is Play Store publication. The release AAB is built and the signing configuration is in place; the remaining work is completing the Play Console store listing.

Longer term, we see three directions worth pursuing. First, adaptive difficulty — adjusting question complexity based on the candidate's performance in previous answers within the same session — would make the interview feel more like a real conversation and less like a fixed script. Second, institutional integration — instructor dashboards, cohort analytics, assignment-based sessions — would let NIT Silchar use AQIA as a formal placement preparation tool rather than just a personal practice app. Third, multi-language support, starting with Hindi, would make the system accessible to a much larger population of students across India.

The codebase is open source. We welcome contributions from anyone who wants to build on what we have started.

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

[13] M. S. Bhatt, A. Jain, and R. Sharma, "LLM-based automated interview coaching: A survey of recent approaches," *arXiv preprint arXiv:2401.09876*, 2024.

[14] H. Touvron, L. Martin, K. Stone, P. Albert, A. Almahairi, Y. Babaei, N. Bashlykov, S. Batra, P. Bhargava, S. Bhosale, et al., "Llama 2: Open foundation and fine-tuned chat models," *arXiv preprint arXiv:2307.09288*, 2023.

[15] M. Jones, J. Bradley, and N. Sakimura, "JSON Web Token (JWT)," *IETF RFC 7519*, May 2015. [Online]. Available: https://datatracker.ietf.org/doc/html/rfc7519

[16] N. Provos and D. Mazières, "A future-adaptable password scheme," in *Proc. USENIX Annual Technical Conference*, 1999, pp. 81–91. (bcrypt)

[17] Redis Ltd., "Redis: The open source, in-memory data structure store," Redis Documentation, 2024. [Online]. Available: https://redis.io/docs/

[18] P. Guo, N. Samat, and A. Bhatt, "Conversational AI for interview preparation: Evaluating LLM-generated feedback quality," in *Proc. 2024 ACM Conf. Human Factors in Computing Systems (CHI)*, 2024, pp. 1–14.

[19] Y. Zhang, S. Sun, M. Galley, Y.-C. Chen, C. Brockett, X. Gao, J. Gao, J. Liu, and B. Dolan, "DIALOGPT: Large-scale generative pre-training for conversational response generation," in *Proc. 58th Annual Meeting of the Association for Computational Linguistics: System Demonstrations*, 2020, pp. 270–278.

[20] Google Cloud, "Text-to-Speech: Chirp3-HD neural voices," Google Cloud Documentation, 2024. [Online]. Available: https://cloud.google.com/text-to-speech/docs/chirp3-hd

[21] React Team, "React — The library for web and native user interfaces," Meta Open Source, 2024. [Online]. Available: https://react.dev/

[22] Flutter Team, "Flutter — Build apps for any screen," Google, 2024. [Online]. Available: https://flutter.dev/

[23] W. Kim, J. Park, and S. Lee, "Automated speech rate and disfluency analysis for interview coaching using transformer-based ASR," *IEEE Access*, vol. 12, pp. 45231–45244, 2024.

[24] A. Sinha, P. Gupta, and R. Verma, "Personalised interview question generation using retrieval-augmented LLMs and candidate profiles," in *Proc. 2025 Int. Conf. Artificial Intelligence in Education (AIED)*, 2025, pp. 312–325.

[25] SQLAlchemy Documentation, "SQLAlchemy — The Python SQL Toolkit and Object Relational Mapper," Michael Bayer, 2024. [Online]. Available: https://docs.sqlalchemy.org/

---

*End of Report*

**National Institute of Technology Silchar**
Department of Electronics and Communication Engineering
Assam – 788010, India
Academic Year 2025–26
