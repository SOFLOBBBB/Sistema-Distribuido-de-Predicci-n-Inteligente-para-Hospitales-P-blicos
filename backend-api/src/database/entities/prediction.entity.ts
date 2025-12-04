/**
 * Prediction Entity
 * 
 * [MODULE 3]: Distributed processing - Results from ML microservice
 * [MODULE 4]: ML prediction storage and history
 * 
 * @author Sofía Castellanos Lobo
 * @description Stores ML prediction results for audit and analysis
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { ClinicalRecord } from './clinical-record.entity';
import { User } from './user.entity';
import { PredictionType, RiskLevel } from '../../common/enums';

@Entity('predictions')
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'uuid', name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => ClinicalRecord)
  @JoinColumn({ name: 'clinical_record_id' })
  clinicalRecord: ClinicalRecord;

  @Column({ type: 'uuid', name: 'clinical_record_id' })
  clinicalRecordId: string;

  // ============================================
  // PREDICTION RESULTS
  // ============================================

  @Column({
    type: 'enum',
    enum: PredictionType,
  })
  predictionType: PredictionType;

  /** 
   * Risk score from ML model (0.0 to 1.0)
   * Represents probability of the predicted outcome
   */
  @Column({ type: 'decimal', precision: 5, scale: 4 })
  riskScore: number;

  /**
   * Categorical risk level derived from riskScore
   * LOW: < 0.3, MEDIUM: 0.3-0.7, HIGH: >= 0.7
   */
  @Column({
    type: 'enum',
    enum: RiskLevel,
  })
  riskLevel: RiskLevel;

  // ============================================
  // MODEL METADATA [MODULE 4: ML Traceability]
  // ============================================

  /** Version of the ML model used */
  @Column({ type: 'varchar', length: 50 })
  modelVersion: string;

  /** Algorithm used (e.g., 'logistic_regression', 'random_forest') */
  @Column({ type: 'varchar', length: 50 })
  modelAlgorithm: string;

  /** 
   * Snapshot of input features used for prediction
   * Stored as JSON for audit purposes
   */
  @Column({ type: 'jsonb' })
  featuresUsed: Record<string, number | string | boolean>;

  /**
   * Feature importance or coefficients from the model
   * Helps explain the prediction
   */
  @Column({ type: 'jsonb', nullable: true })
  featureImportance: Record<string, number>;

  /** Processing time in milliseconds */
  @Column({ type: 'int', nullable: true })
  processingTimeMs: number;

  // ============================================
  // AUDIT TRAIL [MODULE 2: Security & Traceability]
  // ============================================

  /** User who requested this prediction */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by' })
  requestedBy: User;

  @Column({ type: 'uuid', name: 'requested_by' })
  requestedById: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

