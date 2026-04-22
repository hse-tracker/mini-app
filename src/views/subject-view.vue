<script setup lang="ts">

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/use-auth.ts'

import AssessmentBlock from '@/components/assessments/assessment-block.vue'
import PredictDial from '@/components/assessments/predict-dial.vue'

const router = useRouter()
const route = useRoute()
const { getToken, logout } = useAuth()

const subjectData = ref<any>(null)
const isLoading = ref(true)
const notificationsEnabled = ref(true)

// local storage { id: { original: 0, current: 0, weight: 0.5 } }
const predictions = ref<Record<number, { original: number, current: number, weight: number }>>({})

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

    if (response.status === 401) {
      logout()
      return
    }

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`)
    }

    subjectData.value = await response.json()

    const root = subjectData.value?.structure?.[0] || null;
    if (root && root.children) {
      const newPredictions: Record<number, any> = {};
      root.children.forEach((child: any) => {
        let val = 0;
        if (child.value) {
          const parsed = parseFloat(child.value.replace(',', '.'));
          if (!isNaN(parsed)) val = parsed;
        }
        newPredictions[child.id] = {
          original: val,
          current: val,
          weight: child.weight || 0
        };
      });
      predictions.value = newPredictions;
    }
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

const rootChildren = computed<any[]>(() => rootNode.value?.children || [])
const folders = computed(() => {
  return rootChildren.value.filter((child: any) => child.type === 'folder' || child.children?.length > 0)
})

const isAnyDialModified = computed(() => {
  return Object.values(predictions.value).some(p => Math.abs(p.current - p.original) > 0.01);
})

const originalOverallGrade = computed(() => {
  const val = rootNode.value?.value;
  if (!val) return '0.0';
  const num = parseFloat(val.replace(',', '.'));
  return isNaN(num) ? val : num.toFixed(1);
});

const displayPredictedGrade = computed(() => {
  if (!isAnyDialModified.value) {
    return originalOverallGrade.value;
  }

  let sum = 0;
  for (const child of rootChildren.value) {
    const p = predictions.value[child.id];
    const val = p ? p.current : 0;
    const w = child.weight || 0;
    sum += val * w;
  }
  return sum.toFixed(1);
});

const updatePrediction = (id: number, val: number) => {
  if (predictions.value[id]) {
    predictions.value[id].current = val;
  }
}
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
      <header class="flex flex-row flex-nowrap h-4 w-full justify-between items-center mt-24 px-6">
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
        <div class="relative w-82 h-82 text-[7rem] flex justify-center items-center text-text-black bg-button border-6 border-white rounded-full font-semibold shadow-2xl">

          <!-- Dots on the main grade -->
          <div v-for="(child, index) in rootChildren" :key="'dot-' + child.id"
               class="absolute top-0 left-0 w-full h-full pointer-events-none transition-transform duration-75"
               :style="{ transform: `rotate(${((predictions[child.id]?.current || 0) * 36) + 180}deg)` }">

            <div class="mx-auto w-2 h-2 rounded-full transition-colors duration-300"
                 :style="{ marginTop: `${16 + (index % 4) * 12}px` }"
                 :class="(predictions[child.id]?.current !== predictions[child.id]?.original) ? 'bg-accent-red' : 'bg-text-secondary'">
            </div>
          </div>

          <!-- Grade texts container -->
          <div class="z-10 flex flex-col items-center justify-center relative w-full h-full">

            <!-- Original grade -->
            <div
              class="absolute top-[20%] text-text-secondary text-3xl font-medium transition-opacity duration-300"
              :class="isAnyDialModified ? 'opacity-100' : 'opacity-0'"
            >
              {{ originalOverallGrade }}
            </div>

            <!-- New predicted grade -->
            <span>{{ displayPredictedGrade }}</span>
          </div>
        </div>

        <!--Assessments block (Root Children - ТЕПЕРЬ С КРУТИЛКАМИ)-->
        <div v-if="rootChildren.length > 0" class="w-86 min-h-33 bg-button border-6 border-white rounded-4xl mt-8 flex flex-row flex-wrap justify-around items-center p-4 gap-4">
          <PredictDial
            v-for="child in rootChildren"
            :key="child.id"
            :element="child"
            :modelValue="predictions[child.id]?.current || 0"
            @update:modelValue="(val) => updatePrediction(child.id, val)"
            :original="predictions[child.id]?.original || 0"
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
