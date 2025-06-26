import { IsDate, IsNotEmpty } from "class-validator";

export class DeliveryGuideDto {
  @IsNotEmpty({message: 'La fecha es obligatoria'})
  @IsDate({message: 'Fecha no válida'})
  date: Date;
}