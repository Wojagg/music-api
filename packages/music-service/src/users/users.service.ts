import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from './user.entity';
import { MongoServerError, ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import { MongoErrorCodes } from '../mongo/errors.dictionary';

// TODO: Zrobić testy tego serwisu
// Pomyśleć czy nie przerzucić dokładnego wywalania errorów pod odpowiedzi do klientów do resolverów, żeby wydzielić
// odpowiedzialności sieciowe z tego serwisu
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: MongoRepository<User>,
  ) {}

  async isUserAdmin(id: string): Promise<boolean> {
    const user = await this.findOneById(id);
    return user.isAdmin;
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({
      _id: new ObjectId(id),
    });

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

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();

    if (!users) {
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

  async createUser(
    username: string,
    password: string,
    isAdmin: boolean,
  ): Promise<ObjectId> {
    const user = {
      name: username,
      pass: bcrypt.hashSync(password, 10),
      isAdmin: isAdmin,
      isActive: true,
    };

    let createdUser;

    try {
      createdUser = await this.usersRepository.insertOne(user);
    } catch (error: unknown) {
      if (
        error instanceof MongoServerError &&
        error.code === MongoErrorCodes.DUPLICATE_KEY
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

    return createdUser.insertedId;
  }

  async updateUser(
    id: string,
    username?: string,
    password?: string,
    isAdmin?: boolean,
    isActive?: boolean,
  ): Promise<void> {
    const mongoSetObject: Partial<User> = {};
    if (username) mongoSetObject.name = username;
    if (password) mongoSetObject.pass = bcrypt.hashSync(password, 10);
    if (isActive) mongoSetObject.isActive = isActive;
    if (isAdmin) mongoSetObject.isAdmin = isAdmin;

    const updateResult = await this.usersRepository.updateOne(
      { _id: new ObjectId(id) },
      { $set: mongoSetObject },
    );

    // TODO: PO ZMIANIE NA MONGOOSE DODAĆ TUTAJ WYKRYWANIE CZY BYŁ KONFLIKT PODCZAS UPDATE, NA RAZIE Z TEGO CO WIDZĘ
    // NIE MA OPCJI RZUCENIA BŁĘDEM Z updateOne DLA MONGODB Z TYPEORM

    if (updateResult.modifiedCount <= 0) {
      throw new GraphQLError(
        'No documents were modified, check if provided id is valid',
        {
          extensions: {
            code: 'NOT_FOUND',
            http: { status: 404 },
          },
        },
      );
    }
  }

  async deleteUser(id: string): Promise<void> {
    const deleteResult = await this.usersRepository.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount <= 0) {
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
