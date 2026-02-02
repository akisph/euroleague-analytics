<template>
  <div class="page-light-surface">
    <SharedPageHeader
      title="Games"
      subtitle="All games for the current season"
    >
    </SharedPageHeader>

    <SharedErrorAlert
      v-if="error"
      :error="error"
      @retry="loadGames"
      @dismiss="error = null"
    />

    <SharedLoadingState :loading="isLoading" message="Loading games...">
      <GamesList
        v-if="games.length"
        :games="games"
        :selected-season-code="selectedSeasonCode"
      />

      <SharedEmptyState
        v-if="!games.length"
        title="No Games Found"
        :message="hasActiveFilters ? 'No games match your filter criteria' : 'No games available for this season'"
        icon="mdi-basketball"
        :action-text="hasActiveFilters ? 'Clear Filters' : undefined"
        @action="clearFilters"
      />
    </SharedLoadingState>
  </div>
</template>

<script setup lang="ts">


const route = useRoute()
const seasonStore = useSeasonStore()
const { fetchSeasonGames, games, isLoading, error } = useGames()
const { fetchSeasonRounds, rounds, roundOptions } = useRounds()
const { fetchSeasonTeams, teams } = useTeams()

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)
const selectedRound = ref<number | null>(null)
const selectedTeam = ref<string>('')

// Team options for dropdown
const teamOptions = computed(() => {
  return teams.value.map((t) => ({
    title: t.clubName,
    value: t.clubCode,
  }))
})

const hasActiveFilters = computed(() => {
  return selectedRound.value !== null || selectedTeam.value !== ''
})

const applyFilters = () => {
  loadGames()
}

const clearFilters = () => {
  selectedRound.value = null
  selectedTeam.value = ''
  loadGames()
}

const loadGames = async () => {
  if (!selectedSeasonCode.value) return
  
  const filters: Record<string, number | string | undefined> = {}
  if (selectedRound.value) filters.roundNumber = selectedRound.value
  if (selectedTeam.value) filters.teamCode = selectedTeam.value
  
  await fetchSeasonGames(selectedSeasonCode.value, filters)
}

const loadInitialData = async () => {
  if (!selectedSeasonCode.value) return
  
  await Promise.all([
    fetchSeasonRounds(selectedSeasonCode.value),
    fetchSeasonTeams(selectedSeasonCode.value),
  ])
  
  // Apply filters from URL query params
  if (route.query.round) {
    selectedRound.value = Number(route.query.round)
  }
  if (route.query.team) {
    selectedTeam.value = route.query.team as string
  }
  
  await loadGames()
}

// Watch for season changes
watch(selectedSeasonCode, () => {
  loadInitialData()
}, { immediate: true })

onMounted(() => {
  if (selectedSeasonCode.value) {
    loadInitialData()
  }
})
</script>

