import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserDocument } from './user.schema';
import { ObjectId } from 'mongoose';
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

    throw new NotFoundException("user doesn't exist");
  }

  async findById(requestedFields: string[], id: string): Promise<UserDocument> {
    const user = await this.usersRepository.findById(requestedFields, id);

    if (!user) {
      throw new NotFoundException("user doesn't exist");
    }

    return user;
  }

  async findAll(requestedFields: string[]): Promise<UserDocument[]> {
    const users = await this.usersRepository.findAll(requestedFields);

    if (users.length <= 0) {
      throw new NotFoundException(
        'There are no existing users. If you get this message something went wrong and you need to add a ' +
          'user to the database to be able to log in',
      );
    }

    return users;
  }

  async create(createData: {
    username: string;
    password: string;
    isAdmin: boolean;
  }): Promise<ObjectId> {
    const { username, password, isAdmin } = createData;
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

  async update(updateData: {
    id: string;
    username?: string;
    password?: string;
    isActive?: boolean;
    isAdmin?: boolean;
  }): Promise<void> {
    const { id, isActive, username, password, isAdmin } = updateData;

    const fieldsToFetch = ['id'];

    if (username !== undefined) {
      fieldsToFetch.push('name');
    }
    if (password !== undefined) {
      fieldsToFetch.push('pass');
    }
    if (isAdmin !== undefined) {
      fieldsToFetch.push('isAdmin');
    }
    if (isActive !== undefined) {
      fieldsToFetch.push('isActive');
    }

    if (
      !username &&
      !password &&
      isAdmin === undefined &&
      isActive === undefined
    ) {
      throw new BadRequestException(
        'There is no properties to update, provide more properties than only id',
      );
    }

    const userToUpdate = await this.findById(fieldsToFetch, id);

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

  async delete(currentUserId: string, id: string): Promise<void> {
    if (currentUserId === id) {
      throw new UnprocessableEntityException(
        "You can't delete the user you are logged in as",
      );
    }

    const deletedCount = await this.usersRepository.delete(id);

    if (deletedCount <= 0) {
      throw new NotFoundException(
        'No documents were deleted, check if provided id is valid',
      );
    }
  }
}
