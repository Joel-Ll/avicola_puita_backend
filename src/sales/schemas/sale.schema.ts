import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';
import { SaleState, saleState } from "src/common/constants/sale-state";

export type SaleDocument = HydratedDocument<Sale>

@Schema({ timestamps: true })
export class Sale {
  @Prop({
    type: Date,
    default: null
  })
  saleDate: Date;

  @Prop({ type: String, default: '' })
  saleCode: string;

  @Prop({ type: String, default: '' })
  agent: string;

  @Prop({ type: String, default: '' })
  sending: string;

  @Prop({ type: Number, default: 0 })
  soldTotalPrice: number;

  @Prop({ type: Array, default: [] })
  detailSold: string[]

  @Prop({
    type: String,
    enum: Object.values(saleState),
    default: saleState.INACTIVE
  })
  state: SaleState;

  @Prop({
    type: [SchemaType.Types.ObjectId],
    ref: 'SaleItem',
    default: []
  })
  saleItems: Types.ObjectId[]
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
