<script setup lang="ts">
export type BacklightColor = 'amber' | 'green' | 'red' | 'blue' | 'white'

withDefaults(defineProps<{ active?: boolean; color?: BacklightColor }>(), {
  active: false,
  color: 'green',
})
</script>

<template>
  <button class="hardware-button">
    <span :class="[{ active: active }, `backlight-${color}`]" />
    <slot name="backlight" />
    <span class="surface" />
    <slot />
  </button>
</template>

<style scoped>
* {
  --backlight-color: orange;
}

.hardware-button {
  min-height: 42px;
  border: 0;
  border-radius: var(--radius-control);
  background:
    linear-gradient(to bottom, rgb(255 255 255/0.055), transparent 30%),
    linear-gradient(var(--control-top), var(--control-bottom));
  color: var(--device-ink);
  font-size: var(--hardware-label-size);
  font-weight: var(--hardware-label-weight);
  letter-spacing: var(--hardware-label-spacing);
  text-transform: uppercase;
  cursor: pointer;

  transform: translateY(0);

  overflow: hidden;

  box-shadow:
    0 4px 0 var(--device-shadow),
    0 7px 7px rgb(0 0 0 / 0.22),
    inset 0 1px rgb(255 255 255 / 0.07);

  transition:
    transform 50ms ease-out,
    box-shadow 50ms ease-out,
    background 50ms ease-out;
}

.hardware-button:active {
  transform: translateY(1px);

  background: linear-gradient(var(--control-pressed-top), var(--control-pressed-bottom));

  box-shadow:
    0 1px 0 var(--device-shadow),
    0 3px 3px rgb(0 0 0 / 0.18),
    inset 0 1px rgb(255 255 255 / 0.04);
}

.surface {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    rgb(255 255 255/0.1),
    rgb(255 255 255/0.03) 18%,
    transparent 42%,
    rgb(0 0 0/0.2)
  );
  box-shadow: inset 0 0 0 1px rgb(255 255 255/0.03);
}

.active {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  inset: 0;

  background: linear-gradient(
    color-mix(in srgb, var(--backlight-color) 22%, transparent),
    color-mix(in srgb, var(--backlight-color) 33%, transparent)
  );

  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.1),
    0 0 12px color-mix(in srgb, var(--backlight-color) 18%, transparent);
}

.backlight-orange {
  --backlight-color: var(--light-amber);
}

.backlight-green {
  --backlight-color: var(--light-green);
}

.backlight-blue {
  --backlight-color: var(--light-blue);
}

.backlight-red {
  --backlight-color: var(--light-red);
}

.backlight-white {
  --backlight-color: var(--light-white);
}
</style>
