/**
 * Predictions Service
 * 
 * [MODULE 3]: Orchestrates distributed prediction requests
 * [MODULE 4]: Business logic for ML predictions
 * 
 * @author Sofía Castellanos Lobo
 */

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction, ClinicalRecord } from '../database/entities';
import { PatientsService } from '../patients/patients.service';
import { MLServiceClient, MLPredictionInput } from './ml-service.client';
import { RequestPredictionDto } from './dto';
import { PredictionType, RiskLevel } from '../common/enums';

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);

  constructor(
    @InjectRepository(Prediction)
    private predictionRepository: Repository<Prediction>,
    @InjectRepository(ClinicalRecord)
    private clinicalRecordRepository: Repository<ClinicalRecord>,
    private patientsService: PatientsService,
    private mlServiceClient: MLServiceClient,
  ) {}

  /**
   * Request a new prediction
   * 
   * [MODULE 3]: Orchestrates the distributed prediction flow:
   * 1. Validate patient and clinical record exist
   * 2. Prepare features for ML service
   * 3. Call ML microservice (distributed)
   * 4. Store prediction result in database
   */
  async requestPrediction(
    dto: RequestPredictionDto,
    userId: string,
  ): Promise<Prediction> {
    const { patientId, clinicalRecordId, predictionType } = dto;

    // Step 1: Validate entities exist
    await this.patientsService.findById(patientId);
    const clinicalRecord = await this.clinicalRecordRepository.findOne({
      where: { id: clinicalRecordId, patientId },
    });

    if (!clinicalRecord) {
      throw new NotFoundException(
        `Clinical record ${clinicalRecordId} not found for patient ${patientId}`,
      );
    }

    // Step 2: Prepare features for ML service
    const features = this.prepareFeatures(clinicalRecord);

    this.logger.log(
      `Requesting ${predictionType} prediction for patient ${patientId}`,
    );

    // Step 3: [MODULE 3] Call ML microservice
    const mlResponse = await this.mlServiceClient.predict(
      predictionType,
      features,
    );

    // Step 4: Store prediction result
    const prediction = this.predictionRepository.create({
      patientId,
      clinicalRecordId,
      predictionType,
      riskScore: mlResponse.risk_score,
      riskLevel: mlResponse.risk_level as RiskLevel,
      modelVersion: mlResponse.model_version,
      modelAlgorithm: mlResponse.model_algorithm,
      featuresUsed: features as unknown as Record<string, number | string | boolean>,
      featureImportance: mlResponse.feature_importance,
      processingTimeMs: mlResponse.processing_time_ms,
      requestedById: userId,
    });

    await this.predictionRepository.save(prediction);

    this.logger.log(
      `Prediction ${prediction.id} completed: ${prediction.riskLevel} risk (${prediction.riskScore})`,
    );

    return prediction;
  }

  /**
   * Prepare clinical record data as ML features
   * 
   * [MODULE 4]: Feature engineering for ML model input
   */
  private prepareFeatures(record: ClinicalRecord): MLPredictionInput {
    return {
      age: record.age,
      bmi: record.bmi ?? null,
      blood_pressure_systolic: record.bloodPressureSystolic ?? null,
      blood_pressure_diastolic: record.bloodPressureDiastolic ?? null,
      glucose_level: record.glucoseLevel ?? null,
      cholesterol: record.cholesterol ?? null,
      hba1c: record.hba1c ?? null,
      previous_admissions: record.previousAdmissions,
      last_stay_duration: record.lastStayDuration ?? null,
      has_diabetes: record.hasDiabetes,
      has_hypertension: record.hasHypertension,
      has_heart_disease: record.hasHeartDisease,
      smoking_status: record.smokingStatus,
    };
  }

  /**
   * Get prediction by ID
   */
  async findById(id: string): Promise<Prediction> {
    const prediction = await this.predictionRepository.findOne({
      where: { id },
      relations: ['patient', 'clinicalRecord', 'requestedBy'],
    });

    if (!prediction) {
      throw new NotFoundException(`Prediction with ID ${id} not found`);
    }

    return prediction;
  }

  /**
   * Get prediction history for a patient
   */
  async getPatientHistory(patientId: string) {
    await this.patientsService.findById(patientId);

    return this.predictionRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
      relations: ['clinicalRecord', 'requestedBy'],
    });
  }

  /**
   * Get all predictions with pagination
   */
  async findAll(page = 1, limit = 20) {
    const [predictions, total] = await this.predictionRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['patient', 'requestedBy'],
    });

    return {
      data: predictions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get prediction statistics for dashboard
   * 
   * [MODULE 4]: Statistical analysis of ML predictions
   */
  async getStatistics() {
    const total = await this.predictionRepository.count();

    const byRiskLevel = await this.predictionRepository
      .createQueryBuilder('p')
      .select('p.riskLevel', 'riskLevel')
      .addSelect('COUNT(*)', 'count')
      .groupBy('p.riskLevel')
      .getRawMany();

    const byType = await this.predictionRepository
      .createQueryBuilder('p')
      .select('p.predictionType', 'predictionType')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(p.riskScore)', 'avgRiskScore')
      .groupBy('p.predictionType')
      .getRawMany();

    const recentPredictions = await this.predictionRepository.find({
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['patient'],
    });

    // High risk patients count
    const highRiskCount = await this.predictionRepository.count({
      where: { riskLevel: RiskLevel.HIGH },
    });

    return {
      total,
      byRiskLevel,
      byType,
      highRiskCount,
      recentPredictions,
    };
  }

  /**
   * Check ML service health
   */
  async checkMLServiceHealth() {
    return this.mlServiceClient.healthCheck();
  }

  /**
   * Get ML model information
   */
  async getModelInfo() {
    return this.mlServiceClient.getModelInfo();
  }
}

