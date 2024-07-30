import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from '../DTO/SignInDto';
import { JwtResponsePayload } from './model';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto): Promise<JwtResponsePayload> {
    const { username, password } = signInDto;
    return await this.authService.signIn(username, password);
  }
}
