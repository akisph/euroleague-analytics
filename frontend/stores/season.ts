import { defineStore } from 'pinia'
import type { SeasonListItem, Season } from '~/types'

export const useSeasonStore = defineStore('season', {
  state: () => ({
    seasons: [] as SeasonListItem[],
    currentSeason: null as Season | null,
    selectedSeasonCode: '' as string,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    selectedSeason(state): SeasonListItem | undefined {
      return state.seasons.find((s) => s.code === state.selectedSeasonCode)
    },

    hasSeasons(state): boolean {
      return state.seasons.length > 0
    },

    seasonOptions(state): Array<{ title: string; value: string }> {
      return state.seasons.map((season) => ({
        title: `${season.year}-${season.year + 1}${season.active ? ' (Current)' : ''}`,
        value: season.code,
      }))
    },
  },

  actions: {
    setSeasons(seasons: SeasonListItem[]) {
      this.seasons = seasons
    },

    setSelectedSeason(seasonCode: string) {
      this.selectedSeasonCode = seasonCode
      // Persist selection to localStorage
      if (import.meta.client) {
        localStorage.setItem('euroleague_selected_season', seasonCode)
      }
    },

    setCurrentSeason(season: Season) {
      this.currentSeason = season
    },

    loadSavedSeason() {
      if (import.meta.client) {
        const saved = localStorage.getItem('euroleague_selected_season')
        if (saved && this.seasons.some((s) => s.code === saved)) {
          this.selectedSeasonCode = saved
        } else if (this.seasons.length > 0) {
          // Default to first active season or most recent
          const activeSeason = this.seasons.find((s) => s.active)
          this.selectedSeasonCode = activeSeason?.code || this.seasons[0].code
        }
      }
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setError(error: string | null) {
      this.error = error
    },
  },
})
