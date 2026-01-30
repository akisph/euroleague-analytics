import type { Standings } from '~/types'

export const useStandings = () => {
  const api = useApi()

  // State
  const standings = ref<Standings[]>([])
  const currentStanding = ref<Standings | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch standings for a season and round
  const fetchSeasonStandings = async (seasonCode: string, roundNumber: number) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<Standings[]>(`/standings/season/${seasonCode}/round/${roundNumber}`)
      standings.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch standings'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Fetch group standings
  const fetchGroupStandings = async (seasonCode: string, roundNumber: number, groupId: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<Standings>(`/standings/season/${seasonCode}/round/${roundNumber}/group/${groupId}`)
      currentStanding.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch group standings'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Get standings for a specific group
  const getGroupStandings = (groupCode: string) => {
    return standings.value.find((s) => s.groupCode === groupCode)
  }

  // Get all team standings flattened
  const allTeamStandings = computed(() => {
    return standings.value.flatMap((s) => s.standings || [])
  })

  // Reset state
  const resetState = () => {
    currentStanding.value = null
    error.value = null
  }

  return {
    // State
    standings,
    currentStanding,
    isLoading,
    error,
    allTeamStandings,

    // Actions
    fetchSeasonStandings,
    fetchGroupStandings,
    getGroupStandings,
    resetState,
  }
}
