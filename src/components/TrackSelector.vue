<script lang="ts" setup>
import type { Track } from '@/domain/track.interface'

const { tracks } = defineProps<{ tracks: Track[]; selected: number }>()

defineEmits<{ selected: [index: number] }>()
</script>

<template>
  <section>
    <header>
      <h2 id="track-selector-heading">Tracks</h2>
      <span> {{ tracks.length }} tracks </span>
    </header>

    <ol class="tracks">
      <li v-for="(track, index) in tracks" :key="index">
        <button
          type="button"
          class="track"
          :class="{ selected: index === selected }"
          :aria-pressed="index === selected"
          @click="$emit('selected', index)"
        >
          <span>
            {{ track.name }}
          </span>
        </button>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.tracks {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.track {
  display: flex;
  width: 100%;
  height: 54px;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  color: inherit;
  background: var(--panel-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-small);
  cursor: pointer;
}

.track:hover {
  border-color: var(--text-muted);
}

.track.selected {
  color: #17130d;
  background: var(--amber);
  border-color: var(--amber);
}
</style>
