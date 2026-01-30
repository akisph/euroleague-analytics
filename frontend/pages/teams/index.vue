<template>
  <PageHeader
    title="Teams"
    subtitle="All teams participating in the current season"
  >
      <template #actions>
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Search teams"
          single-line
          hide-details
          density="compact"
          variant="outlined"
          class="max-w-[250px]"
          clearable
        />
      </template>
    </PageHeader>

    <ErrorAlert
      v-if="error"
      :error="error"
      @retry="loadTeams"
      @dismiss="error = null"
    />

    <LoadingState :loading="isLoading" message="Loading teams...">
      <v-row v-if="filteredTeams.length">
        <v-col
          v-for="team in filteredTeams"
          :key="team.clubCode"
          cols="12"
          sm="6"
          lg="4"
        >
          <v-card
            class="team-card h-100"
            :to="`/teams/${team.clubCode}`"
          >
            <v-card-text class="pa-6">
              <div class="d-flex align-center">
                <v-avatar size="64" color="grey-lighten-3" class="mr-4">
                  <span class="text-h5 font-weight-bold">
                    {{ team.clubCode.substring(0, 3) }}
                  </span>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-h6 font-weight-bold mb-1">{{ team.clubName }}</div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ team.clubCode }}
                  </div>
                  <div class="d-flex align-center mt-2">
                    <v-chip size="x-small" variant="tonal" class="mr-2">
                      <v-icon size="12" icon="mdi-account-group" class="mr-1" />
                      {{ team.playersCount || team.players?.length || 0 }} players
                    </v-chip>
                    <v-chip v-if="team.coachName" size="x-small" variant="tonal">
                      <v-icon size="12" icon="mdi-whistle" class="mr-1" />
                      {{ team.coachName }}
                    </v-chip>
                  </div>
                </div>
                <v-icon icon="mdi-chevron-right" />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <EmptyState
        v-else
        title="No Teams Found"
        :message="searchQuery ? 'No teams match your search criteria' : 'No teams available for this season'"
        icon="mdi-account-group-outline"
        :action-text="searchQuery ? 'Clear Search' : undefined"
        @action="searchQuery = ''"
      />
    </LoadingState>
</template>

<script setup lang="ts">
const seasonStore = useSeasonStore()
const { fetchSeasonTeams, teams, isLoading, error } = useTeams()

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)
const searchQuery = ref('')

const filteredTeams = computed(() => {
  if (!searchQuery.value) return teams.value
  const query = searchQuery.value.toLowerCase()
  return teams.value.filter((team) => 
    team.clubName.toLowerCase().includes(query) ||
    team.clubCode.toLowerCase().includes(query)
  )
})

const loadTeams = async () => {
  if (!selectedSeasonCode.value) return
  await fetchSeasonTeams(selectedSeasonCode.value)
}

// Watch for season changes
watch(selectedSeasonCode, () => {
  loadTeams()
}, { immediate: true })

onMounted(() => {
  if (selectedSeasonCode.value) {
    loadTeams()
  }
})
</script>

<style scoped>
.team-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.team-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
</style>
