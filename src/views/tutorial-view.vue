<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const slides =[
  {
    description:
      "Здесь будут показываться твои личные\n дисциплины и группы б23дз10\n" + "\n" +
      "Добавить новые предметы можно нажав\n на кнопку «+» внизу экрана\n" + "\n" +
      "После добавления предмета, он будет\n проходить обработку от 1 до 3 дней.",
    image: "/img/tutorial/tutorial1.png"
  },
  {
    description: "Просмотреть более подробную\n статистику успеваемости по дисциплине,\n можно нажав на неё в любом режиме",
    image: "/img/tutorial/tutorial2.png"
  }
]

const currentSlide = ref(0)
const activeSlide = computed(() => slides[ currentSlide.value ]!)

const nextSlide = () => {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++
  } else {
    finishTutorial()
  }
}

const finishTutorial = () => {
  localStorage.setItem('tutorial_completed', 'true')
  router.push({ name: 'Dashboard' })
}
</script>

<template>
    <div class="flex flex-col h-screen" :key="currentSlide">
      <img
        class="w-full max-h-[60%] object-contain"
        :src="activeSlide.image"
        alt="tutorial image" />

      <div class="bg-tutor text-white flex flex-col items-center flex-1 p-4 rounded-t-4xl">
        <p class="flex flex-1 justify-center items-center text-center text-lg/7 font-semibold">
          {{ activeSlide.description }}
        </p>

        <div
          @click="nextSlide"
          class="w-23 h-8 mb-8 bg-accent-red rounded-xl font-semibold text-white flex justify-center items-center"
        >
          {{ currentSlide === slides.length - 1 ? 'Начать' : 'Далее →' }}
        </div>
      </div>
    </div>
</template>
