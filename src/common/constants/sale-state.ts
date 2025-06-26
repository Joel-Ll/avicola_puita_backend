export const saleState = {
  INACTIVE: 'inactive',
  PENDING: 'pending',
  ONHOLD: 'onHold',
  DISPATCHED: 'dispatched',
  RECONCILING: 'reconciling',
  COMPLETED: 'completed',
  FINALIZED: 'finalized',
} as const

export type SaleState = typeof saleState[keyof typeof saleState]