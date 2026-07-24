import { safeFetch } from './_utils'

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || '/api'

export interface Club {
  id: number
  name: string
}

async function getClubs(query: string) {
  const f = fetch(`${BASE_URL}/clubs?query=${query}`, { method: 'GET' })
  return await safeFetch<Club[]>(f, 'Failed to fetch clubs', [])
}

const ClubsService = { getClubs }
export default ClubsService
