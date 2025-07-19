export const expenseCategory = {
  FEED: 'feed',
  HEALTH: 'health',
  TRANSPORT: 'transport',
  WAGES: 'wages',
  SERVICES: 'services',
  EQUIPMENT: 'equipment'
} as const

export type ExpenseCategory = typeof expenseCategory[keyof typeof expenseCategory]