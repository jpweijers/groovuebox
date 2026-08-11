<script lang="ts" setup>
import type { Track } from '@/domain/track.interface.ts'
import RotaryKnob from '@/components/RotaryKnob.vue'
import Switch from '@/components/Switch.vue'
import { useGroovebox } from '@/composables/useGroovebox.ts'

defineProps<{ track: Track }>()

const { setTrackSwing, setTrackOffset, setTrackSwingDivision } = useGroovebox()
</script>

<template>
  <div class="timing-controls">
    <div class="knobs">
      <RotaryKnob
        :model-value="track.swing"
        :min="25"
        :max="75"
        :step="1"
        :size="40"
        :default-value="50"
        label="Swing"
        @update:model-value="(swing) => setTrackSwing(track.id, swing)"
      />
      <RotaryKnob
        :model-value="track.offset"
        :min="-100"
        :max="100"
        :step="1"
        :size="40"
        :default-value="0"
        label="Offset"
        @update:model-value="(offset) => setTrackOffset(track.id, offset)"
      />
    </div>
    <div class="switches">
      <Switch :active="track.swingDivision === 8" @clicked="setTrackSwingDivision(track.id, 8)">
        1/8
      </Switch>
      <Switch :active="track.swingDivision === 16" @clicked="setTrackSwingDivision(track.id, 16)">
        1/16
      </Switch>
    </div>
  </div>
</template>

<style scoped>
.timing-controls {
  overflow: hidden;
  display: grid;
  gap: 12px;
}

.knobs {
  display: grid;
  justify-items: center;
  grid-template-columns: 2fr 2fr;
  gap: 4px;
}

.switches {
  display: grid;
  justify-items: center;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.switches button {
  color: var(--text-muted);
  width: 100%;
}

button.active {
  background: var(--amber);
}
</style>
