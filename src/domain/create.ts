import type { GrooveBoxState } from '@/domain/groovebox-state.interface.ts'
import type { Track } from '@/domain/track.interface.ts'

const tracks = [
  'Kick',
  'Snare',
  'Closed Hat',
  'Open Hat',
  'Track 5',
  'Track 6',
  'Track 7',
  'Track 8',
]

export function createGroovebox(): GrooveBoxState {
  return {
    selectedTrack: 0,
    tempo: 90,
    tracks: tracks.map(createTrack),
  }
}

function createTrack(name: string): Track {
  return {
    name,
    sampleUrl: '',
    volume: 100,
    steps: Array(16).fill(false),
  }
}
