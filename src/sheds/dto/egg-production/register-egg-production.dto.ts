import { Type } from 'class-transformer';
import { IsDate, IsMongoId, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class RegisterEggProductionDto {
  @IsMongoId({ message: 'Id no válido' })
  shedId: string;

  @IsMongoId({ message: 'Id no válido' })
  eggId: string;

  @IsNotEmpty({ message: 'La fecha de registro es obligatoria' })
  @Type(() => Date)
  @IsDate({ message: 'Fecha no válida' })
  dateRegister: Date;

  @IsNotEmpty({ message: 'La cantidad es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'Cantidad no válida' })
  quantity: number;
}