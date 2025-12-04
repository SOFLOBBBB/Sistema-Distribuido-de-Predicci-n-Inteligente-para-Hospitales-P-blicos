-- =============================================================================
-- S.D.P.I. - Database Initialization Script
-- Sistema Distribuido de Predicción Inteligente para Hospitales Públicos
-- =============================================================================
--
-- [MODULE 2]: Database Design and Initialization
-- This script creates the initial database schema and seed data.
--
-- Author: Sofía Castellanos Lobo
-- Universidad de Guadalajara - CUCEI
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUM Types
-- =============================================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'DOCTOR', 'ANALYST');
CREATE TYPE gender_type AS ENUM ('M', 'F', 'OTHER');
CREATE TYPE smoking_status AS ENUM ('NEVER', 'FORMER', 'CURRENT');
CREATE TYPE prediction_type AS ENUM ('READMISSION_RISK', 'DIABETES_RISK');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE audit_action AS ENUM (
    'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGED',
    'USER_CREATED', 'USER_UPDATED', 'USER_DEACTIVATED',
    'PATIENT_CREATED', 'PATIENT_UPDATED', 'PATIENT_VIEWED',
    'CLINICAL_RECORD_CREATED',
    'PREDICTION_REQUESTED', 'PREDICTION_COMPLETED', 'PREDICTION_FAILED'
);

-- =============================================================================
-- USERS Table
-- [MODULE 2]: Authentication and Authorization
-- =============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'ANALYST',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =============================================================================
-- PATIENTS Table
-- [MODULE 2]: Patient records management
-- =============================================================================

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curp VARCHAR(18) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender gender_type,
    blood_type VARCHAR(5),
    hospital_id VARCHAR(50),
    phone VARCHAR(20),
    emergency_contact VARCHAR(200),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_curp ON patients(curp);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_hospital ON patients(hospital_id);

-- =============================================================================
-- CLINICAL_RECORDS Table
-- [MODULE 4]: Clinical data for ML predictions
-- =============================================================================

CREATE TABLE clinical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    age INTEGER NOT NULL,
    bmi DECIMAL(5,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    glucose_level DECIMAL(6,2),
    cholesterol DECIMAL(6,2),
    hba1c DECIMAL(4,2),
    previous_admissions INTEGER DEFAULT 0,
    last_stay_duration INTEGER,
    has_diabetes BOOLEAN DEFAULT false,
    has_hypertension BOOLEAN DEFAULT false,
    has_heart_disease BOOLEAN DEFAULT false,
    smoking_status smoking_status DEFAULT 'NEVER',
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clinical_records_patient ON clinical_records(patient_id);
CREATE INDEX idx_clinical_records_date ON clinical_records(record_date);

-- =============================================================================
-- PREDICTIONS Table
-- [MODULE 3]: Distributed prediction results
-- [MODULE 4]: ML prediction storage
-- =============================================================================

CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinical_record_id UUID NOT NULL REFERENCES clinical_records(id) ON DELETE CASCADE,
    prediction_type prediction_type NOT NULL,
    risk_score DECIMAL(5,4) NOT NULL,
    risk_level risk_level NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    model_algorithm VARCHAR(50) NOT NULL,
    features_used JSONB NOT NULL,
    feature_importance JSONB,
    processing_time_ms INTEGER,
    requested_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_predictions_patient ON predictions(patient_id);
CREATE INDEX idx_predictions_type ON predictions(prediction_type);
CREATE INDEX idx_predictions_risk ON predictions(risk_level);
CREATE INDEX idx_predictions_date ON predictions(created_at);

-- =============================================================================
-- AUDIT_LOG Table
-- [MODULE 2]: Security audit trail
-- =============================================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action audit_action NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_date ON audit_log(created_at);

-- =============================================================================
-- Seed Data: Initial Admin User
-- Password: Admin123! (hashed with bcrypt)
-- =============================================================================

INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES (
    'admin@hospital.gob.mx',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.MHDqCqjDFGwTHm', -- Admin123!
    'Administrador',
    'Sistema',
    'ADMIN',
    true
);

-- =============================================================================
-- Seed Data: Sample Doctor User
-- Password: Doctor123!
-- =============================================================================

INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES (
    'doctor@hospital.gob.mx',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.MHDqCqjDFGwTHm', -- Doctor123!
    'Juan',
    'Pérez García',
    'DOCTOR',
    true
);

-- =============================================================================
-- Confirmation
-- =============================================================================

SELECT 'Database initialized successfully!' AS status;
SELECT COUNT(*) AS total_users FROM users;

