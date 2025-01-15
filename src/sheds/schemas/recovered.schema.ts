import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';

export type RecoveredDocument = HydratedDocument<Recovered>

@Schema({ timestamps: true })
export class Recovered {
  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: 'Shed'
  })
  shedId: Types.ObjectId

  @Prop({ type: String, default: 'Recuperados' })
  type: string;

  @Prop({ type: Number })
  quantity: number;

  @Prop({ type: Date })
  dateRegister: Date;

  createdAt?: Date;
}

export const RecoveredSchema = SchemaFactory.createForClass(Recovered);
