<script lang="ts" setup>
import { computed, ref } from 'vue'
import RotaryKnob from '@/components/RotaryKnob.vue'

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
      <RotaryKnob
        :model-value="bpm"
        :min="40"
        :max="240"
        :step="1"
        :default-value="90"
        label="Original BPM"
        @update:model-value="(val) => (bpm = val)"
      />
      <RotaryKnob
        :model-value="pitch"
        :min="-12"
        :max="12"
        :step="1"
        :default-value="0"
        label="Pitch"
        @update:model-value="(val) => (pitch = val)"
      />
      <div class="result">
        <output> Adjusted BMP: {{ newBpm }} </output>
      </div>
    </div>
  </details>
</template>

<style scoped>
.bpm-calculator {
  display: flex;
  gap: 8px;
}
</style>
