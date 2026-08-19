<script setup lang="ts">
import HardwareDevice from '@/components/Hardware/HardwareDevice.vue'
import Tracks from '@/components/Groovebox/Tracks.vue'
import Parameters from '@/components/Groovebox/Parameters.vue'
import Global from '@/components/Groovebox/Global.vue'
import Sequencer from '@/components/Groovebox/Sequencer.vue'
</script>

<template>
  <HardwareDevice>
    <div class="upper">
      <Tracks />
      <Parameters />
      <Global />
    </div>
    <div class="lower">
      <Sequencer />
    </div>
  </HardwareDevice>
</template>

<style scoped>
.upper {
  display: grid;
  grid-template-columns: 0.85fr 1.8fr 0.8fr;
  gap: 30px;
  margin-top: 28px;
}
</style>
