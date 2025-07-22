import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ExpenseCategory, expenseCategory } from 'src/common/constants/expense-category';

export type ExpenseDocument = HydratedDocument<Expense>

@Schema({
  timestamps: {
    currentTime: () => {
      const now = new Date();
      const boliviaOffset = -4 * 60 * 60 * 1000;
      return new Date(now.getTime() + boliviaOffset);
    },
  }
})
export class Expense {
  @Prop({
    type: String,
    enum: Object.values(expenseCategory),
  })
  category: ExpenseCategory;

  @Prop({
    type: String,
    required: true,
    trim: true
  })
  description: string

  @Prop({
    type: Number,
    required: true,
  })
  amount: number;

  @Prop({
    type: Date,
    required: true
  })
  date: Date
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
