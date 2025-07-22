import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';

export type EggRegisterDocument = HydratedDocument<EggRegister>

@Schema({
  timestamps: {
    currentTime: () => {
      const now = new Date();
      const boliviaOffset = -4 * 60 * 60 * 1000;
      return new Date(now.getTime() + boliviaOffset);
    },
  }
})
export class EggRegister {
  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: 'Shed'
  })
  shed: Types.ObjectId

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: 'Egg'
  })
  egg: Types.ObjectId

  @Prop({ type: Date })
  dateRegister: Date;

  @Prop({ type: Number, default: 0 })
  unitQuantity: number;

  @Prop({ type: Number, default: 0 })
  quantityPerBox: number;

  @Prop({ type: Number, default: 0 })
  totalQuantity: number;
}

export const EggRegisterSchema = SchemaFactory.createForClass(EggRegister)

