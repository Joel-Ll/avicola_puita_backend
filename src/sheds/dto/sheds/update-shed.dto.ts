import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ShedState, shedState } from 'src/common/constants/shed-state';

export class UpdateShedDto {
  @IsNotEmpty({message: 'El nombre es obligatorio'})
  name: string;

  @IsNotEmpty({message: 'El estado es obligatorio'})
  @IsEnum(shedState, {message: 'Estado no válido'})
  state: ShedState;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Fecha no válida' })
  initialDate?: Date;

  @IsNotEmpty({ message: 'La cantidad inicial es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad inicial debe ser un número' })
  @Min(0, { message: 'Cantidad no válida' })
  initialStock: number;
}
