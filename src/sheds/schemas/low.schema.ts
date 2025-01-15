import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';

export type LowDocument = HydratedDocument<Low>

@Schema({ timestamps: true })
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