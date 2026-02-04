<template>
  <div class="player-details-page">
    <SharedPageHeader
      :title="player?.name || 'Player Details'"
      :subtitle="player?.clubName"
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
        <PlayerDetailsPage :player="player" :season-code="seasonCode" />
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
import PlayerDetailsPage from '~/components/players/PlayerDetailsPage.vue'

const route = useRoute()
const router = useRouter()
const seasonStore = useSeasonStore()
const { fetchPlayerByCode, currentPlayer: player, isLoading, error } = usePlayers()

const playerCode = computed(() => route.params.playerCode as string)
const seasonCode = computed(() => route.params.seasonCode as string)

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
</style>
