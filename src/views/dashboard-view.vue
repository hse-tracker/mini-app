<script setup lang="ts">
import subjectElement from '@/components/subject/subject-element.vue';
import router from '@/router'
import { onMounted, ref } from 'vue'
import { useAuth } from '@/composables/use-auth.ts'
import subjectBubble from '@/components/subject/subject-bubble.vue';
import { trackEvent, logUXToBackend } from '@/utils/analytics';

const { getToken, logout } = useAuth()

// eslint-disable-next-line
const subjects = ref<any[]>([])
const isLoading = ref(true)

const isErrorSheetOpen = ref(false)
const currentErrorMessage = ref('')

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

    if (response.status === 401) {
      logout()
      return
    }

    if (!response.ok) {
      throw new Error(`internal error: ${response.status}`)
    }

    const data = await response.json()

    console.log(data)

    subjects.value = data || []

    if (subjects.value.length > 0) {
      const tracked = JSON.parse(localStorage.getItem('tracked_subscriptions') || '[]')
      let hasNewSubscriptions = false

      subjects.value.forEach((sub: any) => {
        if (!sub.is_creator && !tracked.includes(sub.id)) {
          trackEvent('existing_sheet_subscribed', { subject_id: sub.id })
          tracked.push(sub.id)
          hasNewSubscriptions = true
        }
      })

      if (hasNewSubscriptions) {
        localStorage.setItem('tracked_subscriptions', JSON.stringify(tracked))
      }
    }

  } catch (e) {
    console.error("error while loading subjects: ", e)
  } finally {
    isLoading.value = false
  }
}

const viewMode = ref<'list' | 'bubble'>('bubble')

const switchViewMode = (mode: 'list' | 'bubble') => {
  viewMode.value = mode;
  trackEvent('view_switched', { view_type: mode });
  logUXToBackend(`view_switched_to_${mode}`, getToken() || '');
}

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

// error handling
const categorizeError = (rawMsg: string) => {
  if (!rawMsg) return 'Произошла непредвиденная ошибка при обработке таблицы.';

  const lowerMsg = rawMsg.toLowerCase();

  if (lowerMsg.includes('invalid google sheets url') || lowerMsg.includes('regex')) {
    return 'Ссылка некорректная - проверь адрес ссылки и попробуй прикрепить её снова. Если возникнут трудности, пиши в чат телеграм-бота с описанием проблемы';
  }
  if (lowerMsg.includes('403') || lowerMsg.includes('permission')) {
    return 'Нет доступа к таблице. Убедитесь, что в настройках доступа Google Диска выбран пункт "Все, у кого есть ссылка" (с правами читателя).';
  }
  if (lowerMsg.includes('400') || lowerMsg.includes('xlsx') || lowerMsg.includes('unsupported')) {
    return 'Некорректный тип таблицы. Похоже, это Excel-файл (.xlsx). Откройте его через Google Таблицы и сохраните как Google Таблицу.';
  }

  return `Неизвестная ошибка обработки. Попробуйте удалить и добавить предмет заново.`;
}

const openErrorSheet = (rawMessage: string) => {
  currentErrorMessage.value = categorizeError(rawMessage);
  isErrorSheetOpen.value = true;
}

const closeErrorSheet = () => {
  isErrorSheetOpen.value = false;
}
</script>

<template>
  <div class="flex flex-col justify-center items-center">
    <!--Header with navigation-->
    <header class="flex flex-row flex-nowrap h-4 w-full justify-between items-center mt-24">
      <div class="w-5 ml-5"></div>
      <div class="">hse tracker</div>

      <div
        @click="logout"
        class="w-5 mr-5"
      >
        <img class="w-5 mr-5" src="/img/UI/logout.svg" alt="">
      </div>
    </header>

    <!--Content view switch-->
    <div class="w-40 h-8 mt-4 bg-white rounded-2xl flex items-center justify-around mb-4">
      <!--List toggle-->
      <img
        src="/img/UI/list_view.svg"
        alt="list"
        class="cursor-pointer transition-opacity"
        :class="{ 'opacity-30': viewMode === 'bubble' }"
        @click="switchViewMode('list')"
      >
      <!--Bubble toggle-->
      <img
        src="/img/UI/bubble_view.svg"
        alt="bubble"
        class="cursor-pointer transition-opacity"
        :class="{ 'opacity-30': viewMode === 'list' }"
        @click="switchViewMode('bubble')"
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
          @show-error="openErrorSheet"
        />
      </div>

      <!--Bubbles view-->
      <div
        v-else
        class="flex flex-row flex-wrap justify-center items-center gap-x-8 gap-y-8
        w-86 min-h-[40rem] pb-36 shadow-2xl px-6 mt-3 rounded-4xl bg-color-button py-8 p-5">
        <subjectBubble
          v-for="(subject, index) in subjects"
          :key="subject.id"
          :subject="subject"
          :index="index"
          @show-error="openErrorSheet"
        />
      </div>
    </div>

    <!--Add new subject-->
    <div
      @click="trackEvent('start_setup'); router.push({ name: 'AddSubject' });"
      class="fixed bottom-5 flex items-center justify-center h-24 w-24 rounded-full bg-button border-3 border-white">
      <img src="/img/UI/plus.svg" alt="">
    </div>

    <!-- Error sheet -->
    <transition name="slide-up">
      <div
        v-if="isErrorSheetOpen"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
        @click="closeErrorSheet"
      >
        <div
          class="bg-tutor w-full max-w-md h-92 p-6 pb-10 rounded-t-[32px]
          flex flex-col items-center justify-between shadow-2xl"
          @click.stop
        >

          <h2 class="text-xl text-red-500 mb-3">
            Ошибка
          </h2>

          <p class="font-semibold text-white text-center text-md leading-relaxed px-2 w-88">
            {{ currentErrorMessage }}
          </p>

          <div
            @click="closeErrorSheet"
            class="w-21 h-8 flex justify-center items-center text-md bg-accent-red text-white font-semibold rounded-xl transition-colors"
          >
            Окей →
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.3s ease-out;
}
.slide-up-enter-active > div,
.slide-up-leave-active > div {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}
.slide-up-enter-from > div,
.slide-up-leave-to > div {
  transform: translateY(100%);
}
</style>
