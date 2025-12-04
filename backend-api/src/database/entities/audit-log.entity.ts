/**
 * Audit Log Entity
 * 
 * [MODULE 2]: Security - Complete audit trail for compliance
 * 
 * @author Sofía Castellanos Lobo
 * @description Tracks all significant actions in the system for security auditing
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  // Authentication
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  
  // User management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  
  // Patient records
  PATIENT_CREATED = 'PATIENT_CREATED',
  PATIENT_UPDATED = 'PATIENT_UPDATED',
  PATIENT_VIEWED = 'PATIENT_VIEWED',
  
  // Clinical records
  CLINICAL_RECORD_CREATED = 'CLINICAL_RECORD_CREATED',
  
  // Predictions
  PREDICTION_REQUESTED = 'PREDICTION_REQUESTED',
  PREDICTION_COMPLETED = 'PREDICTION_COMPLETED',
  PREDICTION_FAILED = 'PREDICTION_FAILED',
}

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  /** Type of entity affected (e.g., 'Patient', 'Prediction') */
  @Column({ type: 'varchar', length: 50, nullable: true })
  entityType: string;

  /** ID of the affected entity */
  @Column({ type: 'uuid', nullable: true })
  entityId: string;

  /** IP address of the request */
  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  /** User agent string */
  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  /** Additional details as JSON */
  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

