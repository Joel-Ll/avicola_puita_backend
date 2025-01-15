import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateVaccineControlDto {
  @IsNotEmpty({ message: 'El asesor es obligatorio' })
  @IsString()
  @MinLength(3, { message: 'El nombre del asesor es muy corto' })
  adviser: string;

  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @IsString()
  @MinLength(5, { message: 'El teléfono es muy corto' })
  phone: string;

  @IsNotEmpty({ message: 'La línea genética es obligatoria' })
  @IsString()
  @MinLength(3, { message: 'El origen es muy corto' })
  geneticLine: string;

  @IsNotEmpty({ message: 'El origen es obligatorio' })
  @IsString()
  @MinLength(3, { message: 'El origen es muy corto' })
  origin: string;
}