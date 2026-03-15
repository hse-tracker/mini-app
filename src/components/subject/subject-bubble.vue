<script setup lang="ts">
import { computed } from 'vue'
import router from '@/router'

const props = defineProps<{
  subject: {
    id: number;
    name: string;
    status: string;
    grade?: number; // TODO: remove mock data
  };
  index: number;
}>()

const currentGrade = computed(() => {
  if (props.subject.grade !== undefined) {
    return Number(props.subject.grade);
  }
  // TODO: replace id by grade
  return ((props.subject.id * 137) % 80 + 20) / 10;
});

// formating grade
const displayGrade = computed(() => currentGrade.value.toFixed(1));

// bubble size logic
const bubbleStyle = computed(() => {
  const g = currentGrade.value;
  const sizeRem = Math.round(g * 2 + 10) * 0.25;

  return {
    width: `${sizeRem}rem`,
    height: `${sizeRem}rem`
  };
});

const textStyle = computed(() => {
  const g = currentGrade.value;
  const textSizePx = Math.round(g * 2 + 20);

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
      @click="router.push({ name: 'Subject' });"
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
