<script setup lang="ts">

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/use-auth.ts'

import AssessmentElement from '@/components/assessments/assessment-element.vue'
import AssessmentBlock from '@/components/assessments/assessment-block.vue'

const router = useRouter()
const route = useRoute()
const { getToken } = useAuth()

const subjectData = ref<any>(null)
const isLoading = ref(true)
const notificationsEnabled = ref(true)

const toggleNotifications = () => {
  notificationsEnabled.value = !notificationsEnabled.value;
  // TODO: implement PATCH-request to backend
}

// get subject by ID
const fetchSubjectData = async () => {
  try {
    isLoading.value = true
    const token = getToken()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subjects/${route.params.id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`)
    }

    subjectData.value = await response.json()
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchSubjectData()
})

// main node ("Итог")
const rootNode = computed(() => subjectData.value?.structure?.[0] || null)

const displayGrade = computed(() => {
  const val = rootNode.value?.value;
  if (!val) return '0.0'; // Если оценки еще нет

  const normalizedVal = val.replace(',', '.');
  const num = parseFloat(normalizedVal);

  if (isNaN(num)) {
    return val;
  }

  return num.toFixed(1);
});

const rootChildren = computed(() => rootNode.value?.children ||[])
const folders = computed(() => {
  return rootChildren.value.filter((child: any) => child.type === 'folder' || child.children?.length > 0)
})

</script>

<template>
  <div class="min-h-screen w-full">
    <div v-if="isLoading" class="flex flex-col items-center justify-center h-screen text-text-secondary">
      Загрузка ведомости...
    </div>

    <div v-else-if="!subjectData" class="flex flex-col items-center justify-center h-screen text-accent-red">
      Ошибка загрузки предмета
    </div>

    <!--Wrapper-->
    <div v-else class="flex flex-col flex-nowrap items-center w-full pb-10">

      <!--Header with navigation-->
      <header class="flex flex-row flex-nowrap h-4 w-full justify-between items-center mt-16 px-6">
        <img
          @click="router.push({ name: 'Dashboard' })"
          class="cursor-pointer" src="/img/back_arrow.svg" alt=""
        />
        <!--Subject name -->
        <div class="text-lg font-medium truncate max-w-[200px]">
          {{ subjectData.name }}
        </div>
        <img
          @click="toggleNotifications"
          class="cursor-pointer"
          :src="notificationsEnabled ? '/img/UI/bell.svg' : '/img/UI/bell_off.svg'"
          alt="уведомления"
        />
      </header>

      <!--Subject formula-->
      <div class="text-base text-text-secondary text-center mt-4 px-4 min-h-[48px]">
        Текущая оценка: <br> {{ rootNode?.display_formula || 'Формула не задана' }}
      </div>

      <!--Main block-->
      <div class="mt-12 flex flex-col items-center">
        <!--Current grade-->
        <div class="w-82 h-82 text-[7rem] flex justify-center items-center text-text-black
        bg-button border-6 border-white rounded-full font-semibold shadow-2xl">
          {{ displayGrade }}
        </div>

        <!--Assessments block (Root Children)-->
        <div v-if="rootChildren.length > 0" class="w-86 min-h-33 bg-button border-6 border-white rounded-4xl mt-8
        flex flex-row flex-wrap justify-around items-center p-4 gap-4">
          <AssessmentElement
            v-for="child in rootChildren"
            :key="child.id"
            :element="child"
          />
        </div>
      </div>

      <!--Additional info pointer-->
      <div class="flex flex-col justify-center items-center mt-20 mb-10" v-if="folders.length > 0">
        <div class="text-md text-text-secondary mb-2">
          Все оценки по предмету
        </div>
        <img class="h-8" src="/img/UI/down_arrow.svg" alt="">
      </div>

      <!--Assessment blocks-->
      <div class="flex flex-col flex-nowrap gap-6 w-86" v-if="folders.length > 0">
        <AssessmentBlock
          v-for="folder in folders"
          :key="folder.id"
          :folder="folder"
        />
      </div>

    </div>
  </div>
</template>
