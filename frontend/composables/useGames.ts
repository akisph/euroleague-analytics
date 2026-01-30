import type { Game, GamesQueryParams } from '~/types'

export const useGames = () => {
  const api = useApi()

  // State
  const games = ref<Game[]>([])
  const currentGame = ref<Game | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch games for a season
  const fetchSeasonGames = async (seasonCode: string, filters?: GamesQueryParams) => {
    try {
      isLoading.value = true
      error.value = null
      const params: Record<string, string | number | boolean | undefined> = {}
      if (filters?.roundNumber) params.roundNumber = filters.roundNumber
      if (filters?.phaseTypeCode) params.phaseTypeCode = filters.phaseTypeCode
      if (filters?.groupName) params.groupName = filters.groupName
      if (filters?.teamCode) params.teamCode = filters.teamCode

      const response = await api.get<Game[]>(`/games/season/${seasonCode}`, params)
      console.log('Games API Response:', response)
      console.log('Total games fetched:', response?.length || 0)
      games.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch games'
      console.error('Error fetching games:', e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Fetch game details
  const fetchGameDetails = async (seasonCode: string, gameCode: number) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<Game>(`/games/season/${seasonCode}/${gameCode}`)
      currentGame.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch game details'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Fetch games by team
  const fetchGamesByTeam = async (seasonCode: string, teamCode: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<Game[]>(`/games/season/${seasonCode}/team/${teamCode}`)
      games.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch team games'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Fetch games by round
  const fetchGamesByRound = async (seasonCode: string, roundNumber: number) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<Game[]>(`/games/season/${seasonCode}/round/${roundNumber}`)
      games.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch round games'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Get recent games (last N played)
  const getRecentGames = computed(() => {
    return games.value
      .filter((g) => g.played)
      .sort((a, b) => {
        if (!a.gameDate || !b.gameDate) return 0
        return new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime()
      })
      .slice(0, 10)
  })

  // Get upcoming games
  const getUpcomingGames = computed(() => {
    return games.value
      .filter((g) => !g.played)
      .sort((a, b) => {
        if (!a.gameDate || !b.gameDate) return 0
        return new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime()
      })
  })

  // Reset state
  const resetState = () => {
    currentGame.value = null
    error.value = null
  }

  return {
    // State
    games,
    currentGame,
    isLoading,
    error,
    recentGames: getRecentGames,
    upcomingGames: getUpcomingGames,

    // Actions
    fetchSeasonGames,
    fetchGameDetails,
    fetchGamesByTeam,
    fetchGamesByRound,
    resetState,
  }
}
