import {
  Args,
  Context,
  Info,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
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
import { GraphQLResolveInfo } from 'graphql/type';
import { fieldsList } from 'graphql-fields-list';

@Resolver('User')
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query()
  async getUser(
    @Args() args: GetUserInput,
    @Info() info: GraphQLResolveInfo,
  ): Promise<UserDocument> {
    const requestedFields = fieldsList(info);

    return this.usersService.findById(requestedFields, args.id);
  }

  @Query()
  async getUsers(@Info() info: GraphQLResolveInfo): Promise<UserDocument[]> {
    const requestedFields = fieldsList(info);

    return this.usersService.findAll(requestedFields);
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
  async deleteUser(
    @Context('req') request: RequestWithJwtUserInfo,
    @Args() args: DeleteUserInput,
  ): Promise<void> {
    await this.usersService.delete(request.user.sub, args.id);
  }
}
