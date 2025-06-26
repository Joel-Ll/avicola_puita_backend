import { IsNotEmpty } from "class-validator";

export class SummaryFinancialDto {
  @IsNotEmpty()
  timeRange: number;
}