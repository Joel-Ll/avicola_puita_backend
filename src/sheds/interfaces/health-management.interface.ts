import z from 'zod';

export type HealtReport = {
  lowsCount: number,
  lowsObsCount: number,
  sicksCount: number,
  recoveredCount: number,
  tasaLow: number,
  tasaLowObs: number,
  tasaSick: number,
  tasaRecovered: number,
}

export type Growth = {
  week: number,
  minWeight: number,
  maxWeight: number,
  currentWeight: number | null,
}

export type DateRange = {
  fromDate: Date | null,
  toDate: Date | null
}

export type TimeLineHealth = {
  month: string,
  lowsCount: number,
  lowsObsCount: number,
  sicksCount: number,
  recoveredCount: number,
}

export const eventsSchemas = z.array(z.object({
  shedId: z.object({
    name: z.string()
  }),
  vaccine: z.string(),
  illness: z.string(),
  date: z.date(),
  application: z.string(),
}))