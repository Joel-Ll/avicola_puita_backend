import { Type } from "class-transformer";
import { IsDate, IsNotEmpty } from "class-validator";

export class CreateEventDto {
  @IsNotEmpty({ message: 'La fecha de registro es obligatoria' })
  @Type(() => Date)
  @IsDate({ message: 'Fecha no válida' })
  date: Date;

  @IsNotEmpty({ message: 'El registro de enfermedad es obligaorio' })
  illness: string;

  @IsNotEmpty({ message: 'El registro de vacuna es obligatorio' })
  vaccine: string;

  @IsNotEmpty({ message: 'El registro de aplicación es obligatorio' })
  application: string;

  @IsNotEmpty({ message: 'Las indicaciones son obligatorias' })
  directions: string;
}