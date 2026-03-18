<script setup lang="ts">
import router from '@/router'
import { reactive } from 'vue'
import { useAuth } from '@/composables/use-auth.ts'

const { getToken } = useAuth()

// initial subject data
const subjectData = reactive({
  name: '',
  url: '',
})

// sending subject data to backend
const sendSubject = async () => {
  if (!subjectData.name.trim() || !subjectData.url.trim()) {
    alert('Заполните оба поля')
    return;
  }

  try {
    console.log("Sending in process... ", subjectData);

    const token = getToken()

    // sending request
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subjects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(subjectData)
    })

    // error checker
    if (!response.ok) {
      throw new Error(`${response.status}`)
    }

    await router.push({ name: 'Dashboard' })

  } catch (e) {
    console.error(e)
    alert(e)
  }
}
</script>

<template>
  <div
    @click="router.push({ name: 'Dashboard' });"
    class="flex flex-col justify-start items-center bg-black-background w-full h-screen">

    <!--Subject name input-->
    <div
      @click.stop
      class="w-86 h-51 flex flex-col justify-center items-center bg-white rounded-4xl mt-16 mb-3">
      <!--Name input-->
      <input
        v-model="subjectData.name"
        type="text"
        placeholder="CS2?"
        class="leading-[4rem] w-74 h-15 text-text-secondary !text-5xl !text-center"
      >
      <!--Input subtitle-->
      <div class="text-xs text-text-secondary">
        впиши сюда название предмета
      </div>
    </div>

    <!--URL input-->
    <div
      @click.stop
      class="relative w-86 h-51 flex flex-col justify-center items-center bg-white rounded-4xl">
      <!--URL input-->
      <input
        v-model="subjectData.url"
        type="text"
        placeholder="https://"
        class=" w-74 h-15 text-text-secondary placeholder:text-5xl !text-center"
      >
      <!--Input subtitle-->
      <div class="text-xs text-text-secondary">
        впиши сюда ссылку на ведомость предмета
      </div>

      <div
        @click="sendSubject"
        class="absolute -bottom-7 w-45 h-15 px-8 py-6 bg-orange-600 text-white rounded-[32px] shadow-[0px_0px_18.8px_0px_rgba(0,0,0,0.15)] shadow-[inset_0px_0px_7.1px_3px_rgba(255,255,255,1.00)] shadow-[inset_0px_0px_18.4px_3px_rgba(255,255,255,1.00)] shadow-[inset_0px_0px_4.2px_3px_rgba(255,255,255,1.00)] inline-flex justify-center items-center gap-2.5">
        <button class="text-center justify-start">
          Отправить
        </button>
      </div>
    </div>
  </div>
</template>
