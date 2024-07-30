import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtResponsePayload } from './model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    password: string,
  ): Promise<JwtResponsePayload> {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new NotFoundException({
        message: "User with given name doesn't exist",
      });
    }

    if (!user.isActive) {
      throw new ForbiddenException({
        message: 'Given user is not active',
      });
    }

    if (!(await bcrypt.compare(password, user.pass))) {
      throw new UnauthorizedException({
        message: 'Given password does not match to given user',
      });
    }

    const jwtPayload = {
      sub: user.id,
      username: user.name,
    };

    return { access_token: await this.jwtService.signAsync(jwtPayload) };
  }
}
