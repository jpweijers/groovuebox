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
import type { TimeDivision } from '@/domain/time-division.interface.ts'

const persistedState = useStorage<PersistedState>('groovebox', createGroovebox())
const runtimeState = ref<RuntimeState>({ isPlaying: false, currentStep: 0, soloedTrackIds: [] })

for (const track of persistedState.value.tracks) {
  track.swing ??= 50
  track.swingDivision ??= 8
  track.offset ??= 0
  track.pitch ??= 0
  track.decay ??= 2_000
  track.filter ??= 20_000
  track.distortion ??= 0
  track.reverb ??= 0
  track.delay ??= 0
  track.delayFeedback ??= 0.35
  track.delayDivision ??= '1/4'
  track.bitDepth ??= 16
  track.sampleRateReduction ??= 0
}

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
      track.steps[index]!.active = !track.steps[index]!.active
    }
  }

  function clearTrackSequence(id: string) {
    const track = findTrack(id)
    if (!track) return
    for (const step of track.steps) {
      step.active = false
    }
  }

  async function resetAllTracks(): Promise<void> {
    scheduler.stop()
    await audioEngine.close()

    samplesLoaded = false

    persistedState.value = createGroovebox()
    runtimeState.value = {
      isPlaying: false,
      currentStep: 0,
      soloedTrackIds: [],
    }
  }

  function resetTrackVelocities(id: string) {
    const track = findTrack(id)
    if (!track) return
    for (const step of track.steps) {
      step.velocity = 1
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
        audioEngine.setTrackDistortion(track.id, track.distortion)
        audioEngine.setTrackFilter(track.id, track.filter)
        audioEngine.setTrackReverb(track.id, track.reverb)
        audioEngine.setTrackDelay(track.id, track.delay)
        audioEngine.setTrackDelayFeedback(track.id, track.delayFeedback)
        audioEngine.setTrackDelayTime(track.id, track.delayDivision)
      }
    }

    samplesLoaded = true
  }

  async function play(): Promise<void> {
    if (runtimeState.value.isPlaying) return

    await audioEngine.resume()
    await loadSamples()
    _syncAudibleTracks()

    runtimeState.value.isPlaying = true
    scheduler.start()
  }

  async function stop(): Promise<void> {
    scheduler.stop()
    audioEngine.stop()
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
    audioEngine.setBpm(bpm)
  }

  function toggleMute(id: string): void {
    const track = findTrack(id)
    if (track) {
      track.muted = !track.muted
    }
    _syncAudibleTracks()
  }

  function toggleSolo(id: string): void {
    const soloedTrack = runtimeState.value.soloedTrackIds.find((track) => track === id)

    runtimeState.value.soloedTrackIds = soloedTrack ? [] : [id]

    _syncAudibleTracks()
  }

  function isTrackSoloed(id: string): boolean {
    const track = findTrack(id)
    if (track) {
      return runtimeState.value.soloedTrackIds.includes(track.id)
    }
    return false
  }

  function setTrackVelocity(id: string, step: number, velocity: number): void {
    const track = findTrack(id)
    if (track) {
      track.steps[step]!.velocity = velocity
    }
  }

  function setTrackSwing(id: string, swing: number): void {
    const track = findTrack(id)
    if (track) {
      track.swing = swing
    }
  }

  function setTrackSwingDivision(id: string, swingDivision: 8 | 16): void {
    const track = findTrack(id)
    if (track) {
      track.swingDivision = swingDivision
    }
  }

  function setTrackOffset(id: string, offset: number): void {
    const track = findTrack(id)
    if (track) {
      track.offset = offset
    }
  }

  function setTrackPitch(id: string, pitch: number): void {
    const track = findTrack(id)
    if (track) {
      track.pitch = pitch
    }
  }

  function setTrackDecay(id: string, decay: number): void {
    const track = findTrack(id)
    if (track) {
      track.decay = decay
    }
  }

  function setTrackFilter(id: string, filter: number): void {
    const track = findTrack(id)
    if (track) {
      track.filter = filter
      audioEngine.setTrackFilter(track.id, track.filter)
    }
  }

  function setTrackDistortion(id: string, amount: number): void {
    const track = findTrack(id)
    if (track) {
      track.distortion = amount
      audioEngine.setTrackDistortion(track.id, track.distortion)
    }
  }

  function setTrackReverb(id: string, amount: number): void {
    const track = findTrack(id)
    if (track) {
      track.reverb = amount
      audioEngine.setTrackReverb(track.id, track.reverb)
    }
  }

  function setTrackDelay(id: string, delay: number): void {
    const track = findTrack(id)
    if (track) {
      track.delay = delay
      audioEngine.setTrackDelay(id, delay)
    }
  }

  function setTrackDelayFeedback(id: string, feedback: number): void {
    const track = findTrack(id)
    if (track) {
      track.delayFeedback = feedback
      audioEngine.setTrackDelayFeedback(id, feedback)
    }
  }

  function setTrackDelayTime(id: string, time: TimeDivision): void {
    const track = findTrack(id)
    if (track) {
      track.delayDivision = time
      audioEngine.setTrackDelayTime(track.id, time)
    }
  }

  function setTrackBitDepth(id: string, bitDepth: number): void {
    const track = findTrack(id)
    if (track) {
      track.bitDepth = bitDepth
      audioEngine.setTrackBitDepth(track.id, track.bitDepth)
    }
  }

  function setTrackSampleRateReduction(id: string, sampleRateReduction: number): void {
    const track = findTrack(id)
    if (track) {
      track.sampleRateReduction = sampleRateReduction
      audioEngine.setTrackSampleRateReduction(id, track.sampleRateReduction)
    }
  }

  function _syncAudibleTracks(): void {
    for (const track of persistedState.value.tracks) {
      audioEngine.setTrackMute(track.id, !_isTrackAudible(track))
    }
  }

  function _isTrackAudible(track: Track): boolean {
    const soloedIds = runtimeState.value.soloedTrackIds

    return soloedIds.length > 0 ? soloedIds.includes(track.id) : !track.muted
  }

  return {
    state,
    selectTrack,
    toggleStep,
    clearTrackSequence,
    resetAllTracks,
    resetTrackVelocities,
    loadSamples,
    play,
    stop,
    setTrackVolume,
    setTrackChokeGroup,
    setTrackPan,
    setBpm,
    toggleMute,
    toggleSolo,
    isTrackSoloed,
    setTrackVelocity,
    setTrackSwing,
    setTrackOffset,
    setTrackSwingDivision,
    setTrackPitch,
    setTrackDecay,
    setTrackFilter,
    setTrackDistortion,
    setTrackReverb,
    setTrackDelay,
    setTrackDelayFeedback,
    setTrackDelayTime,
    setTrackBitDepth,
    setTrackSampleRateReduction
  }
}
