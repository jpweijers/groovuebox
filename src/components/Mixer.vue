<script lang="ts" setup>
import type { Track } from '@/domain/track.interface.ts'
import MixerChannel from '@/components/MixerChannel.vue'
import { useGroovebox } from '@/composables/useGroovebox.ts'

const { tracks, selected } = defineProps<{ tracks: Track[]; selected: number }>()

const { selectTrack } = useGroovebox()
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
        @select="selectTrack(index)"
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
