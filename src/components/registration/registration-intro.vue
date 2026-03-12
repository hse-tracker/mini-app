<script setup lang="ts">

const emit = defineEmits<{
  (e: 'next'): void;
}>();

</script>

<template>
  <div class="h-182 flex flex-col flex-nowrap items-center justify-around">
    <img src="/img/intro_registration.png" alt="">

    <div class="self-stretch text-center justify-start text-neutral text-base leading-5 font-medium">
      Добро пожаловать <br/>в человекоцентричный трекер <br> успеваемости hse tracker
    </div>

    <div
      @click="emit('next')"
      class="font-medium w-45 h-15 px-8 py-6 bg-orange-600 text-white rounded-[32px] shadow-[0px_0px_18.799999237060547px_0px_rgba(0,0,0,0.15)] shadow-[inset_0px_0px_7.099999904632568px_3px_rgba(255,255,255,1.00)] shadow-[inset_0px_0px_18.399999618530273px_3px_rgba(255,255,255,1.00)] shadow-[inset_0px_0px_4.199999809265137px_3px_rgba(255,255,255,1.00)] inline-flex justify-center items-center gap-2.5">
      <button class="text-center justify-start">
        Регистрация
      </button>
    </div>
  </div>
</template>
