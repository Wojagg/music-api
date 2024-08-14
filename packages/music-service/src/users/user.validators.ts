import { IsBoolean, IsMongoId, IsOptional, Length } from 'class-validator';
import { User } from '../graphql';

export class GetUserInput extends User {
  @IsMongoId()
  id: string;
}

export class CreateUserInput extends User {
  @Length(4, 20)
  name: string;

  @Length(8, 40)
  pass: string;

  @IsBoolean()
  isAdmin: boolean;
}

export class UpdateCurrentUserInput extends User {
  @IsOptional()
  @Length(4, 20)
  name?: string;

  @IsOptional()
  @Length(8, 40)
  pass?: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserInput extends User {
  @IsMongoId()
  id: string;

  @IsOptional()
  @Length(4, 20)
  name?: string;

  @IsOptional()
  @Length(8, 40)
  pass?: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class DeleteUserInput extends User {
  @Length(24, 24)
  id: string;
}
