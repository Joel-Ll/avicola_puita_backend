import { IsNotEmpty, IsOptional, MinLength } from "class-validator";
import { Match } from "../decorators/match.decorator";

export class UpdateUserDto {
  @IsNotEmpty({message: 'El nombre de usuario no puede ir vacío'})
  username: string;

  @IsOptional()
  @MinLength(5,  {message: 'Password muy corto, mínimo 5 caracteres'})
  password?: string;

  @Match('password', { message: 'Las contraseñas no coinciden' })
  password_confirmation?: string;
}
