import { IsDate } from "class-validator";

export class GetRateDto {
  @IsDate()
  fromDate: Date;

  @IsDate()
  toDate: Date
}