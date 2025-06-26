import { IsDate, IsNotEmpty } from "class-validator";

export class PaymentGuideDto {
  @IsNotEmpty({message: 'El nombre es obligatorio'})
  @IsDate({message: 'Fecha no válida'})
  date: Date;
}