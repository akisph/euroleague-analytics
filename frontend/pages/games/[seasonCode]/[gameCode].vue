<template>
  <NuxtLayout>
    <PageHeader
      :title="gameTitle"
      :subtitle="game?.arena"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <v-btn
          variant="outlined"
          prepend-icon="mdi-arrow-left"
          to="/games"
        >
          Back to Games
        </v-btn>
      </template>
    </PageHeader>

    <ErrorAlert
      v-if="error"
      :error="error"
      @retry="loadGame"
      @dismiss="error = null"
    />

    <LoadingState :loading="isLoading" message="Loading game details...">
      <template v-if="game">
        <!-- Game Score Card -->
        <v-card class="mb-6">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-center mb-4">
              <v-chip v-if="game.phaseTypeName" variant="tonal" color="primary" class="mr-2">
                {{ game.phaseTypeName }}
              </v-chip>
              <v-chip variant="outlined">
                Round {{ game.roundNumber }}
              </v-chip>
            </div>
            
            <div class="d-flex align-center justify-center">
              <!-- Home Team -->
              <div class="text-center" style="min-width: 200px;">
                <v-avatar size="80" color="grey-lighten-3" class="mb-3">
                  <span class="text-h5 font-weight-bold">
                    {{ game.homeTeamCode?.substring(0, 3) }}
                  </span>
                </v-avatar>
                <div class="text-h6 font-weight-bold">{{ game.homeTeamName }}</div>
                <NuxtLink
                  :to="`/teams/${game.homeTeamCode}`"
                  class="text-caption text-primary text-decoration-none"
                >
                  View Team →
                </NuxtLink>
              </div>

              <!-- Score -->
              <div class="mx-8 text-center">
                <template v-if="game.played">
                  <div class="d-flex align-center justify-center">
                    <span
                      class="text-h2 font-weight-bold"
                      :class="isHomeWinner ? 'text-success' : 'text-medium-emphasis'"
                    >
                      {{ game.homeScore }}
                    </span>
                    <span class="text-h3 mx-4 text-medium-emphasis">-</span>
                    <span
                      class="text-h2 font-weight-bold"
                      :class="isAwayWinner ? 'text-success' : 'text-medium-emphasis'"
                    >
                      {{ game.awayScore }}
                    </span>
                  </div>
                  <v-chip color="success" variant="flat" class="mt-2">
                    Final
                  </v-chip>
                </template>
                <template v-else>
                  <div class="text-h3 font-weight-bold text-medium-emphasis">VS</div>
                  <v-chip color="info" variant="flat" class="mt-2">
                    Scheduled
                  </v-chip>
                </template>
              </div>

              <!-- Away Team -->
              <div class="text-center" style="min-width: 200px;">
                <v-avatar size="80" color="grey-lighten-3" class="mb-3">
                  <span class="text-h5 font-weight-bold">
                    {{ game.awayTeamCode?.substring(0, 3) }}
                  </span>
                </v-avatar>
                <div class="text-h6 font-weight-bold">{{ game.awayTeamName }}</div>
                <NuxtLink
                  :to="`/teams/${game.awayTeamCode}`"
                  class="text-caption text-primary text-decoration-none"
                >
                  View Team →
                </NuxtLink>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Game Info -->
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="h-100">
              <v-card-title>
                <v-icon icon="mdi-information" class="mr-2" />
                Game Information
              </v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item v-if="game.gameDate">
                    <template #prepend>
                      <v-icon icon="mdi-calendar" class="mr-3" />
                    </template>
                    <v-list-item-title>Date & Time</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDateTime(game.gameDate) }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="game.arena">
                    <template #prepend>
                      <v-icon icon="mdi-stadium" class="mr-3" />
                    </template>
                    <v-list-item-title>Arena</v-list-item-title>
                    <v-list-item-subtitle>{{ game.arena }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="game.attendance">
                    <template #prepend>
                      <v-icon icon="mdi-account-group" class="mr-3" />
                    </template>
                    <v-list-item-title>Attendance</v-list-item-title>
                    <v-list-item-subtitle>{{ game.attendance.toLocaleString() }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="game.status">
                    <template #prepend>
                      <v-icon icon="mdi-flag" class="mr-3" />
                    </template>
                    <v-list-item-title>Status</v-list-item-title>
                    <v-list-item-subtitle>{{ game.status }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="h-100">
              <v-card-title>
                <v-icon icon="mdi-trophy" class="mr-2" />
                Competition Details
              </v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item>
                    <template #prepend>
                      <v-icon icon="mdi-calendar-text" class="mr-3" />
                    </template>
                    <v-list-item-title>Season</v-list-item-title>
                    <v-list-item-subtitle>{{ game.seasonCode }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="game.phaseTypeName">
                    <template #prepend>
                      <v-icon icon="mdi-flag-checkered" class="mr-3" />
                    </template>
                    <v-list-item-title>Phase</v-list-item-title>
                    <v-list-item-subtitle>{{ game.phaseTypeName }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-icon icon="mdi-numeric" class="mr-3" />
                    </template>
                    <v-list-item-title>Round</v-list-item-title>
                    <v-list-item-subtitle>Round {{ game.roundNumber }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="game.groupName">
                    <template #prepend>
                      <v-icon icon="mdi-group" class="mr-3" />
                    </template>
                    <v-list-item-title>Group</v-list-item-title>
                    <v-list-item-subtitle>{{ game.groupName }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Quick Actions -->
        <v-card class="mt-6">
          <v-card-title>Related Content</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="4">
                <v-btn
                  block
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-basketball"
                  :to="`/games?round=${game.roundNumber}`"
                >
                  All Round {{ game.roundNumber }} Games
                </v-btn>
              </v-col>
              <v-col cols="12" sm="4">
                <v-btn
                  block
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-account-group"
                  :to="`/teams/${game.homeTeamCode}`"
                >
                  {{ game.homeTeamName }} Roster
                </v-btn>
              </v-col>
              <v-col cols="12" sm="4">
                <v-btn
                  block
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-account-group"
                  :to="`/teams/${game.awayTeamCode}`"
                >
                  {{ game.awayTeamName }} Roster
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </template>

      <EmptyState
        v-else
        title="Game Not Found"
        message="The requested game could not be found"
        icon="mdi-basketball"
        action-text="Back to Games"
        @action="navigateTo('/games')"
      />
    </LoadingState>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const { fetchGameDetails, currentGame: game, isLoading, error } = useGames()

const seasonCode = computed(() => route.params.seasonCode as string)
const gameCode = computed(() => Number(route.params.gameCode))

const gameTitle = computed(() => {
  if (!game.value) return 'Game Details'
  return `${game.value.homeTeamName} vs ${game.value.awayTeamName}`
})

const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: 'Games', to: '/games' },
  { title: gameTitle.value, disabled: true },
])

const isHomeWinner = computed(() => {
  if (!game.value?.played) return false
  return (game.value.homeScore || 0) > (game.value.awayScore || 0)
})

const isAwayWinner = computed(() => {
  if (!game.value?.played) return false
  return (game.value.awayScore || 0) > (game.value.homeScore || 0)
})

const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadGame = async () => {
  await fetchGameDetails(seasonCode.value, gameCode.value)
}

// Load game when route changes
watch([seasonCode, gameCode], () => {
  loadGame()
}, { immediate: true })
</script>
