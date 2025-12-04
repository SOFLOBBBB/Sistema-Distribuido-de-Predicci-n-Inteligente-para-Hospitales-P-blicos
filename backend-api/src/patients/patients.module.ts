/**
 * Patients Module
 * 
 * [MODULE 2]: Patient management functionality
 * 
 * @author Sofía Castellanos Lobo
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient, ClinicalRecord } from '../database/entities';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, ClinicalRecord])],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}

