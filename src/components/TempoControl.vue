<script lang="ts" setup>
import { useGroovebox } from '@/composables/useGroovebox.ts'

const { state, setBpm } = useGroovebox()

const MIN_TEMPO = 40
const MAX_TEMPO = 240
const DEFAULT_TEMPO = 90

function changeBpm(event: InputEvent) {
  const input = event.target as HTMLInputElement
  setBpm(Number(input.value))
}

function resetBpm() {
  setBpm(DEFAULT_TEMPO)
}

function increaseBpm() {
  setBpm(state.value.tempo + 1)
}

function decreaseBpm() {
  setBpm(state.value.tempo - 1)
}
</script>

<template>
  <fieldset class="tempo-control">
    <label for="tempo">BPM</label>
    <div class="tempo-input">
      <button type="button" @click="decreaseBpm()" :disabled="state.tempo <= MIN_TEMPO">-</button>
      <input
        id="tempo"
        type="number"
        :value="state.tempo"
        :min="MIN_TEMPO"
        :max="MAX_TEMPO"
        :step="1"
        inputmode="numeric"
        @input="changeBpm"
        @dblclick="resetBpm()"
      />
      <button type="button" @click="increaseBpm()" :disabled="state.tempo >= MAX_TEMPO">+</button>
    </div>
  </fieldset>
</template>

<style scoped>
.tempo-control {
  margin: 0;
  padding: 0;
  border: 0;
}

.tempo-input {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tempo-input input {
  width: 4.5rem;
  height: 2.25rem;
  padding: 0 8px;
  color: var(--text);
  text-align: center;
  background: var(--panel-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-small);
  appearance: textfield;
}

.tempo-input input:focus-visible {
  border-color: var(--amber);
  outline: 2px solid color-mix(in srgb, var(--amber) 35%, transparent);
  outline-offset: 1px;
}

.tempo-input button {
  width: 2.25rem;
  height: 2.25rem;
}
</style>
