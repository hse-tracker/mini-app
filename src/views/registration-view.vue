<script setup lang="ts">
import { ref, reactive } from 'vue'
import registrationIntro from '@/components/registration/registration-intro.vue'
import nameStep from '@/components/registration/name-step.vue'
import groupStep from '@/components/registration/group-step.vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/use-auth.ts'

const step = ref(1)
const router = useRouter()
const { setToken } = useAuth();

const formData = reactive({
  full_name: '',
  group: '',
})

const goToLogin = () => {
  console.log("not implemented")
  // TODO: implement login func
}

const finishRegistration = async () => {
  try {
    console.log("Sending in process... ", formData);

    const response = await fetch("http://localhost:8080/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO: add tg mini app initData
      },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      throw new Error(`${response.status}`)
    }

    const data = await response.json()

    if (data.token) {
      setToken(data.token)
      router.push({name: 'Dashboard'});
    } else {
      throw new Error("No response from the server")
    }
  } catch (e) {
    console.error(e)
  }
}
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
      <div :key="step">
        <registration-intro
          v-if="step === 1"
          @next="step++"
          @login="goToLogin"
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
