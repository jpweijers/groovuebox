<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HardwareButton from '@/components/Hardware/HardwareButton.vue'

const props = defineProps<{
  active: boolean
  velocity: number
  current: boolean
  stepNumber: number
}>()

const emit = defineEmits<{ toggle: []; changeVelocity: [velocity: number] }>()

const previewVelocity = ref(props.velocity)
const dragging = ref(false)

const formattedStepNumber = computed(() => {
  if (props.stepNumber < 10) {
    return `0${props.stepNumber}`
  }
  return props.stepNumber
})

watch(
  () => props.velocity,
  (velocity) => {
    if (!dragging.value) {
      previewVelocity.value = velocity
    }
  },
)

const stepStyle = computed(() => {
  if (props.active) {
    return { '--velocity': `${previewVelocity.value * 100}%` }
  }
})

const DRAG_THRESHOLD = 4
const VELOCITY_DRAG_DISTANCE = 100

let pointerId: number | null = null
let startY = 0
let startVelocity = 1
let moved = false

function clampVelocity(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function startDrag(event: PointerEvent): void {
  if (event.button !== 0) return

  const button = event.currentTarget as HTMLButtonElement

  pointerId = event.pointerId
  startY = event.clientY
  startVelocity = props.velocity
  previewVelocity.value = props.velocity
  moved = false

  button.setPointerCapture(event.pointerId)
}

function moveDrag(event: PointerEvent): void {
  if (event.pointerId !== pointerId || !props.active) return

  const distance = startY - event.clientY

  if (!moved && Math.abs(distance) < DRAG_THRESHOLD) return

  moved = true
  dragging.value = true
  previewVelocity.value = clampVelocity(startVelocity + distance / VELOCITY_DRAG_DISTANCE)
}

function finishDrag(event: PointerEvent): void {
  if (event.pointerId !== pointerId) return

  if (moved) {
    emit('changeVelocity', previewVelocity.value)
  } else {
    emit('toggle')
  }

  pointerId = null
  moved = false
  dragging.value = false

  const button = event.target as HTMLButtonElement
  if (button.hasPointerCapture(event.pointerId)) {
    button.releasePointerCapture(event.pointerId)
  }
}
</script>

<template>
  <div class="step-wrap">
    <span class="led" :class="{ on: active }" />
    <HardwareButton
      class="step"
      :style="stepStyle"
      @pointerdown="startDrag"
      @pointermove="moveDrag"
      @pointerup="finishDrag"
      @pointercancel="finishDrag"
    >
      <span :class="{ current: current }" />
      <span class="velocity" />
    </HardwareButton>
    <span class="step-number">{{ formattedStepNumber }}</span>
  </div>
</template>

<style scoped>
.step-wrap {
  display: grid;
  justify-items: center;
  gap: 6px;
}

.led {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--device-shadow);
}

.led.on {
  background: var(--light-green);
  box-shadow: 0 0 7px var(--light-green);
}

.step {
  --velocity: 0%;
  position: relative;
  width: 100%;
  aspect-ratio: 0.95;
  overflow: hidden;
  border-radius: 5px;
  background:
    linear-gradient(to bottom, rgb(255 255 255/0.055), transparent 30%),
    linear-gradient(var(--control-top), var(--control-bottom));
  box-shadow:
    0 4px 0 var(--device-shadow),
    0 8px 8px rgb(0 0 0 / 0.25),
    inset 0 1px rgb(255 255 255 / 0.08),
    inset 0 -6px 10px rgb(0 0 0 / 0.22);
}

.velocity {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--velocity);
  background: linear-gradient(
    color-mix(in srgb, var(--light-green) 22%, transparent),
    color-mix(in srgb, var(--light-green) 33%, transparent)
  );
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.1),
    0 0 12px color-mix(in srgb, var(--light-green) 14%, transparent);
}

.step-number {
  font:
    8px 'Courier New',
    monospace;
  color: var(--device-ink-muted);
}

.current {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  background: linear-gradient(
    color-mix(in srgb, var(--light-amber) 22%, transparent),
    color-mix(in srgb, var(--light-amber) 33%, transparent)
  );
  box-shadow: 0 0 12px color-mix(in srgb, var(--light-amber) 18%, transparent);
}
</style>
