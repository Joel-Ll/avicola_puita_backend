import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';
import { methodToPay } from "src/common/constants/method-to-pay";
import { EggDocument } from "src/sheds/schemas/egg.schema";

export type ProductSaleDocument = HydratedDocument<ProductSold>

@Schema({ timestamps: true })
export class ProductSold {
  @Prop({
    type: SchemaType.ObjectId,
    ref: 'Sale'
  })
  idSale: Types.ObjectId;

  @Prop({
    type: SchemaType.ObjectId,
    ref: 'Egg'
  })
  idEgg: EggDocument | Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  unitQuantity: number;

  @Prop({ type: Number, default: 0 })
  quantityPerBox: number;

  @Prop({
    type: Number,
    required: true,
  })
  amount: number;

  @Prop({
    type: String,
    enum: Object.values(methodToPay),
    required: true
  })
  method: string;

  @Prop({ type: String, default: '' })
  observation: string;

  createdAt?: Date;
}

export const ProductSoldSchema = SchemaFactory.createForClass(ProductSold);