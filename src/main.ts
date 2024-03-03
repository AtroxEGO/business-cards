import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestjsSwagger } from '@anatine/zod-nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();

  const options = new DocumentBuilder()
    .setTitle('Business Cards')
    .setDescription('The Business Cards API Documentation')
    .setVersion('1.0')
    .addTag('Cards')
    .addBearerAuth()
    .build();
  patchNestjsSwagger();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
