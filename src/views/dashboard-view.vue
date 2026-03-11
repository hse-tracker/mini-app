<script setup lang="ts">
import subjectElement from '@/components/subject/subject-element.vue';
</script>

<template>
  <!--Wrapper-->
  <div class="flex flex-col justify-center items-center">
    <!--Header with navigation-->
    <header class="flex flex-row flex-nowrap h-4 w-full justify-center items-center mt-16">
      <div class="">hse tracker</div>
    </header>

    <!--  Content view switch-->
    <div class="w-40 h-8 mt-4 bg-white rounded-2xl flex items-center justify-around mb-4">
      <img src="/img/UI/list_view.svg" alt="list">
      <img src="/img/UI/bubble_view.svg" alt="">
    </div>

    <subjectElement/>
    <subjectElement/>
    <subjectElement/>
    <subjectElement/>
    <subjectElement/>


    <!--Add new subject-->
    <div class="absolute bottom-5 flex items-center justify-center h-24 w-24 rounded-full bg-button border-3 border-white">
      <img src="/img/UI/plus.svg" alt="">
    </div>
  </div>
</template>
