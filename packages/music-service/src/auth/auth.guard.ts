import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { config } from '../config/config';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql/index';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const graphqlExecutionContext = GqlExecutionContext.create(context);
    const request = graphqlExecutionContext.getContext().req;
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new GraphQLError('There was no JWT token given', {
        extensions: {
          code: 'UNAUTHORIZED',
          http: { status: 401 },
        },
      });
    }
    try {
      request['user'] = await this.jwtService.verifyAsync(token, {
        secret: config.jwt.secret,
      });
    } catch {
      throw new GraphQLError('Given JWT token is invalid', {
        extensions: {
          code: 'UNAUTHORIZED',
          http: { status: 401 },
        },
      });
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
