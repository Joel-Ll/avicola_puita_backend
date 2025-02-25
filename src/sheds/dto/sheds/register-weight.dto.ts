import { IsNumber, Max, Min } from "class-validator";

export class RegisterWeightDto {
  @IsNumber()
  @Min(2)
  @Max(32)
  week: number;

  @IsNumber()
  @Min(0)
  weight: number;
}