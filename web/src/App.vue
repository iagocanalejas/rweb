<template>
  <header class="flex items-center justify-between p-4 bg-gray-800 text-white shadow-md">
    <RouterLink to="/" class="flex items-center space-x-2 hover:opacity-80 transition">
      <!-- <img src="@/assets/logo.png" alt="Logo" class="h-10 w-10" /> -->
      <span class="text-xl font-semibold text-white hidden md:block">TStats</span>
    </RouterLink>
    <div>
      <LeaguePicker />
    </div>
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
import LeaguePicker from './components/LeaguePicker.vue'

const { isLoading } = storeToRefs(useLoadingStore())
</script>
