import { Injectable } from '@nestjs/common';
import { UserDocument } from './user.schema';
import { ObjectId } from 'mongoose';
import { GraphQLError } from 'graphql';
import { MongoErrorCodes } from '../mongo/errors.dictionary';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  public async isAdmin(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user.isAdmin;
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new GraphQLError("user doesn't exist", {
        extensions: {
          code: 'NOT_FOUND',
          http: { status: 404 },
        },
      });
    }

    return user;
  }

  async findAll(): Promise<UserDocument[]> {
    const users = await this.usersRepository.findAll();

    if (users.length <= 0) {
      throw new GraphQLError(
        'There are no existing users. If you get this message something went wrong and you need to add a ' +
          'user to the database to be able to log in',
        {
          extensions: {
            code: 'NOT_FOUND',
            http: { status: 404 },
          },
        },
      );
    }

    return users;
  }

  async create(
    username: string,
    password: string,
    isAdmin: boolean,
  ): Promise<ObjectId> {
    let userId;

    try {
      userId = await this.usersRepository.create(username, password, isAdmin);
    } catch (error: any) {
      if (
        error?.name === 'MongoServerError' &&
        error?.code === MongoErrorCodes.DUPLICATE_KEY
      ) {
        throw new GraphQLError('User with that username already exists', {
          extensions: {
            code: 'CONFLICT',
            http: { status: 409 },
          },
        });
      }

      throw new GraphQLError('Unknown error', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          http: { status: 500 },
        },
      });
    }

    return userId;
  }

  async update(
    id: string,
    username?: string,
    password?: string,
    isAdmin?: boolean,
    isActive?: boolean,
  ): Promise<void> {
    if (!username && !password && !isAdmin && !isActive) {
      throw new GraphQLError(
        'There is no properties to update, provide more properties than only id',
        {
          extensions: {
            code: 'BAD_REQUEST',
            http: { status: 400 },
          },
        },
      );
    }

    const userToUpdate = await this.findById(id);

    try {
      await this.usersRepository.update(
        userToUpdate,
        username,
        password,
        isAdmin,
        isActive,
      );
    } catch {
      throw new GraphQLError("update wasn't successful", {
        extensions: {
          code: 'CONFLICT',
          http: { status: 409 },
        },
      });
    }
  }

  async delete(id: string): Promise<void> {
    const deletedCount = await this.usersRepository.delete(id);

    if (deletedCount <= 0) {
      throw new GraphQLError(
        'No documents were deleted, check if provided id is valid',
        {
          extensions: {
            code: 'NOT_FOUND',
            http: { status: 404 },
          },
        },
      );
    }
  }
}
