import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { UserRole } from "../interface/user.interface";

export type UserDocument = HydratedDocument<User>

@Schema({timestamps: true})
export class User {
  @Prop({
    type: String,
    required: true,
    trim: true
  })
  username: string;

  @Prop({
    type: String,
    default: null
  })
  email: string;

  @Prop({
    type: String,
    required: true
  })
  password: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Prop({
    type: Boolean,
    default: true
  })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);


