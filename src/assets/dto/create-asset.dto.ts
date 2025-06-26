import { IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";

export class CreateAssetDto {
  @IsNotEmpty({ message: 'El nombre del activo es obligatorio' })
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity: number;
}


