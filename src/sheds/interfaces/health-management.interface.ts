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