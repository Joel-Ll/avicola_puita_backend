import { z } from 'zod';

export const salePrintSchema = z.object({
  saleDate: z.date(),
  saleCode: z.string(),
  agent: z.string(),
  sending: z.string(),
  saleItems: z.array(
    z.object({
      idEgg: z.object({
        unit_price: z.number(),
        box_price: z.number()
      }),
      detail: z.string(),
    })
  ),
  detailSold: z.array(z.object({})),
});

export type TSalePrint = z.infer<typeof salePrintSchema>