<template>
  <main class="justify-center min-h-[calc(100vh-144px)] bg-gray-900 text-white p-6">
    <div class="flex justify-center mt-10">
      <div class="flex p-1 space-x-1 bg-gray-800 border border-gray-700/50 rounded-full shadow-inner">
        <RouterLink
          to="/year-speeds"
          class="flex items-center px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ease-in-out"
          :class="{
            'bg-gray-900/80 text-white shadow-lg backdrop-blur-sm border border-blue-500/10': activeView === 'year',
            'text-gray-400 hover:text-white': activeView !== 'year',
          }"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Velocidades Anuales
        </RouterLink>

        <RouterLink
          to="/nth-speeds"
          class="flex items-center px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ease-in-out"
          :class="{
            'bg-gray-900/80 text-white shadow-lg backdrop-blur-sm border border-blue-500/10': activeView === 'nth',
            'text-gray-400 hover:text-white': activeView !== 'nth',
          }"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          Velocidades por Posición
        </RouterLink>
      </div>
    </div>
    <RouterView />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const activeView = computed(() => (useRoute().name?.toString() === 'year-speeds' ? 'year' : 'nth'))
</script>
