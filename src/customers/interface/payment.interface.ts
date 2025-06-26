import {z} from 'zod';

export const paymentsSchema = z.array(z.object({
  order: z.object({
    orderCode: z.string(),
    customerId: z.object({
      name: z.string(),
    })
  }),
  amount: z.number(),
  method: z.string(),
  createdAt: z.date()
}));
