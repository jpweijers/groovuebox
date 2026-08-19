<script lang="ts" setup>
import { computed, ref } from 'vue'
import HardwareEncoder from '@/components/Hardware/HardwareEncoder.vue'

const bpm = ref(90)
const pitch = ref(0)

const newBpm = computed(() => {
  return Math.round(bpm.value * Math.pow(2, pitch.value / 12))
})
</script>

<template>
  <details>
    <summary>Tools</summary>
    <div>
      <h2>BPM Calculator</h2>
    </div>
    <div class="bpm-calculator">
      <span>BPM: {{ bpm }}</span>
      <span>PITCH: {{ pitch }}</span>
      <output> Adjusted BMP: {{ newBpm }} </output>
      <HardwareEncoder
        :model-value="bpm"
        :min="40"
        :max="240"
        :step="1"
        :default-value="90"
        @update:model-value="(val) => (bpm = val)"
      />
      <HardwareEncoder
        :model-value="pitch"
        :min="-12"
        :max="12"
        :step="1"
        :default-value="0"
        @update:model-value="(val) => (pitch = val)"
      />
    </div>
  </details>
</template>

<style scoped>
.bpm-calculator {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-items: center;
  gap: 8px;
}
</style>
