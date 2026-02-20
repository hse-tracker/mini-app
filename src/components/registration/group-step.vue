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

const isValid = computed(() => props.modelValue.length > 5);
</script>

<template>
  <div class="step-content">
    <img src="/img/step2_registration.svg" alt="">

    <div class="step-title">
      Введи номер своей группы
    </div>

    <input
      :value="modelValue"
      @input="handleInput"
      placeholder="Б23ДЗ10"
      class="group-input"
    >

    <button :disabled="!isValid" @click="$emit('next')">
      Далее
    </button>
  </div>
</template>

<style scoped>
.step-content{
  height: 30rem;

  display: flex;
  flex-flow: column nowrap;
  justify-content: space-around;
  align-items: center;
}
</style>
