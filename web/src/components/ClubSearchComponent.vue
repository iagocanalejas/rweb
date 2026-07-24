<template>
  <div ref="searchContainer" class="relative w-full">
    <form
      @submit.prevent="handleSearch"
      class="flex items-center w-full rounded-lg border border-slate-700/60 bg-slate-800/90 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all"
    >
      <select
        v-model="selectedGender"
        class="bg-transparent py-2 pl-3 pr-1 text-xs text-slate-300 focus:outline-none border-r border-slate-700/60 cursor-pointer hover:text-slate-100 transition-colors"
      >
        <option value="MALE" class="bg-slate-800 text-slate-200">Masculino</option>
        <option value="FEMALE" class="bg-slate-800 text-slate-200">Femenino</option>
      </select>

      <select
        v-model="selectedCategory"
        class="bg-transparent py-2 pl-3 pr-1 text-xs text-slate-300 focus:outline-none border-r border-slate-700/60 cursor-pointer hover:text-slate-100 transition-colors"
      >
        <option value="ABSOLUT" class="bg-slate-800 text-slate-200">Senior</option>
        <option value="VETERAN" class="bg-slate-800 text-slate-200">Veterano</option>
        <option value="SCHOOL" class="bg-slate-800 text-slate-200">Escuela</option>
      </select>

      <div class="relative flex-1 min-w-0">
        <input
          type="text"
          v-model="searchQuery"
          @focus="isOpen = true"
          @input="onInput"
          @keydown.esc="isOpen = false"
          placeholder="Busca por club..."
          class="w-full bg-transparent py-2 pl-3.5 pr-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
        />

        <button
          type="submit"
          aria-label="Buscar"
          class="absolute right-0 top-0 bottom-0 flex items-center justify-center px-3 text-slate-400 hover:text-blue-400 focus:text-blue-400 transition-colors focus:outline-none"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div
            v-if="isOpen && searchQuery.trim().length > 0"
            class="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-lg border border-slate-700/60 bg-slate-800/95 py-1.5 shadow-2xl backdrop-blur-md"
          >
            <ul v-if="results.length > 0" class="divide-y divide-slate-700/30">
              <li
                v-for="item in results"
                :key="item.id"
                @click="selectResult(item)"
                class="group flex cursor-pointer flex-col px-3.5 py-2.5 transition-colors hover:bg-slate-700/50"
              >
                <span class="text-sm font-medium text-slate-200 group-hover:text-blue-400">
                  {{ item.name }}
                </span>
              </li>
            </ul>

            <div v-else class="px-4 py-3 text-center text-xs text-slate-400">
              Sin resultados para "<span class="text-slate-200"> {{ searchQuery }} </span>"
            </div>
          </div>
        </Transition>
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import ClubsService from '@/stores/api/clubs'
import { useClubsStore } from '@/stores/clubs'
import { debounce } from '@/utils/utils'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'

export interface SearchResult {
  id: number
  name: string
  [key: string]: unknown
}

const clubStore = useClubsStore()
const { selectedClub, selectedGender, selectedCategory } = storeToRefs(clubStore)

const searchQuery = ref(selectedClub.value.name ?? '')
const results = ref<SearchResult[]>([selectedClub.value as SearchResult])
const isOpen = ref(false)
const searchContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function onInput() {
  isOpen.value = true
  debounceFilter(searchQuery.value)
}

function handleSearch() {
  debounceFilter(searchQuery.value)
}

function selectResult(item: SearchResult) {
  searchQuery.value = item.name
  selectedClub.value = item
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const debounceFilter = debounce(_filterResults)
async function _filterResults(query: string) {
  if (query.trim().length < 3) return
  results.value = (await ClubsService.getClubs(query.trim())) as SearchResult[]
}
</script>
