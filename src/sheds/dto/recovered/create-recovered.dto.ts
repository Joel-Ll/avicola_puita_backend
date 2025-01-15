import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateRecoveredDto {
  @IsNotEmpty({ message: 'La cantidad es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'Cantidad no válida' })
  quantity: number;

  @IsNotEmpty({ message: 'La fecha de registro es obligatoria' })
  @Type(() => Date)
  @IsDate({ message: 'Fecha no válida' })
  dateRegister: Date;
}