<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

// steps components
import registrationIntro from '@/components/registration/registration-intro.vue'
import nameStep from '@/components/registration/name-step.vue'
import groupStep from '@/components/registration/group-step.vue'

import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/use-auth.ts'

// current step
const step = ref(1)
const router = useRouter()
const { setToken } = useAuth();

// registration data
const formData = reactive({
  init_data: '',
  full_name: '',
  group: '',
})

onMounted(() => {
  const tg = window.Telegram?.WebApp;
  if (tg?.initData) {
    formData.init_data = tg.initData;
  } else {
    // formData.init_data = "mock_local_data";
    console.warn("No Telegram initData found");
  }
})

// sending formData to backend
const finishRegistration = async () => {
  try {
    console.log("Sending in process... ", formData);

    // sending request
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData)
    })

    // error checker
    if (!response.ok) {
      throw new Error(`${response.status}`)
    }

    const data = await response.json()

    // checker if token exists
    if (data.token) {
      setToken(data.token)
      await router.push({ name: 'Tutorial' });
    } else {
      throw new Error("No response from the server")
    }
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <div class="h-full">
    <!--Header with navigation-->
    <header class="flex flex-row flex-nowrap h-4 w-full justify-between items-center mt-16">
      <div v-if="step === 1"></div>
      <img class="ml-6" v-if="step > 1" @click="step--" src="/img/back_arrow.svg" alt="" />

      <div class="" v-if="step === 1">hse tracker</div>
      <div class="" v-if="step > 1">регистрация</div>

      <div class="mr-6"></div>
    </header>

    <Transition name="slide-fade" mode="out-in">
      <div :key="step">
        <registration-intro
          v-if="step === 1"
          @next="step++"
        />

        <name-step
          v-else-if="step === 2"
          v-model="formData.full_name"
          @next="step++"
        />

        <group-step
          v-else-if="step === 3"
          v-model="formData.group"
          @next="finishRegistration"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active { transition: all 0.3s ease-out; }
.slide-fade-enter-from { transform: translateX(20px); opacity: 0; }
.slide-fade-leave-to { transform: translateX(-20px); opacity: 0; }
</style>
