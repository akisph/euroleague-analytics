<template>
  <div>
    <ErrorAlert
      v-if="error"
      :error="error"
      @retry="loadStandings"
      @dismiss="error = null"
    />

    <LoadingState :loading="isLoading" message="Loading standings...">
      <div class="standings-wrapper">
        <template v-if="allTeamStandings.length">
          <StandingsTable
            :standings="allTeamStandings"
            :title="title"
            :subtitle="subtitle"
          />
        </template>

        <SharedEmptyState
          v-else
          title="No Standings Available"
          message="Standings data will appear once games are played"
          icon="mdi-format-list-numbered"
        />
      </div>
    </LoadingState>
  </div>
</template>

<script setup lang="ts">
const seasonStore = useSeasonStore()
const { fetchCurrentStandings, allTeamStandings, isLoading, error } = useStandings()

interface Props {
  title?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Standings',
  subtitle: 'Regular Season',
})

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)

const loadStandings = async () => {
  if (!selectedSeasonCode.value) return

  try {
    await fetchCurrentStandings(selectedSeasonCode.value)
  } catch (err) {
    console.error('Failed to load standings:', err)
  }
}

watch(selectedSeasonCode, async (newSeason) => {
  if (newSeason) {
    await loadStandings()
  }
})

onMounted(async () => {
  if (!selectedSeasonCode.value) {
    const unwatch = watch(selectedSeasonCode, async (newSeason) => {
      if (newSeason) {
        unwatch()
        await loadStandings()
      }
    })
  } else {
    await loadStandings()
  }
})
</script>

<style scoped>
.standings-wrapper {
  background-color: #ffffff;
  border: 1px solid #e0e6f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.standings-wrapper :deep(.v-card) {
  background-color: #ffffff;
  border: none;
  box-shadow: none;
}
</style>
