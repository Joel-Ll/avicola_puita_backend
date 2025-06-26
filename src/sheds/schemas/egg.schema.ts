import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { eggSizes } from 'src/common/constants/egg-size';

export type EggDocument = HydratedDocument<Egg>

@Schema()
export class Egg {
  @Prop({
    type: String,
    enum: Object.values(eggSizes),
  })
  size: string;

  @Prop({ type: Number })
  quantity: number;

  @Prop({ type: Number, default: 0 })
  unit_price: number;

  @Prop({ type: Number, default: 0})
  box_price: number;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Number })
  sizeOrder: number;
}

export const EggSchema = SchemaFactory.createForClass(Egg);