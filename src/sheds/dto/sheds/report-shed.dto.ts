import { Type } from 'class-transformer';
import { IsISO8601, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class DateRangeDto {
  @IsISO8601()
  from: string;

  @IsISO8601()
  to: string;
}

export class ReportShedDto {
  @IsNotEmpty()
  @IsString({ message: 'Debe seleccionar una opción válida para el galpón' })
  shedOption: string;

  @ValidateNested()
  @Type(() => DateRangeDto)
  date_range: DateRangeDto;
}