import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { MongoServerError, ObjectId } from 'mongodb';
import { UsersRepository } from './users.repository';
import { MongoErrorCodes } from '../mongo/errors.dictionary';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

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
  });

  describe('create', () => {
    const createUserData = {
      username: 'username',
      password: 'password',
      isAdmin: true,
    };

    it('should return a proper user id', async () => {
      const createResult = await service.create(createUserData);

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
        await service.create(createUserData);
      }).rejects.toThrow(
        new ConflictException('User with that username already exists'),
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
        await service.create(createUserData);
      }).rejects.toThrow(new InternalServerErrorException('Unknown error'));
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

      await service.update({
        id: '',
        username: 'username',
        password: 'password',
        isAdmin: true,
        isActive: true,
      });

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
        await service.update({
          id: '',
          username: '-',
        });
      }).rejects.toThrow(new ConflictException("update wasn't successful"));
      expect(usersRepositoryUpdate).toHaveBeenCalledWith(
        {},
        '-',
        undefined,
        undefined,
        undefined,
      );
      expect(usersRepositoryUpdate).toHaveBeenCalledTimes(1);
    });

    it('should throw a conflict error when update was not successful', async () => {
      usersRepositoryUpdate.mockImplementation(() => {
        throw new Error();
      });

      await expect(async () => {
        await service.update({ id: '' });
      }).rejects.toThrow(
        new BadRequestException(
          'There is no properties to update, provide more properties than only id',
        ),
      );
      expect(usersRepositoryUpdate).toHaveBeenCalledTimes(0);
    });
  });

  describe('delete', () => {
    it('should successfully run the .delete() function and return a number of deleted documents', async () => {
      usersRepositoryDelete.mockReturnValue(deleteCorrectResult);

      await service.delete('_', '');

      expect(usersRepositoryDelete).toHaveBeenCalledWith('');
      expect(usersRepositoryDelete).toHaveBeenCalledTimes(1);
    });

    it('should throw a conflict error when delete was not successful', async () => {
      usersRepositoryDelete.mockReturnValue(0);

      await expect(async () => {
        await service.delete('_', '');
      }).rejects.toThrow(
        new NotFoundException(
          'No documents were deleted, check if provided id is valid',
        ),
      );
      expect(usersRepositoryDelete).toHaveBeenCalledWith('');
      expect(usersRepositoryDelete).toHaveBeenCalledTimes(1);
    });

    it('should throw a unprocessable entity error when trying to delete current user', async () => {
      await expect(async () => {
        await service.delete('', '');
      }).rejects.toThrow(
        new UnprocessableEntityException(
          "You can't delete the user you are logged in as",
        ),
      );
      expect(usersRepositoryDelete).toHaveBeenCalledTimes(0);
    });
  });
});
