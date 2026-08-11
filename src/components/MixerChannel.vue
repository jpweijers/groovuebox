<script lang="ts" setup>
import type { Track } from '@/domain/track.interface.ts'
import type { ChokeGroup } from '@/domain/choke-groups.enum.ts'
import { useGroovebox } from '@/composables/useGroovebox.ts'
import RotaryKnob from '@/components/RotaryKnob.vue'

const { track, selected } = defineProps<{ track: Track; selected: boolean }>()

const emit = defineEmits<{
  select: []
}>()

const { setTrackVolume, setTrackPan, setTrackChokeGroup, toggleMute, toggleSolo, isTrackSoloed } =
  useGroovebox()

function changeVolume(event: InputEvent): void {
  const input = event.target as HTMLInputElement
  setTrackVolume(track.id, Number(input.value))
}

function changePan(event: InputEvent): void {
  const input = event.target as HTMLInputElement
  setTrackPan(track.id, Number(input.value))
}

function centerPan(): void {
  setTrackPan(track.id, 0)
}

function changeChokeGroup(event: Event): void {
  const input = event.target as HTMLInputElement
  const group = input.value === '' ? null : (Number(input.value) as ChokeGroup)
  setTrackChokeGroup(track.id, group)
}

function formatPan() {
  if (track.pan === 0) return 'C'

  const amount = Math.round(Math.abs(track.pan) * 50)

  return track.pan < 0 ? `L${amount}` : `R${amount}`
}
</script>

<template>
  <article class="channel" :class="{ selected }">
    <button type="button" class="track-select" :aria-pressed="selected" @click="emit('select')">
      {{ track.name }}
    </button>

    <div class="volume">
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
    </div>

    <hr />

    <RotaryKnob
      :model-value="track.pan"
      :min="-1"
      :max="1"
      :step="0.01"
      :default-value="0"
      :format-value="formatPan"
      @update:model-value="(pan) => setTrackPan(track.id, pan)"
    />

    <hr />

    <div class="channel-switches">
      <button
        type="button"
        class="mute"
        :class="{ active: track.muted }"
        @click="toggleMute(track.id)"
      >
        M
      </button>
      <button
        type="button"
        class="solo"
        :class="{ active: isTrackSoloed(track.id) }"
        @click="toggleSolo(track.id)"
      >
        S
      </button>
    </div>

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

.volume {
  display: grid;
  justify-items: center;
  grid-gap: 0.5rem;
}

.volume input {
  width: 100%;
  accent-color: var(--amber);
  writing-mode: vertical-lr;
  direction: rtl;
}

.pan {
  display: grid;
  justify-items: center;
}

.pan input {
  width: 100%;
  accent-color: var(--amber);
}

.pan output {
  font-size: 0.7rem;
  padding-bottom: 0.5rem;
}

select {
  width: 100%;
  padding: 6px;
  color: var(--text);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-small);
}

.channel-switches {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.channel-switches button {
  padding: 6px;
  color: var(--text-muted);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-small);
}

.mute {
  --control-accent: var(--mute);
  --control-active-bg: var(--mute-dark);
  --control-glow: var(--mute-glow);
}

.solo {
  --control-accent: var(--solo);
  --control-active-bg: var(--solo-dark);
  --control-glow: var(--solo-glow);
}

.mute.active,
.solo.active {
  color: #f5f5f5;
  background: var(--control-active-bg);
  border-color: var(--control-accent);
  box-shadow:
    inset 0 0 0 1px var(--control-accent),
    0 0 10px var(--control-glow);
}
</style>
