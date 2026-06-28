import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix — all routes become /api/...
  app.setGlobalPrefix('api');

  // Global validation — validates all request bodies automatically
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS — allows Postman and future frontend to call this API
  app.enableCors();

  // Swagger — auto-generated API documentation
  const config = new DocumentBuilder()
    .setTitle('CloudPulse API')
    .setDescription('Enterprise task and notification platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 5000);
}

bootstrap();