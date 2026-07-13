import { safeFetch } from './_utils'

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || '/api'

export interface League {
  id: number
  name: string
  symbol: string
  gender: string
  category: string
  participants: Record<number, number>
}

async function getLeagues() {
  const f = fetch(`${BASE_URL}/leagues`, { method: 'GET' })
  return await safeFetch<League[]>(f, 'Failed to fetch leagues', [])
}

const LeaguesService = { getLeagues }
export default LeaguesService
