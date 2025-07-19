import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as SchemaType, Types } from "mongoose";

import type { Growth } from "../interfaces/health-management.interface";

export type HealthManagementDocument = HydratedDocument<HealthManagement>

@Schema({ timestamps: true })
export class HealthManagement {
  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: 'Shed',
    required: true
  })
  shed: Types.ObjectId

  @Prop({
    type: [{
      week: {type: Number},
      minWeight: {type: Number},
      maxWeight: {type: Number},
      currentWeight: {type: Number || null}
    }],
    default: []
  })
  reportGrowth: Array<Growth>
}

export const HealthManagementSchema = SchemaFactory.createForClass(HealthManagement)
