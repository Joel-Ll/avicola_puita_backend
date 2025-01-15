export const eventState = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  EXPIRED: 'expired'
} as const

export type EventState = typeof eventState[keyof typeof eventState]