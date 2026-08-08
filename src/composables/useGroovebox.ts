import { createGroovebox } from '@/domain/create.ts'
import { ref } from 'vue'
import type { GrooveBoxState } from '@/domain/groovebox-state.interface.ts'

const state = ref<GrooveBoxState>(createGroovebox())

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

  return {
    state,
    selectTrack,
    toggleStep,
    clearSelectedTrack,
  }
}
