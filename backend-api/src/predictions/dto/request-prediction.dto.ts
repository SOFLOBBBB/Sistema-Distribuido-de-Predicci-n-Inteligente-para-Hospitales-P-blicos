/**
 * Request Prediction DTO
 * 
 * [MODULE 3]: Communication with ML microservice
 * [MODULE 4]: ML prediction request
 */

import { IsUUID, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PredictionType } from '../../common/enums';

export class RequestPredictionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Patient UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Clinical record UUID to use for prediction',
  })
  @IsUUID()
  @IsNotEmpty()
  clinicalRecordId: string;

  @ApiProperty({
    enum: PredictionType,
    example: 'READMISSION_RISK',
    description: 'Type of prediction to run',
  })
  @IsEnum(PredictionType)
  @IsNotEmpty()
  predictionType: PredictionType;
}

