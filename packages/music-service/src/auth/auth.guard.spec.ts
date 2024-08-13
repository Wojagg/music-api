import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common';
import { config } from '../config/config';

const moduleMocker = new ModuleMocker(global);

describe('AuthGuard', () => {
  let guard: AuthGuard;

  const verifyAsyncCorrectResult = 'user';
  const verifyAsync = jest.fn().mockResolvedValue(verifyAsyncCorrectResult);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard],
    })
      .useMocker((token) => {
        if (token === JwtService) {
          return {
            verifyAsync: verifyAsync,
          };
        }

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    const token = 'string';
    const executionContext = executionContextMockFactory({
      req: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    });

    it('should return true if token is verified successfully', async () => {
      const canActivateResult = await guard.canActivate(executionContext);

      expect(executionContext.getArgs()[2].req.user).toEqual('user');
      expect(canActivateResult).toEqual(true);
      expect(verifyAsync).toHaveBeenCalledWith(token, {
        secret: config.jwt.secret,
      });
      expect(verifyAsync).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if token is not verified successfully', async () => {
      verifyAsync.mockRejectedValue('');

      await expect(async () => {
        await guard.canActivate(executionContext);
      }).rejects.toThrow(
        expect.objectContaining({
          message: 'Given JWT token is invalid',
          extensions: {
            code: 'UNAUTHORIZED',
            http: { status: 401 },
          },
        }),
      );
      expect(verifyAsync).toHaveBeenCalledWith(token, {
        secret: config.jwt.secret,
      });
      expect(verifyAsync).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if token is not present', async () => {
      const executionContext = executionContextMockFactory({
        req: {
          headers: {},
        },
      });

      await expect(async () => {
        await guard.canActivate(executionContext);
      }).rejects.toThrow(
        expect.objectContaining({
          message: 'There was no JWT token given',
          extensions: {
            code: 'UNAUTHORIZED',
            http: { status: 401 },
          },
        }),
      );
      expect(verifyAsync).toHaveBeenCalledTimes(0);
    });
  });
});

function executionContextMockFactory(
  context: Record<string, any>,
): ExecutionContext {
  return {
    getType: () => 'graphql',
    getHandler: () => 'query',
    getClass: () => 'Test Class',
    getArgs: () => [{}, {}, context, {}],
    getArgByIndex: () => ({} as any),
    switchToHttp: () => ({} as any),
    switchToRpc: () => ({} as any),
    switchToWs: () => ({} as any),
  } as any;
}
