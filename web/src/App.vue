<template>
  <header class="flex items-center justify-between p-4 bg-gray-800 text-white shadow-md">
    <RouterLink to="/" class="flex items-center space-x-2 hover:opacity-80 transition">
      <!-- <img src="@/assets/logo.png" alt="Logo" class="h-10 w-10" /> -->
      <span class="text-xl font-semibold text-white hidden md:block">TStats</span>
    </RouterLink>
    <nav class="flex items-center space-x-1 sm:space-x-2">
      <RouterLink
        :to="'/' + RouteName.ByLeague"
        class="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/70 transition-all duration-150 focus:outline-none"
        active-class="bg-gray-900 text-white font-semibold"
      >
        Ligas
      </RouterLink>

      <RouterLink
        :to="'/' + RouteName.ByClub"
        class="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/70 transition-all duration-150 focus:outline-none"
        active-class="bg-gray-900 text-white font-semibold"
      >
        Clubs
      </RouterLink>
    </nav>
  </header>
  <LoadingBarComponent v-if="isLoading" />
  <RouterView />
  <footer class="bg-gray-900 text-gray-400 py-6">
    <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <p class="text-sm">&copy; 2026. All rights reserved.</p>
      <nav class="flex space-x-4">
        <RouterLink to="/privacy-policy" class="hover:text-gray-200 transition"> Privacy Policy </RouterLink>
        <RouterLink to="/conditions" class="hover:text-gray-200 transition"> Terms & Conditions </RouterLink>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLoadingStore } from './stores/loading'
import LoadingBarComponent from './components/LoadingBarComponent.vue'
import { RouteName } from './router'

const { isLoading } = storeToRefs(useLoadingStore())
</script>
