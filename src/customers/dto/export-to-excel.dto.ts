import { IsDate, IsNotEmpty } from "class-validator";

export class PaymentsReporExcelDto {
  @IsNotEmpty({message: 'La fecha es obligatoria'})
  @IsDate({message: 'Fecha no válida'})
  fromDate: Date;

  @IsNotEmpty({message: 'La fecha es obligatoria'})
  @IsDate({message: 'Fecha no válida'})
  toDate: Date;
}