<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  element: { name: string; weight?: number | null };
  modelValue: number;
  original: number;
}>()

const emit = defineEmits(['update:modelValue'])

const knobRef = ref<HTMLElement | null>(null)

let isDragging = false
let lastAngle = 0
let continuousAngle = 0

const isModified = computed(() => {
  return Math.abs(props.modelValue - props.original) > 0.01
})

const displayValue = computed(() => {
  return props.modelValue.toFixed(1)
})

const displayName = computed(() => {
  if (!props.element.name) return '';
  return props.element.name.length > 7
    ? props.element.name.slice(0, 7) + '...'
    : props.element.name;
})

const angle = computed(() => {
  return ((props.modelValue / 10) * 360 + 180) % 360
})

const dialScale = computed(() => {
  const diff = props.modelValue - props.original
  return 1 + diff * 0.035
})

const startDrag = (e: MouseEvent | TouchEvent) => {
  e.preventDefault()
  if (!knobRef.value) return
  const rect = knobRef.value.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  const dx = clientX - cx
  const dy = clientY - cy
  isDragging = true
  lastAngle = Math.atan2(dy, dx) * (180 / Math.PI)
  continuousAngle = (props.modelValue / 10) * 360 + 180
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('touchmove', onDrag, { passive: false })
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchend', stopDrag)
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (e.cancelable) e.preventDefault()
  if (!knobRef.value || !isDragging) return
  const rect = knobRef.value.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  const dx = clientX - cx
  const dy = clientY - cy
  const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI)

  let delta = currentAngle - lastAngle
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  continuousAngle += delta
  lastAngle = currentAngle
  let val = (continuousAngle - 180) / 36

  if (val < props.original) {
    val = props.original
    continuousAngle = (props.original * 36) + 180
  }
  if (val > 10) {
    val = 10
    continuousAngle = (10 * 36) + 180
  }
  emit('update:modelValue', Math.round(val * 10) / 10)
}

const stopDrag = () => {
  isDragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchend', stopDrag)
}
</script>

<template>
  <div
    ref="knobRef"
    class="relative h-19 w-19 rounded-full flex flex-col justify-center items-center select-none cursor-pointer shadow-sm transition-colors duration-200"
    :style="{ transform: `scale(${dialScale})`, touchAction: 'none' }"
    :class="isModified ? 'bg-black text-white shadow-lg' : 'bg-white text-text-secondary'"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none"
      :style="{ transform: `rotate(${angle}deg)` }"
    >
      <div
        class="mx-auto w-1 h-2 mt-1.5 rounded-full"
        :class="isModified ? 'bg-white' : 'bg-black'"
      ></div>
    </div>

    <div class="text-[0.65rem] text-center z-10 font-medium leading-tight mb-0.5 px-1">
      {{ displayName }}
    </div>
    <div class="text-base font-semibold z-10" :class="isModified ? 'text-white' : 'text-text-black'">
      {{ displayValue }}
    </div>
  </div>
</template>
