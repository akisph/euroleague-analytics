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
          color="primary"
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
        <v-card class="mb-6 game-hero">
          <v-card-text class="pa-6">
            <div class="hero-top">
              <div class="hero-badges">
                <v-chip variant="tonal" color="primary">
                  {{ formattedGameDate }}
                </v-chip>
              </div>
              <v-chip
                :color="game.played ? 'success' : 'primary'"
                variant="flat"
                class="status-chip"
              >
                {{ game.played ? 'Final' : 'Scheduled' }}
              </v-chip>
            </div>

            <div class="game-score-row">
              <!-- Home Team -->
              <div class="team-block">
                <div class="team-meta">
                  <v-avatar size="88" color="grey-lighten-3" class="team-avatar">
                    <v-img
                      v-if="game.homeTeamImage"
                      :src="game.homeTeamImage"
                      :alt="game.homeTeamName"
                      :cover="false"
                    />
                    <span v-else class="team-code">
                      {{ game.homeTeamCode?.substring(0, 3) }}
                    </span>
                  </v-avatar>
                  <div class="team-info">
                    <div class="team-name">{{ game.homeTeamName }}</div>
                    <NuxtLink
                      :to="`/clubs/${game.homeTeamCode}`"
                      class="team-link"
                    >
                      View Team ->
                    </NuxtLink>
                  </div>
                </div>
                <div class="team-score" v-if="game.played" :class="isHomeWinner ? 'text-success' : ''">
                  {{ game.homeScore }}
                </div>
              </div>

              <!-- Center -->
              <div class="score-block">
                <div class="center-divider">{{ game.played ? '-' : 'VS' }}</div>
                <div v-if="game.arena" class="arena-text">
                  {{ game.arena }}
                </div>
              </div>

              <!-- Away Team -->
              <div class="team-block">
                <div class="team-meta">
                  <v-avatar size="88" color="grey-lighten-3" class="team-avatar">
                    <v-img
                      v-if="game.awayTeamImage"
                      :src="game.awayTeamImage"
                      :alt="game.awayTeamName"
                      :cover="false"
                    />
                    <span v-else class="team-code">
                      {{ game.awayTeamCode?.substring(0, 3) }}
                    </span>
                  </v-avatar>
                  <div class="team-info">
                    <div class="team-name">{{ game.awayTeamName }}</div>
                    <NuxtLink
                      :to="`/clubs/${game.awayTeamCode}`"
                      class="team-link"
                    >
                      View Team ->
                    </NuxtLink>
                  </div>
                </div>
                <div class="team-score" v-if="game.played" :class="isAwayWinner ? 'text-success' : ''">
                  {{ game.awayScore }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Tabs: Stats / Related -->
        <v-tabs v-model="activeTab" color="primary" class="mt-6 text-secondary">
          <v-tab value="stats">Stats</v-tab>
          <v-tab value="team-comparison">Team Comparison</v-tab>
          <v-tab value="players">Players</v-tab>
        </v-tabs>

        <v-tabs-items v-model="activeTab">
          <v-tab-item value="stats" v-show="activeTab === 'stats'">
            <GamesStats :game="game" />
          </v-tab-item>

          <v-tab-item value="team-comparison" v-show="activeTab === 'team-comparison'">
            <GamesTeamComparison :game="game" />
          </v-tab-item>

          <v-tab-item value="players" v-show="activeTab === 'players'">
            <GamesPlayersStats :game="game" />
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

const formattedGameDate = computed(() => formatDateTime(game.value?.gameDate))

const loadGame = async () => {
  await fetchGameDetails(seasonCode.value, gameCode.value)
}

const activeTab = ref('stats')

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

.team-avatar :deep(img) {
  object-fit: contain !important;
}

.game-hero {
  border: 1px solid #e0e6f0;
  box-shadow: 0 8px 24px rgba(26, 39, 66, 0.06) !important;
}

.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.game-score-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
}

.team-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.team-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.team-info {
  text-align: left;
}

.team-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a2742;
}

.team-link {
  font-size: 0.8rem;
  color: #F05323;
  text-decoration: none;
}

.team-link:hover {
  text-decoration: underline;
}

.team-score {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1a2742;
  min-width: 56px;
  text-align: center;
}

.center-divider {
  font-size: 1.5rem;
  color: #8a92a2;
  font-weight: 700;
}

.score-block {
  text-align: center;
}

.arena-text {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #8a92a2;
  font-weight: 600;
}

@media (max-width: 768px) {
  .game-score-row {
    grid-template-columns: 1fr;
  }

  .team-meta {
    flex-direction: column;
    text-align: center;
  }

  .team-info {
    text-align: center;
  }

  .score-block {
    display: none;
  }

  .team-score {
    font-size: 1.75rem;
  }

  .team-avatar {
    width: 64px !important;
    height: 64px !important;
  }
}

@media (max-width: 480px) {
  .team-avatar {
    width: 56px !important;
    height: 56px !important;
  }

  .team-name {
    font-size: 1rem;
  }

  .pa-6 { padding: 1rem !important; }
  .mt-6 { margin-top: 1rem !important; }
}
</style>
