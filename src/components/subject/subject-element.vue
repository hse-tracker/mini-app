<script setup lang="ts">
import router from '@/router'

const props = defineProps<{
  subject: {
    id: number;
    name: string;
    status: string;
  }
}>()

const statusMap: Record<string, string> = {
  'processing': 'обрабатывается',
  'ready': 'готово',
  'error': 'ошибка',
}
</script>

<template>
  <!--Wrapper-->
  <div
    @click="router.push({ name: 'Subject' });"
    class="flex flex-row w-86 h-19 justify-between items-center bg-surface rounded-2xl
  pl-4 pr-4 shadow-xl">

    <!--Info block-->
    <div class="h-12 flex flex-row justify-start items-end text-xs text-text-secondary">
      <!--Subject name-->
      <div>
        {{ subject.name }}
      </div>

      <!--Subject status-->
      <!--TODO: add dot between name and status-->
      <div class="text-accent-red ml-1">
        · {{ statusMap[subject.status] || subject.status}}
      </div>
    </div>

    <!--Subject grade-->
    <div class="text-text-black text-6xl font-semibold">
      0.0
    </div>
  </div>

</template>
