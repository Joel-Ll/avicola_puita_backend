import { IsNotEmpty } from "class-validator";

export class SummaryEggRegistersDto {
  @IsNotEmpty()
  shed: string;

  @IsNotEmpty()
  timeRange: number;
}