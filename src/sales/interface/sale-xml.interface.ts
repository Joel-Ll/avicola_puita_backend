import {z} from 'zod';

export const saleXmlSchema = z.array(z.object({
  idSale: z.object({
    saleCode: z.string(),
    agent: z.string(),
  }),
  idEgg: z.object({size: z.string()}),
  amount: z.number(),
  method: z.string(),
  unitQuantity: z.number(),
  quantityPerBox: z.number(),
  observation: z.string(),
  createdAt: z.date()
}));
