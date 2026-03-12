<script setup lang="ts">
import assessmentElement from './assessment-element.vue';
</script>

<template>
  <!--Wrapper-->
  <div class="flex flex-col shadow-xl w-86 p-4 rounded-3xl bg-button border-4 border-white">

    <!--Header block-->
    <div class="flex flex-row justify-between mb-10">
      <!--Assessment title-->
      <div class="text-text-black text-md">
        Домашняя работа <br>
        <span class="mt-4 text-xs text-text-secondary">
          Общий накоп
        </span>
      </div>
      <!--Assessment grade-->
      <div class="text-text-black text-6xl font-semibold">
        2.50
      </div>
    </div>

    <!--Assessment elements-->
    <div class="flex flex-row flex-wrap justify-around w-full gap-8">
      <assessmentElement/>
      <assessmentElement/>
      <assessmentElement/>
      <assessmentElement/>
      <assessmentElement/>
      <assessmentElement/>
    </div>
  </div>
</template>
