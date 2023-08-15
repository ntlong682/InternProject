import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import path from 'path';
import { FileValidationExceptionFilter } from './filter/badexception.filter';
import { ProductService } from './product/product.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //Dung de config url image tren server
  // app.use('/files', express.static(path.join(__dirname, '..', 'files')));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({transform: true, whitelist: true}));
  app.useGlobalFilters(new FileValidationExceptionFilter(app.get(ProductService)));
  await app.listen(3000);
}
bootstrap();
