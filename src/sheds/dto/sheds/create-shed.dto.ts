import { IsNotEmpty } from 'class-validator';

export class CreateShedDto {
  @IsNotEmpty({ message: 'El nombre del galpón es obligatorio' })
  name: string;
}
