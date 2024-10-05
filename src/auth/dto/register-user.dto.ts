import { IsString } from 'class-validator';

export class RegisterUsersDto {
  @IsString()
  password: string;
  @IsString()
  name: string;
  @IsString()
  email: string;
}
