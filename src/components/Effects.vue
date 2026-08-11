<script lang="ts" setup>
import type { Track } from '@/domain/track.interface.ts'
import RotaryKnob from '@/components/RotaryKnob.vue'
import { useGroovebox } from '@/composables/useGroovebox.ts'

defineProps<{ track: Track }>()

const { setTrackPitch, setTrackDecay, setTrackFilter } = useGroovebox()

function formatPitch(pitch: number): string {
  if (pitch === 0) return '-'
  return `${pitch}st`
}

function formatDecay(decay: number): string {
  if (decay < 1000) {
    return `${decay}ms`
  }
  if (decay < 2000) {
    return `${Number(decay / 1000).toFixed(2)}s`
  }
  return `-`
}

function formatFilter(filter: number): string {
  if (filter < 1000) {
    return `${filter}hz`
  }

  return `${Number(filter / 1000).toFixed(2)}khz`
}
</script>

<template>
  <div class="effects">
    <RotaryKnob
      :model-value="track.pitch"
      :min="-12"
      :max="12"
      :default-value="0"
      :size="40"
      :format-value="formatPitch"
      label="pitch"
      @update:model-value="(pitch) => setTrackPitch(track.id, pitch)"
    />
    <RotaryKnob
      :model-value="track.decay"
      :min="10"
      :max="2000"
      :default-value="2000"
      :size="40"
      label="decay"
      :format-value="formatDecay"
      @update:model-value="(decay) => setTrackDecay(track.id, decay)"
    />
    <RotaryKnob
      :model-value="track.filter"
      :min="200"
      :max="20_000"
      :size="40"
      :default-value="20_000"
      :format-value="formatFilter"
      label="filter"
      @update:model-value="(filter) => setTrackFilter(track.id, filter)"
    />
  </div>
</template>

<style scoped>
.effects {
  display: flex;
  flex-flow: wrap;
  justify-content: center;
  gap: 8px;
}
</style>
