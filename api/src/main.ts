import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Euroleague API')
    .setDescription('NestJS API wrapper for Euroleague Live API')
    .setVersion('1.0')
    .addTag('Clubs', 'Club information and management')
    .addTag('Seasons', 'Season management and details')
    .addTag('Rounds', 'Round/matchday information')
    .addTag('Games', 'Game schedules and results')
    .addTag('Teams', 'Team rosters and player information')
    .addTag('Standings', 'League standings and statistics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🏀 Euroleague API is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
