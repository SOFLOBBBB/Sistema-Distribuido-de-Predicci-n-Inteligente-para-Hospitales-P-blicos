# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Commands

### Full stack via Docker Compose

From the `infrastructure` directory:

- Start all services (Postgres, backend, ML service, frontend):
  - `cd infrastructure && docker-compose up -d`
- View logs:
  - `cd infrastructure && docker-compose logs -f`
- Stop and remove containers:
  - `cd infrastructure && docker-compose down`

Services/ports (default):
- Backend API (NestJS): `http://localhost:3000`
- Backend API docs: `http://localhost:3000/api/docs`
- ML service (FastAPI): `http://localhost:8000`
- Frontend (React + Vite): `http://localhost:5173`
- Postgres: `localhost:5432` (internal host is `postgres` when using Docker)

### Backend API (NestJS, `backend-api`)

Install and run in development:
- `cd backend-api`
- Install deps: `npm install`
- Start dev server with auto-reload: `npm run start:dev`

Build, lint, and formatting:
- Build: `npm run build`
- Lint TypeScript (ESLint): `npm run lint`
- Format with Prettier: `npm run format`

Tests (Jest):
- Run all unit tests: `npm test`
- Watch mode: `npm run test:watch`
- Coverage: `npm run test:cov`
- E2E tests (if present): `npm run test:e2e`
- Run a single test file:
  - `npm test -- src/<module>/<file>.spec.ts`
  - or use Jest path flags: `npm test -- --runTestsByPath src/<module>/<file>.spec.ts`

Database migrations (TypeORM):
- Run migrations: `npm run migration:run`
- Revert last migration: `npm run migration:revert`
- Generate a new migration (data-source is predefined):
  - `npm run migration:generate -- src/database/migrations/<MigrationName>`

Environment variables (commonly used):
- Database: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- ML integration: `ML_SERVICE_URL`, `ML_SERVICE_TIMEOUT`
- CORS: `CORS_ORIGINS` (comma-separated origins, e.g. `http://localhost:5173`)
- JWT: `JWT_SECRET`, `JWT_EXPIRATION`

### ML Service (FastAPI, `ml-service`)

Local dev setup:
- `cd ml-service`
- Create and activate venv (POSIX):
  - `python -m venv venv`
  - `source venv/bin/activate`
- Install deps:
  - `pip install -r requirements.txt`

Run the service locally:
- `uvicorn app.main:app --reload --port 8000`

Tests (pytest):
- Run all tests: `pytest`
- Run a single test file: `pytest path/to/test_file.py`
- Run a single test by name: `pytest path/to/test_file.py -k "test_name_fragment"`

### Frontend App (React + Vite, `frontend-app`)

Local dev setup:
- `cd frontend-app`
- Install deps: `npm install`

Run, build, and lint:
- Start dev server: `npm run dev` (Vite, defaults to port 5173)
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Lint (ESLint + TypeScript): `npm run lint`

## High-Level Architecture

### System Overview

This repository implements a distributed hospital prediction system composed of:
- **Frontend (`frontend-app`)**: React + TypeScript + Vite single-page application for hospital staff.
- **Backend API (`backend-api`)**: NestJS REST API that handles authentication, RBAC, patient management, and orchestration of ML predictions.
- **ML Service (`ml-service`)**: Python FastAPI microservice for ML inference (logistic regression–based risk prediction and related metadata).
- **PostgreSQL database**: Shared relational store for users, patients, clinical records, predictions, and audit logs.
- **Infrastructure (`infrastructure/docker-compose.yml`)**: Defines how these services are wired together in a distributed setup.

The main request flow is:
1. User interacts with the React frontend.
2. Frontend calls the NestJS backend (`/api/v1/...`) with a JWT.
3. Backend authenticates/authorizes the request, persists or reads data via TypeORM + Postgres, and, for prediction requests, calls the ML service over HTTP.
4. ML service runs the trained model, returns risk scores and metadata; backend stores the prediction and returns a normalized response to the frontend.

### Backend API (NestJS)

Entry point and configuration:
- `src/main.ts` bootstraps the NestJS app:
  - Enables CORS using `CORS_ORIGINS` to allow the Vite frontend.
  - Applies a global `ValidationPipe` so all DTOs are validated and transformed automatically.
  - Sets a global prefix `api/v1` for all routes.
  - Configures Swagger/OpenAPI docs at `/api/docs` with JWT bearer auth and tags per feature module.

- `src/app.module.ts` is the root module:
  - Loads configuration via `ConfigModule.forRoot` (global, `.env` files).
  - Configures a PostgreSQL `TypeOrmModule.forRootAsync` connection; entities are auto-discovered via `**/*.entity.{ts,js}`.
  - Wires feature modules: `AuthModule`, `UsersModule`, `PatientsModule`, `PredictionsModule`.

Core domain modules (high level only):
- **Auth module (`src/auth/`)**
  - `auth.controller.ts`, `auth.service.ts`, and DTOs (`login.dto.ts`, `register.dto.ts`) implement `/auth/login` and `/auth/register`.
  - Guards (`jwt-auth.guard.ts`, `roles.guard.ts`), decorators (`roles.decorator.ts`, `current-user.decorator.ts`, etc.), and JWT strategy (`strategies/jwt.strategy.ts`) enforce authentication and role-based authorization.
  - Uses `@nestjs/jwt` and Passport (`passport-jwt`) under the hood.

- **Users module (`src/users/`)**
  - Handles administrative user management and role assignments over the `User` entity.

- **Patients module (`src/patients/`)**
  - `patients.controller.ts` and `patients.service.ts` manage patients and clinical records.
  - DTOs in `src/patients/dto/` mirror the clinical feature set used by the ML service.
  - Persists to TypeORM entities under `src/database/entities/` (patients, clinical records, predictions, audit logs, users).

- **Predictions module (`src/predictions/`)**
  - `predictions.controller.ts` exposes endpoints like `POST /predictions` and prediction history.
  - `predictions.service.ts` orchestrates:
    - Validation of prediction requests.
    - Persistence of prediction inputs/outputs.
    - Calls to the ML microservice via `MLServiceClient`.

Distributed ML integration:
- `src/predictions/ml-service.client.ts` encapsulates **all HTTP communication** to the ML microservice:
  - Configured via `ML_SERVICE_URL` and `ML_SERVICE_TIMEOUT` (defaults to `http://localhost:8000` and 30s).
  - Exposes:
    - `predict(predictionType, features)` → POST `/predict` on the ML service.
    - `healthCheck()` → GET `/health`.
    - `getModelInfo()` → GET `/model-info`.
  - Converts transport-level failures (connection refused, timeout, non-2xx responses) into `ServiceUnavailableException` with useful log messages.

Database and entities:
- `src/database/entities/` contains the main persistent models:
  - `user.entity.ts`: application users and roles.
  - `patient.entity.ts`: core patient demographic data.
  - `clinical-record.entity.ts`: clinical measurements and risk factors used as ML features.
  - `prediction.entity.ts`: stores model outputs (risk scores, levels, metadata) tied to patients.
  - `audit-log.entity.ts`: tracks important security and access events.
- `common/enums/` centralizes enums such as roles and prediction types, which are reused across modules and for Swagger documentation.

### ML Service (FastAPI)

Application setup:
- `app/main.py` creates the FastAPI app with a custom `lifespan` context:
  - On startup, instantiates `ModelService`, loads the ML model into memory, and stores it in `app.state.model_service`.
  - Tracks `start_time` in `app.state` for uptime reporting.
  - Adds permissive CORS via `CORSMiddleware` to enable calls from the backend and, if needed, directly from tools.
  - Registers routers from `app.routers.predictions` and `app.routers.health`.
  - Root endpoint `/` returns service metadata, links to docs, and module annotations.

Prediction API:
- `app/routers/predictions.py` defines:
  - `POST /predict` (response model: `PredictionResponse`):
    - Accepts a `PredictionRequest` containing `prediction_type` and `features`.
    - Delegates to `ModelService.predict`, which returns:
      - `risk_score` (probability from logistic regression).
      - `risk_level` (mapped enum, e.g., LOW/MEDIUM/HIGH).
      - `feature_importance` (per-feature contributions).
      - `processing_time_ms`.
    - Serializes a normalized JSON response consumed by the NestJS backend.
  - `GET /model-info`: exposes model metadata and interpretability details (algorithm, coefficients, features) via `ModelService.get_model_info()`.

Health and lifecycle:
- `app/routers/health.py` (not detailed here) is wired in to provide `GET /health` used by:
  - Docker healthcheck in `ml-service/Dockerfile`.
  - Backend `MLServiceClient.healthCheck()`.

Schemas and services:
- `app/schemas/` contains Pydantic models for request/response and enums like `RiskLevel`.
- `app/services/model_service.py` manages model loading, inference, and feature importance calculations, abstracting away scikit-learn details from API routers.

### Frontend App (React + Vite)

HTTP client and authentication:
- `src/services/api.ts` configures a shared Axios instance:
  - `baseURL` sourced from `VITE_API_URL` (fallback `http://localhost:3000/api/v1`).
  - Request interceptor attaches JWT from `localStorage` (`sdpi_token`) as `Authorization: Bearer <token>`.
  - Response interceptor centralizes error handling for 401/403/404/5xx, including automatic logout and redirect to `/login` on 401.

- `src/context/AuthContext.tsx` provides global auth state:
  - Tracks `user`, `loading`, and `isAuthenticated`.
  - On mount, attempts to restore the session from stored token + user.
  - Exposes `login(credentials)`, `logout()`, and `refreshUser()` using `authService`.
  - Custom hook `useAuth()` is the main entry point for components needing auth state.

Domain services and types:
- `src/services/` contains thin wrappers around the Axios client:
  - `authService.ts`: login, logout, current user, token persistence.
  - `patientService.ts`: CRUD and listing for patients and clinical records.
  - `predictionService.ts`: requesting predictions and retrieving history.
- `src/types/` defines shared TypeScript types for users, auth responses, patients, predictions, and related DTOs to keep the React code aligned with backend contracts.

UI structure:
- `src/pages/` holds route-level pages:
  - `LoginPage`, `DashboardPage`, `PatientsPage`, `PatientDetailPage`, `PredictionsPage`, `NewPredictionPage`.
  - `src/pages/index.ts` re-exports page components for centralized imports.
- `src/components/layout/MainLayout.tsx` implements the main shell (navigation and shared layout).
- `src/components/common/LoadingScreen.tsx` encapsulates loading UX for long-running operations.

### Infrastructure and Deployment

- `infrastructure/docker-compose.yml` defines the distributed runtime topology:
  - `postgres`: database container, initialized via `init-db.sql`, with persisted volume `postgres_data`.
  - `backend-api`: builds from `../backend-api/Dockerfile`, connects to `postgres` and `ml-service`, and exposes port `3000`.
  - `ml-service`: builds from `../ml-service/Dockerfile`, exposes port `8000`, and mounts a `ml_models` volume for persisted models.
  - `frontend`: builds from `../frontend-app/Dockerfile`, serves the built React app via Nginx on port `5173`.
  - All services share the `sdpi-network` bridge network; database is internal-only (no direct exposure beyond mapped `5432` in dev).

- Each service has its own Dockerfile tuned for production builds:
  - **Backend**: multi-stage Node 18 build, runs compiled NestJS app as a non-root user; healthcheck hits `/api/v1/predictions/ml-health`.
  - **Frontend**: Node 18 build stage, then served from Nginx with a custom `nginx.conf`.
  - **ML service**: Python 3.11 image with dependencies from `requirements.txt`, healthcheck uses `/health`.

This high-level view should be enough to orient future Warp agents; use file search (e.g., `src/patients/`, `src/predictions/`, `app/services/model_service.py`, `src/services/*.ts`) for more detailed, module-level behavior when needed.