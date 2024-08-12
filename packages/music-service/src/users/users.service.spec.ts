import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { MongoServerError, ObjectId } from 'mongodb';
import { UsersRepository } from './users.repository';
import { MongoErrorCodes } from '../mongo/errors.dictionary';

const moduleMocker = new ModuleMocker(global);

describe('UsersService', () => {
  let service: UsersService;

  const findByIdCorrectResult = {
    id: new ObjectId('6694eeb0ef0201f8a0149f49'),
    name: 'user',
    pass: '$2b$10$//uCLIGtx4vcKq6db5mAZelRTF.nPu.8WHg41ViExUmxBpNbl0oS.',
    isActive: true,
    isAdmin: false,
  };
  const findAllCorrectResult = [findByIdCorrectResult];
  const createCorrectResult = '6694eeb0ef0201f8a0149f49';
  const deleteCorrectResult = 1;

  const usersRepositoryFindById = jest
    .fn()
    .mockResolvedValue(findByIdCorrectResult);
  const usersRepositoryFindAll = jest
    .fn()
    .mockResolvedValue(findAllCorrectResult);
  const usersRepositoryCreate = jest
    .fn()
    .mockResolvedValue(createCorrectResult);
  const usersRepositoryDelete = jest
    .fn()
    .mockResolvedValue(deleteCorrectResult);
  const usersRepositoryUpdate = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    })
      .useMocker((token) => {
        if (token === UsersRepository) {
          return {
            findById: usersRepositoryFindById,
            findAll: usersRepositoryFindAll,
            create: usersRepositoryCreate,
            update: usersRepositoryUpdate,
            delete: usersRepositoryDelete,
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

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a proper user', async () => {
      const findByIdResult = await service.findById('');

      expect(findByIdResult).toEqual(findByIdCorrectResult);
      expect(usersRepositoryFindById).toHaveBeenCalledWith('');
      expect(usersRepositoryFindById).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return a proper users array', async () => {
      const findAllResult = await service.findAll();

      expect(findAllResult).toEqual(findAllCorrectResult);
      expect(usersRepositoryFindAll).toHaveBeenCalledTimes(1);
    });

    it('should throw a conflict error when user with provided username already exists', async () => {
      usersRepositoryFindAll.mockReturnValue([]);

      await expect(async () => {
        await service.findAll();
      }).rejects.toThrow(
        expect.objectContaining({
          message:
            'There are no existing users. If you get this message something went wrong and you need to add a user to the database to be able to log in',
          extensions: {
            code: 'NOT_FOUND',
            http: { status: 404 },
          },
        }),
      );
      expect(usersRepositoryFindAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should return a proper user id', async () => {
      const createResult = await service.create('username', 'password', true);

      expect(createResult).toEqual(createCorrectResult);
      expect(usersRepositoryCreate).toHaveBeenCalledWith(
        'username',
        'password',
        true,
      );
      expect(usersRepositoryCreate).toHaveBeenCalledTimes(1);
    });

    it('should throw a conflict error when user with provided username already exists', async () => {
      usersRepositoryCreate.mockImplementation(() => {
        throw new MongoServerError({ code: MongoErrorCodes.DUPLICATE_KEY });
      });

      await expect(async () => {
        await service.create('username', 'password', true);
      }).rejects.toThrow(
        expect.objectContaining({
          message: 'User with that username already exists',
          extensions: {
            code: 'CONFLICT',
            http: { status: 409 },
          },
        }),
      );
      expect(usersRepositoryCreate).toHaveBeenCalledWith(
        'username',
        'password',
        true,
      );
      expect(usersRepositoryCreate).toHaveBeenCalledTimes(1);
    });

    it('should throw an unknown error when it encounter a different error than user with provided username already exists', async () => {
      usersRepositoryCreate.mockImplementation(() => {
        throw new Error();
      });

      await expect(async () => {
        await service.create('username', 'password', true);
      }).rejects.toThrow(
        expect.objectContaining({
          message: 'Unknown error',
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
          },
        }),
      );
      expect(usersRepositoryCreate).toHaveBeenCalledWith(
        'username',
        'password',
        true,
      );
      expect(usersRepositoryCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should successfully run the .update() function', async () => {
      usersRepositoryFindById.mockReturnValue({});

      await service.update('', 'username', 'password', true, true);

      expect(usersRepositoryUpdate).toHaveBeenCalledWith(
        {},
        'username',
        'password',
        true,
        true,
      );
      expect(usersRepositoryUpdate).toHaveBeenCalledTimes(1);
    });

    it('should throw a conflict error when update was not successful', async () => {
      usersRepositoryUpdate.mockImplementation(() => {
        throw new Error();
      });

      await expect(async () => {
        await service.update('');
      }).rejects.toThrow(
        expect.objectContaining({
          message: "update wasn't successful",
          extensions: {
            code: 'CONFLICT',
            http: { status: 409 },
          },
        }),
      );
      expect(usersRepositoryUpdate).toHaveBeenCalledWith(
        {},
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(usersRepositoryUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should successfully run the .delete() function and return a number of deleted documents', async () => {
      usersRepositoryDelete.mockReturnValue(deleteCorrectResult);

      await service.delete('');

      expect(usersRepositoryDelete).toHaveBeenCalledWith('');
      expect(usersRepositoryDelete).toHaveBeenCalledTimes(1);
    });

    it('should throw a conflict error when update was not successful', async () => {
      usersRepositoryDelete.mockReturnValue(0);

      await expect(async () => {
        await service.delete('');
      }).rejects.toThrow(
        expect.objectContaining({
          message: 'No documents were deleted, check if provided id is valid',
          extensions: {
            code: 'NOT_FOUND',
            http: { status: 404 },
          },
        }),
      );
      expect(usersRepositoryDelete).toHaveBeenCalledWith('');
      expect(usersRepositoryDelete).toHaveBeenCalledTimes(1);
    });
  });
});
