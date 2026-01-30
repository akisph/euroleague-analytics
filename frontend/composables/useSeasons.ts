import type { SeasonListItem, Season, SeasonsListResponse, SeasonClubsResponse, SeasonsQueryParams } from '~/types'

export const useSeasons = () => {
  const api = useApi()
  const seasonStore = useSeasonStore()

  // Fetch all seasons
  const fetchSeasons = async (params?: SeasonsQueryParams): Promise<SeasonsListResponse> => {
    try {
      seasonStore.setLoading(true)
      seasonStore.setError(null)
      const response = await api.get<SeasonsListResponse>('/seasons', params as Record<string, string | number | boolean | undefined>)
      
      // Filter seasons from E2016 onwards
      const filteredSeasons = response.data.filter((season: SeasonListItem) => {
        const year = parseInt(season.code.replace('E', ''))
        return year >= 2016
      })
      
      seasonStore.setSeasons(filteredSeasons)
      seasonStore.loadSavedSeason()
      return { ...response, data: filteredSeasons }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch seasons'
      seasonStore.setError(errorMessage)
      throw error
    } finally {
      seasonStore.setLoading(false)
    }
  }

  // Fetch current season
  const fetchCurrentSeason = async (): Promise<Season> => {
    try {
      const season = await api.get<Season>('/seasons/current')
      seasonStore.setCurrentSeason(season)
      return season
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch current season'
      seasonStore.setError(errorMessage)
      throw error
    }
  }

  // Fetch season by code
  const fetchSeasonByCode = async (seasonCode: string): Promise<Season> => {
    return api.get<Season>(`/seasons/${seasonCode}`)
  }

  // Fetch season clubs
  const fetchSeasonClubs = async (seasonCode: string): Promise<SeasonClubsResponse> => {
    return api.get<SeasonClubsResponse>(`/seasons/${seasonCode}/clubs`)
  }

  // Initialize seasons on app load
  const initializeSeasons = async () => {
    await fetchSeasons()
    if (!seasonStore.selectedSeasonCode && seasonStore.seasons.length > 0) {
      // Try to get current season
      try {
        const current = await fetchCurrentSeason()
        seasonStore.setSelectedSeason(current.code)
      } catch {
        // Fall back to first season
        seasonStore.setSelectedSeason(seasonStore.seasons[0].code)
      }
    }
  }

  return {
    // State from store
    seasons: computed(() => seasonStore.seasons),
    selectedSeasonCode: computed(() => seasonStore.selectedSeasonCode),
    currentSeason: computed(() => seasonStore.currentSeason),
    isLoading: computed(() => seasonStore.isLoading),
    error: computed(() => seasonStore.error),
    seasonOptions: computed(() => seasonStore.seasonOptions),

    // Actions
    fetchSeasons,
    fetchCurrentSeason,
    fetchSeasonByCode,
    fetchSeasonClubs,
    initializeSeasons,
    setSelectedSeason: seasonStore.setSelectedSeason,
  }
}
