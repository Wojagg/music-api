import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { ObjectId } from 'mongoose';
import { UserDocument } from './user.schema';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { RequestWithJwtUserInfo } from '../auth/model';
import {
  CreateUserInput,
  DeleteUserInput,
  GetUserInput,
  UpdateCurrentUserInput,
  UpdateUserInput,
} from './user.validators';

@Resolver('User')
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query()
  async getUser(@Args() args: GetUserInput) {
    return this.usersService.findById(args.id);
  }

  @Query()
  async getUsers(): Promise<UserDocument[]> {
    return this.usersService.findAll();
  }

  @UseGuards(AdminGuard)
  @Mutation()
  async createUser(@Args() args: CreateUserInput): Promise<ObjectId> {
    return await this.usersService.create({
      username: args.name,
      password: args.pass,
      isAdmin: args.isAdmin,
    });
  }

  @Mutation()
  async updateCurrentUser(
    @Context('req') request: RequestWithJwtUserInfo,
    @Args() args: UpdateCurrentUserInput,
  ): Promise<void> {
    await this.usersService.update({
      id: request.user.sub,
      isActive: args.isActive,
      username: args.name,
      password: args.pass,
    });
  }

  @UseGuards(AdminGuard)
  @Mutation()
  async updateUser(@Args() args: UpdateUserInput): Promise<void> {
    await this.usersService.update({
      id: args.id,
      isActive: args.isActive,
      isAdmin: args.isAdmin,
    });
  }

  @UseGuards(AdminGuard)
  @Mutation()
  async deleteUser(@Args() args: DeleteUserInput): Promise<void> {
    await this.usersService.delete(args.id);
  }
}
