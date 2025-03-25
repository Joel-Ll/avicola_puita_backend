import { Type } from "class-transformer";
import { IsDate, IsString } from "class-validator";

export class GenerateReportDto {
  @IsString()
  category: string;

  @Type(() => Date)
  @IsDate({ message: 'Fecha no válida' })
  fromDate: Date

  @Type(() => Date)
  @IsDate({ message: 'Fecha no válida' })
  toDate: Date
}