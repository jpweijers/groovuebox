import { createGroovebox } from '@/domain/create.ts'
import type {
  GrooveBoxState,
  PersistedState,
  RuntimeState,
} from '@/domain/groovebox-state.interface.ts'
import { SequencerScheduler } from '@/audio/SequenceScheduler.ts'
import { audioEngine } from '@/audio/AudioEngine.ts'
import type { ChokeGroup } from '@/domain/choke-groups.enum.ts'
import type { Track } from '@/domain/track.interface.ts'
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'

const persistedState = useStorage<PersistedState>('groovebox', createGroovebox())
const runtimeState = ref<RuntimeState>({ isPlaying: false, currentStep: 0 })

const state = computed<GrooveBoxState>(() => ({ ...persistedState.value, ...runtimeState.value }))

const scheduler = new SequencerScheduler({
  getTempo: () => persistedState.value.tempo,
  getTracks: () => persistedState.value.tracks,
  onStep: (step: number) => {
    runtimeState.value.currentStep = step
  },
})
let samplesLoaded = false

export function useGroovebox() {
  function selectTrack(index: number) {
    persistedState.value.selectedTrack = index
  }

  function toggleStep(id: string, index: number) {
    const track = findTrack(id)
    if (track) {
      track.steps[index] = !track.steps[index]
    }
  }

  function clearTrackSequence(id: string) {
    const track = findTrack(id)
    if (track) {
      track.steps.fill(false)
    }
  }

  async function loadSamples(): Promise<void> {
    if (samplesLoaded) return

    const definitions = persistedState.value.tracks
      .filter((track) => track.sampleUrl)
      .map((track) => ({ id: track.id, url: track.sampleUrl }))

    await audioEngine.loadSamples(definitions)

    for (const track of persistedState.value.tracks) {
      if (track.sampleUrl) {
        audioEngine.setTrackVolume(track.id, track.volume)
        audioEngine.setTrackPan(track.id, track.pan)
      }
    }

    samplesLoaded = true
  }

  async function play(): Promise<void> {
    if (runtimeState.value.isPlaying) return

    await audioEngine.resume()
    await loadSamples()

    runtimeState.value.isPlaying = true
    scheduler.start()
  }

  async function stop(): Promise<void> {
    scheduler.stop()
    runtimeState.value.isPlaying = false
  }

  function findTrack(id: string): Track | undefined {
    return persistedState.value.tracks.find((track) => track.id === id)
  }

  function setTrackVolume(id: string, volume: number): void {
    const track = findTrack(id)
    if (track) {
      track.volume = volume
      audioEngine.setTrackVolume(track.id, volume)
    }
  }

  function setTrackChokeGroup(id: string, chokeGroup: ChokeGroup): void {
    const track = findTrack(id)
    if (track) {
      track.chokeGroup = chokeGroup
    }
  }

  function setTrackPan(id: string, pan: number): void {
    const track = findTrack(id)
    if (track) {
      track.pan = pan
      audioEngine.setTrackPan(track.id, track.pan)
    }
  }

  function setBpm(bpm: number): void {
    persistedState.value.tempo = Math.min(240, Math.max(40, Math.round(bpm)))
  }

  return {
    state,
    selectTrack,
    toggleStep,
    clearTrackSequence,
    loadSamples,
    play,
    stop,
    setTrackVolume,
    setTrackChokeGroup,
    setTrackPan,
    setBpm,
  }
}
