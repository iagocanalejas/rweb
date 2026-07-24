<template>
  <div ref="dropdown" v-if="leagues.length" class="relative inline-block text-center text-white">
    <button
      @click="isDropdownOpen = !isDropdownOpen"
      class="inline-flex items-center justify-between bg-gray-800 px-4 py-2 rounded-md hover:bg-gray-700"
    >
      {{ selectedLeague.name }}
      <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="isDropdownOpen"
      class="absolute right-0 z-50 mt-2 w-56 bg-gray-800 text-white rounded-lg shadow-lg ring-1 ring-white/10"
    >
      <div
        v-for="league in leagues"
        :key="league.name"
        class="group flex items-center justify-between px-4 py-2 hover:bg-gray-700 cursor-pointer"
        @click="select(league)"
      >
        <span class="truncate">
          {{ league.symbol }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { League } from '@/stores/api/leagues'
import { useLeaguesStore } from '@/stores/leagues'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'

const { leagues, selectedLeague } = storeToRefs(useLeaguesStore())

const isDropdownOpen = ref(false)

const dropdown = ref<HTMLElement | null>(null)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function select(item: League) {
  isDropdownOpen.value = false
  selectedLeague.value = item
}

function handleClickOutside(event: MouseEvent) {
  if (dropdown.value && !dropdown.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}
</script>
