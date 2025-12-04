/**
 * Predictions Module
 * 
 * [MODULE 3]: Distributed prediction orchestration
 * [MODULE 4]: ML prediction functionality
 * 
 * @author Sofía Castellanos Lobo
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prediction, ClinicalRecord } from '../database/entities';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { MLServiceClient } from './ml-service.client';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prediction, ClinicalRecord]),
    PatientsModule,
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService, MLServiceClient],
  exports: [PredictionsService],
})
export class PredictionsModule {}

