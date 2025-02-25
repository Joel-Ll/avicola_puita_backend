import { IsInt, IsNumber, Max, Min } from "class-validator";

export class RescheduleEventsDto {
  @IsNumber()
  @IsInt()
  @Max(10)
  @Min(-10)
  quantityDays: number;
}