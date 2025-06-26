import {z} from 'zod';

export const orderPrintSchema = z.array(z.object({
  orderCode: z.string(),
  customerId: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
  }),
  orderItems: z.array(z.object({
    detail: z.string()
  })),
  totalAmount: z.number(),
  balance: z.number()
}));

export type TOrderPrint = z.infer<typeof orderPrintSchema>
