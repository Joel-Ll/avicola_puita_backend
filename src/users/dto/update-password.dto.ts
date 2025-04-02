import { IsNotEmpty, MinLength } from "class-validator";
import { Match } from "../decorators/match.decorator";

export class UpdatePasswordDto {
  @IsNotEmpty()
  currentPassword: string;

  @MinLength(5,  {message: 'Password muy corto, mínimo 5 caracteres'})
  newPassword: string;

  @IsNotEmpty({message: 'El password de confirmación no puede ir vacío'})
  @Match('newPassword', { message: 'Las contraseñas no coinciden' })
  confirmPassword: string;
}