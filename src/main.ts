import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import path, { join } from 'path';
import { FileValidationExceptionFilter } from './filter/badexception.filter';
import { ProductService } from './product/product.service';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const app = await NestFactory.create<NestExpressApplication>(AppModule);
  //Dung de config url image tren server
  // app.useStaticAssets(join(__dirname, '..', 'online-shop', 'files'), {
  //   prefix: '/files', // Set the prefix for the static asset URLs
  // });
  app.use('/files', express.static('files'));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({transform: true, whitelist: true}));
  // app.useGlobalFilters(new FileValidationExceptionFilter(app.get(ProductService)));
  await app.listen(3000);
}
bootstrap();
