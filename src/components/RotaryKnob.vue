<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    step?: number
    defaultValue: number
    label: string
    formatValue?: (value: number) => string
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
    formatValue: (value: number) => String(value),
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

const KNOB_START_ANGLE = -135
const KNOB_SWEEP_ANGLE = 270
const DRAG_THRESHOLD_PX = 4
const FULL_RANGE_DRAG_PX = 125
const VALUE_PRECISION = 6

const dragging = ref(false)
const previewValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    if (!dragging.value) {
      previewValue.value = value
    }
  },
)

const formattedValue = computed(() => props.formatValue(snapValue(previewValue.value)))

const valueRange = computed(() => props.max - props.min)

const valueRatio = computed(() => {
  return (previewValue.value - props.min) / valueRange.value
})

const angle = computed(() => KNOB_START_ANGLE + valueRatio.value * KNOB_SWEEP_ANGLE)

const knobStyle = computed(() => ({
  '--knob-angle': `${angle.value}deg`,
}))

function updateValue(value: number): void {
  previewValue.value = snapValue(value)
  emit('update:modelValue', previewValue.value)
}

function commitValue(): void {
  emit('change', previewValue.value)
}

function resetValue(): void {
  updateValue(props.defaultValue)
  commitValue()
}

function snapValue(value: number): number {
  const clamped = Math.min(props.max, Math.max(props.min, value))
  const steps = Math.round((clamped - props.min) / props.step)
  const stepped = props.min + steps * props.step

  return Number(stepped.toFixed(VALUE_PRECISION))
}

let pointerId: number | null = null
let startY = 0
let startValue = 0
let moved = false

function startDrag(event: PointerEvent): void {
  event.preventDefault()

  if (event.button !== 0) return

  const knob = event.currentTarget as HTMLElement

  pointerId = event.pointerId
  startY = event.clientY
  startValue = previewValue.value
  moved = false
  dragging.value = true

  knob.setPointerCapture(pointerId)
}

function moveDrag(event: PointerEvent): void {
  event.preventDefault()

  if (event.pointerId !== pointerId) return

  const distance = startY - event.clientY

  if (!moved && Math.abs(distance) < DRAG_THRESHOLD_PX) return

  moved = true
  const change = (distance / FULL_RANGE_DRAG_PX) * valueRange.value

  updateValue(startValue + change)
}

function finishDrag(event: PointerEvent): void {
  event.preventDefault()

  if (event.pointerId !== pointerId) return

  if (moved) {
    commitValue()
  }

  resetInteraction()

  const knob = event.currentTarget as HTMLElement

  if (knob.hasPointerCapture(event.pointerId)) {
    knob.releasePointerCapture(event.pointerId)
  }
}

function cancelDrag(event: PointerEvent): void {
  if (event.pointerId !== pointerId) return

  resetInteraction()
  previewValue.value = props.modelValue
}

function resetInteraction(): void {
  pointerId = null
  moved = false
  dragging.value = false
}
</script>

<template>
  <div class="rotary-control">
    <span class="label">{{ label }}</span>

    <div
      class="knob"
      :class="{ dragging }"
      :style="knobStyle"
      @dblclick="resetValue"
      @pointerdown="startDrag"
      @pointermove="moveDrag"
      @pointerup="finishDrag"
      @pointercancel="cancelDrag"
      @lostpointercapture="cancelDrag"
    >
      <span class="knob-face" aria-hidden="true" />
      <span class="knob-marker" aria-hidden="true" />
    </div>

    <output class="value">
      {{ formattedValue }}
    </output>
  </div>
</template>

<style scoped>
.rotary-control {
  display: grid;
  justify-items: center;
  gap: 5px;
}

.label,
.value {
  color: var(--text-muted);
  font-size: 0.7rem;
}

.knob {
  position: relative;
  width: 52px;
  height: 52px;
  cursor: ns-resize;
}

.knob.dragging {
  cursor: none;
}

.knob-face {
  position: absolute;
  inset: 3px;
  background: linear-gradient(145deg, var(--panel-raised), var(--panel));
  border: 1px solid var(--border);
  border-radius: 50%;
  box-shadow:
    0 4px 8px rgb(0 0 0 / 35%),
    inset 1px 1px rgb(255 255 255 / 6%);
}

.knob-marker {
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  transform: rotate(var(--knob-angle));
}

.knob-marker::after {
  position: absolute;
  top: 5px;
  left: 50%;
  width: 3px;
  height: 11px;
  background: var(--amber);
  border-radius: 2px;
  box-shadow: 0 0 5px rgb(255 183 77 / 45%);
  content: '';
  transform: translateX(-50%);
}
</style>
