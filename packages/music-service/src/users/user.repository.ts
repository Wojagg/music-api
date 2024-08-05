import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { Model, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  public async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  public async findAll(): Promise<UserDocument[]> {
    return this.userModel.find();
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
}
