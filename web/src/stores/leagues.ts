import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { League } from './api/leagues'
import LeaguesService from './api/leagues'

export const useLeaguesStore = defineStore('leagues', () => {
  const leagues = ref<League[]>([])
  const selectedLeague: Ref<League> = ref<League>({} as League)

  async function fetchLeagues() {
    leagues.value = await LeaguesService.getLeagues()
    if (!leagues.value.length) {
      selectedLeague.value = {} as League
      console.error('No leagues found.')
      return
    }
    selectedLeague.value = leagues.value[0]!
  }

  return { leagues, selectedLeague, fetchLeagues }
})
