import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { User } from './users/user.entity';
import { config } from './config/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { GraphQLVoid } from 'graphql-scalars';

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
    RedisModule.forRoot({
      config: {
        host: config.redis.host,
        port: config.redis.port,
        username: config.redis.user,
        password: config.redis.password,
      },
    }),
    UsersModule,
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
        outputAs: 'class',
      },
      resolvers: { Void: GraphQLVoid },
      includeStacktraceInErrorResponses: false,
    }),
  ],
})
export class AppModule {}
