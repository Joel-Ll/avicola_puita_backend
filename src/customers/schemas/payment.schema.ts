import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';
import { methodToPay } from "src/common/constants/method-to-pay";

export type PaymentDocument = HydratedDocument<Payment>

@Schema({timestamps: true})
export class Payment {
  @Prop({
    type: SchemaType.ObjectId,
    ref: 'Order'
  })
  order: Types.ObjectId;

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

  createdAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);