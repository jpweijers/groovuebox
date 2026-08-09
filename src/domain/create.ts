import type { GrooveBoxState } from '@/domain/groovebox-state.interface.ts'
import type { Track } from '@/domain/track.interface.ts'

interface CreateTrackInput {
  name: string
  url?: string
  chokeGroup?: string
}

const tracks: CreateTrackInput[] = [
  { name: 'Kick', url: '/samples/kick.wav' },
  { name: 'Snare', url: '/samples/snare.wav' },
  { name: 'Close Hat', url: '/samples/hh.wav', chokeGroup: 'hats' },
  { name: 'Open Hat', url: '/samples/oh.wav', chokeGroup: 'hats' },
  { name: 'Track 5' },
  { name: 'Track 6' },
  { name: 'Track 7' },
  { name: 'Track 8' },
]

export function createGroovebox(): GrooveBoxState {
  return {
    isPlaying: false,
    currentStep: 0,
    selectedTrack: 0,
    tempo: 90,
    tracks: tracks.map(createTrack),
  }
}

function createTrack({ name, url, chokeGroup }: CreateTrackInput): Track {
  return {
    id: self.crypto.randomUUID(),
    name,
    sampleUrl: url ?? '',
    volume: 1,
    steps: Array(16).fill(false),
    chokeGroup,
  }
}
