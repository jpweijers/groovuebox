<script setup lang="ts">
import { useGroovebox } from '@/composables/useGroovebox.ts'
import HardwareSection from '@/components/Hardware/HardwareSection.vue'
import HardwareEncoder from '@/components/Hardware/HardwareEncoder.vue'
import HardwareButton from '@/components/Hardware/HardwareButton.vue'
import HardwareLCD from '@/components/Hardware/HardwareLCD.vue'

const { state, setBpm, play, stop, resetAllTracks } = useGroovebox()
</script>
<template>
  <HardwareSection class="global" title="Global">
    <HardwareLCD class="tempo">{{ state.tempo }}</HardwareLCD>
    <HardwareEncoder
      :model-value="state.tempo"
      :default-value="90"
      :min="40"
      :max="240"
      :step="1"
      @update:model-value="(bpm) => setBpm(bpm)"
      @change="(bpm) => setBpm(bpm)"
    />
    <div class="transport">
      <HardwareButton @click="stop()">■ STOP</HardwareButton>
      <HardwareButton :active="state.isPlaying" class="play" @click="play()">▶ PLAY</HardwareButton>
      <HardwareButton @click="resetAllTracks()">Clear All</HardwareButton>
    </div>
  </HardwareSection>
</template>

<style scoped>
.global {
  display: grid;
  align-content: start;
  gap: 22px;
}

.tempo {
  text-align: center;
}

.transport {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.play {
  color: #9fe08f;
}
</style>
