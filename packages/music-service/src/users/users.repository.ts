import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { Model, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersRepository {
  private isAdminDatabaseFieldName = 'isAdmin';
  private idDatabaseFieldName = '_id';
  private idIncomingFieldName = 'id';

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  public async findById(
    fieldsToFetch: string[],
    id: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findById(
      id,
      this.getFieldsToFetchProjection(fieldsToFetch),
    );
  }

  public async findAll(fieldsToFetch: string[]): Promise<UserDocument[]> {
    return this.userModel.find(
      {},
      this.getFieldsToFetchProjection(fieldsToFetch),
    );
  }

  public async isAdmin(id: string): Promise<boolean | undefined> {
    const user = await this.findById([this.isAdminDatabaseFieldName], id);

    return user?.isAdmin;
  }

  public async create(
    username: string,
    password: string,
    isAdmin: boolean,
  ): Promise<ObjectId> {
    const userToCreate = new this.userModel({
      name: username,
      pass: bcrypt.hashSync(password, 10),
      isAdmin: isAdmin,
    });

    await userToCreate.save();
    return userToCreate.id;
  }

  public async update(
    userToUpdate: UserDocument,
    username?: string,
    password?: string,
    isAdmin?: boolean,
    isActive?: boolean,
  ): Promise<void> {
    if (username !== undefined) userToUpdate.name = username;
    if (password !== undefined)
      userToUpdate.pass = bcrypt.hashSync(password, 10);
    if (isActive !== undefined) userToUpdate.isActive = isActive;
    if (isAdmin !== undefined) userToUpdate.isAdmin = isAdmin;

    await new this.userModel(userToUpdate).save();
  }

  public async delete(id: string): Promise<number> {
    const deleteResult = await this.userModel.deleteOne({
      _id: id,
    });

    return deleteResult.deletedCount;
  }

  private getFieldsToFetchProjection(
    fieldsToFetch: string[],
  ): Record<string, number> {
    const fieldsToFetchFilter: Record<string, number> = {};
    fieldsToFetch.forEach((field) => {
      fieldsToFetchFilter[field] = 1;
    });

    if (!fieldsToFetch.includes(this.idIncomingFieldName)) {
      fieldsToFetchFilter[this.idDatabaseFieldName] = 0;
    }

    return fieldsToFetchFilter;
  }
}
