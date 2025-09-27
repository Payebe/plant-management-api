/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Récupérer ConfigService pour accéder aux variables d'environnement
  const configService = app.get(ConfigService);

  // Configurer le ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    }),
  );

  // Activer l'intercepteur pour standardiser les réponses API
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  // Activer le filtre global pour gérer les erreurs
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configurer Swagger pour la documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Plant Care API')
    .setDescription(
      'API pour la gestion des plantes d’intérieur avec suivi d’arrosage et notifications',
    )
    .setVersion('1.0')
    .addBearerAuth() // Supporter l'authentification JWT
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // Activer CORS pour permettre les requêtes du frontend
  app.enableCors();

  // Lancer le serveur
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
