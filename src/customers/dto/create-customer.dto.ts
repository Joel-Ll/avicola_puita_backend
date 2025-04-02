import { IsNotEmpty } from "class-validator";

export class CreateCustomerDto {
  @IsNotEmpty({message: 'El nombre es obligatorio'})
  name: string;

  @IsNotEmpty({message: 'El numero de teléfono es obligatorio'})
  phone: string;

  @IsNotEmpty({message: 'La dirección es obligatoria'})
  address: string;
}
