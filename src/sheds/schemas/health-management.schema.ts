import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as SchemaType, Types } from "mongoose";

import type { DateRange, Growth, HealtReport, TimeLineHealth } from "../interfaces/health-management.interface";

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
    type: {
      lowsCount: { type: Number },
      lowsObsCount: { type: Number },
      sicksCount: { type: Number },
      recoveredCount: { type: Number },
      tasaLow: { type: Number },
      tasaLowObs: { type: Number },
      tasaSick: { type: Number },
      tasaRecovered: { type: Number },
    },
    default: {
      lowsCount: 0,
      lowsObsCount: 0,
      sicksCount: 0,
      recoveredCount: 0,
      tasaLow: 0,
      tasaLowObs: 0,
      tasaSick: 0,
      tasaRecovered: 0,
    }
  })
  reportHealth: HealtReport

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

  @Prop({
    type: [{
      month: { type: String },
      lowsCount: { type: Number },
      lowsObsCount: { type: Number },
      sicksCount: { type: Number },
      recoveredCount: { type: Number },
    }],
    default: []
  })
  timeLineHealth: Array<TimeLineHealth>

  @Prop({
    type: {
      fromDate: { type: Date },
      toDate: { type: Date },
    },
    default: {
      fromDate: null,
      toDate: null
    }
  })
  dateRange: DateRange;
}

export const HealthManagementSchema = SchemaFactory.createForClass(HealthManagement)
