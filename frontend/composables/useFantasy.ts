import type { FantasyPlayerStats, FantasyTeamPirAllowed } from '~/types'

interface TeamsPirAllowedParams {
  statsId?: number
  positionId?: number
}

interface PlayersStatsParams {
  statsType?: 'tot' | 'avg'
}

export const useFantasy = () => {
  const api = useApi()

  const teamsPirAllowed = ref<FantasyTeamPirAllowed[]>([])
  const playersStats = ref<FantasyPlayerStats[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchTeamsPirAllowed = async (
    seasonCode: string,
    params: TeamsPirAllowedParams = {},
  ) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<FantasyTeamPirAllowed[]>(
        `/fantasy/season/${seasonCode}/teams/pir-allowed`,
        params,
      )
      teamsPirAllowed.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch fantasy teams'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const fetchPlayersStats = async (
    seasonCode: string,
    params: PlayersStatsParams = {},
  ) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<FantasyPlayerStats[]>(
        `/fantasy/season/${seasonCode}/players/stats`,
        params,
      )
      playersStats.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch fantasy players'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    teamsPirAllowed,
    playersStats,
    isLoading,
    error,
    fetchTeamsPirAllowed,
    fetchPlayersStats,
  }
}
