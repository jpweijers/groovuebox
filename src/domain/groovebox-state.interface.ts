import type { Track } from '@/domain/track.interface.ts'

export interface Compression {
  threshold: number
  ratio: number
  attack: number
  release: number
}

export interface PersistedState {
  tempo: number
  selectedTrack: number
  tracks: Track[]
  compression: Compression
}

export interface RuntimeState {
  isPlaying: boolean
  currentStep: number
  soloedTrackIds: string[]
}

export type GrooveBoxState = PersistedState & RuntimeState
