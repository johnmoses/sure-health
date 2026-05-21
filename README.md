# SureHealth — AI-Powered Healthcare Platform

[![SureHealth Banner](https://github.com/johnmoses/sure-health/raw/main/brand-sure-health.png)](https://github.com/johnmoses/sure-health)

> **Clinical-grade EHR platform with LLM-powered multi-party chat, real-time monitoring, and FHIR-compliant interoperability.**
> Built as a full-stack proof of concept demonstrating production AI architecture in a regulated healthcare context.

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.3-black?logo=flask)](https://flask.palletsprojects.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![React Native](https://img.shields.io/badge/React_Native-0.72-61DAFB?logo=react)](https://reactnative.dev)
[![HIPAA](https://img.shields.io/badge/HIPAA-Compliant-red)](https://www.hhs.gov/hipaa)
[![MCP](https://img.shields.io/badge/MCP-Anthropic-orange)](https://anthropic.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

SureHealth is a three-tier Electronic Health Records platform that integrates Large Language Models, Retrieval-Augmented Generation, and multi-agent AI into a clinically structured EHR system. It demonstrates how modern AI can augment patient-doctor workflows while maintaining compliance with healthcare interoperability standards.

---

## Screenshots

### 📱 Mobile App

| | | | |
|---|---|---|---|
| ![](https://github.com/johnmoses/sure-health/raw/main/mobile/images/1.png) | ![](https://github.com/johnmoses/sure-health/raw/main/mobile/images/2.png) | ![](https://github.com/johnmoses/sure-health/raw/main/mobile/images/3.png) | ![](https://github.com/johnmoses/sure-health/raw/main/mobile/images/4.png) |
| ![](https://github.com/johnmoses/sure-health/raw/main/mobile/images/5.png) | ![](https://github.com/johnmoses/sure-health/raw/main/mobile/images/6.png) | ![](https://github.com/johnmoses/sure-health/raw/main/mobile/images/7.png) | ![](https://github.com/johnmoses/sure-health/raw/main/mobile/images/8.png) |

<details>
<summary>View all mobile screenshots (12)</summary>

| | | | |
|---|---|---|---|
| ![](https://github.com/johnmoses/sure-health/raw/main/mobile/images/9.png) | ![](https://github.com/johnmoses/sure-health/raw/main/mobile/images/10.png) | ![](https://github.com/johnmoses/sure-health/raw/main/mobile/images/11.png) | ![](https://github.com/johnmoses/sure-health/raw/main/mobile/images/12.png) |

</details>

### 🌐 Web App

| | | |
|---|---|---|
| ![](https://github.com/johnmoses/sure-health/raw/main/web/images/1.png) | ![](https://github.com/johnmoses/sure-health/raw/main/web/images/2.png) | ![](https://github.com/johnmoses/sure-health/raw/main/web/images/3.png) |
| ![](https://github.com/johnmoses/sure-health/raw/main/web/images/4.png) | ![](https://github.com/johnmoses/sure-health/raw/main/web/images/5.png) | ![](https://github.com/johnmoses/sure-health/raw/main/web/images/6.png) |

<details>
<summary>View all web screenshots (9)</summary>

| | | |
|---|---|---|
| ![](https://github.com/johnmoses/sure-health/raw/main/web/images/7.png) | ![](https://github.com/johnmoses/sure-health/raw/main/web/images/8.png) | ![](https://github.com/johnmoses/sure-health/raw/main/web/images/9.png) |

</details>

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                          │
│         Next.js Web (Clinician Dashboard)                   │
│         React Native Mobile (Patient & Provider App)        │
└────────────────────────┬────────────────────────────────────┘
                         │ REST / Socket.IO
┌────────────────────────▼────────────────────────────────────┐
│                      API LAYER                              │
│                  Flask (Python 3.11)                        │
│   Auth  │  FHIR Resource Engine  │  AI Orchestration Layer  │
└──────┬──────────────┬────────────────────┬──────────────────┘
       │              │                    │
┌──────▼───┐  ┌───────▼──────┐  ┌──────────▼─────────────────┐
│PostgreSQL│  │ Milvus Vector │  │        LLM Layer           │
│(HIPAA-   │  │ (RAG / Notes) │  │  LangChain · MCP · Llama   │
│compliant)│  └───────────────┘  └────────────────────────────┘
└──────────┘
```

| Layer | Technology |
|---|---|
| Backend API | Flask, Python 3.11, SQLAlchemy, Marshmallow |
| AI Orchestration | LangChain, Anthropic MCP, RAG |
| LLM Inference | Llama (local via llama.cpp), OpenAI |
| Vector Store | Milvus (clinical notes RAG) |
| Web Frontend | Next.js 14, TypeScript, TailwindCSS |
| Mobile | React Native (iOS & Android) |
| Real-time | Socket.IO |
| Cache & Rate Limiting | Redis |
| Database | PostgreSQL |
| Deployment | Docker Compose |

---

## Key Features

**🏥 HIPAA-Compliant EHR Core** — Full audit logging, PHI encryption, and role-based access control across Patient, Clinician, and Administrator roles.

**🤖 LLM-Powered Clinical AI** — Integrated LLMs assist with clinical note summarisation, differential diagnosis suggestions (RAG-grounded), medication interaction flagging, and patient risk scoring.

**💬 Secure Multi-Party Chat** — Patient · Doctor · AI chat rooms with end-to-end role-based access. The AI participates as a clinical assistant — not a decision-maker.

**📡 Real-Time Clinical Monitoring** — Live vital sign feeds and observation streams with threshold-based alerting via WebSocket/Socket.IO.

**🧠 RAG-Grounded Clinical Context** — Clinical notes and discharge summaries embedded in Milvus; LLM responses anchored to the patient's actual record, scoped per patient and encounter.

**📱 Cross-Platform Mobile** — React Native app for patients (appointments, records, messaging) and providers (mobile charting, alerts, chat).

**🔐 Security & Compliance** — JWT authentication, rate limiting via Redis, HIPAA audit logging, PHI encryption at rest.

---

## Getting Started

### Prerequisites

- Python 3.10+, Node.js 18+, Redis, Docker & Docker Compose

### Quickstart

```bash
# 1. Clone
git clone https://github.com/johnmoses/sure-health.git
cd sure-health

# 2. Configure environment
cd api && cp .env.example .env
# Edit .env: DATABASE_URL, ANTHROPIC_API_KEY or LLAMA_MODEL_PATH,
#            JWT_SECRET_KEY, REDIS_URL, MILVUS_DB_PATH

# 3. Start backend + database
docker-compose up -d

# 4. Run migrations
pip install -r requirements.txt && python run.py

# 5. Start web frontend
cd ../web && npm install && npm run dev   # → http://localhost:3000

# 6. Start mobile
cd ../mobile && npm install && npx react-native run-ios
```

### Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@localhost/surehealth
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
LLAMA_MODEL_PATH=/path/to/llama/model.gguf   # or set OPENAI_API_KEY
MILVUS_DB_PATH=./milvus_rag.db
EMBED_MODEL_NAME=all-MiniLM-L6-v2
REDIS_URL=redis://localhost:6379
```

---

## AI Architecture Notes

**Clinical Agent Design** — Agents built with LangChain and Anthropic's Model Context Protocol (MCP) connect directly to live FHIR resources, grounding all responses in the patient's actual record state — not generic medical knowledge.

**RAG for Clinical Notes** — Unstructured notes are chunked, embedded, and stored in Milvus. Retrieval is scoped per patient and encounter to eliminate cross-patient context leakage.

**Safety Guardrails** — All AI-generated clinical suggestions are flagged in the UI as AI-generated, grounded via RAG, and require clinician confirmation before any record update.

---

## API Reference

| Endpoint | Purpose |
|---|---|
| `POST /auth/register` / `POST /auth/login` | Authentication |
| `GET/POST /patients` | Patient management |
| `GET/POST /clinical` | Clinical records |
| `POST /llm/chat` | AI chat interface |
| `POST /dashboard/metrics/ask-llm` | AI-powered metrics queries |
| `GET /health` | System health check |

---

## Project Status

> ⚡ **Complete proof of concept — fully functional locally.**
> All core features implemented. HIPAA/GDPR hardening and third-party security audit would be required before production deployment.

---

## About the Author

Built by **John Moses** — co-founding engineer at [ShopStack360](https://shopstack360.com) and independent AI consultant through AXIIS Microsystems, with prior delivery experience in EHR, fintech, and global nonprofit systems.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-john--moses--ng-blue?logo=linkedin)](https://linkedin.com/in/john-moses-ng)
[![GitHub](https://img.shields.io/badge/GitHub-johnmoses-black?logo=github)](https://github.com/johnmoses)
[![Email](https://img.shields.io/badge/Email-johnmosesng%40gmail.com-red?logo=gmail)](mailto:johnmosesng@gmail.com)

---

## License

MIT — see [LICENSE](LICENSE) for details.