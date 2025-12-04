# System Architecture Document

## S.D.P.I. - Sistema Distribuido de Predicción Inteligente para Hospitales Públicos

---

## 1. Architecture Overview

The S.D.P.I. system follows a **microservices architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      Frontend (React + TypeScript)                     │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │  │
│  │  │  Login  │ │Dashboard│ │Patients │ │Predict  │ │    Statistics   │ │  │
│  │  │  Page   │ │  Page   │ │  Page   │ │  Page   │ │      Page       │ │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API (JWT)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BUSINESS LOGIC LAYER                                │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Backend API (NestJS + TypeScript)                   │  │
│  │                                                                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐│  │
│  │  │   Auth   │  │  Users   │  │ Patients │  │      Predictions       ││  │
│  │  │  Module  │  │  Module  │  │  Module  │  │        Module          ││  │
│  │  └──────────┘  └──────────┘  └──────────┘  └───────────┬────────────┘│  │
│  │                                                        │              │  │
│  │                                            ┌───────────▼────────────┐ │  │
│  │                                            │   ML Service Client    │ │  │
│  │                                            │  (HTTP Communication)  │ │  │
│  │                                            └───────────┬────────────┘ │  │
│  └────────────────────────────────────────────────────────│──────────────┘  │
└───────────────────────────────────────────────────────────│─────────────────┘
                          │                                 │
                          │ SQL                             │ REST API
                          ▼                                 ▼
┌─────────────────────────────────────┐  ┌────────────────────────────────────┐
│         DATA PERSISTENCE LAYER       │  │        ML PROCESSING LAYER         │
│  ┌───────────────────────────────┐  │  │  ┌────────────────────────────────┐│
│  │     PostgreSQL Database       │  │  │  │    ML Service (FastAPI)        ││
│  │                               │  │  │  │                                ││
│  │  ┌─────────┐  ┌───────────┐  │  │  │  │  ┌──────────────────────────┐ ││
│  │  │  users  │  │ patients  │  │  │  │  │  │   Logistic Regression    │ ││
│  │  └─────────┘  └───────────┘  │  │  │  │  │   scikit-learn model     │ ││
│  │  ┌─────────┐  ┌───────────┐  │  │  │  │  └──────────────────────────┘ ││
│  │  │clinical │  │predictions│  │  │  │  │                                ││
│  │  │_records │  │           │  │  │  │  │  • /predict endpoint           ││
│  │  └─────────┘  └───────────┘  │  │  │  │  • /health endpoint            ││
│  │  ┌─────────┐                 │  │  │  │  • /model-info endpoint        ││
│  │  │audit_log│                 │  │  │  └────────────────────────────────┘│
│  │  └─────────┘                 │  │  └────────────────────────────────────┘
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 2. Component Details

### 2.1 Frontend (React)

**Technology Stack:**
- React 18 with TypeScript
- Vite (build tool)
- React Router (navigation)
- Axios (HTTP client)
- Tailwind CSS / CSS Modules (styling)
- Chart.js or Recharts (visualizations)

**Responsibilities:**
- User authentication interface
- Patient management CRUD
- Prediction request forms
- Dashboard with statistics
- Result visualization

**Key Features:**
- Single Page Application (SPA)
- JWT token management
- Role-based UI rendering
- Responsive design

### 2.2 Backend API (NestJS)

**Technology Stack:**
- NestJS framework
- TypeScript
- TypeORM (PostgreSQL)
- Passport.js + JWT
- class-validator (DTO validation)
- Swagger/OpenAPI

**Modules:**
| Module | Responsibility |
|--------|---------------|
| `AuthModule` | Login, registration, JWT tokens |
| `UsersModule` | User CRUD, role management |
| `PatientsModule` | Patient records, clinical data |
| `PredictionsModule` | Orchestrate ML predictions |

**API Endpoints:**

```
Authentication:
  POST   /api/v1/auth/login           # User login
  POST   /api/v1/auth/register        # Register user (admin)
  POST   /api/v1/auth/me              # Get current user

Users:
  GET    /api/v1/users                # List users (admin)
  GET    /api/v1/users/:id            # Get user by ID
  PATCH  /api/v1/users/:id/activate   # Activate user
  PATCH  /api/v1/users/:id/deactivate # Deactivate user

Patients:
  GET    /api/v1/patients             # List patients (paginated)
  GET    /api/v1/patients/search      # Search patients
  GET    /api/v1/patients/:id         # Get patient details
  POST   /api/v1/patients             # Create patient
  PUT    /api/v1/patients/:id         # Update patient
  POST   /api/v1/patients/:id/clinical-records  # Add clinical record
  GET    /api/v1/patients/:id/clinical-records  # Get clinical history

Predictions:
  POST   /api/v1/predictions          # Request prediction
  GET    /api/v1/predictions          # List predictions
  GET    /api/v1/predictions/:id      # Get prediction details
  GET    /api/v1/predictions/patient/:id  # Patient prediction history
  GET    /api/v1/predictions/statistics   # Prediction statistics
  GET    /api/v1/predictions/ml-health    # ML service health check
```

### 2.3 ML Service (FastAPI)

**Technology Stack:**
- Python 3.11
- FastAPI
- scikit-learn
- NumPy, Pandas
- Pydantic (validation)
- joblib (model serialization)

**Endpoints:**

```
POST   /predict      # Run ML prediction
GET    /health       # Service health check
GET    /ready        # Readiness probe
GET    /model-info   # Model metadata
```

**ML Model Details:**

```python
# Logistic Regression Configuration
LogisticRegression(
    C=1.0,              # Regularization strength
    solver='lbfgs',     # Optimization algorithm
    max_iter=1000,      # Maximum iterations
    random_state=42     # Reproducibility
)

# Feature Pipeline
Pipeline([
    ('scaler', StandardScaler()),  # Normalize features
    ('classifier', LogisticRegression())
])
```

### 2.4 PostgreSQL Database

**Schema Overview:**

```
┌─────────────────┐     ┌─────────────────┐
│     users       │     │    patients     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ email           │────▶│ created_by (FK) │
│ password_hash   │     │ curp            │
│ first_name      │     │ first_name      │
│ last_name       │     │ last_name       │
│ role            │     │ birth_date      │
│ is_active       │     │ gender          │
│ created_at      │     │ blood_type      │
│ updated_at      │     │ hospital_id     │
└─────────────────┘     └────────┬────────┘
                                 │
                                 │ 1:N
                                 ▼
                        ┌─────────────────┐
                        │clinical_records │
                        ├─────────────────┤
                        │ id (PK)         │
                        │ patient_id (FK) │
                        │ record_date     │
                        │ age, bmi        │
                        │ blood_pressure  │
                        │ glucose_level   │
                        │ cholesterol     │
                        │ previous_admissions
                        │ has_diabetes    │
                        │ smoking_status  │
                        └────────┬────────┘
                                 │
                                 │ 1:N
                                 ▼
                        ┌─────────────────┐
                        │  predictions    │
                        ├─────────────────┤
                        │ id (PK)         │
                        │ patient_id (FK) │
                        │ clinical_record_id (FK)
                        │ prediction_type │
                        │ risk_score      │
                        │ risk_level      │
                        │ model_version   │
                        │ features_used   │
                        │ feature_importance
                        │ requested_by (FK)
                        └─────────────────┘
```

---

## 3. Communication Flows

### 3.1 Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Backend │         │PostgreSQL│
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │ POST /auth/login   │                    │
     │ {email, password}  │                    │
     │───────────────────▶│                    │
     │                    │ SELECT user        │
     │                    │───────────────────▶│
     │                    │◀───────────────────│
     │                    │                    │
     │                    │ Verify bcrypt hash │
     │                    │ Generate JWT       │
     │                    │                    │
     │ 200 OK             │                    │
     │ {accessToken, user}│                    │
     │◀───────────────────│                    │
     │                    │                    │
```

### 3.2 Prediction Flow (Distributed)

```
┌──────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐
│  Client  │       │  Backend │       │ML Service│       │PostgreSQL│
└────┬─────┘       └────┬─────┘       └────┬─────┘       └────┬─────┘
     │                  │                  │                  │
     │ POST /predictions│                  │                  │
     │ {patientId,      │                  │                  │
     │  clinicalRecordId│                  │                  │
     │  predictionType} │                  │                  │
     │─────────────────▶│                  │                  │
     │                  │                  │                  │
     │                  │ Validate patient │                  │
     │                  │─────────────────────────────────────▶│
     │                  │◀─────────────────────────────────────│
     │                  │                  │                  │
     │                  │ Get clinical record                 │
     │                  │─────────────────────────────────────▶│
     │                  │◀─────────────────────────────────────│
     │                  │                  │                  │
     │                  │ POST /predict    │                  │
     │                  │ {type, features} │                  │
     │                  │─────────────────▶│                  │
     │                  │                  │ Load model       │
     │                  │                  │ Preprocess       │
     │                  │                  │ Run inference    │
     │                  │ {risk_score,     │                  │
     │                  │  risk_level,     │                  │
     │                  │  importance}     │                  │
     │                  │◀─────────────────│                  │
     │                  │                  │                  │
     │                  │ Store prediction │                  │
     │                  │─────────────────────────────────────▶│
     │                  │◀─────────────────────────────────────│
     │                  │                  │                  │
     │ 201 Created      │                  │                  │
     │ {prediction}     │                  │                  │
     │◀─────────────────│                  │                  │
```

---

## 4. Security Architecture

### 4.1 Authentication

- **Method**: JWT (JSON Web Tokens)
- **Algorithm**: HS256
- **Token Expiration**: 24 hours
- **Storage**: Client-side (localStorage/memory)

### 4.2 Authorization (RBAC)

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access, user management |
| **DOCTOR** | Create/view patients, request predictions |
| **ANALYST** | View patients, view statistics |

### 4.3 Data Protection

- Passwords hashed with bcrypt (12 rounds)
- Input validation on all endpoints
- SQL injection prevention via parameterized queries
- CORS configuration for allowed origins
- Rate limiting (recommended for production)

---

## 5. Deployment Architecture

### 5.1 Docker Containers

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network (sdpi-network)            │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  frontend   │  │ backend-api │  │ ml-service  │         │
│  │   :5173     │  │    :3000    │  │    :8000    │         │
│  └─────────────┘  └──────┬──────┘  └─────────────┘         │
│                          │                                  │
│                          ▼                                  │
│                   ┌─────────────┐                           │
│                   │  postgres   │                           │
│                   │    :5432    │                           │
│                   └─────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Environment Variables

```bash
# Backend API
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=sdpi_user
DB_PASSWORD=<secure_password>
DB_DATABASE=sdpi_db
JWT_SECRET=<random_256bit_secret>
ML_SERVICE_URL=http://ml-service:8000

# Frontend
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 6. Scalability Considerations

### 6.1 Current Design

- Stateless backend API (horizontal scaling ready)
- Separate ML service (can scale independently)
- PostgreSQL with connection pooling

### 6.2 Future Improvements

- Add Redis for session/cache layer
- Implement message queue for async predictions
- Add load balancer for multiple backend instances
- Consider PostgreSQL read replicas

---

*Architecture Document - S.D.P.I. Project*
*Universidad de Guadalajara, CUCEI, Ingeniería Informática*

