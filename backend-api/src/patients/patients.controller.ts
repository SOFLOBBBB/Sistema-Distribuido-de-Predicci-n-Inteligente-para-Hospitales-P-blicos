/**
 * Patients Controller
 * 
 * [MODULE 2]: REST API endpoints for patient management
 * [MODULE 3]: Distributed communication - API layer
 * 
 * @author Sofía Castellanos Lobo
 */

import {
  Controller,
  Get,
  Post,
  Put,
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
import { PatientsService } from './patients.service';
import { CreatePatientDto, CreateClinicalRecordDto } from './dto';
import { CurrentUser, Roles } from '../auth/decorators';
import { UserRole } from '../common/enums';
import { User } from '../database/entities';

@ApiTags('patients')
@ApiBearerAuth('JWT-auth')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  /**
   * POST /api/v1/patients
   * Create a new patient record
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Create a new patient record' })
  @ApiResponse({ status: 201, description: 'Patient created successfully' })
  @ApiResponse({ status: 409, description: 'CURP already exists' })
  async create(
    @Body() dto: CreatePatientDto,
    @CurrentUser() user: User,
  ) {
    return this.patientsService.create(dto, user.id);
  }

  /**
   * GET /api/v1/patients
   * Get all patients with pagination
   */
  @Get()
  @ApiOperation({ summary: 'Get all patients (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of patients' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.patientsService.findAll(page, Math.min(limit, 100));
  }

  /**
   * GET /api/v1/patients/search
   * Search patients by name or CURP
   */
  @Get('search')
  @ApiOperation({ summary: 'Search patients by name or CURP' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(@Query('q') query: string) {
    return this.patientsService.search(query || '');
  }

  /**
   * GET /api/v1/patients/statistics
   * Get patient statistics
   */
  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Get patient statistics' })
  @ApiResponse({ status: 200, description: 'Patient statistics' })
  async getStatistics() {
    return this.patientsService.getStatistics();
  }

  /**
   * GET /api/v1/patients/:id
   * Get patient by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({ status: 200, description: 'Patient details' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientsService.findById(id);
  }

  /**
   * PUT /api/v1/patients/:id
   * Update patient record
   */
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update patient record' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreatePatientDto>,
  ) {
    return this.patientsService.update(id, dto);
  }

  // ============================================
  // CLINICAL RECORDS
  // ============================================

  /**
   * POST /api/v1/patients/:id/clinical-records
   * Create a clinical record for a patient
   */
  @Post(':id/clinical-records')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Create clinical record for patient' })
  @ApiResponse({ status: 201, description: 'Clinical record created' })
  async createClinicalRecord(
    @Param('id', ParseUUIDPipe) patientId: string,
    @Body() dto: Omit<CreateClinicalRecordDto, 'patientId'>,
    @CurrentUser() user: User,
  ) {
    return this.patientsService.createClinicalRecord(
      { ...dto, patientId },
      user.id,
    );
  }

  /**
   * GET /api/v1/patients/:id/clinical-records
   * Get all clinical records for a patient
   */
  @Get(':id/clinical-records')
  @ApiOperation({ summary: 'Get clinical records for patient' })
  @ApiResponse({ status: 200, description: 'List of clinical records' })
  async getClinicalRecords(@Param('id', ParseUUIDPipe) patientId: string) {
    return this.patientsService.getClinicalRecords(patientId);
  }

  /**
   * GET /api/v1/patients/:id/clinical-records/latest
   * Get the most recent clinical record for a patient
   */
  @Get(':id/clinical-records/latest')
  @ApiOperation({ summary: 'Get latest clinical record for patient' })
  @ApiResponse({ status: 200, description: 'Latest clinical record' })
  async getLatestClinicalRecord(@Param('id', ParseUUIDPipe) patientId: string) {
    return this.patientsService.getLatestClinicalRecord(patientId);
  }
}

