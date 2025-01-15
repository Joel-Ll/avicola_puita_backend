import { IsBoolean } from "class-validator";

export class ChangeEventStateDto {
  @IsBoolean()
  completed: boolean;
}