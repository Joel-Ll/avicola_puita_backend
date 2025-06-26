import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';
import { EggDocument } from "src/sheds/schemas/egg.schema";

export type SaleItemDocument = HydratedDocument<SaleItem>

@Schema()
export class SaleItem {
  @Prop({
    type: SchemaType.ObjectId,
    ref: 'Egg'
  })
  idEgg: EggDocument | Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  totalQuantity: number;

  @Prop({ type: String, default: '' })
  detail: string;
}

export const SaleItemSchema = SchemaFactory.createForClass(SaleItem);