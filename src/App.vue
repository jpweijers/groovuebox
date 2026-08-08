<script setup lang="ts">
import Sequencer from '@/components/Sequencer.vue'
import { useGroovebox } from '@/composables/useGroovebox.ts'
import TrackSelector from '@/components/TrackSelector.vue'
import TransportControls from '@/components/TransportControls.vue'
import { audioEngine } from '@/audio/AudioEngine.ts'

const { state, selectTrack, toggleStep, clearSelectedTrack } = useGroovebox()

async function testKick() {
  await audioEngine.loadSamples([{ id: '1', url: '/samples/kick.wav' }])
  audioEngine.playSample('1')
}
</script>

<template>
  <div class="groovebox">
    <button @click="testKick()">Boom!</button>
    <header>
      <h1>Groovue</h1>
      <span>Vue Groovebox</span>
    </header>

    <TransportControls />

    <TrackSelector
      :tracks="state.tracks"
      :selected="state.selectedTrack"
      @selected="(index: number) => selectTrack(index)"
    />

    <Sequencer
      :track="state.tracks[state.selectedTrack]!"
      :current-step="state.currentStep"
      @toggle="(index: number) => toggleStep(index)"
      @clear="clearSelectedTrack()"
    />
  </div>
</template>

<style scoped>
.groovebox {
  width: min(1100px, calc(100vw - 64px));
  margin: 48px auto;
  padding: 28px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow:
    0 24px 60px rgb(0 0 0 / 40%),
    inset 0 1px rgb(255 255 255 / 5%);
}
</style>
