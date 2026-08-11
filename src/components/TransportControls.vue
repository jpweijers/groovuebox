<script lang="ts" setup>
import { useGroovebox } from '@/composables/useGroovebox.ts'
import TempoControl from '@/components/TempoControl.vue'

const { play, stop, clearAllTracks } = useGroovebox()
</script>

<template>
  <section>
    <div class="controls">
      <button class="start" @click="play">Play</button>
      <button class="stop" @click="stop">Stop</button>

      <TempoControl />

      <button class="stop" @click="clearAllTracks">Clear All</button>
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
</style>
