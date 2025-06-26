export const orderState = {
  PENDING: 'pending',
  TO_PAY: 'to_pay',
  COMPLETED: 'completed',
  FINALIZED: 'finalized'
} as const

export type OrderState = typeof orderState[keyof typeof orderState]