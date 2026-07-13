import { ref } from 'vue'
import { defineStore } from 'pinia'
import SpeedsService from './api/speeds'
import type { League } from './api/leagues'

export const useSpeedsStore = defineStore('speeds', () => {
  const yearAverages = ref<Record<number, number[]>>({})
  const yearNthSpeeds = ref<Record<number, number[]>>({})

  async function fetchYearAverages(league: League, ignoreOutliers: boolean) {
    yearAverages.value = await SpeedsService.getAverageSpeeds(league.id, league.gender, league.category, ignoreOutliers)
  }

  async function fetchNthSpeeds(index: number, league: League, ignoreOutliers: boolean) {
    yearNthSpeeds.value = await SpeedsService.getNthSpeeds(
      index,
      league.id,
      league.gender,
      league.category,
      ignoreOutliers,
    )
  }

  return { yearAverages, fetchYearAverages, yearNthSpeeds, fetchNthSpeeds }
})
