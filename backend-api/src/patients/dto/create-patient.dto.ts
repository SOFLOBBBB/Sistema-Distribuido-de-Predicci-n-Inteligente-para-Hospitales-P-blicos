/**
 * Create Patient DTO
 * 
 * [MODULE 2]: Input validation for patient creation
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../database/entities/patient.entity';

export class CreatePatientDto {
  @ApiPropertyOptional({
    example: 'CAST850101HJCRLA05',
    description: 'CURP - Mexican unique population registry code (18 characters)',
  })
  @IsOptional()
  @IsString()
  @MinLength(18)
  @MaxLength(18)
  @Matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/, {
    message: 'Invalid CURP format',
  })
  curp?: string;

  @ApiProperty({ example: 'María', description: 'Patient first name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'González López', description: 'Patient last name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: '1985-03-15', description: 'Birth date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiPropertyOptional({ enum: Gender, example: 'F', description: 'Gender' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 'O+', description: 'Blood type' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  bloodType?: string;

  @ApiPropertyOptional({ example: 'HGR-45', description: 'Hospital identifier' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  hospitalId?: string;

  @ApiPropertyOptional({ example: '+52 33 1234 5678', description: 'Contact phone' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    example: 'Juan González - Esposo - 33 9876 5432',
    description: 'Emergency contact information',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  emergencyContact?: string;
}

