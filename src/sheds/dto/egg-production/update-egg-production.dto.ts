import { PartialType } from "@nestjs/mapped-types";
import { RegisterEggProductionDto } from "./register-egg-production.dto";

export class UpdateEggProductionDto extends PartialType(RegisterEggProductionDto) { }