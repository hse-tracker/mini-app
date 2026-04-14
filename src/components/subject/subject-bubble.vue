<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import router from '@/router'

const props = defineProps<{
  subject: {
    id: number;
    name: string;
    status: string;
    grade?: string | null;
    error_message?: string | null;
  };
  index: number;
}>()

const emit = defineEmits<{
  (e: 'show-error', msg: string): void
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

const bubbleRef = ref<HTMLElement | null>(null);
const dodgeTransform = ref('translate(0px, 0px)');

const handleScroll = () => {
  if (!bubbleRef.value) return;
  const rect = bubbleRef.value.getBoundingClientRect();

  const fabX = window.innerWidth / 2;
  const fabY = window.innerHeight - 60;

  const bubbleX = rect.left + rect.width / 2;
  const bubbleY = rect.top + rect.height / 2;

  const dx = bubbleX - fabX;
  const dy = bubbleY - fabY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 110) {
    const pushStrength = ((110 - dist) / 110) * 25;
    const angle = Math.atan2(dy, dx);
    const tx = Math.cos(angle) * pushStrength;
    const ty = Math.sin(angle) * pushStrength;
    dodgeTransform.value = `translate(${tx}px, ${ty}px)`;
  } else {
    dodgeTransform.value = 'translate(0px, 0px)';
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('touchmove', handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('touchmove', handleScroll);
});

const handleClick = () => {
  if (props.subject.status === 'error') {
    emit('show-error', props.subject.error_message || '')
  } else {
    router.push({ name: 'Subject', params: { id: props.subject.id } });
  }
}
</script>

<template>
  <div
    ref="bubbleRef"
    :class="offsetClass"
    :style="{ transform: dodgeTransform, transition: 'transform 0.1s ease-out' }"
  >
    <div
      @click="handleClick"
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
