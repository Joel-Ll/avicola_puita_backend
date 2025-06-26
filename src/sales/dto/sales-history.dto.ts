import { IsDate, IsNotEmpty } from "class-validator";

export class ProductsSoldDto {
  @IsNotEmpty({message: 'La fecha es obligatoria'})
  @IsDate({message: 'Fecha no válida'})
  fromDate: Date;

  @IsNotEmpty({message: 'La fecha es obligatoria'})
  @IsDate({message: 'Fecha no válida'})
  toDate: Date;
}