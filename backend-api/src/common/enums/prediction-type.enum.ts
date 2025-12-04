/**
 * Prediction Types Enumeration
 * 
 * [MODULE 4]: Types of ML predictions available in the system
 * 
 * @description Defines the clinical risk predictions the ML service can perform
 */

export enum PredictionType {
  /** Risk of hospital readmission within 30 days */
  READMISSION_RISK = 'READMISSION_RISK',
  
  /** Risk of developing diabetes */
  DIABETES_RISK = 'DIABETES_RISK',
}

export enum RiskLevel {
  /** Low risk: probability < 0.3 */
  LOW = 'LOW',
  
  /** Medium risk: 0.3 <= probability < 0.7 */
  MEDIUM = 'MEDIUM',
  
  /** High risk: probability >= 0.7 */
  HIGH = 'HIGH',
}

