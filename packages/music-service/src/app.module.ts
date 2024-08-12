import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { config } from './config/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { GraphQLVoid } from 'graphql-scalars';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        host: config.redis.host,
        port: config.redis.port,
        username: config.redis.user,
        password: config.redis.password,
      },
    }),
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
    MongooseModule.forRoot(
      `mongodb://${config.mongo.user}:${config.mongo.password}@${config.mongo.host}:${config.mongo.port}/${config.mongo.database}`,
      {
        authSource: config.mongo.authSource,
      },
    ),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
