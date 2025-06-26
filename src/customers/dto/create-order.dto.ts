import { IsMongoId } from "class-validator";

export class CreateOrderDto {
  @IsMongoId({ message: 'ID no válido' })
  idCustomer: string;
}