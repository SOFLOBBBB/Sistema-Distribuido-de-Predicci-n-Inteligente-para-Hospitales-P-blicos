/**
 * Register User DTO
 * 
 * [MODULE 2]: Input validation for user registration
 */

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums';

export class RegisterDto {
  @ApiProperty({
    example: 'doctor@hospital.gob.mx',
    description: 'Unique email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Password (min 8 chars, must include uppercase, lowercase, and number)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    },
  )
  password: string;

  @ApiProperty({
    example: 'Juan',
    description: 'User first name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    example: 'Pérez García',
    description: 'User last name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.DOCTOR,
    description: 'User role (only ADMIN can set this)',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

