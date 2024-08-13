import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { User, UserDocument } from './user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let findByIdSpy: jest.SpyInstance;
  let findSpy: jest.SpyInstance;
  let deleteOneSpy: jest.SpyInstance;

  const user = {
    name: 'user',
    pass: '$2b$10$//uCLIGtx4vcKq6db5mAZelRTF.nPu.8WHg41ViExUmxBpNbl0oS.',
    isActive: true,
    isAdmin: false,
  };
  const userId = '6694eeb0ef0201f8a0149f49';

  class UserModelMock {
    static entityStub = user;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static async findById(id: string): Promise<User> {
      return this.entityStub;
    }

    public static async find(): Promise<User[]> {
      return [this.entityStub];
    }

    public static async deleteOne(): Promise<DeleteResult> {
      return {
        acknowledged: true,
        deletedCount: 1,
      };
    }

    public async save(): Promise<void> {
      Object.assign(this, {
        id: userId,
      });
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getModelToken(User.name),
          useValue: UserModelMock,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);

    findByIdSpy = jest.spyOn(UserModelMock, 'findById');
    findSpy = jest.spyOn(UserModelMock, 'find');
    deleteOneSpy = jest.spyOn(UserModelMock, 'deleteOne');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a proper user', async () => {
      const findByIdResult = await repository.findById('');

      expect(findByIdResult).toEqual(user);
      expect(findByIdSpy).toHaveBeenCalledWith('');
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return a proper users array', async () => {
      const findAllResult = await repository.findAll();

      expect(findAllResult).toEqual([user]);
      expect(findSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should return a proper user id', async () => {
      const createResult = await repository.create(
        'username',
        'password',
        true,
      );

      expect(createResult).toEqual(userId);
      // TODO: add UserModelMock constructor testing (it seems like nestjs magic is preventing me from spying on the
      // constructor so I'm skipping it for now)
    });
  });

  describe('update', () => {
    it('should successfully run the .update() function', async () => {
      findByIdSpy.mockReturnValue({});

      await repository.update(
        user as UserDocument,
        'username',
        'password',
        true,
        true,
      );
      // TODO: add UserModelMock constructor testing (it seems like nestjs magic is preventing me from spying on the
      // constructor so I'm skipping it for now)
    });
  });

  describe('delete', () => {
    it('should successfully run the .delete() function and return a number of deleted documents', async () => {
      const id = '';
      const deleteResult = await repository.delete(id);

      expect(deleteOneSpy).toHaveBeenCalledWith({
        _id: id,
      });
      expect(deleteOneSpy).toHaveBeenCalledTimes(1);
      expect(deleteResult).toEqual(1);
    });
  });
});
