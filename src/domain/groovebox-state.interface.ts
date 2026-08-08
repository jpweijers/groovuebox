import type { Track } from '@/domain/track.interface.ts'

export interface GrooveBoxState {
  tempo: number
  isPlaying: boolean
  currentStep: number
  selectedTrack: number
  tracks: Track[]
}
