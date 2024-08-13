import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RequestWithJwtUserInfo } from './model';
import { UsersService } from '../users/users.service';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql/index';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const graphqlExecutionContext = GqlExecutionContext.create(context);
    const request = graphqlExecutionContext.getContext()
      .req as RequestWithJwtUserInfo;

    if (!(await this.usersService.isAdmin(request.user.sub))) {
      throw new GraphQLError(
        'Admin permissions are needed to access this path',
        {
          extensions: {
            code: 'FORBIDDEN',
            http: { status: 403 },
          },
        },
      );
    }

    return true;
  }
}