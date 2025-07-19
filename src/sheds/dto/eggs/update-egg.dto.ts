import { IsNumber } from 'class-validator';

export class UpdateEggDto {
  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_price: number;

  @IsNumber()
  box_price: number;

}