import { IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
  @IsNotEmpty({message: 'El nombre de usuario es obligatorio'})
  @IsString()
  username: string;

  @IsNotEmpty({message: 'La password es obligatorio'})
  @IsString()
  password: string;
}