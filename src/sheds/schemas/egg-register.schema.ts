import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';
import { eggSizes } from 'src/common/constants/egg-size';

export type EggRegisterDocument = HydratedDocument<EggRegister>

@Schema({timestamps: true})
export class EggRegister {
  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: 'Shed'
  })
  shedId: Types.ObjectId

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: 'Egg'
  })
  eggId: Types.ObjectId

  @Prop({type: String})
  shedName: string;

  @Prop({ type: Date })
  dateRegister: Date;

  @Prop({
    type: String,
    enum: Object.values(eggSizes),
  })
  size: string;

  @Prop({ type: Number })
  quantity: number;
}

export const EggRegisterSchema = SchemaFactory.createForClass(EggRegister)

