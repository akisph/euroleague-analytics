<template>
  <PageHeader
    title="Games"
    subtitle="All games for the current season"
  >
      <template #actions>
        <div class="d-flex gap-2 flex-wrap">
          <v-select
            v-model="selectedRound"
            :items="roundOptions"
            label="Round"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            class="max-w-[150px]"
            @update:model-value="applyFilters"
          />
          <v-select
            v-model="selectedTeam"
            :items="teamOptions"
            label="Team"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            class="max-w-[200px]"
            @update:model-value="applyFilters"
          />
          <v-btn-toggle
            v-model="viewMode"
            density="compact"
            mandatory
          >
            <v-btn value="grid" icon="mdi-view-grid" />
            <v-btn value="list" icon="mdi-view-list" />
          </v-btn-toggle>
        </div>
      </template>
    </PageHeader>

    <ErrorAlert
      v-if="error"
      :error="error"
      @retry="loadGames"
      @dismiss="error = null"
    />

    <LoadingState :loading="isLoading" message="Loading games...">
      <!-- Game Filters Summary -->
      <div v-if="hasActiveFilters" class="mb-4 d-flex align-center gap-2 flex-wrap">
        <v-chip
          v-if="selectedRound"
          closable
          @click:close="selectedRound = null; applyFilters()"
        >
          Round {{ selectedRound }}
        </v-chip>
        <v-chip
          v-if="selectedTeam"
          closable
          @click:close="selectedTeam = ''; applyFilters()"
        >
          {{ selectedTeam }}
        </v-chip>
        <v-btn
          variant="text"
          size="small"
          @click="clearFilters"
        >
          Clear All
        </v-btn>
      </div>

      <!-- Grid View -->
      <template v-if="viewMode === 'grid'">
        <v-row v-if="games.length">
          <v-col
            v-for="game in games"
            :key="game.gameCode"
            cols="12"
            sm="6"
            lg="4"
          >
            <GameCard
              :game="game"
              show-details
              show-action
              @view-details="navigateTo(`/games/${selectedSeasonCode}/${game.gameCode}`)"
            />
          </v-col>
        </v-row>
      </template>

      <!-- List View -->
      <template v-else>
        <v-card v-if="games.length">
          <v-data-table
            :headers="gamesHeaders"
            :items="games"
            :items-per-page="20"
            class="elevation-0"
          >
            <template #item.roundNumber="{ item }">
              <v-chip size="small" variant="tonal">
                R{{ item.roundNumber }}
              </v-chip>
            </template>
            <template #item.teams="{ item }">
              <div class="d-flex align-center">
                <span :class="{ 'font-weight-bold': item.played && (item.homeScore || 0) > (item.awayScore || 0) }">
                  {{ item.homeTeamName }}
                </span>
                <span class="mx-2 text-medium-emphasis">vs</span>
                <span :class="{ 'font-weight-bold': item.played && (item.awayScore || 0) > (item.homeScore || 0) }">
                  {{ item.awayTeamName }}
                </span>
              </div>
            </template>
            <template #item.score="{ item }">
              <template v-if="item.played">
                <span class="font-weight-bold">{{ item.homeScore }} - {{ item.awayScore }}</span>
              </template>
              <template v-else>
                <v-chip size="x-small" color="info" variant="flat">Scheduled</v-chip>
              </template>
            </template>
            <template #item.gameDate="{ item }">
              {{ formatDate(item.gameDate) }}
            </template>
            <template #item.actions="{ item }">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                @click="navigateTo(`/games/${selectedSeasonCode}/${item.gameCode}`)"
              />
            </template>
          </v-data-table>
        </v-card>
      </template>

      <EmptyState
        v-if="!games.length"
        title="No Games Found"
        :message="hasActiveFilters ? 'No games match your filter criteria' : 'No games available for this season'"
        icon="mdi-basketball"
        :action-text="hasActiveFilters ? 'Clear Filters' : undefined"
        @action="clearFilters"
      />
    </LoadingState>
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
const viewMode = ref<'grid' | 'list'>('grid')

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

const gamesHeaders = [
  { title: 'Round', key: 'roundNumber', width: '80px' },
  { title: 'Teams', key: 'teams', sortable: false },
  { title: 'Score', key: 'score', width: '120px' },
  { title: 'Date', key: 'gameDate', width: '180px' },
  { title: 'Arena', key: 'arena' },
  { title: '', key: 'actions', width: '60px', sortable: false },
]

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

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
