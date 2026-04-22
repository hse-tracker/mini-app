<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  element: {
    name: string;
    value?: string | null;
  }
}>()

const displayGrade = computed(() => {
  if (!props.element.value) return '0.0';
  const g = parseFloat(props.element.value.replace(',', '.'));
  return isNaN(g) ? props.element.value : g.toFixed(1);
});

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
});
</script>

<template>
  <!--Wrapper-->
  <div class="h-19 w-19 rounded-full flex flex-col justify-center items-center bg-white">

    <!--Assessment name-->
    <div class="text-text-secondary text-xs text-center">
      {{ displayName }}
    </div>

    <!--Assessment value-->
    <div class="text-text-secondary text-base font-semibold">
      {{ displayGrade }}
    </div>

  </div>
</template>
