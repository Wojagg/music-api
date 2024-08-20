import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RequestWithJwtUserInfo } from './model';
import { UsersService } from '../users/users.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const graphqlExecutionContext = GqlExecutionContext.create(context);
    const request = graphqlExecutionContext.getContext()
      .req as RequestWithJwtUserInfo;

    if (!(await this.usersService.isAdmin(request.user.sub))) {
      throw new ForbiddenException(
        'Admin permissions are needed to access this path',
      );
    }

    return true;
  }
}
