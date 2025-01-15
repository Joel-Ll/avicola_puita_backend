import { IsNotEmpty, IsString } from 'class-validator';

export class SelectShedDto {
  @IsNotEmpty()
  @IsString({ message: 'Debe seleccionar una opción válida para el galpón' })
  shedOption: string;
}