import { IsString, MinLength, MaxLength } from 'class-validator';

export class SignInDto {
  @MinLength(4)
  @MaxLength(20)
  @IsString()
  username: string;

  @MinLength(4)
  @MaxLength(40)
  @IsString()
  password: string;
}
