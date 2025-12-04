/**
 * Clinical Record Entity
 * 
 * [MODULE 2]: Data persistence - Clinical measurements for ML features
 * [MODULE 4]: Feature data used by ML models for predictions
 * 
 * @author Sofía Castellanos Lobo
 * @description Stores clinical measurements that serve as input features for ML predictions
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
import { User } from './user.entity';

export enum SmokingStatus {
  NEVER = 'NEVER',
  FORMER = 'FORMER',
  CURRENT = 'CURRENT',
}

@Entity('clinical_records')
export class ClinicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'uuid', name: 'patient_id' })
  patientId: string;

  /** Date when measurements were taken */
  @Column({ type: 'date' })
  recordDate: Date;

  // ============================================
  // DEMOGRAPHIC FEATURES (for ML)
  // ============================================

  /** Patient age at time of record */
  @Column({ type: 'int' })
  age: number;

  // ============================================
  // PHYSICAL MEASUREMENTS (for ML)
  // ============================================

  /** Body Mass Index (kg/m²) */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bmi: number;

  /** Systolic blood pressure (mmHg) */
  @Column({ type: 'int', nullable: true })
  bloodPressureSystolic: number;

  /** Diastolic blood pressure (mmHg) */
  @Column({ type: 'int', nullable: true })
  bloodPressureDiastolic: number;

  // ============================================
  // LAB RESULTS (for ML)
  // ============================================

  /** Fasting glucose level (mg/dL) */
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  glucoseLevel: number;

  /** Total cholesterol (mg/dL) */
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  cholesterol: number;

  /** HbA1c - Glycated hemoglobin (%) */
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  hba1c: number;

  // ============================================
  // MEDICAL HISTORY (for ML)
  // ============================================

  /** Number of previous hospital admissions */
  @Column({ type: 'int', default: 0 })
  previousAdmissions: number;

  /** Length of last hospital stay (days) */
  @Column({ type: 'int', default: 0, nullable: true })
  lastStayDuration: number;

  /** Whether patient has diagnosed diabetes */
  @Column({ type: 'boolean', default: false })
  hasDiabetes: boolean;

  /** Whether patient has diagnosed hypertension */
  @Column({ type: 'boolean', default: false })
  hasHypertension: boolean;

  /** Whether patient has heart disease */
  @Column({ type: 'boolean', default: false })
  hasHeartDisease: boolean;

  // ============================================
  // LIFESTYLE FACTORS (for ML)
  // ============================================

  @Column({
    type: 'enum',
    enum: SmokingStatus,
    default: SmokingStatus.NEVER,
  })
  smokingStatus: SmokingStatus;

  // ============================================
  // METADATA
  // ============================================

  /** User who registered this clinical record */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ type: 'uuid', name: 'created_by' })
  createdById: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  /** Additional notes from healthcare provider */
  @Column({ type: 'text', nullable: true })
  notes: string;
}

