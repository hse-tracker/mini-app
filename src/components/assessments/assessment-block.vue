<script setup lang="ts">
import AssessmentElement from './assessment-element.vue';
import { computed } from 'vue'

const props = defineProps<{
  folder: {
    id: number;
    name: string;
    value?: string | null;
    weight?: number | null;
    children: any[];
  }
}>()

const displayGrade = computed(() => {
  if (!props.folder.value) return '0.0';
  const g = parseFloat(props.folder.value.replace(',', '.'));
  return isNaN(g) ? props.folder.value : g.toFixed(1);
});
</script>

<template>
  <!--Wrapper-->
  <div class="flex flex-col shadow-xl w-86 p-4 rounded-3xl bg-button border-4 border-white">

    <!--Header block-->
    <div class="flex flex-row justify-between mb-10">
      <!--Assessment title-->
      <div class="text-text-black text-md leading-tight max-w-[180px]">
        {{ folder.name }} <br>
        <span class="mt-4 text-xs text-text-secondary inline-block">
          {{ folder.weight ? `Вес: ${folder.weight * 100}%` : 'Папка' }}
        </span>
      </div>
      <!--Assessment grade-->
      <div class="text-text-black text-6xl font-semibold">
        {{ displayGrade }}
      </div>
    </div>

    <!--Assessment elements (Children)-->
    <div class="flex flex-row flex-wrap justify-around w-full gap-y-4 gap-x-2">
      <AssessmentElement
        v-for="child in folder.children"
        :key="child.id"
        :element="child"
      />
    </div>
  </div>
</template>

