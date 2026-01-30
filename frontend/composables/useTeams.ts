import type { Roster, Player } from '~/types'

export const useTeams = () => {
  const api = useApi()

  // State
  const teams = ref<Roster[]>([])
  const currentRoster = ref<Roster | null>(null)
  const players = ref<Player[]>([])
  const currentPlayer = ref<Player | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all teams for a season
  const fetchSeasonTeams = async (seasonCode: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<Roster[]>(`/teams/season/${seasonCode}`)
      teams.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch teams'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Fetch team roster
  const fetchTeamRoster = async (seasonCode: string, clubCode: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<Roster>(`/teams/season/${seasonCode}/${clubCode}/roster`)
      currentRoster.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch roster'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Fetch team players
  const fetchTeamPlayers = async (seasonCode: string, clubCode: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<Player[]>(`/teams/season/${seasonCode}/${clubCode}/players`)
      players.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch players'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Fetch player by code
  const fetchPlayerByCode = async (playerCode: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<Player>(`/teams/player/${playerCode}`)
      currentPlayer.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch player'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Get team by club code
  const getTeamByCode = (clubCode: string) => {
    return teams.value.find((t) => t.clubCode === clubCode)
  }

  // Reset state
  const resetState = () => {
    currentRoster.value = null
    currentPlayer.value = null
    players.value = []
    error.value = null
  }

  return {
    // State
    teams,
    currentRoster,
    players,
    currentPlayer,
    isLoading,
    error,

    // Actions
    fetchSeasonTeams,
    fetchTeamRoster,
    fetchTeamPlayers,
    fetchPlayerByCode,
    getTeamByCode,
    resetState,
  }
}
