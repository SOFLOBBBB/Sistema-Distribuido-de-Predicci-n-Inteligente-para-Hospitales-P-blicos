/**
 * Predictions Controller
 * 
 * [MODULE 3]: REST API endpoints for predictions (distributed orchestration)
 * [MODULE 4]: ML prediction interface
 * 
 * @author Sofía Castellanos Lobo
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PredictionsService } from './predictions.service';
import { RequestPredictionDto } from './dto';
import { CurrentUser, Roles, Public } from '../auth/decorators';
import { UserRole } from '../common/enums';
import { User } from '../database/entities';

@ApiTags('predictions')
@ApiBearerAuth('JWT-auth')
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  /**
   * POST /api/v1/predictions
   * Request a new ML prediction
   * 
   * [MODULE 3]: This endpoint triggers distributed processing:
   * Frontend -> Backend API -> ML Microservice -> Database
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Request a new prediction',
    description: 'Sends clinical data to ML service and stores the prediction result',
  })
  @ApiResponse({ status: 201, description: 'Prediction completed and stored' })
  @ApiResponse({ status: 503, description: 'ML Service unavailable' })
  async requestPrediction(
    @Body() dto: RequestPredictionDto,
    @CurrentUser() user: User,
  ) {
    return this.predictionsService.requestPrediction(dto, user.id);
  }

  /**
   * GET /api/v1/predictions
   * Get all predictions with pagination
   */
  @Get()
  @ApiOperation({ summary: 'Get all predictions (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of predictions' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.predictionsService.findAll(page, Math.min(limit, 100));
  }

  /**
   * GET /api/v1/predictions/statistics
   * Get prediction statistics for dashboard
   */
  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Get prediction statistics' })
  @ApiResponse({ status: 200, description: 'Prediction statistics' })
  async getStatistics() {
    return this.predictionsService.getStatistics();
  }

  /**
   * GET /api/v1/predictions/ml-health
   * Check ML service health status
   * 
   * [MODULE 3]: Health check for distributed service
   */
  @Get('ml-health')
  @Public()
  @ApiOperation({ summary: 'Check ML service health' })
  @ApiResponse({ status: 200, description: 'ML service is healthy' })
  @ApiResponse({ status: 503, description: 'ML service unavailable' })
  async checkMLHealth() {
    return this.predictionsService.checkMLServiceHealth();
  }

  /**
   * GET /api/v1/predictions/model-info
   * Get ML model information
   * 
   * [MODULE 4]: ML model metadata
   */
  @Get('model-info')
  @ApiOperation({ summary: 'Get ML model information' })
  @ApiResponse({ status: 200, description: 'Model information' })
  async getModelInfo() {
    return this.predictionsService.getModelInfo();
  }

  /**
   * GET /api/v1/predictions/patient/:patientId
   * Get prediction history for a specific patient
   */
  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get prediction history for patient' })
  @ApiResponse({ status: 200, description: 'Patient prediction history' })
  async getPatientHistory(
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ) {
    return this.predictionsService.getPatientHistory(patientId);
  }

  /**
   * GET /api/v1/predictions/:id
   * Get prediction by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get prediction by ID' })
  @ApiResponse({ status: 200, description: 'Prediction details' })
  @ApiResponse({ status: 404, description: 'Prediction not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.predictionsService.findById(id);
  }
}

