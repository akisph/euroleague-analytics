import type { Player } from '~/types'

export const usePlayers = () => {
  const api = useApi()
  const seasonStore = useSeasonStore()

  // State
  const allPlayers = ref<(Player & { clubCode?: string; clubName?: string })[]>([])
  const currentPlayer = ref<(Player & { clubCode?: string; clubName?: string; stats?: any }) | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all players for the current season
  const fetchAllPlayers = async (seasonCode?: string) => {
    try {
      isLoading.value = true
      error.value = null

      const season = seasonCode || seasonStore.selectedSeasonCode
      console.log('[usePlayers] Fetching players for season:', season)

      if (!season) {
        throw new Error('No season selected')
      }

      // Fetch all players for season from the new players endpoint
      console.log('[usePlayers] Fetching from /players/season/' + season)
      const response = await api.get<any>(`/players/season/${season}`)
      console.log('[usePlayers] Response:', response)

      // Handle both direct array and wrapped response
      const playersData = Array.isArray(response) ? response : response.data || []
      console.log('[usePlayers] Total players loaded:', playersData.length)
      if (playersData.length > 0) {
        console.log('[usePlayers] First player structure:', {
          playerCode: playersData[0].playerCode,
          name: playersData[0].name,
          position: playersData[0].position,
          clubCode: playersData[0].clubCode,
          clubName: playersData[0].clubName,
          stats: playersData[0].stats ? 'has stats' : 'no stats',
        })
      }

      allPlayers.value = playersData
      return playersData
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch players'
      console.error('[usePlayers] Error:', error.value, e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Get filtered players by search term and club
  const getFilteredPlayers = (searchTerm?: string, clubCode?: string) => {
    let filtered = allPlayers.value

    if (clubCode) {
      filtered = filtered.filter((p) => p.clubCode === clubCode)
    }

    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.alias?.toLowerCase().includes(term) ||
          p.playerCode.toLowerCase().includes(term)
      )
    }

    return filtered
  }

  // Get unique teams/clubs from players
  const getTeams = () => {
    const teams = new Map<string, { clubCode: string; clubName: string }>()
    for (const player of allPlayers.value) {
      if (player.clubCode && player.clubName) {
        teams.set(player.clubCode, {
          clubCode: player.clubCode,
          clubName: player.clubName,
        })
      }
    }
    return Array.from(teams.values())
  }

  // Reset state
  const resetState = () => {
    allPlayers.value = []
    error.value = null
  }

  // Fetch single player by code for a specific season
  const fetchPlayerByCode = async (playerCode: string, seasonCode?: string) => {
    try {
      isLoading.value = true
      error.value = null

      const season = seasonCode || seasonStore.selectedSeasonCode
      if (!season) {
        throw new Error('No season selected')
      }

      console.log('[usePlayers] Fetching player:', playerCode, 'for season:', season)
      const response = await api.get<any>(`/players/${season}/${playerCode}`)
      console.log('[usePlayers] Player response:', response)

      currentPlayer.value = response.data || response
      return currentPlayer.value
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch player'
      console.error('[usePlayers] Error fetching player:', error.value, e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    allPlayers,
    currentPlayer,
    isLoading,
    error,

    // Actions
    fetchAllPlayers,
    fetchPlayerByCode,
    getFilteredPlayers,
    getTeams,
    resetState,
  }
}
