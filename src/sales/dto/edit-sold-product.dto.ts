import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class EditSoldProductDto {
  @IsNumber()
  @IsNotEmpty({message: 'El monto es obligatorio'})
  amount: number;

  @IsNotEmpty({message: 'Seleccione un metodo de pago'})
  method: string;

  @IsOptional()
  observation?: string;
}