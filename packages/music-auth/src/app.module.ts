import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { config } from './config/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: `mongodb://${config.mongo.user}:${config.mongo.password}@${config.mongo.host}:${config.mongo.port}`,
      entities: [User],
      synchronize: false,
      database: config.mongo.database,
      authSource: config.mongo.authSource,
    }),
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
