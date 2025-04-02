import { IsEmail, IsNotEmpty, IsOptional, MinLength } from "class-validator";
import { Match } from "../decorators/match.decorator";

export class CreateUserDto {
  @IsNotEmpty({message: 'El nombre de usuario no puede ir vacío'})
  username: string;

  @IsOptional()
  @IsEmail({}, {message: 'E-mail no válido'})
  email?: string;

  @MinLength(5,  {message: 'Password muy corto, mínimo 5 caracteres'})
  password: string;

  @IsNotEmpty({message: 'El password de confirmación no puede ir vacío'})
  @Match('password', { message: 'Las contraseñas no coinciden' })
  password_confirmation: string;
}
