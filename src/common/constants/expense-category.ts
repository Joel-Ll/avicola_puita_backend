export const expenseCategory = {
  FEED: 'feed',
  HEALTH: 'health',
  TRANSPORT: 'transport',
  WAGES: 'wages',
  SERVICES: 'services',
  INFRASTRUCTURE: 'infrastructure'
} as const

export type ExpenseCategory = typeof expenseCategory[keyof typeof expenseCategory]