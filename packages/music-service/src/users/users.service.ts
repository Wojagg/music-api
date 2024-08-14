import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserDocument } from './user.schema';
import { ObjectId } from 'mongoose';
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
      throw new NotFoundException("user doesn't exist");
    }

    return user;
  }

  async findAll(): Promise<UserDocument[]> {
    const users = await this.usersRepository.findAll();

    if (users.length <= 0) {
      throw new NotFoundException(
        'There are no existing users. If you get this message something went wrong and you need to add a ' +
          'user to the database to be able to log in',
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
        throw new ConflictException('User with that username already exists');
      }

      throw new InternalServerErrorException('Unknown error');
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
      throw new ConflictException("update wasn't successful");
    }
  }

  async delete(id: string): Promise<void> {
    const deletedCount = await this.usersRepository.delete(id);

    if (deletedCount <= 0) {
      throw new NotFoundException(
        'No documents were deleted, check if provided id is valid',
      );
    }
  }
}
