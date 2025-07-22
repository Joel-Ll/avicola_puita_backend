import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';

export type RecoveredDocument = HydratedDocument<Recovered>

@Schema({
  timestamps: {
    currentTime: () => {
      const now = new Date();
      const boliviaOffset = -4 * 60 * 60 * 1000;
      return new Date(now.getTime() + boliviaOffset);
    },
  }
})
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
