import {
  ExceptionFilter,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GraphQLError } from 'graphql/index';

@Catch(HttpException)
export class HttpToGraphqlExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException) {
    const status = exception.getStatus();

    throw new GraphQLError(exception.message, {
      extensions: {
        code: HttpStatus[status],
        http: { status: status },
      },
    });
  }
}
