<template>
  <div class="display">
    <slot />
  </div>
</template>

<style scoped>
.display {
  padding: 18px 20px;
  background: var(--lcd-face);
  border: 1px solid var(--lcd-border);
  color: var(--lcd-ink);
  font-family: 'Courier New', monospace;
  box-shadow: inset 0 0 28px rgb(0 0 0 / 0.75);
  border-radius: 5px;
}
</style>
