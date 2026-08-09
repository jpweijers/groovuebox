export const ChokeGroup = {
  One: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  None: null,
} as const

export type ChokeGroup = (typeof ChokeGroup)[keyof typeof ChokeGroup]
