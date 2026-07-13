import { safeFetch } from './_utils'

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || '/api'

async function getAverageSpeeds(leagueId: number, gender: string, category: string, ignoreOutliers: boolean) {
  const query = new URLSearchParams({
    league: leagueId.toString(),
    gender,
    category,
    normalize: ignoreOutliers.toString(),
  })
  const f = fetch(`${BASE_URL}/speeds/averages?${query}`, { method: 'GET' })
  return await safeFetch<Record<number, number[]>>(f, 'Failed to fetch data', {})
}

async function getNthSpeeds(
  index: number,
  leagueId: number,
  gender: string,
  category: string,
  ignoreOutliers: boolean,
) {
  const query = new URLSearchParams({
    index: index.toString(),
    league: leagueId.toString(),
    gender,
    category,
    normalize: ignoreOutliers.toString(),
  })
  const f = fetch(`${BASE_URL}/speeds/nth?${query}`, { method: 'GET' })
  return await safeFetch<Record<number, number[]>>(f, 'Failed to fetch data', [])
}

const SpeedsService = {
  getAverageSpeeds,
  getNthSpeeds,
}
export default SpeedsService
