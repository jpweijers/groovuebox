<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  active: boolean
  velocity: number
  current: boolean
}>()

const emit = defineEmits<{ toggle: []; changeVelocity: [velocity: number] }>()

const previewVelocity = ref(props.velocity)
const dragging = ref(false)

watch(
  () => props.velocity,
  (velocity) => {
    if (!dragging.value) {
      previewVelocity.value = velocity
    }
  },
)

const velocityPercentage = computed(() => {
  return Math.round(previewVelocity.value * 100)
})

const stepStyle = computed(() => ({
  '--step-velocity': `${previewVelocity.value * 100}%`,
}))

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
  <button
    type="button"
    class="step"
    :class="{ current, active }"
    :style="stepStyle"
    @pointerdown="startDrag"
    @pointermove="moveDrag"
    @pointerup="finishDrag"
    @pointercancel="finishDrag"
  >
    <span class="indicator" />
    <span class="velocity-fill" />
    <output v-if="dragging" class="velocity-value">{{ velocityPercentage }}%</output>
  </button>
</template>

<style scoped>
.step {
  position: relative;
  display: grid;
  width: 100%;
  height: 72px;
  min-width: 0;
  overflow: hidden;
  place-items: center;
  color: var(--text-muted);
  background: var(--panel-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-small);
  cursor: pointer;
}

.step:hover {
  border: none;
}

.step.current {
  border-color: var(--amber);
}

.velocity-fill {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: var(--step-velocity);
  background: var(--orange);
  opacity: 0;
  pointer-events: none;
}

.step.active .velocity-fill {
  opacity: 0.2;
}

.velocity-value {
  font-size: smaller;
  position: absolute;
  bottom: 5px;
  color: var(--text-muted);
  z-index: 2;
}

.indicator {
  width: 10px;
  height: 10px;
  background: var(--border);
  border-radius: 50%;
  z-index: 1;
}

.step.active .indicator {
  background: var(--orange);
  box-shadow: 0 0 10px var(--orange);
}
</style>
