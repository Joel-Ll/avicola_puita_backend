import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AssetDocument = HydratedDocument<Asset>

@Schema({timestamps: true})
export class Asset {
  @Prop({
    type: String,
    required: true,
  })
  name: string; 

  @Prop({
    required: true,
    unique: true
  })
  slug: string;

  @Prop({
    type: Number,
    default: 0
  })
  quantity: number;

  updatedAt?: Date;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);
