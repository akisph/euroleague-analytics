import { ref } from "vue"

<template>
  <div class="page-light-surface">
    <SharedPageHeader
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
    </SharedPageHeader>

    <SharedErrorAlert
      v-if="error"
      :error="error"
      @retry="loadGame"
      @dismiss="error = null"
    />

    <SharedLoadingState :loading="isLoading" message="Loading game details...">
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
                  :to="`/clubs/${game.homeTeamCode}`"
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
                  :to="`/clubs/${game.awayTeamCode}`"
                  class="text-caption text-primary text-decoration-none"
                >
                  View Team →
                </NuxtLink>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Tabs: Game Info / Stats / Related -->
        <v-tabs  v-model="activeTab" color="primary" class="mt-6 bg-secondary">
            <v-tab value="game-info">Game Info</v-tab>
            <v-tab value="stats">Stats</v-tab>
        </v-tabs>

        <v-tabs-items v-model="activeTab">
          <v-tab-item value="game-info" v-show="activeTab === 'game-info'">
            <GamesInfo :game="game" />
          </v-tab-item>

            <v-tab-item value="stats" v-show="activeTab === 'stats'">
              <GamesStats :game="game" />
            </v-tab-item>

          
        </v-tabs-items>
      </template>

      <SharedEmptyState
        v-else
        title="Game Not Found"
        message="The requested game could not be found"
        icon="mdi-basketball"
        action-text="Back to Games"
        @action="navigateTo('/games')"
      />
    </SharedLoadingState>
  </div>
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

const activeTab = ref('game-info')

// Load game when route changes
watch([seasonCode, gameCode], () => {
  loadGame()
}, { immediate: true })
</script>

<style scoped>
/* Ensure no dark backgrounds appear inside pages wrapped with .page-light-surface */
.page-light-surface :deep(.v-card),
.page-light-surface :deep(.v-card-text),
.page-light-surface :deep(.v-card-title),
.page-light-surface :deep(.v-card__title),
.page-light-surface :deep(.v-card-actions),
.page-light-surface :deep(.v-list),
.page-light-surface :deep(.v-list-item),
.page-light-surface :deep(.v-list-item__content),
.page-light-surface :deep(.v-list-item__title),
.page-light-surface :deep(.v-list-item__subtitle),
.page-light-surface :deep(.v-avatar) {
  background-color: #ffffff !important;
  color: #1a1a1a !important;
}

.page-light-surface :deep(.v-card-title),
.page-light-surface :deep(.v-card__title) {
  background-color: transparent !important;
}

.page-light-surface :deep(.v-chip) {
  background-color: rgba(240,83,35,0.08) !important;
  color: #F05323 !important;
}

/* Specific safe overrides for avatars and tiny UI pieces */
.page-light-surface :deep(.v-avatar) {
  background-color: #f3f4f6 !important;
}
</style>
