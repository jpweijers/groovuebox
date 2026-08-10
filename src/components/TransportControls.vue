<script lang="ts" setup>
import { useGroovebox } from '@/composables/useGroovebox.ts'

const { state, play, stop } = useGroovebox()
</script>

<template>
  <section>
    <div class="controls">
      <button class="start" @click="play">Play</button>
      <button class="stop" @click="stop">Stop</button>
      <span class="bpm">BPM: {{ state.tempo }}</span>
    </div>
  </section>
</template>

<style scoped>
.controls {
  display: flex;
  gap: 8px;
}

.start {
  padding: 10px 20px;
  background: var(--orange);
}

.stop {
  padding: 10px 20px;
  color: var(--text-muted);
}

.bpm {
  padding: 4px 10px;
}
</style>
