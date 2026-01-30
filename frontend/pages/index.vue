<template>
  <PageHeader
    title="Dashboard"
    subtitle="Overview of the Euroleague Basketball season"
  />

    <ErrorAlert
      v-if="errorMessage"
      :error="errorMessage"
      @retry="loadDashboardData"
      @dismiss="errorMessage = null"
    />

    <LoadingState :loading="isLoading" message="Loading dashboard data...">
      <!-- Stats Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Total Teams"
            :value="teams.length"
            icon="mdi-shield-home"
            icon-color="primary"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Games Played"
            :value="gamesPlayed"
            icon="mdi-basketball"
            icon-color="success"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Total Rounds"
            :value="rounds.length"
            icon="mdi-calendar"
            icon-color="warning"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Current Round"
            :value="latestRound?.roundNumber || 0"
            icon="mdi-play-circle"
            icon-color="info"
          />
        </v-col>
      </v-row>

      <!-- Recent & Upcoming Games -->
      <v-row class="mb-6">
        <v-col cols="12" lg="6">
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <span>
                <v-icon icon="mdi-history" class="mr-2" />
                Recent Results
              </span>
              <v-btn
                variant="text"
                size="small"
                to="/games"
              >
                View All
              </v-btn>
            </v-card-title>
            <v-card-text v-if="recentGames.length === 0">
              <EmptyState
                title="No Recent Games"
                message="No games have been played yet this season"
                icon="mdi-basketball-hoop"
              />
            </v-card-text>
            <v-list v-else lines="two" density="compact">
              <v-list-item
                v-for="game in recentGames.slice(0, 5)"
                :key="game.gameCode"
                :to="`/games/${selectedSeasonCode}/${game.gameCode}`"
              >
                <template #prepend>
                  <v-avatar size="36" color="grey-lighten-3" class="mr-2">
                    <span class="text-caption">R{{ game.roundNumber }}</span>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2">
                  <span :class="{ 'font-weight-bold': (game.homeScore || 0) > (game.awayScore || 0) }">
                    {{ game.homeTeamName }}
                  </span>
                  <span class="mx-2">
                    {{ game.homeScore }} - {{ game.awayScore }}
                  </span>
                  <span :class="{ 'font-weight-bold': (game.awayScore || 0) > (game.homeScore || 0) }">
                    {{ game.awayTeamName }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(game.gameDate) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <span>
                <v-icon icon="mdi-calendar-clock" class="mr-2" />
                Upcoming Games
              </span>
              <v-btn
                variant="text"
                size="small"
                to="/games"
              >
                View All
              </v-btn>
            </v-card-title>
            <v-card-text v-if="upcomingGames.length === 0">
              <EmptyState
                title="No Upcoming Games"
                message="All games have been played this season"
                icon="mdi-calendar-check"
              />
            </v-card-text>
            <v-list v-else lines="two" density="compact">
              <v-list-item
                v-for="game in upcomingGames.slice(0, 5)"
                :key="game.gameCode"
                :to="`/games/${selectedSeasonCode}/${game.gameCode}`"
              >
                <template #prepend>
                  <v-avatar size="36" color="grey-lighten-3" class="mr-2">
                    <span class="text-caption">R{{ game.roundNumber }}</span>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ game.homeTeamName }} vs {{ game.awayTeamName }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(game.gameDate) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <!-- Quick Standings -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <span>
                <v-icon icon="mdi-format-list-numbered" class="mr-2" />
                Current Standings
              </span>
              <v-btn
                variant="text"
                size="small"
                to="/standings"
              >
                Full Standings
              </v-btn>
            </v-card-title>
            <v-card-text v-if="!topTeams.length">
              <EmptyState
                title="No Standings Data"
                message="Standings data will appear once games are played"
                icon="mdi-format-list-numbered"
              />
            </v-card-text>
            <v-data-table
              v-else
              :headers="standingsHeaders"
              :items="topTeams"
              :items-per-page="8"
              density="compact"
              class="elevation-0"
            >
              <template #item.position="{ item }">
                <v-avatar
                  :color="item.position <= 4 ? 'success' : 'grey'"
                  size="24"
                >
                  <span class="text-caption text-white font-weight-bold">
                    {{ item.position }}
                  </span>
                </v-avatar>
              </template>
              <template #item.teamName="{ item }">
                <NuxtLink
                  :to="`/teams/${item.teamCode}`"
                  class="text-decoration-none font-weight-medium"
                >
                  {{ item.teamName }}
                </NuxtLink>
              </template>
              <template #item.record="{ item }">
                <span class="font-weight-medium">{{ item.wins }}-{{ item.losses }}</span>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </LoadingState>
</template>

<script setup lang="ts">
const seasonStore = useSeasonStore()
const { fetchSeasonTeams, teams } = useTeams()
const { fetchSeasonGames, games, recentGames, upcomingGames } = useGames()
const { fetchSeasonRounds, rounds, latestRound } = useRounds()
const { fetchSeasonStandings, standings } = useStandings()

const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)

const gamesPlayed = computed(() => games.value.filter((g) => g.played).length)

const topTeams = computed(() => {
  if (standings.value.length === 0) return []
  const firstStanding = standings.value[0]
  return (firstStanding.standings || []).slice(0, 8)
})

const standingsHeaders = [
  { title: '#', key: 'position', width: '50px', sortable: false },
  { title: 'Team', key: 'teamName', sortable: false },
  { title: 'GP', key: 'gamesPlayed', width: '60px' },
  { title: 'W-L', key: 'record', width: '80px', sortable: false },
  { title: 'PF', key: 'pointsFor', width: '80px' },
  { title: 'PA', key: 'pointsAgainst', width: '80px' },
]

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const loadDashboardData = async () => {
  if (!selectedSeasonCode.value) return
  
  isLoading.value = true
  errorMessage.value = null
  
  try {
    await Promise.all([
      fetchSeasonTeams(selectedSeasonCode.value),
      fetchSeasonGames(selectedSeasonCode.value),
      fetchSeasonRounds(selectedSeasonCode.value),
    ])
    
    // Fetch standings for latest round
    if (latestRound.value) {
      await fetchSeasonStandings(selectedSeasonCode.value, latestRound.value.roundNumber)
    }
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load dashboard data'
  } finally {
    isLoading.value = false
  }
}

// Watch for season changes
watch(selectedSeasonCode, () => {
  loadDashboardData()
}, { immediate: true })

// Initial load when season is available
onMounted(() => {
  if (selectedSeasonCode.value) {
    loadDashboardData()
  }
})
</script>
