import { IsInt, IsNumber, Max, Min } from "class-validator";

export class RescheduleEventsDto {
  @IsNumber()
  @IsInt()
  @Max(10, {message: 'Ingrese un número entre -10, 10'})
  @Min(-10, {message: 'Ingrese un número entre -10, 10'})
  quantityDays: number;
}