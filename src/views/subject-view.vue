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

// --- Slider Mode State ---
const activeSliderId = ref<number | null>(null)
let sliderOpenedAt = 0

const activeSliderValue = computed({
  get: () => {
    if (activeSliderId.value === null) return 0;
    return predictions.value[activeSliderId.value]?.current || 0;
  },
  set: (val) => {
    if (activeSliderId.value !== null) {
      updatePrediction(activeSliderId.value, Number(val));
    }
  }
})

const activeSliderOriginal = computed(() => {
  if (activeSliderId.value === null) return 0;
  return predictions.value[activeSliderId.value]?.original || 0;
})

const openSlider = (id: number) => {
  activeSliderId.value = id
  sliderOpenedAt = Date.now()
}

const closeSlider = () => {
  // Safe-check to prevent instantly closing when first long-pressed
  if (activeSliderId.value !== null && Date.now() - sliderOpenedAt > 100) {
    activeSliderId.value = null
  }
}
// -------------------------

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
  <!-- Вся страница слушает клик для закрытия слайдера -->
  <div class="min-h-screen w-full" @click="closeSlider">
    <div v-if="isLoading" class="flex flex-col items-center justify-center h-screen text-text-secondary">
      Загрузка ведомости...
    </div>

    <div v-else-if="!subjectData" class="flex flex-col items-center justify-center h-screen text-accent-red">
      Ошибка загрузки предмета
    </div>

    <!--Wrapper-->
    <div v-else class="flex flex-col flex-nowrap items-center w-full pb-10">

      <!-- Топ Секция: Хедер, Формула и Основной блок (всегда видимые при активном слайдере) -->
      <div class="w-full flex flex-col items-center relative transition-all duration-300"
           :class="{ 'z-40': activeSliderId !== null }">

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

          <!--Assessments block (Крутилки)-->
          <div v-if="rootChildren.length > 0" class="w-86 min-h-33 bg-button border-6 border-white rounded-4xl mt-8 flex flex-row flex-wrap justify-around items-center p-4 gap-4">
            <PredictDial
              v-for="child in rootChildren"
              :key="child.id"
              :element="child"
              :modelValue="predictions[child.id]?.current || 0"
              @update:modelValue="(val) => updatePrediction(child.id, val)"
              :original="predictions[child.id]?.original || 0"
              :isActive="activeSliderId === child.id"
              :isDimmed="activeSliderId !== null && activeSliderId !== child.id"
              @long-press="openSlider"
              @click-active="closeSlider"
            />
          </div>
        </div>
      </div>

      <!-- Backdrop Overlay for Slider Mode (Затемнение) -->
      <transition name="fade">
        <div v-if="activeSliderId !== null"
             class="fixed inset-0 z-30 bg-[#F2F2F6]/90 backdrop-blur-sm">
        </div>
      </transition>

      <!-- Bottom Slider Container (Слайдер Точной Оценки) -> @click.stop предотвращает закрытие -->
      <transition name="slide-up">
        <div v-if="activeSliderId !== null" class="fixed bottom-12 left-0 w-full z-50 flex flex-col items-center" @click.stop>
          <div class="text-text-black text-sm mb-6 font-medium">
            Перемещай для изменения
          </div>

          <!-- Slider UI -->
          <div class="slider-container h-12 w-80 relative flex items-center justify-center">
            <!-- Штрихи линейки -->
            <div class="absolute w-full px-[18px] flex justify-between items-center pointer-events-none opacity-20">
              <div v-for="i in 21" :key="i" class="w-[2px] bg-text-primary rounded-full" :class="i % 5 === 1 ? 'h-6' : 'h-3'"></div>
            </div>

            <input
              type="range"
              class="custom-range w-full absolute inset-0 m-0"
              :min="activeSliderOriginal"
              max="10"
              step="0.1"
              v-model.number="activeSliderValue"
            />
          </div>
        </div>
      </transition>

      <!--Additional info pointer-->
      <div class="flex flex-col justify-center items-center mt-20 mb-10 relative z-20" v-if="folders.length > 0">
        <div class="text-md text-text-secondary mb-2">
          Все оценки по предмету
        </div>
        <img class="h-8" src="/img/UI/down_arrow.svg" alt="">
      </div>

      <!--Assessment blocks-->
      <div class="flex flex-col flex-nowrap gap-6 w-86 relative z-20" v-if="folders.length > 0">
        <AssessmentBlock
          v-for="folder in folders"
          :key="folder.id"
          :folder="folder"
        />
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Custom Range Slider Styling matches Mockup */
.custom-range {
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
  outline: none;
}
.custom-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 48px;
  width: 36px;
  border-radius: 12px;
  border: 2px solid var(--color-text-primary, #1A1A1A);
  background-color: var(--color-background, #F2F2F6);
  background-image: radial-gradient(circle, var(--color-accent-red, #FF453A) 4px, transparent 4px);
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 20;
}
.custom-range::-moz-range-thumb {
  height: 48px;
  width: 36px;
  border-radius: 12px;
  border: 2px solid var(--color-text-primary, #1A1A1A);
  background-color: var(--color-background, #F2F2F6);
  background-image: radial-gradient(circle, var(--color-accent-red, #FF453A) 4px, transparent 4px);
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 20;
}
.custom-range::-webkit-slider-runnable-track {
  width: 100%;
  height: 100%;
  cursor: pointer;
  background: transparent;
}
</style>
