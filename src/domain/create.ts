import type { PersistedState } from '@/domain/groovebox-state.interface.ts'
import type { Track } from '@/domain/track.interface.ts'
import type { ChokeGroup } from '@/domain/choke-groups.enum.ts'

interface CreateTrackInput {
  name: string
  url?: string
  chokeGroup?: ChokeGroup
}

const tracks: CreateTrackInput[] = [
  { name: 'Kick', url: '/samples/kick.wav' },
  { name: 'Snare', url: '/samples/snare.wav' },
  { name: 'Close Hat', url: '/samples/hh.wav', chokeGroup: 1 },
  { name: 'Open Hat', url: '/samples/oh.wav', chokeGroup: 1 },
  { name: 'Jazz', url: '/samples/jazz.wav' },
  { name: 'Bass', url: '/samples/bass_80_gm.wav' },
  { name: 'Track 7' },
  { name: 'Track 8' },
]

export function createGroovebox(): PersistedState {
  return {
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
    pan: 0,
    swing: 50,
    swingDivision: 8,
    offset: 0,
    steps: Array.from({ length: 16 }, () => ({ active: false, velocity: 1 })),
    chokeGroup: chokeGroup ?? null,
    muted: false,
    decay: 2000,
    filter: 20_000,
    pitch: 0,
    distortion: 0,
    reverb: 0,
    delay: 0,
    delayFeedback: 0,
    delayDivision: '1/4',
  }
}
