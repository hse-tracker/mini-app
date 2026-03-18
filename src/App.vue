<template>
  <router-view v-slot="{ Component, route }">
    <transition name="page-slide" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
#app {
  overflow-x: hidden;
  min-height: 100vh;
}

.page-slide-enter-active,
.page-slide-leave-active {
  transition: all 0.25s ease-out;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(15px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}
</style>
