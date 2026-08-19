<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    step?: number
    size?: number
    defaultValue: number
    label?: string
    formatValue?: (value: number) => string
    mode?: 'log' | 'linear'
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
    size: 52,
    mode: 'linear',
    formatValue: (value: number) => String(value),
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

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

const knobStyle = computed(() => ({
  '--knob-angle': `${visualRotation.value}deg`,
  '--knob-size': `${props.size}px`,
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

function valueToRatio(value: number): number {
  const clamped = Math.min(props.max, Math.max(props.min, value))

  if (props.mode === 'log') {
    return Math.log(clamped / props.min) / Math.log(props.max / props.min)
  }

  return (clamped - props.min) / (props.max - props.min)
}

function ratioToValue(ratio: number): number {
  const clamped = Math.min(1, Math.max(0, ratio))

  if (props.mode === 'log') {
    return props.min * Math.pow(props.max / props.min, clamped)
  }

  return props.min + clamped * (props.max - props.min)
}

function snapValue(value: number): number {
  const clamped = Math.min(props.max, Math.max(props.min, value))
  const steps = Math.round((clamped - props.min) / props.step)
  const stepped = props.min + steps * props.step

  return Number(stepped.toFixed(VALUE_PRECISION))
}

let pointerId: number | null = null
const visualRotation = ref(0)
let lastY = 0
let startY = 0
let startRatio = 0
let moved = false

function startDrag(event: PointerEvent): void {
  event.preventDefault()

  if (event.button !== 0) return

  const knob = event.currentTarget as HTMLElement

  pointerId = event.pointerId
  startY = event.clientY
  lastY = event.clientY
  startRatio = valueToRatio(previewValue.value)
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

  const ratioChange = distance / FULL_RANGE_DRAG_PX
  const nextValue = ratioToValue(startRatio + ratioChange)

  updateValue(nextValue)

  const deltaY = lastY - event.clientY
  visualRotation.value += deltaY * 2.5
  lastY = event.clientY
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
  <label class="encoder">
    <span
      class="knob"
      :style="knobStyle"
      :class="{ dragging }"
      @dblclick="resetValue"
      @pointerdown="startDrag"
      @pointermove="moveDrag"
      @pointerup="finishDrag"
      @pointercancel="cancelDrag"
      @lostpointercapture="cancelDrag"
      ><i></i></span
  ></label>

  <!--  <div class="rotary-control">-->
  <!--    <span v-if="label" class="label">{{ label }}</span>-->

  <!--    <div-->
  <!--      class="knob"-->
  <!--      :class="{ dragging }"-->
  <!--      :style="knobStyle"-->
  <!--      @dblclick="resetValue"-->
  <!--      @pointerdown="startDrag"-->
  <!--      @pointermove="moveDrag"-->
  <!--      @pointerup="finishDrag"-->
  <!--      @pointercancel="cancelDrag"-->
  <!--      @lostpointercapture="cancelDrag"-->
  <!--    >-->
  <!--      <span class="knob-face" aria-hidden="true" />-->
  <!--      <span class="knob-marker" aria-hidden="true" />-->
  <!--    </div>-->

  <!--    <output class="value">-->
  <!--      {{ formattedValue }}-->
  <!--    </output>-->
  <!--  </div>-->
</template>

<style scoped>
.encoder {
  display: grid;
  justify-items: center;
  gap: 10px;
}

.knob {
  --knob-angle: 1deg;
  position: relative;
  display: block;
  width: 60px;
  height: 66px;
  cursor: ns-resize;
}

.knob.dragging {
  cursor: none;
}

.knob:after {
  content: '';
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 0;
  height: 10px;
  border-radius: 50%;
  background: rgb(0 0 0/0.42);
  filter: blur(4px);
}

.knob::before {
  content: '';
  position: absolute;
  left: 5px;
  right: 5px;
  top: 7px;
  height: 52px;
  border-radius: 50% / 43%;
  background: repeating-conic-gradient(
    from var(--knob-angle),
    var(--control-bottom) 0 3deg,
    var(--control-top) 3deg 6deg
  );
  box-shadow:
    inset 4px 0 7px rgb(255 255 255 / 0.03),
    inset -5px 0 8px rgb(0 0 0 / 0.4),
    0 5px 0 var(--encoder-depth);
}

.knob i {
  position: absolute;
  z-index: 2;
  left: 5px;
  top: 5px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 24%,
    var(--encoder-face-highlight),
    var(--encoder-face-mid) 24%,
    var(--encoder-face) 62%,
    var(--encoder-face-shadow)
  );
  border: 1px solid var(--encoder-border);
  box-shadow: inset 0 2px 2px rgb(255 255 255 / 0.07);
}

.knob i::before {
  content: '';

  position: absolute;
  inset: 2px;

  border-radius: 50%;

  background: repeating-conic-gradient(rgb(255 255 255 / 0.025) 0 1deg, transparent 1deg 4deg);

  transform: rotate(var(--knob-angle));
}

.knob i::after {
  content: '';
  position: absolute;
  top: 7px;
  left: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.2);
  transform: translateX(-50%) rotate(var(--knob-angle));
  transform-origin: 50% 19px;
}
</style>
