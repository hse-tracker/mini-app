<script setup lang="ts">
import { computed } from 'vue'
import router from '@/router'

const props = defineProps<{
  subject: {
    id: number;
    name: string;
    status: string;
    grade?: string | null;
  };
  index: number;
}>()

const parsedGrade = computed(() => {
  if (!props.subject.grade) return 0;
  const g = parseFloat(props.subject.grade.replace(',', '.'));
  return isNaN(g) ? 0 : g;
});

const displayGrade = computed(() => {
  if (!props.subject.grade) return '-';
  const g = parseFloat(props.subject.grade.replace(',', '.'));
  return isNaN(g) ? props.subject.grade : g.toFixed(1);
});

const bubbleStyle = computed(() => {
  const g = parsedGrade.value;
  const sizeRem = g > 0 ? Math.round(g * 2 + 10) * 0.25 : 3;

  return {
    width: `${sizeRem}rem`,
    height: `${sizeRem}rem`
  };
});

const textStyle = computed(() => {
  const g = parsedGrade.value;
  const textSizePx = g > 0 ? Math.round(g * 2 + 20) : 18;

  return {
    fontSize: `${textSizePx}px`,
    lineHeight: 1
  };
});

// offset config
const offsets =[
  '-translate-y-2', // 8px up
  'translate-y-4',  // 16px down
  '-translate-y-4', // 16px up
  'translate-y-2',  // 8px down
  'translate-y-0',  // center
  'translate-y-5'   // 20px down
];

const offsetClass = computed(() => offsets[props.index % offsets.length]);
</script>

<template>
  <div
    :class="offsetClass"
  >
    <div
      @click="router.push({ name: 'Subject', params: { id: subject.id } });"
      :style="bubbleStyle"
      class="flex flex-col justify-center items-center bg-surface rounded-full shadow-xl shrink-0 cursor-pointer transition-all duration-300"
    >
      <!--Grade-->
      <div>
        <div class="text-text-black font-semibold" :style=textStyle>
          {{ displayGrade }}
        </div>
      </div>
    </div>
    <!--Subject name-->
    <div class="text-text-secondary text-center px-3 leading-tight mt-3 line-clamp-2 text-sm">
      {{ subject.name }}
    </div>
  </div>


</template>
