import type {Track} from '@/domain/track.interface.ts'

export interface GrooveBoxState {
  tempo: number
  selectedTrack: number
  tracks: Track[]
}
