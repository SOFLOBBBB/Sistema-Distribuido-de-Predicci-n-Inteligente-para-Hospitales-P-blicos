/**
 * Create Clinical Record DTO
 * 
 * [MODULE 2]: Input validation for clinical data
 * [MODULE 4]: Feature data for ML predictions
 */

import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SmokingStatus } from '../../database/entities/clinical-record.entity';

export class CreateClinicalRecordDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Patient UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: '2024-01-15', description: 'Record date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  recordDate: string;

  @ApiProperty({ example: 45, description: 'Patient age at time of record' })
  @IsNumber()
  @Min(0)
  @Max(150)
  age: number;

  // Physical measurements
  @ApiPropertyOptional({ example: 27.5, description: 'Body Mass Index (kg/m²)' })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(80)
  bmi?: number;

  @ApiPropertyOptional({ example: 120, description: 'Systolic blood pressure (mmHg)' })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(250)
  bloodPressureSystolic?: number;

  @ApiPropertyOptional({ example: 80, description: 'Diastolic blood pressure (mmHg)' })
  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(150)
  bloodPressureDiastolic?: number;

  // Lab results
  @ApiPropertyOptional({ example: 95.5, description: 'Fasting glucose level (mg/dL)' })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(600)
  glucoseLevel?: number;

  @ApiPropertyOptional({ example: 180, description: 'Total cholesterol (mg/dL)' })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(500)
  cholesterol?: number;

  @ApiPropertyOptional({ example: 5.7, description: 'HbA1c - Glycated hemoglobin (%)' })
  @IsOptional()
  @IsNumber()
  @Min(3)
  @Max(20)
  hba1c?: number;

  // Medical history
  @ApiPropertyOptional({ example: 2, description: 'Number of previous hospital admissions' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  previousAdmissions?: number;

  @ApiPropertyOptional({ example: 5, description: 'Length of last hospital stay (days)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  lastStayDuration?: number;

  @ApiPropertyOptional({ example: false, description: 'Has diagnosed diabetes' })
  @IsOptional()
  @IsBoolean()
  hasDiabetes?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Has diagnosed hypertension' })
  @IsOptional()
  @IsBoolean()
  hasHypertension?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Has heart disease' })
  @IsOptional()
  @IsBoolean()
  hasHeartDisease?: boolean;

  // Lifestyle
  @ApiPropertyOptional({ enum: SmokingStatus, example: 'NEVER', description: 'Smoking status' })
  @IsOptional()
  @IsEnum(SmokingStatus)
  smokingStatus?: SmokingStatus;

  @ApiPropertyOptional({ example: 'Patient reports occasional dizziness', description: 'Clinical notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

