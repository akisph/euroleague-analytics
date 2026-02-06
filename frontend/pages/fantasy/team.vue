<template>
  <div class="page-light-surface">
    <SharedPageHeader
      title="Fantasy Team"
      subtitle="PIR allowed per team"
    />

    <SharedErrorAlert
      v-if="error"
      :error="error"
      @retry="loadFantasyTeams"
      @dismiss="error = null"
    />

    <SharedLoadingState :loading="isLoading" message="Loading fantasy data...">
      <FantasyTeamPage
        v-if="teamsPirAllowed.length"
        :items="teamsPirAllowed"
        v-model:positionId="positionId"
      />

      <SharedEmptyState
        v-else
        title="No Fantasy Data"
        message="Fantasy stats are not available for the selected season."
        icon="mdi-chart-box-outline"
      />
    </SharedLoadingState>
  </div>
</template>

<script setup lang="ts">
import FantasyTeamPage from '~/components/fantasy/FantasyTeamPage.vue'

const seasonStore = useSeasonStore()
const { teamsPirAllowed, isLoading, error, fetchTeamsPirAllowed } = useFantasy()

const positionId = ref(1)

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)

const loadFantasyTeams = async () => {
  if (!selectedSeasonCode.value) return
  await fetchTeamsPirAllowed(selectedSeasonCode.value, {
    positionId: positionId.value,
  })
}

watch([selectedSeasonCode, positionId], () => {
  loadFantasyTeams()
}, { immediate: true })
</script>
