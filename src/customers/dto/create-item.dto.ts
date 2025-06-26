import { IsMongoId, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateItemDto {
  @IsMongoId({ message: 'ID no válido' })
  idEgg: string;

  @IsNumber()
  @IsNotEmpty({ message: 'La cantidad unitaria es obligatoria' })
  unitQuantity: number;

  @IsNumber()
  @IsNotEmpty({ message: 'La cantidad por caja es obligatoria' })
  quantityPerBox: number;

  @IsNumber()
  @IsOptional()
  totalPrice?: number;
}