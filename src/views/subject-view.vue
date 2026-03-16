<script setup lang="ts">
import router from '@/router'
import AssessmentElement from '@/components/assessments/assessment-element.vue'
import AssessmentBlock from '@/components/assessments/assessment-block.vue'
import { ref } from 'vue'

const notificationsEnabled = ref(true)

const toggleNotifications = () => {
  notificationsEnabled.value = !notificationsEnabled.value;

  // TODO: implement PATCH-request to backend
}
</script>

<template>
  <!--Wrapper-->
  <div class="flex flex-col flex-nowrap items-center">

    <!--Header with navigation-->
    <header class="flex flex-row flex-nowrap h-4 w-full justify-between items-center mt-16">
      <img
        @click="router.push({ name: 'Dashboard' })"
        class="ml-6" src="/img/back_arrow.svg" alt=""
      />
      <div class="">анализ данных</div>
      <img
        @click="toggleNotifications"
        class="mr-6 cursor-pointer"
        :src="notificationsEnabled ? '/img/UI/bell.svg' : '/img/UI/bell_off.svg'"
        alt="уведомления"
      />
    </header>

    <!--Subject formula-->
    <div class="text-base text-text-secondary text-center mt-4">
      Текущая оценка: <br> 8*0.25 + 0*0.25 + 0*0.5
    </div>

    <!--Main block-->
    <div class="mt-12">
      <!--Current grade-->
      <div class="w-82 h-82 text-[7rem] flex justify-center items-center text-text-black
      bg-button border-6 border-white rounded-full font-semibold">
        2.0
      </div>

      <!--Assessments block-->
      <div class="w-86 h-33 bg-button border-6 border-white rounded-4xl mt-8
      flex flex-row flex-wrap justify-around items-center">
        <AssessmentElement/>
        <AssessmentElement/>
        <AssessmentElement/>
      </div>
    </div>

    <!--Additional info pointer-->
    <div class="flex flex-col justify-center mt-30 mb-10">
      <div class="text-md text-text-secondary">
        Все оценки по предмету
      </div>
      <img class="h-8" src="/img/UI/down_arrow.svg" alt="">
    </div>

    <!--Assessment blocks-->
    <div class="flex flex-col flex-nowrap gap-4">
      <AssessmentBlock/>
      <AssessmentBlock/>
      <AssessmentBlock/>
    </div>

  </div>
</template>
