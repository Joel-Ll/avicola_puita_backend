import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';

export type SickDocument = HydratedDocument<Sick>

@Schema({
  timestamps: {
    currentTime: () => {
      const now = new Date();
      const boliviaOffset = -4 * 60 * 60 * 1000;
      return new Date(now.getTime() + boliviaOffset);
    },
  }
})
export class Sick {
  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: 'Shed'
  })
  shedId: Types.ObjectId

  @Prop({ type: String, default: 'En observación' })
  type: string;

  @Prop()
  quantity: number;

  @Prop()
  dateRegister: Date;

  createdAt?: Date;
}

export const SickSchema = SchemaFactory.createForClass(Sick);