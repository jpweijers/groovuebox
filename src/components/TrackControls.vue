<script lang="ts" setup>
import type { Track } from '@/domain/track.interface.ts'
import { ChokeGroup } from '@/domain/choke-groups.enum.ts'

const { track } = defineProps<{ track: Track }>()
const emit = defineEmits<{
  changeChokeGroup: [group: ChokeGroup]
  changeVolume: [volume: number]
}>()

function changeVolume(event: InputEvent) {
  const input = event.target as HTMLInputElement
  emit('changeVolume', Number(input.value))
}
</script>

<template>
  <section>
    <header>
      <h2>{{ track.name }}</h2>
      <span>Track Controls</span>
    </header>

    <div class="volume">
      <label for="track-volume">Volume</label>
      <input
        id="track-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="track.volume"
        @input="changeVolume"
      />

      <output for="track-volume"> {{ Math.round(track.volume * 100) }}% </output>
    </div>

    <fieldset>
      <legend>Choke group</legend>
      <div class="groups">
        <button
          class="group"
          v-for="group in ChokeGroup"
          :key="group ?? 'off'"
          type="button"
          :class="{ selected: track.chokeGroup === group }"
          @click="$emit('changeChokeGroup', group)"
        >
          {{ group ?? 'off' }}
        </button>
      </div>
    </fieldset>
  </section>
</template>

<style scoped>
fieldset {
  margin: 0;
  padding: 0;
  border: 0;
}

legend {
  margin-bottom: 8px;
  color: var(--text-muted);
  font-size: 0.75rem;
}

button {
  border-radius: 0;
}

.groups {
  display: flex;
  gap: 4px;
}

.group {
  min-width: 48px;
  padding: 8px 12px;
  color: var(--text-muted);
  background: var(--panel-raised);
  border: 1px solid var(--border);
  cursor: pointer;
}

.group:first-child {
  border-radius: var(--radius-small) 0 0 var(--radius-small);
}

.group:last-child {
  border-radius: 0 var(--radius-small) var(--radius-small) 0;
}

.group.selected {
  color: #17130d;
  background: var(--amber);
  border-color: var(--amber);
}

.volume {
  display: grid;
  grid-template-columns: 80px 1fr 48px;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.volume label {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.volume input {
  width: 100%;
  accent-color: var(--amber);
}

.volume output {
  color: var(--text);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
</style>
