<template>
  <div class="page-light-surface">
    <SharedPageHeader
      title="Players"
      subtitle="All players for the selected season"
    />

    <PlayersPage
      :search-term="searchTerm"
      :selected-team="selectedTeam"
      :team-options="teamOptions"
      :players="displayPlayers"
      :is-loading="isLoading"
      :error="error"
      @update:search-term="searchTerm = $event"
      @update:selected-team="selectedTeam = $event"
      @dismiss-error="error = null"
    />
  </div>
</template>

<script setup lang="ts">
import PlayersPage from '~/components/players/PlayersPage.vue'

import { usePlayers } from '~/composables/usePlayers'
import { useSeasons } from '~/composables/useSeasons'
import { useSeasonStore } from '~/stores/season'

const seasonStore = useSeasonStore()
const { isLoading: playersLoading, error: playersError, fetchAllPlayers, getFilteredPlayers, getTeams } = usePlayers()
const { fetchSeasons } = useSeasons()

const searchTerm = ref('')
const selectedTeam = ref<string | null>(null)
const error = ref<string | null>(null)

const isLoading = computed(() => playersLoading.value)

const teamOptions = computed(() => getTeams())

const displayPlayers = computed(() => {
  const players = getFilteredPlayers(searchTerm.value, selectedTeam.value || undefined)
  const withStats = players.map((player: any) => {
    const gp = player.stats?.gamesPlayed || 0
    return {
      ...player,
      calculatedMPG: gp > 0 ? (player.stats?.timePlayed || 0) / 60 / gp : 0,
      calculatedPIR: gp > 0 ? (player.stats?.valuation || 0) / gp : 0,
      calculatedPPG: gp > 0 ? (player.stats?.points || 0) / gp : 0,
      calculatedAPG: gp > 0 ? (player.stats?.assistances || 0) / gp : 0,
      calculatedRPG: gp > 0 ? (player.stats?.totalRebounds || 0) / gp : 0,
      calculatedSPG: gp > 0 ? (player.stats?.steals || 0) / gp : 0,
    }
  })

  return withStats.sort((a: any, b: any) => (b.calculatedPIR ?? 0) - (a.calculatedPIR ?? 0))
})

onMounted(async () => {
  try {
    await nextTick()

    if (seasonStore.seasons.length === 0) {
      await fetchSeasons()
    }

    if (!seasonStore.selectedSeasonCode && seasonStore.seasons.length > 0) {
      seasonStore.loadSavedSeason()
    }

    if (!seasonStore.selectedSeasonCode) {
      error.value = 'Please select a season first'
      return
    }

    await fetchAllPlayers(seasonStore.selectedSeasonCode)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load players'
  }
})

watch(
  () => seasonStore.selectedSeasonCode,
  async (newSeason) => {
    if (!newSeason) return
    searchTerm.value = ''
    selectedTeam.value = null
    try {
      await fetchAllPlayers(newSeason)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load players'
    }
  },
)

watch(
  () => playersError.value,
  (newError) => {
    if (!newError) return
    error.value = newError
  },
)
</script>
