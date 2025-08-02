import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";

export class CreateSoldProductDto {
  @IsMongoId({ message: 'ID no válido' })
  idEgg: string;

  @IsNumber()
  @Min(0, {message: 'Cantidad no válida'})
  @IsNotEmpty({ message: 'La cantidad unitaria es obligatoria' })
  unitQuantity: number;

  @IsNumber()
  @Min(0, {message: 'Cantidad no válida'})
  @IsNotEmpty({ message: 'La cantidad por caja es obligatoria' })
  quantityPerBox: number;

  @IsNumber()
  @IsNotEmpty({message: 'El monto es obligatorio'})
  amount: number;

  @IsNotEmpty({message: 'Seleccione un metodo de pago'})
  method: string;

  @IsOptional()
  observation?: string;
}