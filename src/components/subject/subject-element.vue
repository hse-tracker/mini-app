<script setup lang="ts">
import { computed, ref } from 'vue'
import router from '@/router'

const props = defineProps<{
  subject: {
    id: number;
    name: string;
    status: string;
    grade?: string | null;
  }
}>()

const emit = defineEmits<{
  (e: 'delete', id: number): void
}>()

const statusMap: Record<string, string> = {
  'processing': 'обрабатывается',
  'ready': 'готово',
  'error': 'ошибка',
}

// long press state
const isDeletingMode = ref(false)
let pressTimer: ReturnType<typeof setTimeout> | null = null
let wasLongPressed = false

const startPress = () => {
  if (isDeletingMode.value) return

  wasLongPressed = false
  pressTimer = setTimeout(() => {
    isDeletingMode.value = true
    wasLongPressed = true
  }, 500)
}

const cancelPress = () => {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

const handleClick = () => {
  if (wasLongPressed) {
    wasLongPressed = false
    return
  }

  if (isDeletingMode.value) {
    isDeletingMode.value = false
  } else {
    router.push({ name: 'Subject', params: { id: props.subject.id } });
  }
}

const onDelete = () => {
  emit('delete', props.subject.id)
  isDeletingMode.value = false
}

const displayGrade = computed(() => {
  if (!props.subject.grade) return '0.0';
  const g = parseFloat(props.subject.grade.replace(',', '.'));
  return isNaN(g) ? props.subject.grade : g.toFixed(1);
});
</script>

<template>
  <div
    class="relative flex flex-row w-86 h-19 bg-surface rounded-2xl shadow-xl overflow-hidden cursor-pointer select-none"
    @mousedown="startPress"
    @touchstart="startPress"
    @mouseup="cancelPress"
    @mouseleave="cancelPress"
    @touchend="cancelPress"
    @touchmove="cancelPress"
    @click="handleClick"
    @contextmenu.prevent
  >

    <div
      class="w-full h-full flex flex-row justify-between items-center pl-4 pr-4 transition-transform duration-300 ease-in-out"
      :class="{ '-translate-x-16': isDeletingMode }"
    >
      <!-- Info block -->
      <div class="h-12 flex flex-row justify-start items-end text-xs text-text-secondary pb-1">
        <!-- Subject name -->
        <div class="truncate max-w-[120px]">
          {{ subject.name }}
        </div>

        <!-- Subject status -->
        <div class="text-accent-red ml-1 whitespace-nowrap">
          · {{ statusMap[subject.status] || subject.status}}
        </div>
      </div>

      <!-- Subject grade -->
      <div class="text-text-black text-6xl font-semibold">
        {{ displayGrade }}
      </div>
    </div>

    <!--Delete button-->
    <div
      @click.stop="onDelete"
      class="absolute right-0 top-0 bottom-0 w-20 flex justify-center items-center transition-transform duration-300 ease-in-out"
      :class="isDeletingMode ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="w-12 h-12 flex justify-center items-center shadow-xl rounded-full bg-button">
        <img src="/img/UI/trash.svg" alt="" class="h-6">
      </div>

    </div>

  </div>
</template>
