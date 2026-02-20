<script setup lang="ts">
const emit = defineEmits<{
  (e: 'next'): void;
  (e: 'login'): void;
}>();
</script>

<template>
  <div class="wrapper">
    <div class="title">
      hse tracker
    </div>
    <img src="/img/intro_registration.png" alt="">
    <p class="info">
      Добро пожаловать <br> в человекоцентричный трекер <br> успеваемости hse tracker
    </p>
    <button class="continue" @click="emit('next')">
      Регистрация
    </button>
    <button class="signin" @click="emit('login')">
      У меня есть аккаунт. Войти
    </button>
  </div>
</template>

<style scoped>
  .wrapper{
    height: 52rem;

    display: flex;
    flex-flow: column nowrap;
    justify-content: space-around;
    align-items: center;
  }

  .title{
    font-size: 1rem;
  }

  .continue{
    width: 11.3rem;
    height: 3.7rem;
    color: #fff;
    border-radius: 2rem;
    background-color: #ff6000;
    border: #fff 0 solid;
    text-align: center;
  }

  .info{
    text-align: center;
  }
</style>
