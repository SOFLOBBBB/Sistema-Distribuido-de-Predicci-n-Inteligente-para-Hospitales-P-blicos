# S.D.P.I. - Sistema Distribuido de Predicción Inteligente para Hospitales Públicos

> **Distributed Intelligent Prediction System for Public Hospitals**

A modular graduation project for INNI – Ingeniería Informática, CUCEI, Universidad de Guadalajara.

**Author**: Sofía Castellanos Lobo

---

## 📋 Project Overview

This system enables healthcare personnel in Mexican public hospitals to:
- Securely manage patient records
- Run ML-based clinical risk predictions (e.g., hospital readmission risk)
- Visualize statistics and prediction history

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  Backend API │────▶│  ML Service  │
│   (React)    │     │   (NestJS)   │     │  (FastAPI)   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  PostgreSQL  │
                    └──────────────┘
```

## 📁 Project Structure

```
/sdpi-project
├── /frontend-app       # React 18+ with TypeScript & Vite
├── /backend-api        # NestJS REST API
├── /ml-service         # Python FastAPI microservice
├── /docs               # Academic documentation
└── /infrastructure     # Docker & deployment configs
```

## 🎓 Academic Module Mapping

| Module | Focus | Components |
|--------|-------|------------|
| **Module 2** | IT Management | Database design, security, SCRUM methodology |
| **Module 3** | Distributed Systems | Microservices architecture, REST APIs, Docker |
| **Module 4** | Soft Computing | ML models (Logistic Regression, Random Forest) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Using Docker Compose

```bash
cd infrastructure
docker-compose up -d
```

### Manual Setup

1. **Backend API**:
```bash
cd backend-api
npm install
cp .env.example .env
npm run start:dev
```

2. **ML Service**:
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

3. **Frontend** (coming soon):
```bash
cd frontend-app
npm install
ng serve
```

## 📊 API Endpoints

### Backend API (Port 3000)
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration (admin only)
- `GET /patients` - List patients
- `POST /patients` - Create patient record
- `POST /predictions` - Request prediction
- `GET /predictions/history` - Prediction history

### ML Service (Port 8000)
- `POST /predict` - Run prediction inference
- `GET /health` - Service health check
- `GET /model-info` - Model metadata

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (ADMIN, DOCTOR, ANALYST)
- Password hashing with bcrypt
- Input validation and sanitization
- Audit logging

## 📈 ML Model

**Primary Algorithm**: Logistic Regression for hospital readmission risk prediction

**Features used**:
- Age, BMI, blood pressure
- Glucose level, cholesterol
- Previous admissions count
- Chronic conditions (diabetes, hypertension)
- Smoking status

**Performance Metrics** (to be updated after training):
- Accuracy: TBD
- Precision: TBD
- Recall: TBD
- F1-Score: TBD
- ROC-AUC: TBD

## 📚 Documentation

See `/docs` folder for:
- Architecture details
- Module mapping
- Academic formats (Spanish)
- IEEE article draft

## 📄 License

Academic project - Universidad de Guadalajara, CUCEI, 2024-2025

