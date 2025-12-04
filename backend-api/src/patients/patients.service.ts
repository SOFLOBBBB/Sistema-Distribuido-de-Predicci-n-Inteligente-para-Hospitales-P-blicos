/**
 * Patients Service
 * 
 * [MODULE 2]: Business logic for patient management
 * 
 * @author Sofía Castellanos Lobo
 */

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient, ClinicalRecord } from '../database/entities';
import { CreatePatientDto, CreateClinicalRecordDto } from './dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(ClinicalRecord)
    private clinicalRecordRepository: Repository<ClinicalRecord>,
  ) {}

  /**
   * Create a new patient record
   */
  async create(dto: CreatePatientDto, userId: string): Promise<Patient> {
    // Check for duplicate CURP
    if (dto.curp) {
      const existing = await this.patientRepository.findOne({
        where: { curp: dto.curp },
      });

      if (existing) {
        throw new ConflictException('A patient with this CURP already exists');
      }
    }

    const patient = this.patientRepository.create({
      ...dto,
      createdById: userId,
    });

    return this.patientRepository.save(patient);
  }

  /**
   * Get all patients with pagination
   */
  async findAll(page = 1, limit = 20) {
    const [patients, total] = await this.patientRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['createdBy'],
    });

    return {
      data: patients,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Search patients by name or CURP
   */
  async search(query: string) {
    return this.patientRepository
      .createQueryBuilder('patient')
      .where('LOWER(patient.firstName) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(patient.lastName) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('patient.curp LIKE :query', { query: `%${query}%` })
      .orderBy('patient.lastName', 'ASC')
      .limit(50)
      .getMany();
  }

  /**
   * Get patient by ID with clinical records
   */
  async findById(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  /**
   * Update patient record
   */
  async update(id: string, dto: Partial<CreatePatientDto>): Promise<Patient> {
    const patient = await this.findById(id);

    // Check for duplicate CURP if updating
    if (dto.curp && dto.curp !== patient.curp) {
      const existing = await this.patientRepository.findOne({
        where: { curp: dto.curp },
      });

      if (existing) {
        throw new ConflictException('A patient with this CURP already exists');
      }
    }

    Object.assign(patient, dto);
    return this.patientRepository.save(patient);
  }

  // ============================================
  // CLINICAL RECORDS
  // ============================================

  /**
   * Create clinical record for a patient
   */
  async createClinicalRecord(
    dto: CreateClinicalRecordDto,
    userId: string,
  ): Promise<ClinicalRecord> {
    // Verify patient exists
    await this.findById(dto.patientId);

    const record = this.clinicalRecordRepository.create({
      ...dto,
      createdById: userId,
    });

    return this.clinicalRecordRepository.save(record);
  }

  /**
   * Get clinical records for a patient
   */
  async getClinicalRecords(patientId: string) {
    // Verify patient exists
    await this.findById(patientId);

    return this.clinicalRecordRepository.find({
      where: { patientId },
      order: { recordDate: 'DESC' },
      relations: ['createdBy'],
    });
  }

  /**
   * Get the most recent clinical record for a patient
   */
  async getLatestClinicalRecord(patientId: string): Promise<ClinicalRecord | null> {
    return this.clinicalRecordRepository.findOne({
      where: { patientId },
      order: { recordDate: 'DESC' },
    });
  }

  /**
   * Get clinical record by ID
   */
  async getClinicalRecordById(id: string): Promise<ClinicalRecord> {
    const record = await this.clinicalRecordRepository.findOne({
      where: { id },
      relations: ['patient', 'createdBy'],
    });

    if (!record) {
      throw new NotFoundException(`Clinical record with ID ${id} not found`);
    }

    return record;
  }

  /**
   * Get patient statistics for dashboard
   */
  async getStatistics() {
    const total = await this.patientRepository.count();
    const thisMonth = await this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.createdAt >= DATE_TRUNC(\'month\', CURRENT_DATE)')
      .getCount();

    const byGender = await this.patientRepository
      .createQueryBuilder('patient')
      .select('patient.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .groupBy('patient.gender')
      .getRawMany();

    return {
      total,
      thisMonth,
      byGender,
    };
  }
}

