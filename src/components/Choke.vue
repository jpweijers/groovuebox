<script lang="ts" setup>
import type { Track } from '@/domain/track.interface.ts'
import Switch from '@/components/Switch.vue'
import { useGroovebox } from '@/composables/useGroovebox.ts'
import type { ChokeGroup } from '@/domain/choke-groups.enum.ts'

const { track } = defineProps<{ track: Track }>()

const { setTrackChokeGroup } = useGroovebox()

function onClick(group: ChokeGroup) {
  if (group === track.chokeGroup) {
    setTrackChokeGroup(track.id, null)
  } else {
    setTrackChokeGroup(track.id, group)
  }
}
</script>

<template>
  <div class="choke-container">
    <span class="label">Choke</span>
    <div class="choke-select">
      <Switch
        v-for="i in [1, 2, 3, 4]"
        :active="track.chokeGroup === i"
        tone="red"
        @clicked="onClick(i)"
      >
        {{ i }}
      </Switch>
    </div>
  </div>
</template>

<style scoped>
.choke-container {
  display: grid;
  justify-items: center;
  gap: 8px;
}

.label {
  color: var(--text-muted);
  font-size: 0.7rem;
}

.choke-select {
  display: flex;
  flex-direction: row;
  overflow: hidden;
  gap: 4px;
}
</style>
