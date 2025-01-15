import { PartialType } from "@nestjs/mapped-types";
import { CreateVaccineControlDto } from "./create-vaccine-control.dto";

export class UpdateVaccineControlDto extends PartialType(CreateVaccineControlDto) {}