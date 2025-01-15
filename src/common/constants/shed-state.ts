export const shedState = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  UNDER_REVIEW: 'underReview',
  UNDER_MAINTENANCE: 'underMaintenance'
} as const

export type ShedState = typeof shedState[keyof typeof shedState]


