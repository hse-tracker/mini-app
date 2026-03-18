<script setup lang="ts">
import { computed } from 'vue';

// getting v-model
const props = defineProps<{modelValue: string }>();
const emit = defineEmits(['update:modelValue', 'next']);

// input handler
const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  emit('update:modelValue', value);
};

// valid input checker
const isValid = computed(() => props.modelValue.length > 5);

</script>

<template>
  <div class="h-120 flex flex-col flex-nowrap justify-around items-center">
    <img class="mt-8" src="/img/step_registration.svg" alt="">

    <div class="step-title">
      Введи своё ФИО (полностью)
    </div>

    <input
      :value="modelValue"
      @input="handleInput"
      placeholder="Иванов Иван Иванович"
      @keydown.enter="isValid && emit('next')"
      class="fullName-input w-50"
    >

    <div v-if="!isValid" class="h-6"></div>
    <button v-if="isValid" @click="emit('next')">
      Далее
    </button>
  </div>
</template>
