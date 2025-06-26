export const methodToPay = {
  QR: 'QR',
  EFECTIVO: 'EFECTIVO',
} as const

export type MethodToPay = typeof methodToPay[keyof typeof methodToPay]
