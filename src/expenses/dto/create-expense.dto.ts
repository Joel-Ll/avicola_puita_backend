import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, Min, MinLength, min } from "class-validator";
import { ExpenseCategory, expenseCategory } from "src/common/constants/expense-category";

export class CreateExpenseDto {
  @IsNotEmpty({message: 'La categoría es obligatoria'})
  @IsEnum(expenseCategory, {message: 'Categoría no válida'})
  category: ExpenseCategory;

  @IsNotEmpty({message: 'La descripción es obligatoria'})
  description: string

  @IsNumber()
  @Min(1, {message: 'El costo debe ser mayor a 0'})
  amount: number;

  @Type(() => Date)
  @IsDate({ message: 'Fecha no válida' })
  date: Date
}
