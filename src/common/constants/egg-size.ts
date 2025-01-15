export const eggSizes = {
  C: 'C',
  M: 'M',
  G: 'G',
  EX: 'EX',
  S: 'S',
  R: 'R'
} as const

export type EggSize = typeof eggSizes[keyof typeof eggSizes];

export const initialEggs = [
  {
    size: 'C',
    price: 0,
    description: 'Huevos chicos',
    quantity: 0,
    sizeOrder: 1,
  },
  {
    size: 'M',
    price: 0,
    description: 'Huevos medianos',
    quantity: 0,
    sizeOrder: 2,
  },
  {
    size: 'G',
    price: 0,
    description: 'Huevos grandes',
    quantity: 0,
    sizeOrder: 3,
  },
  {
    size: 'EX',
    price: 0,
    description: 'Huevos extra grandes',
    quantity: 0,
    sizeOrder: 4,
  },
  {
    size: 'S',
    price: 0,
    description: 'Huevos super grandes',
    quantity: 0,
    sizeOrder: 5,
  },
  {
    size: 'R',
    price: 0,
    description: 'Huevos rotos',
    quantity: 0,
    sizeOrder: 6,
  },
]