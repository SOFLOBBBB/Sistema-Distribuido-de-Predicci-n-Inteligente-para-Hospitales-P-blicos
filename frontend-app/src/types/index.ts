/**
 * Definiciones de tipos TypeScript
 * 
 * Este archivo contiene todas las interfaces y tipos utilizados
 * en la aplicación frontend del S.D.P.I.
 * 
 * @author Sofía Castellanos Lobo
 */

// ============================================
// TIPOS DE USUARIO Y AUTENTICACIÓN
// ============================================

/** Roles disponibles en el sistema */
export type UserRole = 'ADMIN' | 'DOCTOR' | 'ANALYST';

/** Información del usuario autenticado */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

/** Respuesta del endpoint de login */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

/** Credenciales para login */
export interface LoginCredentials {
  email: string;
  password: string;
}

// ============================================
// TIPOS DE PACIENTE
// ============================================

/** Género del paciente */
export type Gender = 'M' | 'F' | 'OTHER';

/** Estado de fumador */
export type SmokingStatus = 'NEVER' | 'FORMER' | 'CURRENT';

/** Información del paciente */
export interface Patient {
  id: string;
  curp?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender?: Gender;
  bloodType?: string;
  hospitalId?: string;
  phone?: string;
  emergencyContact?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

/** Datos para crear/actualizar paciente */
export interface PatientFormData {
  curp?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender?: Gender;
  bloodType?: string;
  hospitalId?: string;
  phone?: string;
  emergencyContact?: string;
}

// ============================================
// TIPOS DE REGISTRO CLÍNICO
// ============================================

/** Registro clínico del paciente */
export interface ClinicalRecord {
  id: string;
  patientId: string;
  recordDate: string;
  age: number;
  bmi?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  glucoseLevel?: number;
  cholesterol?: number;
  hba1c?: number;
  previousAdmissions: number;
  lastStayDuration?: number;
  hasDiabetes: boolean;
  hasHypertension: boolean;
  hasHeartDisease: boolean;
  smokingStatus: SmokingStatus;
  notes?: string;
  createdById: string;
  createdAt: string;
}

/** Datos para crear registro clínico */
export interface ClinicalRecordFormData {
  patientId: string;
  recordDate: string;
  age: number;
  bmi?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  glucoseLevel?: number;
  cholesterol?: number;
  hba1c?: number;
  previousAdmissions?: number;
  lastStayDuration?: number;
  hasDiabetes?: boolean;
  hasHypertension?: boolean;
  hasHeartDisease?: boolean;
  smokingStatus?: SmokingStatus;
  notes?: string;
}

// ============================================
// TIPOS DE PREDICCIÓN
// ============================================

/** Tipo de predicción disponible */
export type PredictionType = 'READMISSION_RISK' | 'DIABETES_RISK';

/** Nivel de riesgo */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/** Resultado de predicción */
export interface Prediction {
  id: string;
  patientId: string;
  clinicalRecordId: string;
  predictionType: PredictionType;
  riskScore: number;
  riskLevel: RiskLevel;
  modelVersion: string;
  modelAlgorithm: string;
  featuresUsed: Record<string, number | string | boolean>;
  featureImportance: Record<string, number>;
  processingTimeMs: number;
  requestedById: string;
  createdAt: string;
  patient?: Patient;
}

/** Datos para solicitar predicción */
export interface PredictionRequest {
  patientId: string;
  clinicalRecordId: string;
  predictionType: PredictionType;
}

// ============================================
// TIPOS DE ESTADÍSTICAS
// ============================================

/** Estadísticas de pacientes */
export interface PatientStatistics {
  total: number;
  thisMonth: number;
  byGender: { gender: Gender; count: number }[];
}

/** Estadísticas de predicciones */
export interface PredictionStatistics {
  total: number;
  highRiskCount: number;
  byRiskLevel: { riskLevel: RiskLevel; count: number }[];
  byType: { predictionType: PredictionType; count: number; avgRiskScore: number }[];
  recentPredictions: Prediction[];
}

/** Estadísticas de usuarios */
export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  byRole: { role: UserRole; count: number }[];
}

// ============================================
// TIPOS DE RESPUESTA API
// ============================================

/** Respuesta paginada genérica */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Respuesta de error de la API */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// ============================================
// TIPOS DE ESTADO DEL ML SERVICE
// ============================================

/** Estado de salud del servicio ML */
export interface MLHealthStatus {
  status: string;
  service: string;
  model_loaded: boolean;
  model_version: string;
  model_algorithm: string;
  uptime_seconds: number;
}


