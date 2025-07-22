import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';

export type CustomerDocument = HydratedDocument<Customer>

@Schema({
  timestamps: {
    currentTime: () => {
      const now = new Date();
      const boliviaOffset = -4 * 60 * 60 * 1000;
      return new Date(now.getTime() + boliviaOffset);
    },
  }
})
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
