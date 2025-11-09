import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        console.log('Validation errors:', JSON.stringify(errors, null, 2));
        return new (require('@nestjs/common').BadRequestException)(errors);
      },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('QDP API Documentation')
    .setDescription('Qatar Dynamic Projects and Properties - API Documentation')
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Properties', 'Property listings and management')
    .addTag('Locations', 'Qatar cities and areas')
    .addTag('Amenities', 'Property amenities')
    .addTag('Upload', 'File upload endpoints')
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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
