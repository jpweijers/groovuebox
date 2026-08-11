<script lang="ts" setup>
withDefaults(
  defineProps<{
    active: boolean
    tone?: 'amber' | 'blue' | 'red'
    disabled?: boolean
  }>(),
  {
    tone: 'amber',
    disabled: false,
  },
)

defineEmits<{ clicked: [] }>()
</script>

<template>
  <button
    type="button"
    class="switch"
    :class="[`tone-${tone}`, { active }]"
    :disabled="disabled"
    @click="$emit('clicked')"
  >
    <slot />
  </button>
</template>

<style scoped>
.switch {
  position: relative;
  min-width: 0;
  padding: 7px 7px;
  overflow: hidden;
  color: var(--text-muted);
  font: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: linear-gradient(180deg, #292722, #181713);
  border: 1px solid var(--border);
  border-radius: var(--radius-small);
  box-shadow:
    inset 0 1px rgb(255 255 255 / 6%),
    inset 0 -2px rgb(0 0 0 / 35%),
    0 2px 4px rgb(0 0 0 / 30%);
  cursor: pointer;
  transition:
    color 100ms ease,
    background 100ms ease,
    border-color 100ms ease,
    box-shadow 100ms ease,
    transform 80ms ease;
}

.switch:hover:not(:disabled):not(.active) {
  color: var(--text);
  border-color: var(--text-muted);
}

.switch:active:not(:disabled) {
  transform: translateY(1px);
}

.switch.active {
  color: color-mix(in srgb, var(--switch-accent) 35%, white);

  background:
    radial-gradient(
      circle at 50% 55%,
      color-mix(in srgb, var(--switch-accent) 38%, var(--border)),
      transparent 200%
    ),
    var(--switch-active-bg);

  border-color: var(--switch-accent);

  box-shadow:
    inset 0 0 12px var(--switch-glow),
    inset 0 1px color-mix(in srgb, var(--switch-accent) 40%, white),
    inset 0 -2px rgb(0 0 0 / 30%),
    0 0 8px var(--switch-glow),
    0 2px 4px rgb(0 0 0 / 100%);

  text-shadow: 0 0 4px var(--switch-glow);
}

.tone-amber {
  --switch-accent: var(--amber);
  --switch-active-bg: var(--amber-dark);
  --switch-glow: var(--amber-glow);
}

.tone-blue {
  --switch-accent: var(--mute);
  --switch-active-bg: var(--mute-dark);
  --switch-glow: var(--mute-glow);
}

.tone-red {
  --switch-accent: var(--solo);
  --switch-active-bg: var(--solo-dark);
  --switch-glow: var(--solo-glow);
}
</style>
