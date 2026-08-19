<script setup lang="ts">
import HardwareSection from '@/components/Hardware/HardwareSection.vue'
import { useGroovebox } from '@/composables/useGroovebox.ts'
import HardwareButton, { type BacklightColor } from '@/components/Hardware/HardwareButton.vue'
import { computed } from 'vue'
import type { Track } from '@/domain/track.interface.ts'

const { state, selectTrack, toggleMute, toggleSolo, isTrackSoloed } = useGroovebox()

const selectedTrack = computed(() => state.value.tracks[state.value.selectedTrack]!)

function trackColor(track: Track): BacklightColor {
  if (isTrackSoloed(track.id)) return 'red'
  if (track.muted) return 'blue'
  return 'green'
}

function isBacklit(track: Track): boolean {
  if (track.id === selectedTrack.value.id) return true
  return isTrackSoloed(track.id) || track.muted
}
</script>
<template>
  <HardwareSection class="tracks" title="Tracks">
    <div class="track-grid">
      <HardwareButton
        v-for="(track, index) in state.tracks"
        :key="index"
        :active="isBacklit(track)"
        :color="trackColor(track)"
        @click="selectTrack(index)"
      >
        T0{{ index + 1 }}
      </HardwareButton>
    </div>
    <div class="mode-row">
      <HardwareButton
        :active="selectedTrack.muted"
        color="blue"
        @click="toggleMute(selectedTrack.id)"
        >Mute</HardwareButton
      >
      <HardwareButton
        :active="isTrackSoloed(selectedTrack.id)"
        color="red"
        @click="toggleSolo(selectedTrack.id)"
        >Solo</HardwareButton
      >
    </div>
  </HardwareSection>
</template>

<style scoped>
.tracks {
  display: grid;
  align-content: start;
  gap: 22px;
}

.track-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.mode-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
</style>
