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
    const isAdmin = await this.usersRepository.isAdmin(id);
    if (isAdmin) {
      return isAdmin;
    }

    throw new GraphQLError("user doesn't exist", {
      extensions: {
        code: 'NOT_FOUND',
        http: { status: 404 },
      },
    });
  }

  async findById(requestedFields: string[], id: string): Promise<UserDocument> {
    const user = await this.usersRepository.findById(requestedFields, id);

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

  async findAll(requestedFields: string[]): Promise<UserDocument[]> {
    const users = await this.usersRepository.findAll(requestedFields);

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
    name?: string,
    pass?: string,
    isAdmin?: boolean,
    isActive?: boolean,
  ): Promise<void> {
    const fieldsToFetch = ['id'];

    if (name !== undefined) {
      fieldsToFetch.push('name');
    }
    if (pass !== undefined) {
      fieldsToFetch.push('pass');
    }
    if (isAdmin !== undefined) {
      fieldsToFetch.push('isAdmin');
    }
    if (isActive !== undefined) {
      fieldsToFetch.push('isActive');
    }

    const userToUpdate = await this.findById(fieldsToFetch, id);

    try {
      await this.usersRepository.update(
        userToUpdate,
        name,
        pass,
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
