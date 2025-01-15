import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';
import { ShedState, shedState } from 'src/common/constants/shed-state';

export type ShedDocument = HydratedDocument<Shed>

@Schema()
export class Shed {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    unique: true
  })
  slug: string;

  @Prop({
    type: String,
    enum: Object.values(shedState),
    default: shedState.INACTIVE
  })
  state: ShedState;

  @Prop({ default: null })
  initialDate: Date;

  @Prop({ default: 0 })
  initialStock: number;

  @Prop({ default: 0 })
  currentStock: number;

  @Prop({ default: 0 })
  lowsCount: number;

  @Prop({ default: 0 })
  sicksCount: number;

  @Prop({ default: 0 })
  recoveredCount: number;

  @Prop({
    type: SchemaType.Types.ObjectId,
    ref: 'VaccineControl',
    default: null
  })
  vaccineControl: Types.ObjectId;

  @Prop({ default: false })
  managed: boolean;
}

export const ShedShema = SchemaFactory.createForClass(Shed);
