import { IsDate, IsNotEmpty } from "class-validator";

export class UpdateSaleDto {
  @IsNotEmpty({message: 'La fecha de venta es obligatorio'})
  @IsDate({ message: 'Fecha no válida' })
  saleDate: Date;

  @IsNotEmpty({message: 'El nombre del responsable es obligatorio'})
  agent: string;

  @IsNotEmpty({message: 'El lugar de envío es obligatorio'})
  sending: string;
}
