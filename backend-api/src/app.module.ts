/**
 * S.D.P.I. Backend API - Root Application Module
 * 
 * [MODULE 2]: Modular architecture following software engineering best practices
 * [MODULE 3]: Configuration for distributed service communication
 * 
 * @author Sofía Castellanos Lobo
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { PredictionsModule } from './predictions/predictions.module';

@Module({
  imports: [
    // [MODULE 2: Configuration Management] - Environment-based configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),

    // [MODULE 2: Database] - TypeORM PostgreSQL connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'sdpi_user'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_DATABASE', 'sdpi_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') === 'development', // Only in dev!
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    PatientsModule,
    PredictionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

