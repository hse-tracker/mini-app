<script setup lang="ts">
import { ref, computed } from 'vue'
import { trackEvent } from '@/utils/analytics'

const props = defineProps<{
  element: { id?: number; name: string; weight?: number | null };
  modelValue: number;
  original: number;
  isActive?: boolean;
  isDimmed?: boolean;
}>()

const emit = defineEmits(['update:modelValue', 'long-press', 'click-active'])

const knobRef = ref<HTMLElement | null>(null)

let isDragging = false
let lastAngle = 0
let continuousAngle = 0

// Variables for long press detection
let pressTimer: ReturnType<typeof setTimeout> | null = null;
let startX = 0;
let startY = 0;
let wasLongPressed = false;

// Update styling condition to consider active state
const isStylingActive = computed(() => {
  return Math.abs(props.modelValue - props.original) > 0.01 || props.isActive
})

const displayValue = computed(() => {
  return props.modelValue.toFixed(1)
})

const displayName = computed(() => {
  let name = props.element.name;
  if (!name) return '';

  const num = parseInt(name, 10);
  if (!isNaN(num) && num > 45000 && num < 50000) {
    const date = new Date(1899, 11, 30);
    date.setDate(date.getDate() + num);

    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    name = `${d}.${m}.${y}`;
  }

  return name.length > 7
    ? name.slice(0, 7) + '...'
    : name;
})

const angle = computed(() => {
  return ((props.modelValue / 10) * 360 + 180) % 360
})

const dialScale = computed(() => {
  const diff = props.modelValue - props.original
  return 1 + diff * 0.035
})

// Helper to get touch/mouse coordinates consistently
const getClientXY = (e: MouseEvent | TouchEvent) => {
  if ('touches' in e) {
    const touchEvent = e as TouchEvent;
    if (touchEvent.touches && touchEvent.touches.length > 0) {
      const touch = touchEvent.touches[0];
      if (touch) {
        return { x: touch.clientX, y: touch.clientY };
      }
    }
  } else {
    const mouseEvent = e as MouseEvent;
    return { x: mouseEvent.clientX, y: mouseEvent.clientY };
  }
  return { x: 0, y: 0 };
}

const startDrag = (e: MouseEvent | TouchEvent) => {
  e.preventDefault()

  // Do nothing if it's dimmed out by another active slider
  if (props.isDimmed) return;

  const pos = getClientXY(e);

  // If already active, prepare to handle normal click out
  if (props.isActive) {
    startX = pos.x;
    startY = pos.y;
    const handleRelease = (ev: MouseEvent | TouchEvent) => {
      const current = getClientXY(ev);
      if (Math.abs(current.x - startX) < 10 && Math.abs(current.y - startY) < 10) {
        emit('click-active'); // Exact click to close
      }
      window.removeEventListener('mouseup', handleRelease);
      window.removeEventListener('touchend', handleRelease);
    };
    window.addEventListener('mouseup', handleRelease);
    window.addEventListener('touchend', handleRelease);
    return; // Block default dial drag if it's currently in slider mode
  }

  if (!knobRef.value) return

  const rect = knobRef.value.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  startX = pos.x;
  startY = pos.y;
  const dx = pos.x - cx
  const dy = pos.y - cy

  wasLongPressed = false;

  // Initialize Long Press
  pressTimer = setTimeout(() => {
    wasLongPressed = true;
    emit('long-press', props.element.id);
    stopDrag(); // Cancel normal drag mechanisms if long press triggers
  }, 400);

  isDragging = true
  lastAngle = Math.atan2(dy, dx) * (180 / Math.PI)
  if (!knobRef.value?.dataset.tracked) {
    trackEvent('calculation_performed');
    if (knobRef.value) knobRef.value.dataset.tracked = "true";
  }
  continuousAngle = (props.modelValue / 10) * 360 + 180

  window.addEventListener('mousemove', onDrag)
  window.addEventListener('touchmove', onDrag, { passive: false })
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchend', stopDrag)
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (e.cancelable) e.preventDefault()

  const pos = getClientXY(e);

  // Cancel long press if the user dragged significantly
  if (pressTimer) {
    if (Math.abs(pos.x - startX) > 10 || Math.abs(pos.y - startY) > 10) {
      clearTimeout(pressTimer);
      pressTimer = null;
    } else {
      return; // Await timer inside deadzone
    }
  }

  if (!knobRef.value || !isDragging) return

  const rect = knobRef.value.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  const dx = pos.x - cx
  const dy = pos.y - cy
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
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
  isDragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchend', stopDrag)
}

const handleClick = (e: Event) => {
  if (wasLongPressed) {
    e.stopPropagation();
    e.preventDefault();
    wasLongPressed = false;
  }
}
</script>

<template>
  <div
    ref="knobRef"
    class="relative h-19 w-19 rounded-full flex flex-col justify-center items-center select-none cursor-pointer transition-all duration-300"
    :style="{ transform: `scale(${dialScale})`, touchAction: 'none' }"
    :class="[
      isStylingActive ? 'bg-black text-white shadow-lg' : 'bg-white text-text-secondary shadow-sm',
      isDimmed ? 'opacity-30 pointer-events-none' : '',
      isActive ? 'z-50 ring-4 ring-black/5' : ''
    ]"
    @mousedown="startDrag"
    @touchstart="startDrag"
    @click="handleClick"
  >
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none"
      :style="{ transform: `rotate(${angle}deg)` }"
    >
      <div
        class="mx-auto w-1 h-2 mt-1.5 rounded-full transition-colors duration-200"
        :class="isStylingActive ? 'bg-white' : 'bg-black'"
      ></div>
    </div>

    <div class="text-[0.65rem] text-center z-10 font-medium leading-tight mb-0.5 px-1">
      {{ displayName }}
    </div>
    <div class="text-base font-semibold z-10 transition-colors duration-200" :class="isStylingActive ? 'text-white' : 'text-text-black'">
      {{ displayValue }}
    </div>
  </div>
</template>
