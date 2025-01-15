import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';

export type VaccineControlDocument = HydratedDocument<VaccineControl>;

@Schema()
export class VaccineControl {
  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: 'Shed'
  })
  shed: Types.ObjectId

  @Prop({ type: String, required: true })
  adviser: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, required: true })
  geneticLine: string;

  @Prop({ type: String, required: true })
  origin: string;

  @Prop({
    type: [SchemaType.Types.ObjectId],
    ref: 'Event',
    default: []
  })
  events: Types.ObjectId[];
}

export const VaccineControlSchema = SchemaFactory.createForClass(VaccineControl);
