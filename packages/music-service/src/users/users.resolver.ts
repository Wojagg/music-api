import { Args, Context, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { ObjectId } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { RequestWithJwtUserInfo } from '../auth/model';
import { GraphQLResolveInfo } from 'graphql/type';
import { fieldsList, fieldsMap } from 'graphql-fields-list';

@Resolver('User')
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query()
  async getUser(@Args('id') id: string, @Info() info: GraphQLResolveInfo): Promise<UserDocument>  {
    const requestedFields = fieldsList(info);

    return this.usersService.findById(requestedFields, id);
  }

  @Query()
  async getUsers(@Info() info: GraphQLResolveInfo): Promise<UserDocument[]> {
    const requestedFields = fieldsList(info);

    return this.usersService.findAll(requestedFields);
  }

  @UseGuards(AdminGuard)
  @Mutation()
  async createUser(
    @Args('username') username: string,
    @Args('password') password: string,
    @Args('isAdmin') isAdmin: boolean,
  ): Promise<ObjectId> {
    return await this.usersService.create(username, password, isAdmin);
  }

  @Mutation()
  async updateCurrentUser(
    @Context('req') request: RequestWithJwtUserInfo,
    @Args('username') username?: string,
    @Args('password') password?: string,
    @Args('isAdmin') isAdmin?: boolean,
    @Args('isActive') isActive?: boolean,
  ): Promise<void> {
    await this.usersService.update(
      request.user.sub,
      username,
      password,
      isAdmin,
      isActive,
    );
  }

  @UseGuards(AdminGuard)
  @Mutation()
  async updateUser(
    @Args('id') id: string,
    @Args('username') username?: string,
    @Args('password') password?: string,
    @Args('isAdmin') isAdmin?: boolean,
    @Args('isActive') isActive?: boolean,
  ): Promise<void> {
    await this.usersService.update(id, username, password, isAdmin, isActive);
  }

  @UseGuards(AdminGuard)
  @Mutation()
  async deleteUser(@Args('id') id: string): Promise<void> {
    await this.usersService.delete(id);
  }
}
