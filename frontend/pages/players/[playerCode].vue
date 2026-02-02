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
            <v-col cols="12" md="4">
              <PlayersPlayerProfileHeader :player="player" />
            </v-col>

            <!-- Info Card -->
            <v-col cols="12" md="8">
              <PlayersPlayerInfoCard :player="player" />
            </v-col>
          </v-row>

          <!-- Stats Sections -->
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
const { fetchPlayerByCode, currentPlayer: player, isLoading, error } = usePlayers()

const playerCode = computed(() => route.params.playerCode as string)

const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: 'Clubs', to: '/clubs' },
  { title: player.value?.name || playerCode.value, disabled: true },
])

const loadPlayer = async () => {
  await fetchPlayerByCode(playerCode.value)
}

// Load player when route changes
watch(playerCode, () => {
  loadPlayer()
}, { immediate: true })
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