import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { UsersService } from '../users/users.service';
import { ObjectId } from 'mongodb';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

const moduleMocker = new ModuleMocker(global);

describe('AuthService', () => {
  let service: AuthService;

  const jwtServiceSignAsync = jest.fn().mockResolvedValue('string');

  const findOneResult = {
    id: new ObjectId(),
    name: 'user',
    pass: '$2b$10$//uCLIGtx4vcKq6db5mAZelRTF.nPu.8WHg41ViExUmxBpNbl0oS.',
    isActive: true,
    isAdmin: false,
  };
  const usersServiceFindOne = jest.fn().mockResolvedValue(findOneResult);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (token === JwtService) {
          return { signAsync: jwtServiceSignAsync };
        }

        if (token === UsersService) {
          return { findOne: usersServiceFindOne };
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

    service = module.get<AuthService>(AuthService);
  });

  it('should return the return value of jwtService.signAsync()', async () => {
    expect(await service.signIn('user', 'pass')).toEqual({
      access_token: 'string',
    });
  });

  it('should throw an exception if user does not exist', async () => {
    usersServiceFindOne.mockResolvedValue(null);

    await expect(service.signIn('user', 'pass')).rejects.toEqual(
      new NotFoundException({
        message: "User with given name doesn't exist",
      }),
    );
  });

  it('should throw an exception if user is not active', async () => {
    usersServiceFindOne.mockResolvedValue({
      isActive: false,
    });

    await expect(service.signIn('user', 'pass')).rejects.toEqual(
      new ForbiddenException({
        message: 'Given user is not active',
      }),
    );
  });

  it("should throw an exception if password doesn't match", async () => {
    usersServiceFindOne.mockResolvedValue({
      isActive: true,
      pass: 'someHash',
    });

    await expect(service.signIn('user', 'pass')).rejects.toEqual(
      new UnauthorizedException({
        message: 'Given password does not match to given user',
      }),
    );
  });
});
