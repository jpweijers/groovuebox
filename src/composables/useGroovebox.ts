import { createGroovebox } from '@/domain/create.ts'
import { ref } from 'vue'
import type { GrooveBoxState } from '@/domain/groovebox-state.interface.ts'
import { SequencerScheduler } from '@/audio/SequenceScheduler.ts'
import { audioEngine } from '@/audio/AudioEngine.ts'
import type { ChokeGroup } from '@/domain/choke-groups.enum.ts'
import type { Track } from '@/domain/track.interface.ts'

const state = ref<GrooveBoxState>(createGroovebox())
const scheduler = new SequencerScheduler({
  getTempo: () => state.value.tempo,
  getTracks: () => state.value.tracks,
  onStep: (step: number) => {
    state.value.currentStep = step
  },
})
let samplesLoaded = false

export function useGroovebox() {
  function selectTrack(index: number) {
    state.value.selectedTrack = index
  }

  function toggleStep(index: number) {
    const track = state.value.tracks[state.value.selectedTrack]
    if (track) {
      track.steps[index] = !track.steps[index]
    }
  }

  function clearSelectedTrack() {
    const track = state.value.tracks[state.value.selectedTrack]
    if (track) {
      track.steps.fill(false)
    }
  }

  async function loadSamples(): Promise<void> {
    if (samplesLoaded) return

    const definitions = state.value.tracks
      .filter((track) => track.sampleUrl)
      .map((track) => ({ id: track.id, url: track.sampleUrl }))

    await audioEngine.loadSamples(definitions)

    for (const track of state.value.tracks) {
      if (track.sampleUrl) {
        audioEngine.setTrackVolume(track.id, track.volume)
        audioEngine.setTrackPan(track.id, track.pan)
      }
    }

    samplesLoaded = true
  }

  async function play(): Promise<void> {
    if (state.value.isPlaying) return

    await audioEngine.resume()
    await loadSamples()

    state.value.isPlaying = true
    scheduler.start()
  }

  async function stop(): Promise<void> {
    scheduler.stop()
    state.value.isPlaying = false
  }

  function changeChokeGroup(chokeGroup: ChokeGroup): void {
    const track = state.value.tracks[state.value.selectedTrack]
    if (track) {
      track.chokeGroup = chokeGroup
    }
  }

  function setCurrentTrackVolume(volume: number): void {
    const track = state.value.tracks[state.value.selectedTrack]
    if (track) {
      track.volume = volume
      audioEngine.setTrackVolume(track.id, volume)
    }
  }

  function findTrack(id: string): Track | undefined {
    return state.value.tracks.find((track) => track.id === id)
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

  return {
    state,
    selectTrack,
    toggleStep,
    clearSelectedTrack,
    loadSamples,
    play,
    stop,
    changeChokeGroup,
    setCurrentTrackVolume,
    setTrackVolume,
    setTrackChokeGroup,
    setTrackPan,
  }
}
