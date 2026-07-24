import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { Club } from './api/clubs'

export const useClubsStore = defineStore('clubs', () => {
  const selectedClub: Ref<Club> = ref<Club>({} as Club)
  const selectedGender: Ref<string> = ref('MALE')
  const selectedCategory: Ref<string> = ref('ABSOLUT')

  return { selectedClub, selectedCategory, selectedGender }
})
