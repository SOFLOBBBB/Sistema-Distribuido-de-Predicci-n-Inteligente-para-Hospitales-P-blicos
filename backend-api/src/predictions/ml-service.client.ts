/**
 * ML Service Client
 * 
 * [MODULE 3]: DISTRIBUTED COMMUNICATION
 * This client handles HTTP communication between the Backend API
 * and the Python ML Microservice running on a separate process/container.
 * 
 * Communication Protocol: REST over HTTP
 * Data Format: JSON
 * 
 * @author Sofía Castellanos Lobo
 */

import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Input features for ML prediction
 * These correspond to the clinical record data
 */
export interface MLPredictionInput {
  age: number;
  bmi: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  glucose_level: number | null;
  cholesterol: number | null;
  hba1c: number | null;
  previous_admissions: number;
  last_stay_duration: number | null;
  has_diabetes: boolean;
  has_hypertension: boolean;
  has_heart_disease: boolean;
  smoking_status: string; // 'NEVER' | 'FORMER' | 'CURRENT'
}

/**
 * Response from ML service prediction endpoint
 */
export interface MLPredictionResponse {
  success: boolean;
  prediction_type: string;
  risk_score: number;           // 0.0 to 1.0
  risk_level: string;           // 'LOW' | 'MEDIUM' | 'HIGH'
  model_version: string;
  model_algorithm: string;
  feature_importance: Record<string, number>;
  processing_time_ms: number;
}

/**
 * ML Service health check response
 */
export interface MLHealthResponse {
  status: string;
  model_loaded: boolean;
  model_version: string;
  uptime_seconds: number;
}

@Injectable()
export class MLServiceClient {
  private readonly logger = new Logger(MLServiceClient.name);
  private readonly httpClient: AxiosInstance;
  private readonly mlServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.mlServiceUrl = this.configService.get<string>(
      'ML_SERVICE_URL',
      'http://localhost:8000',
    );

    const timeout = this.configService.get<number>('ML_SERVICE_TIMEOUT', 30000);

    // [MODULE 3]: Configure HTTP client for distributed communication
    this.httpClient = axios.create({
      baseURL: this.mlServiceUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.logger.log(`ML Service client configured for: ${this.mlServiceUrl}`);
  }

  /**
   * Request a prediction from the ML microservice
   * 
   * [MODULE 3]: This is the core distributed communication call
   * Backend API -> ML Service (separate process/container)
   */
  async predict(
    predictionType: string,
    features: MLPredictionInput,
  ): Promise<MLPredictionResponse> {
    const startTime = Date.now();

    try {
      this.logger.log(
        `Requesting ${predictionType} prediction from ML service`,
      );

      const response = await this.httpClient.post<MLPredictionResponse>(
        '/predict',
        {
          prediction_type: predictionType,
          features,
        },
      );

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `ML prediction completed in ${processingTime}ms - Risk: ${response.data.risk_level}`,
      );

      return response.data;
    } catch (error) {
      this.handleMLServiceError(error);
      throw error; // TypeScript requires this
    }
  }

  /**
   * Check if ML service is healthy and available
   */
  async healthCheck(): Promise<MLHealthResponse> {
    try {
      const response = await this.httpClient.get<MLHealthResponse>('/health');
      return response.data;
    } catch (error) {
      this.logger.error('ML Service health check failed');
      throw new ServiceUnavailableException(
        'ML Service is not available. Please try again later.',
      );
    }
  }

  /**
   * Get information about the loaded ML model
   */
  async getModelInfo(): Promise<Record<string, unknown>> {
    try {
      const response = await this.httpClient.get('/model-info');
      return response.data;
    } catch (error) {
      this.handleMLServiceError(error);
      throw error;
    }
  }

  /**
   * Handle errors from ML service communication
   */
  private handleMLServiceError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNREFUSED') {
        this.logger.error(
          `Cannot connect to ML Service at ${this.mlServiceUrl}`,
        );
        throw new ServiceUnavailableException(
          'ML Service is not available. The prediction service may be starting up or offline.',
        );
      }

      if (axiosError.code === 'ETIMEDOUT') {
        this.logger.error('ML Service request timed out');
        throw new ServiceUnavailableException(
          'ML Service request timed out. The prediction is taking too long.',
        );
      }

      if (axiosError.response) {
        this.logger.error(
          `ML Service error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`,
        );
        throw new ServiceUnavailableException(
          `ML Service error: ${axiosError.response.data?.detail || 'Unknown error'}`,
        );
      }
    }

    this.logger.error('Unknown error communicating with ML Service', error);
    throw new ServiceUnavailableException(
      'An unexpected error occurred with the ML Service',
    );
  }
}

