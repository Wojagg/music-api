import { HttpToGraphqlExceptionFilter } from './http-to-graphql-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('HttpToGraphqlExceptionFilter', () => {
  describe('catch', () => {
    it('should throw an error with message, and http response code given in error', () => {
      const httpResponseCode = 500;
      const exception = new HttpException('error', httpResponseCode);

      const filter = new HttpToGraphqlExceptionFilter();

      expect(async () => {
        filter.catch(exception);
      }).rejects.toThrow(
        expect.objectContaining({
          message: 'error',
          extensions: {
            code: HttpStatus[httpResponseCode],
            http: { status: HttpStatus.INTERNAL_SERVER_ERROR },
          },
        }),
      );
    });
  });
});
