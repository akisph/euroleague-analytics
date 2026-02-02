import { ref } from "vue"

<template>
  <div class="player-details-page">
    <SharedPageHeader
      :title="player?.name || 'Player Details'"
      :subtitle="player?.position"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="$router.back()">
          Back
        </v-btn>
      </template>
    </SharedPageHeader>

    <SharedErrorAlert v-if="error" :error="error" @retry="loadPlayer" @dismiss="error = null" />

    <SharedLoadingState :loading="isLoading" message="Loading player details...">
      <template v-if="player">
        <div class="page-container">
          <!-- Profile Header Section -->
          <v-row class="mb-8">
          

            <!-- Info Card -->
            <v-col cols="12" md="12">
              <PlayersPlayerInfoCard :player="player" />
            </v-col>
          </v-row>

          <!-- Stats Sections with Tabs -->
          <v-tabs v-model="activeTab" color="primary" class="mt-6 text-secondary">
            <!-- Stats Tab -->
            <v-tab key="stats" value="stats">
              <v-icon icon="mdi-chart-box" class="mr-2" />
              Stats
            </v-tab>

            <!-- Games Tab -->
            <v-tab key="games" value="games">
              <v-icon icon="mdi-basketball" class="mr-2" />
              Games
            </v-tab>
          </v-tabs>

          <!-- Tab Content -->
          <v-window v-model="activeTab" class="mt-6">
            <!-- Stats Tab Content -->
            <v-window-item key="stats" value="stats">
              <template v-if="player.stats">
                <!-- Charts Row - Shooting Percentages & Per Game Averages -->
                <v-row class="gap-6 mb-8">
                  <v-col cols="12" md="6">
                    <PlayersPlayerShootingGauges :player="player" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <PlayersPlayerPerGameChart :player="player" />
                  </v-col>
                </v-row>

                <!-- Detailed Stats Grid -->
                <v-row class="gap-4">
                  <v-col cols="12">
                    <PlayersPlayerScoringStats :player="player" />
                  </v-col>

                  <v-col cols="12">
                    <PlayersPlayerReboundsStats :player="player" />
                  </v-col>

                  <v-col cols="12">
                    <PlayersPlayerDefenseStats :player="player" />
                  </v-col>
                </v-row>
              </template>
            </v-window-item>

            <!-- Games Tab Content -->
            <v-window-item key="games" value="games">
              <div class="pa-8 text-center">
                <p class="text-body-2 text-medium-emphasis">Games content coming soon...</p>
              </div>
            </v-window-item>
          </v-window>
        </div>
      </template>

      <SharedEmptyState
        v-else
        title="Player Not Found"
        message="The requested player could not be found"
        icon="mdi-account-off"
        action-text="Go Back"
        @action="$router.back()"
      />
    </SharedLoadingState>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const seasonStore = useSeasonStore()
const { fetchPlayerByCode, currentPlayer: player, isLoading, error } = usePlayers()

const playerCode = computed(() => route.params.playerCode as string)
const seasonCode = computed(() => route.params.seasonCode as string)
const activeTab = ref('stats')

const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: 'Players', to: `/players` },
  { title: player.value?.name || playerCode.value, disabled: true },
])

const loadPlayer = async () => {
  // Use seasonCode and playerCode from route params
  if (!seasonCode.value || !playerCode.value) {
    error.value = 'Season or player code missing'
    return
  }
  await fetchPlayerByCode(playerCode.value, seasonCode.value)
}

// Load player when route changes
watch([seasonCode, playerCode], () => {
  loadPlayer()
}, { immediate: true })

// Watch for season changes in store and update the route
watch(
  () => seasonStore.selectedSeasonCode,
  (newSeason) => {
    if (newSeason && newSeason !== seasonCode.value) {
      console.log('[Player Details] Season changed to:', newSeason, 'updating route...')
      // Navigate to the player page with the new season
      router.push(`/players/${newSeason}/${playerCode.value}`)
    }
  }
)
</script>
<style scoped>
.player-details-page {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.page-container {
  padding: 32px 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 960px) {
  .page-container {
    padding: 20px 16px;
  }
}

@media (max-width: 600px) {
  .page-container {
    padding: 16px 12px;
  }
}
</style>
