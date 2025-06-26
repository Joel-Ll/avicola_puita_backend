import { Transform } from "class-transformer";
import { IsDate, ValidateIf  } from "class-validator";

export class DeliveryDateDto {
  @Transform(({ value }) => {
    if (value === '' || value === 'null' || value === null) return null;
    return new Date(value);
  })
  @ValidateIf((_, value) => value !== null)
  @IsDate({ message: 'Fecha no válida' })
  date: Date | null;
}