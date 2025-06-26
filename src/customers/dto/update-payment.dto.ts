import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class UpdatePaymentDto {
  @IsNumber()
  @IsNotEmpty({ message: 'La cantidad a pagar es obligatorio' })
  @Min(0, { message: 'Cantidad no válida' })
  amount: number;

  @IsString()
  @IsNotEmpty({ message: 'La cantidad a pagar es obligatorio' })
  method: string;
}