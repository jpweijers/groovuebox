<script setup lang="ts">
import HardwareDisplay from '@/components/Hardware/HardwareDisplay.vue'
import { useGroovebox } from '@/composables/useGroovebox.ts'
import { computed, ref } from 'vue'
import HardwareEncoder from '@/components/Hardware/HardwareEncoder.vue'
import HardwareButton from '@/components/Hardware/HardwareButton.vue'
import { TIME_DIVISIONS, type TimeDivision } from '@/domain/time-division.interface.ts'

const {
  state,
  setTrackPitch,
  setTrackFilter,
  setTrackDecay,
  setTrackDistortion,
  setTrackVolume,
  setTrackPan,
  setTrackSwing,
  setTrackSwingDivision,
  setTrackOffset,
  setTrackReverb,
  setTrackDelay,
  setTrackDelayTime,
  setTrackDelayFeedback,
} = useGroovebox()

const selectedTrack = computed(() => state.value.tracks[state.value.selectedTrack]!)

const wave = [18, 34, 70, 92, 72, 48, 26, 14, 10, 52, 82, 44, 22, 12]

const page = ref<'mix' | 'sound' | 'sound2' | 'timing'>('sound')

const delayDivisionIndex = computed(() => {
  return TIME_DIVISIONS.indexOf(selectedTrack.value.delayDivision)
})

const params = computed(() => {
  switch (page.value) {
    case 'mix':
      return {
        1: { name: 'VOL', value: selectedTrack.value.volume },
        2: { name: 'PAN', value: selectedTrack.value.pan },
        3: { name: 'REVERB', value: selectedTrack.value.reverb },
      }
    case 'sound':
      return {
        1: { name: 'PITCH', value: selectedTrack.value.pitch },
        2: { name: 'FILTER', value: selectedTrack.value.filter },
        3: { name: 'DECAY', value: selectedTrack.value.decay },
        4: { name: 'DRIVE', value: selectedTrack.value.distortion },
      }

    case 'sound2':
      return {
        1: { name: 'Delay', value: selectedTrack.value.delay },
        2: { name: 'Delay Feedback', value: selectedTrack.value.delayFeedback },
        3: { name: 'Delay Time', value: selectedTrack.value.delayDivision },
      }

    case 'timing':
      return {
        1: { name: 'SWING', value: selectedTrack.value.swing },
        2: { name: 'SWING D', value: selectedTrack.value.swingDivision },
        3: { name: 'OFFSET', value: selectedTrack.value.offset },
      }
  }
})

function updateDelayDivision(index: number) {
  const division = TIME_DIVISIONS[index] as TimeDivision | undefined

  if (division) {
    setTrackDelayTime(selectedTrack.value.id, division)
  }
}
</script>

<template>
  <div class="parameters">
    <HardwareDisplay
      :track="state.selectedTrack + 1"
      :trackName="selectedTrack.name"
      :wave="wave"
      :bpm="state.tempo"
      :params="params"
    />

    <div v-show="page === 'mix'" class="encoder-row">
      <HardwareEncoder
        :model-value="selectedTrack.volume"
        :default-value="1"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="(volume) => setTrackVolume(selectedTrack.id, volume)"
        @change="(volume) => setTrackVolume(selectedTrack.id, volume)"
      />
      <HardwareEncoder
        :model-value="selectedTrack.pan"
        :default-value="0"
        :min="-1"
        :max="1"
        :step="0.01"
        @update:model-value="(pan) => setTrackPan(selectedTrack.id, pan)"
        @change="(pan) => setTrackPan(selectedTrack.id, pan)"
      />
      <HardwareEncoder
        :model-value="selectedTrack.reverb"
        :default-value="0"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="(reverb) => setTrackReverb(selectedTrack.id, reverb)"
        @change="(reverb) => setTrackReverb(selectedTrack.id, reverb)"
      />
      <HardwareEncoder :default-value="0" :model-value="0" />
    </div>

    <div v-show="page === 'sound'" class="encoder-row">
      <HardwareEncoder
        :model-value="selectedTrack.pitch"
        :default-value="0"
        :min="-12"
        :max="12"
        @update:model-value="(pitch) => setTrackPitch(selectedTrack.id, pitch)"
        @change="(pitch) => setTrackPitch(selectedTrack.id, pitch)"
      />
      <HardwareEncoder
        :model-value="selectedTrack.filter"
        :default-value="20_000"
        :min="0"
        :max="20_000"
        @update:model-value="(filter) => setTrackFilter(selectedTrack.id, filter)"
        @change="(filter) => setTrackFilter(selectedTrack.id, filter)"
      />
      <HardwareEncoder
        :model-value="selectedTrack.decay"
        :default-value="2_000"
        :min="0"
        :max="2_000"
        @update:model-value="(decay) => setTrackDecay(selectedTrack.id, decay)"
        @change="(decay) => setTrackDecay(selectedTrack.id, decay)"
      />
      <HardwareEncoder
        :model-value="selectedTrack.distortion"
        :default-value="0"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="(distortion) => setTrackDistortion(selectedTrack.id, distortion)"
        @change="(distortion) => setTrackDistortion(selectedTrack.id, distortion)"
      />
    </div>

    <div v-show="page === 'timing'" class="encoder-row">
      <HardwareEncoder
        :model-value="selectedTrack.swing"
        :default-value="50"
        :min="25"
        :max="75"
        :step="1"
        @update:model-value="(swing) => setTrackSwing(selectedTrack.id, swing)"
        @change="(volume) => setTrackSwing(selectedTrack.id, volume)"
      />
      <HardwareEncoder
        :model-value="selectedTrack.swingDivision"
        :default-value="8"
        :min="8"
        :max="16"
        :step="8"
        @update:model-value="(swing) => setTrackSwingDivision(selectedTrack.id, swing as 8 | 16)"
        @change="(swing) => setTrackSwingDivision(selectedTrack.id, swing as 8 | 16)"
      />
      <HardwareEncoder
        :model-value="selectedTrack.offset"
        :default-value="0"
        :min="-100"
        :max="100"
        :step="1"
        @update:model-value="(offset) => setTrackOffset(selectedTrack.id, offset)"
        @change="(offset) => setTrackOffset(selectedTrack.id, offset)"
      />
      <HardwareEncoder :default-value="0" :model-value="0" />
    </div>

    <div v-show="page === 'sound2'" class="encoder-row">
      <HardwareEncoder
        :model-value="selectedTrack.delay"
        :default-value="0"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="(delay) => setTrackDelay(selectedTrack.id, delay)"
        @change="(delay) => setTrackDelay(selectedTrack.id, delay)"
      />
      <HardwareEncoder
        :model-value="selectedTrack.delayFeedback"
        :default-value="0"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="(pan) => setTrackDelayFeedback(selectedTrack.id, pan)"
        @change="(pan) => setTrackDelayFeedback(selectedTrack.id, pan)"
      />
      <HardwareEncoder
        :model-value="delayDivisionIndex"
        :default-value="0"
        :min="-1"
        :max="TIME_DIVISIONS.length - 1"
        :step="1"
        @update:model-value="updateDelayDivision"
        @change="updateDelayDivision"
      />
      <HardwareEncoder :default-value="0" :model-value="0" />
    </div>

    <div class="pages">
      <HardwareButton :active="page === 'mix'" @click="page = 'mix'"> Mix </HardwareButton>
      <HardwareButton :active="page === 'sound'" @click="page = 'sound'"> Sound I</HardwareButton>
      <HardwareButton :active="page === 'sound2'" @click="page = 'sound2'">
        Sound II
      </HardwareButton>
      <HardwareButton :active="page === 'timing'" @click="page = 'timing'"> Timing </HardwareButton>
    </div>
  </div>
</template>

<style scoped>
.parameters {
  display: grid;
  gap: 20px;
}

.encoder-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.pages {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
</style>
