/**
 * S.D.P.I. Backend API - Main Entry Point
 * 
 * [MODULE 2]: Application bootstrap with security configurations
 * [MODULE 3]: REST API server initialization for distributed communication
 * 
 * @author Sofía Castellanos Lobo
 * @description NestJS application entry point for the hospital prediction system
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // [MODULE 2: Security] - Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // [MODULE 2: Data Validation] - Global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error on extra properties
      transform: true,           // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix for all routes
  app.setGlobalPrefix('api/v1');

  // [MODULE 2: Documentation] - Swagger/OpenAPI setup
  const config = new DocumentBuilder()
    .setTitle('S.D.P.I. API')
    .setDescription(
      'Sistema Distribuido de Predicción Inteligente para Hospitales Públicos - REST API Documentation'
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('patients', 'Patient records management')
    .addTag('predictions', 'ML prediction requests and history')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║           S.D.P.I. Backend API Started                    ║
  ╠═══════════════════════════════════════════════════════════╣
  ║  🚀 Server running on: http://localhost:${port}              ║
  ║  📚 API Docs:          http://localhost:${port}/api/docs     ║
  ║  🔒 Environment:       ${process.env.NODE_ENV || 'development'}                      ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();

