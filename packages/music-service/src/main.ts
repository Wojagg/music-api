import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpToGraphqlExceptionFilter } from './filters/http-to-graphql-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpToGraphqlExceptionFilter());
  await app.listen(3000);
}

bootstrap();
