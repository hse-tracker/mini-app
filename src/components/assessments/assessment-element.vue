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
</script>

<template>
  <!--Wrapper-->
  <div class="h-19 w-19 rounded-full flex flex-col justify-center items-center bg-white">

    <!--Assessment name-->
    <div class="text-text-secondary text-xs text-center">
      {{ element.name }}
    </div>

    <!--Assessment value-->
    <div class="text-text-secondary text-base font-semibold">
      {{ displayGrade }}
    </div>

  </div>
</template>
