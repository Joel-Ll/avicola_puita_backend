import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';

export type LowDocument = HydratedDocument<Low>

@Schema({
  timestamps: {
    currentTime: () => {
      const now = new Date();
      const boliviaOffset = -4 * 60 * 60 * 1000;
      return new Date(now.getTime() + boliviaOffset);
    },
  }
})
export class Low {
  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: 'Shed'
  })
  shedId: Types.ObjectId

  @Prop({ type: String, default: 'Bajas' })
  type: string;

  @Prop()
  quantity: number;

  @Prop({
    required: true,
    default: false
  })
  sick: boolean;

  @Prop()
  dateRegister: Date;

  createdAt?: Date;
}

export const LowSchema = SchemaFactory.createForClass(Low);