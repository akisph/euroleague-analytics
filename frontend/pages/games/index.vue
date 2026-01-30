<template>
  <div class="page-light-surface">
    <PageHeader
      title="Games"
      subtitle="All games for the current season"
    >
      <template #actions>
        <div class="d-flex gap-2 flex-wrap align-center">
          <span class="text-caption">View:</span>
          <v-btn-toggle
            v-model="viewMode"
            density="compact"
            mandatory
            color="primary"
          >
            <v-btn value="grid" icon="mdi-view-grid" title="Grid View" />
            <v-btn value="list" icon="mdi-view-list" title="List View" />
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

      <!-- Tabs for Rounds -->
      <template v-if="games.length">
        <v-card>
          <v-tabs 
            v-model="selectedRoundTab" 
            bg-color="primary" 
            class="mb-4"
            show-arrows
            center-active
            @update:model-value="selectedRoundTab = $event"
          >
            <v-tab
              v-for="roundNum in sortedRounds"
              :key="roundNum"
              :value="roundNum"
              :class="{ 'font-weight-bold': isCurrentRound(roundNum) }"
            >
              Round {{ roundNum }}
            </v-tab>
          </v-tabs>

          <v-card-text>
            <v-window v-model="selectedRoundTab">
              <v-window-item
                v-for="roundNum in sortedRounds"
                :key="roundNum"
                :value="roundNum"
              >
                <div v-if="gamesByRound[roundNum]" class="pa-4">
                  <!-- Completed Games -->
                  <div v-if="gamesByRound[roundNum].completed.length > 0" class="mb-8">
                    <div class="d-flex align-center mb-4">
                      <v-icon icon="mdi-check-circle" color="success" class="mr-2" />
                      <span class="font-weight-bold text-h6">Completed ({{ gamesByRound[roundNum].completed.length }})</span>
                    </div>

                    <!-- Grid View for Completed -->
                    <template v-if="viewMode === 'grid'">
                      <v-row>
                        <v-col
                          v-for="game in gamesByRound[roundNum].completed"
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

                    <!-- List View for Completed -->
                    <template v-else>
                      <div v-if="getGamesByDay(gamesByRound[roundNum].completed).length > 0">
                        <div
                          v-for="dayItem in getGamesByDayGrouped(gamesByRound[roundNum].completed)"
                          :key="dayItem.date"
                          class="mb-4"
                        >
                          <div class="text-subtitle-2 font-weight-bold mb-2 pa-2 bg-light rounded">
                            {{ dayItem.date }}
                          </div>
                          <v-card variant="outlined" class="table-card">
                            <v-data-table
                              :headers="gamesHeaders"
                              :items="dayItem.games"
                              :items-per-page="-1"
                              class="elevation-0 fixed-table"
                              hide-default-footer
                              density="compact"
                            >
                              <template #item.roundNumber="{ item }">
                                <v-chip size="small" variant="tonal" color="success">
                                  R{{ item.roundNumber }}
                                </v-chip>
                              </template>
                              <template #item.teams="{ item }">
                                <div class="d-flex align-center gap-2">
                                  <span
                                    class="font-weight-bold pa-1 rounded"
                                    :class="(item.homeScore || 0) > (item.awayScore || 0) ? 'bg-success text-white' : ''"
                                  >
                                    {{ item.homeTeamName }}
                                  </span>
                                  <span class="text-medium-emphasis">vs</span>
                                  <span
                                    class="font-weight-bold pa-1 rounded"
                                    :class="(item.awayScore || 0) > (item.homeScore || 0) ? 'bg-success text-white' : ''"
                                  >
                                    {{ item.awayTeamName }}
                                  </span>
                                </div>
                              </template>
                              <template #item.score="{ item }">
                                <span class="font-weight-bold">{{ item.homeScore }} - {{ item.awayScore }}</span>
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
                  </div>

                  <!-- Scheduled Games -->
                  <div v-if="gamesByRound[roundNum].scheduled.length > 0">
                    <div class="d-flex align-center mb-4">
                      <v-icon icon="mdi-clock-outline" color="info" class="mr-2" />
                      <span class="font-weight-bold text-h6">Scheduled ({{ gamesByRound[roundNum].scheduled.length }})</span>
                    </div>

                    <!-- Grid View for Scheduled -->
                    <template v-if="viewMode === 'grid'">
                      <v-row>
                        <v-col
                          v-for="game in gamesByRound[roundNum].scheduled"
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

                    <!-- List View for Scheduled -->
                    <template v-else>
                      <div v-if="getGamesByDay(gamesByRound[roundNum].scheduled).length > 0">
                        <div
                          v-for="dayItem in getGamesByDayGrouped(gamesByRound[roundNum].scheduled)"
                          :key="dayItem.date"
                          class="mb-4"
                        >
                          <div class="text-subtitle-2 font-weight-bold mb-2 pa-2 bg-light rounded">
                            {{ dayItem.date }}
                          </div>
                          <v-card variant="outlined" class="table-card">
                            <v-data-table
                              :headers="gamesHeaders"
                              :items="dayItem.games"
                              :items-per-page="-1"
                              class="elevation-0 fixed-table"
                              hide-default-footer
                              density="compact"
                            >
                              <template #item.roundNumber="{ item }">
                                <v-chip size="small" variant="tonal" color="info">
                                  R{{ item.roundNumber }}
                                </v-chip>
                              </template>
                              <template #item.teams="{ item }">
                                <div class="d-flex align-center">
                                  <span>{{ item.homeTeamName }}</span>
                                  <span class="mx-2 text-medium-emphasis">vs</span>
                                  <span>{{ item.awayTeamName }}</span>
                                </div>
                              </template>
                              <template #item.score="{ item }">
                                <v-chip size="x-small" color="info" variant="flat">Scheduled</v-chip>
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
                  </div>

                  <!-- No games message -->
                  <div v-if="gamesByRound[roundNum].completed.length === 0 && gamesByRound[roundNum].scheduled.length === 0" class="text-center py-8">
                    <span class="text-medium-emphasis">No games for this round</span>
                  </div>
                </div>
              </v-window-item>
            </v-window>
          </v-card-text>
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
const viewMode = ref<'grid' | 'list'>('list')
const selectedRoundTab = ref<number | null>(null)

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
  const grouped: Record<number, { completed: typeof games.value; scheduled: typeof games.value }> = {}
  
  games.value.forEach((game) => {
    const round = game.roundNumber || 0
    if (!grouped[round]) {
      grouped[round] = { completed: [], scheduled: [] }
    }
    if (game.played) {
      grouped[round].completed.push(game)
    } else {
      grouped[round].scheduled.push(game)
    }
  })
  
  return grouped
})

// Get sorted rounds (ascending order with current first marked)
const sortedRounds = computed(() => {
  const roundNumbers = Object.keys(gamesByRound.value).map(Number).sort((a, b) => a - b)
  return roundNumbers
})

// Compute current round
const currentRound = computed(() => {
  const roundNumbers = Object.keys(gamesByRound.value).map(Number).sort((a, b) => b - a)
  
  // Find current round (last round with completed games, or first round with scheduled games)
  for (const roundNum of roundNumbers) {
    if (gamesByRound.value[roundNum].completed.length > 0) {
      return roundNum
    }
  }
  
  for (const roundNum of roundNumbers) {
    if (gamesByRound.value[roundNum].scheduled.length > 0) {
      return roundNum
    }
  }
  
  return null
})

const isCurrentRound = (roundNum: number) => {
  return roundNum === currentRound.value
}

// Set default tab to current round
watch(() => currentRound.value, (newCurrent) => {
  if (newCurrent && !selectedRoundTab.value) {
    selectedRoundTab.value = newCurrent
  }
}, { immediate: true })

// Group games by day for list view
const gamesByDay = computed(() => {
  const allGames = games.value
  const grouped: Record<string, typeof games.value> = {}
  
  allGames.forEach((game) => {
    if (!game.gameDate) return
    
    const date = new Date(game.gameDate)
    const dateKey = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(game)
  })
  
  // Sort by date
  return Object.keys(grouped)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .reduce((acc, key) => {
      acc[key] = grouped[key]
      return acc
    }, {} as Record<string, typeof games.value>)
})

const gamesHeaders = [
  { title: 'Round', key: 'roundNumber', width: '70px' },
  { title: 'Teams', key: 'teams', sortable: false },
  { title: 'Score', key: 'score', width: '100px' },
  { title: 'Date', key: 'gameDate', width: '160px' },
  { title: 'Arena', key: 'arena', width: '250px' },
  { title: '', key: 'actions', width: '50px', sortable: false, align: 'end' },
]

const getGamesByDay = (gameList: typeof games.value) => {
  const grouped: Record<string, typeof games.value> = {}
  
  gameList.forEach((game) => {
    if (!game.gameDate) return
    
    const date = new Date(game.gameDate)
    const dateKey = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(game)
  })
  
  return Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
}

const getGamesByDayGrouped = (gameList: typeof games.value) => {
  const grouped: Record<string, typeof games.value> = {}
  
  gameList.forEach((game) => {
    if (!game.gameDate) return
    
    const date = new Date(game.gameDate)
    const dateKey = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(game)
  })
  
  // Sort keys chronologically and return as array of entries
  const sorted = Object.keys(grouped)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map(key => ({ date: key, games: grouped[key] }))
  
  return sorted
}

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

.table-card {
  margin-bottom: 0;
  background-color: #ffffff;
  border: 1px solid #e0e6f0;
}

.table-card :deep(.v-data-table) {
  background-color: #ffffff;
}

.table-card :deep(table) {
  table-layout: fixed;
  width: 100%;
}

.table-card :deep(thead) {
  background-color: #F05323;
}

.table-card :deep(thead th) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ffffff !important;
  font-weight: 700 !important;
}

.table-card :deep(tbody td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 8px 4px !important;
  background-color: #ffffff;
  color: #1a1a1a;
}

.table-card :deep(tbody tr:hover) {
  background-color: #f9fafb !important;
}

:deep(.v-card) {
  background-color: #ffffff;
  border: 1px solid #e0e6f0;
}

:deep(.v-tabs__bar) {
  background-color: #1a2742 !important;
}

:deep(.v-tabs) {
  background-color: transparent !important;
}

:deep(.v-tab) {
  color: #8a92a2 !important;
}

:deep(.v-tab--selected) {
  color: #F05323 !important;
  font-weight: 700;
}

:deep(.v-slide-group__content) {
  border-bottom: 2px solid transparent;
}

@media (max-width: 768px) {
  .table-card {
    border-radius: 8px;
  }
}
</style>
