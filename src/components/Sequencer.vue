<script lang="ts" setup>
import type { Track } from '@/domain/track.interface.ts'
import { useGroovebox } from '@/composables/useGroovebox.ts'
import SequencerStep from '@/components/SequencerStep.vue'
import { computed } from 'vue'

const { track } = defineProps<{ track: Track; currentStep: number }>()

const { toggleStep, clearTrackSequence, setTrackVelocity, resetTrackVelocities } = useGroovebox()

const beats = computed(() => {
  return Array.from({ length: 4 }, (_, beatIndex) =>
    track.steps.slice(beatIndex * 4, beatIndex * 4 + 4).map((step, offset) => ({
      step,
      index: beatIndex * 4 + offset,
    })),
  )
})
</script>

<template>
  <section>
    <header>
      <h2 id="sequencer-heading">Sequencer</h2>
      <span> {{ track.name }} </span>
    </header>
    <div class="steps">
      <div v-for="(beat, beatIndex) in beats" :key="beatIndex" class="beat">
        <SequencerStep
          v-for="{ step, index } in beat"
          :key="index"
          :active="step.active"
          :velocity="step.velocity"
          :current="index === currentStep"
          @change-velocity="(velocity) => setTrackVelocity(track.id, index, velocity)"
          @toggle="() => toggleStep(track.id, index)"
        />
      </div>
    </div>
    <footer>
      <button type="button" class="clear" @click="clearTrackSequence(track.id)">Clear track</button>
      <button type="button" class="clear" @click="resetTrackVelocities(track.id)">
        Reset velocities
      </button>
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
  grid-template-columns: repeat(4, 1fr);
  gap: 21px;
}

.beat {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
}
</style>
