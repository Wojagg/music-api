import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from './admin.guard';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { ExecutionContext } from '@nestjs/common';
import { UsersService } from '../users/users.service';

const moduleMocker = new ModuleMocker(global);

describe('AdminGuard', () => {
  let guard: AdminGuard;

  const isAdminCorrectResult = true;
  const isAdmin = jest.fn().mockResolvedValue(isAdminCorrectResult);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminGuard],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return {
            isAdmin: isAdmin,
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

    guard = module.get<AdminGuard>(AdminGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    const username = 'user';
    const executionContext = executionContextMockFactory({
      req: {
        user: {
          sub: username,
        },
      },
    });

    it('should return true if admin permissions was detected', async () => {
      const canActivateResult = await guard.canActivate(executionContext);

      expect(canActivateResult).toEqual(true);
      expect(isAdmin).toHaveBeenCalledWith(username);
      expect(isAdmin).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if admin permissions wasn't detected", async () => {
      isAdmin.mockResolvedValue(false);

      await expect(async () => {
        await guard.canActivate(executionContext);
      }).rejects.toThrow(
        expect.objectContaining({
          message: 'Admin permissions are needed to access this path',
          extensions: {
            code: 'FORBIDDEN',
            http: { status: 403 },
          },
        }),
      );
      expect(isAdmin).toHaveBeenCalledWith(username);
      expect(isAdmin).toHaveBeenCalledTimes(1);
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
