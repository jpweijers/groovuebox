<script setup lang="ts">
import HardwareLCD from '@/components/Hardware/HardwareLCD.vue'

defineProps<{
  track: string
  trackName: string
  wave: number[]
  bpm: number
  params: {
    1?: { name: string; value: number | string }
    2?: { name: string; value: number | string }
    3?: { name: string; value: number | string }
    4?: { name: string; value: number | string }
  }
}>()

function formatTrackNumber(track: number) {
  if (track < 10) return `0${track}`
  return `${track}`
}
</script>

<template>
  <HardwareLCD>
    <div class="display">
      <div class="display__top">
        <span
          ><b>{{ formatTrackNumber(track) }}</b> {{ trackName }}</span
        >
        <span>{{ Number(bpm).toFixed(1) }} BPM</span>
      </div>

      <div class="wave">
        <i v-for="bar in wave" :style="`height: ${bar}%`" :key="bar"></i>
      </div>

      <div class="display__params">
        <span>
          {{ params['1']?.name }}<b>{{ params['1']?.value }}</b>
        </span>
        <span>
          {{ params['2']?.name }}<b>{{ params['2']?.value }}</b>
        </span>
        <span>
          {{ params['3']?.name }}<b>{{ params['3']?.value }}</b>
        </span>
        <span>
          {{ params['4']?.name }}<b>{{ params['4']?.value }}</b>
        </span>
      </div>
    </div>
  </HardwareLCD>
</template>

<style scoped>
.display__top,
.display__params {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  text-transform: uppercase;
}

.display__top {
  font-size: 13px;
  font-weight: 700;
}

.display__top b {
  margin-right: 10px;
  padding: 2px 5px;
  border: 1px solid currentColor;
}

.wave {
  height: 82px;
  display: flex;
  align-items: center;
  gap: 3px;
  margin: 20px 0 14px;
  border-block: 1px solid color-mix(in srgb, var(--lcd-ink) 18%, transparent);
}

.wave i {
  width: 7px;
  background: currentColor;
  opacity: 0.82;
}

.display__params span {
  font-size: 9px;
  line-height: 1.45;
}

.display__params b {
  display: block;
  font-size: 11px;
}
</style>
