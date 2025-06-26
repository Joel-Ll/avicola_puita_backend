import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';
import { EggDocument } from "src/sheds/schemas/egg.schema";

export type ItemDocument = HydratedDocument<Item>

@Schema()
export class Item {
  @Prop({
    type: SchemaType.ObjectId,
    ref: 'Egg'
  })
  idEgg: EggDocument | Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  unitQuantity: number;

  @Prop({ type: Number, default: 0 })
  quantityPerBox: number;

  @Prop({ type: String, default: '' })
  detail: string;

  @Prop({ type: Number, default: 0 })
  totalPrice: number;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

