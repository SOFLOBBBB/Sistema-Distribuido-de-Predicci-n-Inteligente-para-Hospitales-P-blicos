# Module Mapping Document

## S.D.P.I. - Academic Module Compliance Matrix

This document maps each system component to the academic modules required for the graduation project at Universidad de Guadalajara, CUCEI.

---

## Overview

| Module | Name | Primary Components |
|--------|------|-------------------|
| **Module 2** | Gestión de las Tecnologías de la Información | Backend API, Database, Security |
| **Module 3** | Sistemas Robustos, Paralelos y Distribuidos | Microservices Architecture, Docker |
| **Module 4** | Cómputo Flexible / Softcomputing | ML Service, Prediction Models |

---

## Module 2: Gestión de TI (IT Management)

### Requirements Checklist

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Information System Modeling | UML diagrams, Entity-Relationship | ✅ |
| Software Engineering Methodology | SCRUM with documented sprints | ✅ |
| Relational Database | PostgreSQL with TypeORM | ✅ |
| Data Integrity | Foreign keys, constraints, validation | ✅ |
| Information Security | JWT auth, bcrypt, role-based access | ✅ |
| Data Protection | Input validation, SQL injection prevention | ✅ |
| Quality Standards | ISO/IEC 25010 compliance | ✅ |

### Code Locations

```
backend-api/
├── src/
│   ├── auth/                    # [M2] Authentication & Security
│   │   ├── auth.service.ts      # JWT token generation, bcrypt hashing
│   │   ├── guards/              # Route protection
│   │   └── strategies/          # Passport JWT strategy
│   │
│   ├── database/entities/       # [M2] Data Model
│   │   ├── user.entity.ts       # User management
│   │   ├── patient.entity.ts    # Patient records
│   │   ├── clinical-record.entity.ts
│   │   ├── prediction.entity.ts
│   │   └── audit-log.entity.ts  # Security audit trail
│   │
│   ├── common/                  # [M2] Quality - Reusable components
│   │   ├── enums/               # Type safety
│   │   └── dto/                 # Data validation
│   │
│   └── */dto/*.dto.ts           # [M2] Input validation with class-validator
```

### Key Security Features

```typescript
// [MODULE 2] Password hashing with bcrypt (12 rounds)
const passwordHash = await bcrypt.hash(password, 12);

// [MODULE 2] JWT token with role-based claims
const payload: JwtPayload = {
  sub: user.id,
  email: user.email,
  role: user.role,  // ADMIN, DOCTOR, ANALYST
};

// [MODULE 2] Input validation DTO
export class CreatePatientDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;
  
  @Matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/)
  curp?: string;  // Mexican ID validation
}
```

---

## Module 3: Sistemas Distribuidos (Distributed Systems)

### Requirements Checklist

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Distributed Services | 3 separate microservices | ✅ |
| Client-Server Architecture | React SPA ↔ NestJS API | ✅ |
| Communication Protocols | REST/HTTP, JSON | ✅ |
| Service Independence | Each service in own container | ✅ |
| Fault Tolerance | Health checks, retries, timeouts | ✅ |
| Cloud-Ready | Docker, environment variables | ✅ |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DISTRIBUTED ARCHITECTURE                         │
│                              [MODULE 3]                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐    HTTP/REST    ┌──────────────┐    HTTP/REST        │
│   │   Frontend   │ ──────────────► │  Backend API │ ──────────────►     │
│   │   (React)    │    Port 5173    │   (NestJS)   │    Port 3000        │
│   │  Container 1 │ ◄────────────── │  Container 2 │ ◄──────────────     │
│   └──────────────┘      JSON       └──────┬───────┘      JSON           │
│                                           │                              │
│                                           │ SQL/TCP                      │
│                                           │ Port 5432                    │
│   ┌──────────────┐    HTTP/REST           ▼                              │
│   │  ML Service  │ ◄──────────────  ┌──────────────┐                    │
│   │  (FastAPI)   │    Port 8000     │  PostgreSQL  │                    │
│   │  Container 3 │ ──────────────►  │  Container 4 │                    │
│   └──────────────┘      JSON        └──────────────┘                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Code Locations

```
infrastructure/
├── docker-compose.yml           # [M3] Container orchestration
│
backend-api/src/
├── predictions/
│   └── ml-service.client.ts     # [M3] HTTP client for ML service
│
ml-service/
├── app/
│   ├── main.py                  # [M3] Independent FastAPI service
│   └── routers/
│       └── health.py            # [M3] Health check endpoints
```

### Key Distributed Communication Code

```typescript
// [MODULE 3] ML Service Client - Distributed Communication
@Injectable()
export class MLServiceClient {
  constructor(private configService: ConfigService) {
    this.mlServiceUrl = configService.get('ML_SERVICE_URL', 'http://localhost:8000');
    
    // [M3] HTTP client configuration for distributed service
    this.httpClient = axios.create({
      baseURL: this.mlServiceUrl,
      timeout: 30000,  // Timeout for fault tolerance
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // [M3] Distributed prediction request
  async predict(predictionType: string, features: MLPredictionInput) {
    const response = await this.httpClient.post('/predict', {
      prediction_type: predictionType,
      features,
    });
    return response.data;
  }

  // [M3] Health check for service discovery
  async healthCheck() {
    return this.httpClient.get('/health');
  }
}
```

```python
# [MODULE 3] ML Service Health Check Endpoint
@router.get("/health")
async def health_check(request: Request):
    """
    [MODULE 3]: Service discovery and health monitoring
    The Backend API calls this to verify ML service availability
    """
    return {
        "status": "healthy",
        "service": "S.D.P.I. ML Service",
        "model_loaded": model_service.model is not None,
        "uptime_seconds": time.time() - start_time,
    }
```

---

## Module 4: Cómputo Flexible / Softcomputing

### Requirements Checklist

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| ML Algorithm | Logistic Regression | ✅ |
| Alternative Algorithm | Random Forest | ✅ |
| Mathematical Model | Sigmoid function documented | ✅ |
| Dataset | 50 records (exceeds 35 minimum) | ✅ |
| Performance Metrics | Accuracy, Precision, Recall, F1, ROC-AUC | ✅ |
| Feature Engineering | Preprocessing, one-hot encoding | ✅ |
| Model Interpretability | Feature importance | ✅ |

### Mathematical Model: Logistic Regression

```
LOGISTIC REGRESSION MODEL
═════════════════════════

The model predicts probability using the sigmoid (logistic) function:

                        1
    P(Y=1|X) = ─────────────────────
               1 + e^(-z)

Where:
    z = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ

Variables:
    Y = 1     → Patient will be readmitted within 30 days
    Y = 0     → Patient will NOT be readmitted
    xᵢ        → Input features (age, BMI, glucose, etc.)
    βᵢ        → Learned coefficients (weights)
    β₀        → Intercept (bias term)

Loss Function (Binary Cross-Entropy):
    
              1   N
    L(β) = - ─── Σ [yᵢ·log(ŷᵢ) + (1-yᵢ)·log(1-ŷᵢ)]
              N  i=1

Optimization: Gradient Descent (LBFGS solver)
```

### Code Locations

```
ml-service/
├── app/
│   ├── services/
│   │   └── model_service.py      # [M4] ML model inference
│   ├── schemas/
│   │   └── prediction.py         # [M4] Feature definitions
│   └── routers/
│       └── predictions.py        # [M4] Prediction endpoint
│
├── training/
│   ├── dataset.csv               # [M4] 50 patient records
│   └── train_model.py            # [M4] Training script with metrics
```

### Key ML Implementation Code

```python
# [MODULE 4] Logistic Regression Prediction
def predict(self, prediction_type: PredictionType, features: PredictionFeatures):
    """
    [MODULE 4]: ML Inference
    
    Mathematical Model:
        P(Y=1|X) = σ(z) = 1 / (1 + e^(-z))
        where z = β₀ + Σ(βᵢ · xᵢ)
    """
    # Preprocess features
    X = self.preprocess_features(features)
    
    # [M4] The sigmoid function outputs probability
    probabilities = self.model.predict_proba(X)
    risk_score = float(probabilities[0][1])  # P(Y=1)
    
    # Risk level classification
    if risk_score < 0.3:
        risk_level = RiskLevel.LOW
    elif risk_score < 0.7:
        risk_level = RiskLevel.MEDIUM
    else:
        risk_level = RiskLevel.HIGH
    
    return risk_score, risk_level, feature_importance
```

### Performance Metrics (from training)

```
═══════════════════════════════════════════════════════════════
  [MODULE 4] Model Evaluation Results
═══════════════════════════════════════════════════════════════

  LOGISTIC REGRESSION:
  ─────────────────────────────────────────────────────────────
    Accuracy:   0.8667 (86.67%)
    Precision:  0.8750 (87.50%)
    Recall:     0.8750 (87.50%)
    F1-Score:   0.8750 (87.50%)
    ROC-AUC:    0.9306 (93.06%)

  RANDOM FOREST:
  ─────────────────────────────────────────────────────────────
    Accuracy:   0.8000 (80.00%)
    Precision:  0.7778 (77.78%)
    Recall:     0.8750 (87.50%)
    F1-Score:   0.8235 (82.35%)
    ROC-AUC:    0.8889 (88.89%)

  Conclusion: Logistic Regression selected as primary model
  due to better overall performance and interpretability.
═══════════════════════════════════════════════════════════════
```

---

## Summary: Module Coverage by File

| File | M2 | M3 | M4 | Description |
|------|:--:|:--:|:--:|-------------|
| `backend-api/src/auth/*` | ✅ | | | JWT authentication, security |
| `backend-api/src/database/entities/*` | ✅ | | | Data model, TypeORM entities |
| `backend-api/src/patients/*` | ✅ | | | Patient CRUD, validation |
| `backend-api/src/predictions/ml-service.client.ts` | | ✅ | | Distributed HTTP client |
| `backend-api/src/predictions/predictions.service.ts` | | ✅ | | Orchestration |
| `ml-service/app/main.py` | | ✅ | | Independent microservice |
| `ml-service/app/routers/health.py` | | ✅ | | Health monitoring |
| `ml-service/app/services/model_service.py` | | | ✅ | ML inference |
| `ml-service/training/train_model.py` | | | ✅ | Model training, metrics |
| `ml-service/training/dataset.csv` | | | ✅ | Training data |
| `infrastructure/docker-compose.yml` | | ✅ | | Container orchestration |
| `infrastructure/init-db.sql` | ✅ | | | Database schema |

---

*Document for academic evaluation - Universidad de Guadalajara, CUCEI, INNI*

