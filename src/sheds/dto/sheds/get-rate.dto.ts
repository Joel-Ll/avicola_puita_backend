import { IsNotEmpty } from "class-validator";

export class GetRateDto {
  @IsNotEmpty()
  timeRange: number;
}