import type { Standings } from '~/types'

export const useStandings = () => {
  const api = useApi()

  // State
  const standings = ref<Standings[]>([])
  const currentStanding = ref<Standings | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch current standings for a season
  const fetchCurrentStandings = async (seasonCode: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<any>(`/standings/current`, { seasonCode })
      // The standings endpoint returns data directly or might have nested structure
      if (response.teams) {
        // Single group standings - wrap it in an array
        standings.value = [{
          groupCode: response.groupCode || 'default',
          groupName: response.groupName || 'Standings',
          standings: response.teams
        }]
      } else if (Array.isArray(response)) {
        standings.value = response
      } else {
        standings.value = []
      }
      return standings.value
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch current standings'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Fetch standings for a season and round
  const fetchSeasonStandings = async (seasonCode: string, roundNumber: number) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<any>(`/standings/season/${seasonCode}/round/${roundNumber}`)
      // The standings endpoint returns data directly or might have nested structure
      if (response.teams) {
        // Single group standings - wrap it in an array
        standings.value = [{
          groupCode: response.groupCode || 'default',
          groupName: response.groupName || 'Standings',
          standings: response.teams
        }]
      } else if (Array.isArray(response)) {
        standings.value = response
      } else {
        standings.value = []
      }
      return standings.value
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
    fetchCurrentStandings,
    fetchSeasonStandings,
    fetchGroupStandings,
    getGroupStandings,
    resetState,
  }
}
