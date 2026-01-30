<template>
  <div>
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
      <!-- Legend for game status -->
      <v-card v-if="games.length" variant="tonal" class="mb-4 pa-3">
        <div class="d-flex align-center gap-4 flex-wrap">
          <div class="d-flex align-center">
            <div class="legend-indicator bg-success mr-2"></div>
            <span class="text-caption">Completed Games</span>
          </div>
          <div class="d-flex align-center">
            <div class="legend-indicator bg-info mr-2"></div>
            <span class="text-caption">Scheduled Games</span>
          </div>
        </div>
      </v-card>

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
        <div v-if="games.length">
          <!-- Group games by round -->
          <div
            v-for="(roundGames, roundNum) in gamesByRound"
            :key="roundNum"
            class="mb-8"
          >
            <!-- Round Header -->
            <div class="d-flex align-center mb-4">
              <v-chip
                color="primary"
                variant="tonal"
                size="large"
                class="mr-3"
              >
                <v-icon icon="mdi-basketball" class="mr-2" />
                Round {{ roundNum }}
              </v-chip>
              <v-chip
                variant="outlined"
                size="small"
                class="mr-3"
              >
                {{ roundGames.length }} {{ roundGames.length === 1 ? 'game' : 'games' }}
              </v-chip>
              <v-divider class="flex-grow-1" />
            </div>
            
            <!-- Games Grid -->
            <v-row>
              <v-col
                v-for="game in roundGames"
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
          </div>
        </div>
      </template>

      <!-- List View -->
      <template v-else>
        <div v-if="games.length">
          <!-- Group games by round -->
          <div
            v-for="(roundGames, roundNum) in gamesByRound"
            :key="roundNum"
            class="mb-6"
          >
            <!-- Round Header -->
            <div class="d-flex align-center mb-3">
              <v-chip
                color="primary"
                variant="tonal"
                class="mr-3"
              >
                <v-icon icon="mdi-basketball" class="mr-2" size="small" />
                Round {{ roundNum }}
              </v-chip>
              <v-chip
                variant="outlined"
                size="small"
              >
                {{ roundGames.length }} {{ roundGames.length === 1 ? 'game' : 'games' }}
              </v-chip>
            </div>

            <!-- Round Games Table -->
            <v-card class="mb-4">
              <v-data-table
                :headers="gamesHeaders"
                :items="roundGames"
                :items-per-page="-1"
                class="elevation-0"
                hide-default-footer
              >
                <template #item.roundNumber="{ item }">
                  <v-chip size="small" variant="tonal" color="primary">
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
          </div>
        </div>
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

// Group games by round for better visualization
const gamesByRound = computed(() => {
  const grouped: Record<number, typeof games.value> = {}
  
  games.value.forEach((game) => {
    const round = game.roundNumber || 0
    if (!grouped[round]) {
      grouped[round] = []
    }
    grouped[round].push(game)
  })
  
  // Sort rounds in descending order (latest first)
  return Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a)
    .reduce((acc, roundNum) => {
      acc[roundNum] = grouped[roundNum]
      return acc
    }, {} as Record<number, typeof games.value>)
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

<style scoped>
.legend-indicator {
  width: 4px;
  height: 20px;
  border-radius: 2px;
}
</style>
