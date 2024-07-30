import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { ObjectId } from 'mongodb';
import { User } from './user.entity';

@Resolver('User')
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query()
  async getUser(@Args('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Query()
  async getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Mutation()
  async createUser(
    @Args('username') username: string,
    @Args('password') password: string,
    @Args('isAdmin') isAdmin: boolean,
  ): Promise<ObjectId> {
    return await this.usersService.createUser(username, password, isAdmin);
  }

  @Mutation()
  async updateUser(
    @Args('id') id: string,
    @Args('username') username?: string,
    @Args('password') password?: string,
    @Args('isAdmin') isAdmin?: boolean,
    @Args('isActive') isActive?: boolean,
  ): Promise<void> {
    await this.usersService.updateUser(
      id,
      username,
      password,
      isAdmin,
      isActive,
    );
  }

  @Mutation()
  async deleteUser(@Args('id') id: string): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}
