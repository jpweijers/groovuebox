<script setup lang="ts">
import Sequencer from '@/components/Sequencer.vue'
import { useGroovebox } from '@/composables/useGroovebox.ts'
import TransportControls from '@/components/TransportControls.vue'
import Mixer from '@/components/Mixer.vue'
import { ref } from 'vue'
import BpmCalculator from '@/components/BpmCalculator.vue'

const { state } = useGroovebox()

const activeSwitch = ref(false)
</script>

<template>
  <div class="groovebox">
    <header>
      <h1>Groovue</h1>
      <span>Vue Groovebox</span>
    </header>

    <TransportControls />

    <Mixer :tracks="state.tracks" :selected="state.selectedTrack" />

    <Sequencer :track="state.tracks[state.selectedTrack]!" :current-step="state.currentStep" />

    <br />
    <BpmCalculator />
  </div>
</template>

<style scoped>
.groovebox {
  width: min(1200px, calc(100vw - 64px));
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
