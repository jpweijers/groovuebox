<script setup lang="ts">
defineProps<{ title: string }>()
</script>
<template>
  <div class="panel">
    <span class="panel-title">{{ title.toUpperCase() }}</span>
    <slot />
  </div>
</template>

<style scoped>
.panel {
  position: relative;
  min-height: 290px;
  padding: 30px 18px 18px;
  border: 1px solid var(--device-border);
}

.panel-title {
  position: absolute;
  top: -6px;
  left: 20px;
  padding: 0 8px;
  background: var(--device-ink-background);
  font-size: var(--hardware-label-size);
  font-weight: var(--hardware-label-weight);
  letter-spacing: var(--hardware-label-spacing);
  color: var(--device-ink-muted);
}
</style>
