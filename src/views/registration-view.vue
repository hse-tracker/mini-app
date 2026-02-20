<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import registrationIntro from '@/components/registration/registration-intro.vue'
import nameStep from '@/components/registration/name-step.vue'
import groupStep from '@/components/registration/group-step.vue'
import { useRouter } from 'vue-router'

const step = ref(1)
const router = useRouter()

const stepsMap: Record<number, any> = {
  1: registrationIntro,
  2: nameStep,
  3: groupStep,
}

const currentComponent = computed(() => stepsMap[step.value])

const formData = reactive({
  full_name: '',
  faculty: '',
  program: '',
  course_number: '',
  group: '',
})

// const finishRegistration = () => {
//   console.log("Sending in process: ", formData);
//   // TODO: Add sending logic
//
//   router.push('/dashboard');
// }
</script>

<template>
  <div class="registration-container">
    <!--Header with navigation-->
    <header class="header_nav" v-if="step > 1">
      <img class="header_back" @click="step--" src="/img/back_registration.svg" alt="" />
      <span class="header_title"> регистрация </span>
      <div class="header_right"></div>
    </header>

    <Transition name="slide-fade" mode="out-in">
      <component
        v-if="currentComponent"
        :is="currentComponent"
        :key="step"
        v-model="formData.full_name"
        @next="step++"
      />
    </Transition>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.header_nav{
  height: 6rem;
  width: 100vw;

  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
}

.header_back{
  margin-left: 1.5rem;
}
.header_right{
  margin-right: 1.5rem;
}
</style>
