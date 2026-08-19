<script setup lang="ts">
import { useGroovebox } from '@/composables/useGroovebox.ts'
import { computed } from 'vue'
import HardwareSequencerStep from '@/components/Hardware/HardwareSequencerStep.vue'

const { state, toggleStep, setTrackVelocity } = useGroovebox()

const currentTrack = computed(() => state.value.tracks[state.value.selectedTrack]!)
const steps = computed(() => state.value.tracks[state.value.selectedTrack]!.steps)
</script>

<template>
  <section class="sequencer">
    <span class="sequencer-title">SEQUENCER</span>
    <div class="steps">
      <HardwareSequencerStep
        v-for="(step, index) in steps"
        :key="index"
        :active="step.active"
        :velocity="step.velocity"
        :current="state.currentStep === index"
        :step-number="index + 1"
        @toggle="toggleStep(currentTrack.id, index)"
        @change-velocity="(velocity) => setTrackVelocity(currentTrack.id, index, velocity)"
      />
    </div>
    <div class="beat-groups">
      <div v-for="beat in 4" :key="beat" class="beat-group">
        <span class="beat-group__label">0{{ beat }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sequencer {
  position: relative;
  margin-top: 38px;
  padding: 34px 8px 4px;
  border-top: 1px solid var(--device-border);
}

.sequencer-title {
  position: absolute;
  top: -6px;
  left: 18px;
  padding: 0 8px;

  background: var(--device-ink-background);
  color: var(--device-ink-muted);
  font-size: var(--hardware-label-size);
  font-weight: var(--hardware-label-weight);
  letter-spacing: var(--hardware-label-spacing);
}

.steps {
  display: grid;
  grid-template-columns: repeat(16, minmax(0, 1fr));
  gap: 9px;
}

.beat-groups {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;

  margin-top: 10px;
}

.beat-group {
  position: relative;
  height: 14px;

  border-bottom: 1px solid var(--device-border);
}

.beat-group::before,
.beat-group::after {
  content: '';

  position: absolute;
  bottom: 0;

  width: 1px;
  height: 6px;

  background: var(--device-border);
}

.beat-group::before {
  left: 0;
}

.beat-group::after {
  right: 0;
}

.beat-group__label {
  position: absolute;

  left: 50%;
  bottom: -4px;

  padding-inline: 6px;

  transform: translateX(-50%);

  background: var(--device-ink-background);
  color: var(--device-ink-muted);
  font-weight: var(--hardware-label-weight);

  letter-spacing: var(--hardware-label-spacing);
  font:
    8px 'Courier New',
    monospace;
}
</style>
