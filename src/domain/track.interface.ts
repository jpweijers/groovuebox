import type { ChokeGroup } from '@/domain/choke-groups.enum.ts'
import type { TimeDivision } from '@/domain/time-division.interface.ts'

export interface Step {
  active: boolean
  velocity: number
}

export interface Track {
  id: string
  name: string
  sampleUrl: string
  volume: number
  pan: number
  swing: number
  swingDivision: 8 | 16
  offset: number
  pitch: number
  filter: number
  decay: number
  steps: Step[]
  chokeGroup: ChokeGroup | null
  muted: boolean
  distortion: number
  reverb: number
  delay: number
  delayFeedback: number
  delayDivision: TimeDivision
}
