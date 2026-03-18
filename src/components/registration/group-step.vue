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

const isValid = computed(() => props.modelValue.length >= 3);
</script>

<template>
  <div class="h-120 flex flex-col flex-nowrap justify-around items-center">
    <img src="/img/step2_registration.svg" alt="">

    <div class="step-title">
      Введи номер своей группы
    </div>

    <input
      :value="modelValue"
      @input="handleInput"
      @keydown.enter="isValid && emit('next')"
      placeholder="Б23ДЗ10"
      class="group-input"
    >

    <div v-if="!isValid" class="h-6"></div>
    <button v-if="isValid" @click="emit('next')">
      Далее
    </button>
  </div>
</template>
