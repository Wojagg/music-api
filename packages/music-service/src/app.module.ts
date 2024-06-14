import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './Controller/app.controller';
import { AppService } from './Service/app.service';

import { User } from './users/user.entity';

import { config } from './config/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: config.mongo.host,
      port: config.mongo.port,
      username: config.mongo.user,
      password: config.mongo.password,
      database: config.mongo.db,
      entities: [User],
      synchronize: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
