import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Knowledge Graph API')
    .setDescription('API for Knowledge Graph Platform - build and manage graph-based knowledge')
    .setVersion('1.0')
    .addTag('auth', 'Authentication with Google OAuth 2.0')
    .addTag('domains', 'Knowledge domains management')
    .addTag('node-types', 'Node type definitions')
    .addTag('edge-types', 'Edge type definitions')
    .addTag('nodes', 'Graph nodes (articles with EditorJS content)')
    .addTag('edges', 'Graph edges (relationships between nodes)')
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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`📝 Test endpoint: http://localhost:${port}/just-test?query=hello`);
}

bootstrap();
