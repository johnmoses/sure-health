# 🏥 SureHealth - AI-Powered Healthcare Platform

> A comprehensive healthcare management system integrating blockchain technology, AI/LLM capabilities, and modern web technologies for secure, intelligent patient care.

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.3+-green.svg)](https://flask.palletsprojects.com)
[![React Native](https://img.shields.io/badge/React%20Native-0.72+-61DAFB.svg)](https://reactnative.dev)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org)
[![HIPAA](https://img.shields.io/badge/HIPAA-Compliant-red.svg)](https://www.hhs.gov/hipaa)

## 🌟 Features

### 🔐 **Security & Compliance**
- **HIPAA Compliant** - Full audit logging and PHI encryption
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin, healthcare provider, and patient roles
- **Rate Limiting** - API protection with Redis backend

### 🤖 **AI & Machine Learning**
- **Large Language Models (LLMs)** - Integrated Llama models for intelligent responses
- **Retrieval-Augmented Generation (RAG)** - Context-aware AI using Milvus vector database
- **AI Agents** - Automated healthcare task processing
- **Model Context Protocol (MCP)** - Advanced context management

### 🏥 **Healthcare Management**
- **Patient Records** - Comprehensive EHR system
- **Clinical Data** - Medical history, diagnoses, treatments
- **Medication Management** - AI-powered drug counseling
- **Billing System** - Insurance and payment processing
- **Real-time Chat** - Secure patient-provider communication

### 📊 **Analytics & Monitoring**
- **Admin Dashboard** - Real-time metrics and insights
- **API Analytics** - Usage tracking and performance monitoring
- **Health Checks** - System status and AI model availability

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │  Mobile App     │    │   Admin Panel   │
│   (Next.js)     │    │ (React Native)  │    │   (Dashboard)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │     Flask API Server      │
                    │   (Python + SQLAlchemy)   │
                    └─────────────┬─────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
    ┌─────┴─────┐         ┌───────┴───────┐       ┌───────┴───────┐
    │ PostgreSQL│         │ Milvus Vector │       │ Redis Cache   │
    │ Database  │         │   Database    │       │ & Rate Limit  │
    └───────────┘         └───────────────┘       └───────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Redis Server
- PostgreSQL (optional, SQLite for development)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/sure-health.git
cd sure-health
```

### 2. Backend Setup
```bash
cd api
pip install -r requirements.txt
cp .env.example .env
# Configure your environment variables
python run.py
```

### 3. Web Frontend Setup
```bash
cd web
npm install
npm run dev
```

### 4. Mobile App Setup
```bash
cd mobile
npm install
npx react-native run-ios  # or run-android
```

## 📱 Applications

### 🌐 **Web Application** (`/web`)
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **Real-time updates** via WebSocket
- **Responsive design** for all devices

### 📱 **Mobile Application** (`/mobile`)
- **React Native** cross-platform
- **Native performance** on iOS/Android
- **Offline capabilities** for critical features
- **Push notifications** for alerts

### ⚙️ **API Server** (`/api`)
- **Flask RESTful API** with comprehensive endpoints
- **SQLAlchemy ORM** for database operations
- **Marshmallow** for data validation
- **Socket.IO** for real-time communication

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/surehealth

# Security
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

# AI/ML Models
LLAMA_MODEL_PATH=/path/to/llama/model.gguf
MILVUS_DB_PATH=./milvus_rag.db
EMBED_MODEL_NAME=all-MiniLM-L6-v2

# Redis
REDIS_URL=redis://localhost:6379
```

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh

### Patient Management
- `GET /patients` - List patients
- `POST /patients` - Create patient
- `GET /patients/{id}` - Get patient details
- `PUT /patients/{id}` - Update patient

### Clinical Data
- `GET /clinical` - List clinical records
- `POST /clinical` - Create clinical record
- `GET /clinical/{id}` - Get clinical details

### AI & LLM
- `POST /llm/chat` - Chat with AI
- `GET /llm/health` - AI model status
- `POST /dashboard/metrics/ask-llm` - Query metrics with AI

## 🧪 Testing

```bash
# Backend tests
cd api
python -m pytest tests/

# Frontend tests
cd web
npm test

# Mobile tests
cd mobile
npm test
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Scale services
docker-compose up -d --scale api=3
```

## 📈 Monitoring & Analytics

- **Health Checks** - `/health` endpoint for system status
- **Metrics Dashboard** - Real-time system metrics
- **Audit Logging** - HIPAA-compliant activity tracking
- **Performance Monitoring** - API response times and usage

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@surehealth.com
- 📖 Documentation: [docs.surehealth.com](https://docs.surehealth.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/sure-health/issues)

## 🙏 Acknowledgments

- **Flask** - Web framework
- **React Native** - Mobile development
- **Next.js** - Web frontend
- **Milvus** - Vector database
- **Llama.cpp** - LLM inference

---

<div align="center">
  <strong>Built with ❤️ for better healthcare</strong>
</div>