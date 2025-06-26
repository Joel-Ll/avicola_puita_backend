import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CompletedOrderDto {
  @IsNumber()
  @IsNotEmpty({message: 'La cantidad a pagar es obligatorio'})
  @Min(0, {message: 'Cantidad no válida'})
  amountToPay: number;

  @IsOptional()
  @IsString()
  methodToPay?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Fecha no válida' })
  nextPay?: Date;
}