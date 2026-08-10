import type { Track } from '@/domain/track.interface.ts'

export interface PersistedState {
  tempo: number
  selectedTrack: number
  tracks: Track[]
}

export interface RuntimeState {
  isPlaying: boolean
  currentStep: number
}

export type GrooveBoxState = PersistedState & RuntimeState
