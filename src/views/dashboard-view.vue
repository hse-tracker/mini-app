<script setup lang="ts">
import subjectElement from '@/components/subject/subject-element.vue';
import router from '@/router'
import { onMounted, ref } from 'vue'
import { useAuth } from '@/composables/use-auth.ts'
import subjectBubble from '@/components/subject/subject-bubble.vue';

const { getToken } = useAuth()

// eslint-disable-next-line
const subjects = ref<any[]>([])
const isLoading = ref(true)

const fetchSubjects = async () => {
  try {
    isLoading.value = true
    const token = getToken()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subjects`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`internal error: ${response.status}`)
    }

    const data = await response.json()

    console.log(data)

    subjects.value = data || []
  } catch (e) {
    console.error("error while loading subjects: ", e)
  } finally {
    isLoading.value = false
  }
}

const viewMode = ref<'list' | 'bubble'>('bubble')

onMounted(() => {
  fetchSubjects()
})

const deleteSubjectHandler = async (id: number) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subjects/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    })

    if (!response.ok) {
      throw new Error(`error: ${response.status}`)
    }

    subjects.value = subjects.value.filter(s => s.id !== id)
  } catch (e) {
    console.error("Ошибка при удалении:", e)
    alert("Не удалось удалить предмет")
  }
}
</script>

<template>
  <div class="flex flex-col justify-center items-center">
    <!--Header with navigation-->
    <header class="flex flex-row flex-nowrap h-4 w-full justify-center items-center mt-10">
      <div class="">hse tracker</div>
    </header>

    <!--Content view switch-->
    <div class="w-40 h-8 mt-4 bg-white rounded-2xl flex items-center justify-around mb-4">
      <!--List toggle-->
      <img
        src="/img/UI/list_view.svg"
        alt="list"
        class="cursor-pointer transition-opacity"
        :class="{ 'opacity-30': viewMode === 'bubble' }"
        @click="viewMode = 'list'"
      >
      <!--Bubble toggle-->
      <img
        src="/img/UI/bubble_view.svg"
        alt="bubble"
        class="cursor-pointer transition-opacity"
        :class="{ 'opacity-30': viewMode === 'list' }"
        @click="viewMode = 'bubble'"
      >
    </div>

    <!--Loading -->
    <div v-if="isLoading" class="mt-10 text-text-secondary">
      Загрузка предметов...
    </div>

    <!--No subjects -->
    <div v-else-if="subjects.length === 0"
         class="mt-60 text-center">
      Здесь будут показываться <br>
      отслеживаемые дисциплины. <br>
      Нажми на <span class="text-accent-red">«+»</span>, чтобы добавить предмет
    </div>

    <!--Subject list & Bubbles-->
    <div
      v-else
      class="w-full flex justify-center items-center">
      <!--List view-->
      <div v-if="viewMode === 'list'" class="flex flex-col gap-2 w-full items-center">
        <subjectElement
          v-for="subject in subjects"
          :key="subject.id"
          :subject="subject"
          @delete="deleteSubjectHandler"
        />
      </div>

      <!--Bubbles view-->
      <div
        v-else
        class="flex flex-row flex-wrap justify-center items-center gap-x-8 gap-y-8
        w-86 h-160 shadow-2xl px-6 mt-3 rounded-4xl bg-color-button py-8 p-5">
        <subjectBubble
          v-for="(subject, index) in subjects"
          :key="subject.id"
          :subject="subject"
          :index="index"
        />
      </div>
    </div>

    <!--Add new subject-->
    <div
      @click="router.push({ name: 'AddSubject' });"
      class="fixed bottom-5 flex items-center justify-center h-24 w-24 rounded-full bg-button border-3 border-white">
      <img src="/img/UI/plus.svg" alt="">
    </div>
  </div>
</template>
