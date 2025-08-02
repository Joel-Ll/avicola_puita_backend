import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, Min, min } from "class-validator";

export class CreateItemDto {
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
  @Min(0, {message: 'Cantidad no válida'})
  @IsOptional()
  totalPrice?: number;
}