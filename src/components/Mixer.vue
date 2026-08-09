<script lang="ts" setup>
import type { Track } from '@/domain/track.interface.ts'
import MixerChannel from '@/components/MixerChannel.vue'
import type { ChokeGroup } from '@/domain/choke-groups.enum.ts'

const { tracks, selected } = defineProps<{ tracks: Track[]; selected: number }>()

defineEmits<{
  select: [index: number]
  changeVolume: [id: string, volume: number]
  changePan: [id: string, pan: number]
  changeChokeGroup: [id: string, group: ChokeGroup]
}>()
</script>

<template>
  <section>
    <header>
      <h2>Mixer</h2>
      <span>{{ tracks.length }} tracks</span>
    </header>
    <div class="channels">
      <MixerChannel
        v-for="(track, index) in tracks"
        :track="track"
        :selected="selected === index"
        :key="track.id"
        @select="$emit('select', index)"
        @changeVolume="(volume) => $emit('changeVolume', track.id, volume)"
        @changePan="(pan) => $emit('changePan', track.id, pan)"
        @changeCokeGroup="(group) => $emit('changeChokeGroup', track.id, group)"
      />
    </div>
  </section>
</template>

<style scoped>
.channels {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 8px;
}
</style>
