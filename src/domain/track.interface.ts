import type { ChokeGroup } from '@/domain/choke-groups.enum.ts'

export interface Track {
  id: string
  name: string
  sampleUrl: string
  volume: number
  pan: number
  steps: boolean[]
  chokeGroup: ChokeGroup | null
}
