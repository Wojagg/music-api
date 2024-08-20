import { IsBoolean, IsMongoId, IsOptional, MinLength } from 'class-validator';
import { User } from '../graphql';

export class GetUserInput extends User {
  @IsMongoId()
  id: string;
}

export class CreateUserInput extends User {
  @MinLength(4)
  name: string;

  @MinLength(8)
  pass: string;

  @IsBoolean()
  isAdmin: boolean;
}

export class UpdateCurrentUserInput extends User {
  @IsOptional()
  @MinLength(4)
  name?: string;

  @IsOptional()
  @MinLength(8)
  pass?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserInput extends User {
  @IsMongoId()
  id: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class DeleteUserInput extends User {
  @IsMongoId()
  id: string;
}
