/**
 * Patient Entity
 * 
 * [MODULE 2]: Data persistence layer - Patient records
 * [MODULE 2]: Data integrity and consistency
 * 
 * @author Sofía Castellanos Lobo
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'OTHER',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** CURP - Mexican unique population registry code (18 characters) */
  @Column({ type: 'varchar', length: 18, unique: true, nullable: true })
  curp: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ type: 'varchar', length: 5, nullable: true })
  bloodType: string;

  /** Hospital identifier where patient is registered */
  @Column({ type: 'varchar', length: 50, nullable: true })
  hospitalId: string;

  /** Contact phone number */
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  /** Emergency contact name */
  @Column({ type: 'varchar', length: 200, nullable: true })
  emergencyContact: string;

  /** User who created this patient record */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ type: 'uuid', name: 'created_by' })
  createdById: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Computed property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Computed property for age
  get age(): number {
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}

