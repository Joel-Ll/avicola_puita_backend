import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';
import { OrderState, orderState } from "src/common/constants/order-state";

export type OrderDocument = HydratedDocument<Order>

@Schema({ timestamps: true, autoIndex: true })
export class Order {
  @Prop({
    type: Date,
    default: null,
  })
  deliveryDate: Date;

  @Prop({
    type: String,
    default: ''
  })
  orderCode: string;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: 'Customer'
  })
  customerId: Types.ObjectId;

  @Prop({
    type: [SchemaType.Types.ObjectId],
    ref: 'Item',
    default: []
  })
  orderItems: Types.ObjectId[]

  @Prop({ type: Number, default: 0 })
  totalAmount: number;

  @Prop({ type: Number, default: 0 })
  balance: number;

  @Prop({
    type: String,
    enum: Object.values(orderState),
    default: orderState.PENDING
  })
  state: OrderState;

  @Prop({
    type: Date,
    default: null
  })
  nextPay: Date
}

export const OrderSchema = SchemaFactory.createForClass(Order);