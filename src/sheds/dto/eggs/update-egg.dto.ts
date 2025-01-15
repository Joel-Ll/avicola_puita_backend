import { IsNumber,  } from 'class-validator';

export class UpdateEggDto {
  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}