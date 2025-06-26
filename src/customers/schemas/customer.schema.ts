import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';

export type CustomerDocument = HydratedDocument<Customer>

@Schema({timestamps: true})
export class Customer {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    unique: true,
    required: true
  })
  phone: string;

  @Prop({
    type: String,
    required: true
  })
  address: string;

  @Prop({
    type: [SchemaType.Types.ObjectId],
    ref: 'Order',
    default: []
  })
  orders: Types.ObjectId[]
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
