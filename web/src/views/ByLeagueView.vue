<template>
  <main class="min-h-[calc(100vh-144px)] bg-gray-900 text-white p-4 sm:p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <div
        class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-800/80 border border-gray-700/60 rounded-2xl shadow-lg backdrop-blur-md"
      >
        <div class="w-full sm:w-auto flex justify-center sm:justify-start">
          <LeaguePicker />
        </div>

        <div class="flex p-1 bg-gray-900/90 border border-gray-700/60 rounded-xl shadow-inner">
          <RouterLink
            :to="RouteName.LeagueYearSpeeds"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            :class="[
              activeView === 'year'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50',
            ]"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Velocidades Anuales
          </RouterLink>

          <RouterLink
            :to="RouteName.LeagueNthSpeeds"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            :class="[
              activeView === 'nth'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50',
            ]"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Velocidades por Posición
          </RouterLink>
        </div>
      </div>

      <div class="w-full">
        <RouterView />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import LeaguePicker from '@/components/LeaguePicker.vue'
import { RouteName } from '@/router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const activeView = computed(() => (useRoute().name?.toString() === RouteName.LeagueYearSpeeds ? 'year' : 'nth'))
</script>
