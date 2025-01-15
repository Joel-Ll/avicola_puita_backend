import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { EventState, eventState } from "src/common/constants/event-state";

export type EventDocument = HydratedDocument<Event>

@Schema()
export class Event {
  @Prop({ required: true })
  date: Date;

  @Prop({ type: Number })
  week: number;

  @Prop({
    type: String,
    enum: Object.values(eventState),
    default: eventState.PENDING
  })
  state: EventState;

  @Prop({ type: String, required: true, trim: true })
  illness: string;

  @Prop({ type: String, required: true, trim: true })
  vaccine: string;

  @Prop({ type: String, required: true, trim: true })
  application: string;

  @Prop({ type: String, required: true, trim: true })
  directions: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);