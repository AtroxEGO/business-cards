import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestjsSwagger } from '@anatine/zod-nestjs';
import { ConfigService } from '@nestjs/config';

// TODO: Docker
// TODO: Tests
// TODO: Logging
// TODO: CI/CD
// TODO: Caching

async function bootstrap() {
  // Start the App
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Business Cards')
    .setDescription('The Business Cards API Documentation')
    .setVersion('1.0')
    .addTag('Cards')
    .addBearerAuth({
      name: 'accessToken',
      type: 'apiKey',
    })
    .build();
  patchNestjsSwagger();
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get('port');
  console.log(port);
  await app.listen(3000);
}
bootstrap();
