import { IsNotEmpty } from "class-validator";

export class UpdateUsernameDto {
  @IsNotEmpty({message: 'El nombre de usuario es obligatorio'})
  username: string;
}