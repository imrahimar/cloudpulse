import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 5000;
  const isProd = configService.get<string>('NODE_ENV') === 'production';
  const corsOrigin = configService.get<string>('CORS_ORIGIN');

  app.setGlobalPrefix('api');
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',').map((o) => o.trim()) : !isProd,
    credentials: true,
  });

  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('CloudPulse API')
      .setDescription('Task management API with JWT auth and RBAC')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const jwtSecret = configService.get<string>('JWT_SECRET');
  if (!jwtSecret || jwtSecret === 'change-me-in-production') {
    if (isProd) {
      throw new Error('JWT_SECRET must be set to a strong value in production');
    }
  }

  await app.listen(port);
}

bootstrap();
