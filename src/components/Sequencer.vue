<script lang="ts" setup>
import type { Track } from '@/domain/track.interface.ts'

const { track } = defineProps<{ track: Track; currentStep: number }>()

defineEmits(['toggle', 'clear'])
</script>

<template>
  <section>
    <header>
      <h2 id="sequencer-heading">Sequencer</h2>
      <span> {{ track.name }} </span>
    </header>
    {{ currentStep }}
    <div class="steps">
      <button
        v-for="(active, index) in track.steps"
        :key="index"
        type="button"
        class="step"
        :class="{ active, current: index === currentStep }"
        :aria-label="`Step ${index + 1}`"
        :aria-pressed="active"
        @click="$emit('toggle', index)"
      >
        <span aria-hidden="true"></span>
      </button>
    </div>
    <footer>
      <button type="button" class="clear" @click="$emit('clear')">Clear track</button>
    </footer>
  </section>
</template>

<style scoped>
.clear {
  padding: 8px 12px;
  color: var(--text-muted);
}

.clear:hover {
  color: var(--text);
  border-color: var(--text-muted);
}

.steps {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 7px;
}

.step {
  display: grid;
  min-width: 0;
  height: 72px;
  place-items: center;
  padding: 10px 4px;
  color: var(--text-muted);
  background: var(--panel-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-small);
  cursor: pointer;
}

.step:hover {
  border-color: var(--text-muted);
}

/* Add separation after each four-step beat. */
.step:nth-child(4n):not(:last-child) {
  margin-right: 8px;
}

.step span {
  width: 10px;
  height: 10px;
  background: var(--border);
  border-radius: 50%;
}

.step.active {
  color: var(--text);
  background: #3a2720 !important;
  border-color: var(--orange);
}

.step.current {
  background: var(--amber);
}

.step.active span {
  background: var(--orange);
  box-shadow: 0 0 10px var(--orange);
}
</style>
