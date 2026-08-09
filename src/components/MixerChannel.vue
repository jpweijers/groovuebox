<script lang="ts" setup>
import type { Track } from '@/domain/track.interface.ts'
import type { ChokeGroup } from '@/domain/choke-groups.enum.ts'

const { track, selected } = defineProps<{ track: Track; selected: boolean }>()

const emit = defineEmits<{
  select: []
  changeVolume: [number]
  changeCokeGroup: [ChokeGroup]
}>()

function changeVolume(event: InputEvent): void {
  const input = event.target as HTMLInputElement
  emit('changeVolume', Number(input.value))
}

function changeChokeGroup(event: Event): void {
  const input = event.target as HTMLInputElement
  const group = input.value === '' ? null : (Number(input.value) as ChokeGroup)
  emit('changeCokeGroup', group)
}
</script>

<template>
  <article class="channel" :class="{ selected }">
    <button type="button" class="track-select" :aria-pressed="selected" @click="emit('select')">
      {{ track.name }}
    </button>

    <label :for="`volume-${track.id}`">Volume</label>

    <output :for="`volume-${track.id}`"> {{ Math.round(track.volume * 100) }}% </output>

    <input
      :id="`volume-${track.id}`"
      type="range"
      min="0"
      max="1"
      step="0.01"
      :value="track.volume"
      @input="changeVolume"
    />

    <label :for="`choke-${track.id}`">Choke</label>

    <select :id="`choke-${track.id}`" :value="track.chokeGroup ?? ''" @change="changeChokeGroup">
      <option value="">Off</option>
      <option value="1">Group 1</option>
      <option value="2">Group 2</option>
      <option value="3">Group 3</option>
      <option value="4">Group 4</option>
    </select>
  </article>
</template>

<style scoped>
.channel {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 12px;
  background: var(--panel-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-small);
}

.channel.selected {
  border-color: var(--amber);
  box-shadow: inset 0 0 0 1px var(--amber);
}

.track-select {
  min-width: 0;
  padding: 10px 6px;
  overflow: hidden;
  color: var(--text);
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.selected .track-select {
  color: var(--amber);
}

label,
output {
  color: var(--text-muted);
  font-size: 0.7rem;
}

output {
  font-variant-numeric: tabular-nums;
}

input {
  width: 100%;
  accent-color: var(--amber);
}

select {
  width: 100%;
  padding: 6px;
  color: var(--text);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-small);
}
</style>
