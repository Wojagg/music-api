import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { config } from '../config/config';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: config.jwt.secret,
      signOptions: { expiresIn: '10m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
