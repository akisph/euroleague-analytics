<template>
  <NuxtLayout>
    <PageHeader
      title="Standings"
      subtitle="Current season standings and rankings"
    >
      <template #actions>
        <div class="d-flex gap-2 flex-wrap">
          <v-select
            v-model="selectedRound"
            :items="roundOptions"
            label="Round"
            density="compact"
            variant="outlined"
            hide-details
            class="max-w-[150px]"
            @update:model-value="loadStandings"
          />
        </div>
      </template>
    </PageHeader>

    <ErrorAlert
      v-if="error"
      :error="error"
      @retry="loadStandings"
      @dismiss="error = null"
    />

    <LoadingState :loading="isLoading" message="Loading standings...">
      <template v-if="standings.length">
        <!-- Single standings table if only one group -->
        <StandingsTable
          v-if="standings.length === 1"
          :standings="standings[0].standings || []"
          :title="`Round ${selectedRound} Standings`"
          :subtitle="standings[0].groupName"
        />

        <!-- Multiple groups tabs -->
        <template v-else>
          <v-tabs v-model="selectedTab" color="primary" class="mb-4">
            <v-tab
              v-for="(standing, index) in standings"
              :key="standing.groupCode || index"
              :value="index"
            >
              {{ standing.groupName || `Group ${index + 1}` }}
            </v-tab>
          </v-tabs>

          <v-window v-model="selectedTab">
            <v-window-item
              v-for="(standing, index) in standings"
              :key="standing.groupCode || index"
              :value="index"
            >
              <StandingsTable
                :standings="standing.standings || []"
                :title="standing.groupName || `Group ${index + 1}`"
                :subtitle="`Round ${selectedRound}`"
              />
            </v-window-item>
          </v-window>
        </template>

        <!-- Standings Summary Cards -->
        <v-row class="mt-6">
          <v-col cols="12" md="4">
            <v-card color="success" variant="tonal">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon icon="mdi-trophy" size="40" class="mr-4" />
                  <div>
                    <div class="text-h6 font-weight-bold">Top Team</div>
                    <div class="text-body-1">{{ topTeam?.teamName || '-' }}</div>
                    <div class="text-caption">{{ topTeam?.wins }}-{{ topTeam?.losses }} record</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card color="primary" variant="tonal">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon icon="mdi-chart-line" size="40" class="mr-4" />
                  <div>
                    <div class="text-h6 font-weight-bold">Best Offense</div>
                    <div class="text-body-1">{{ bestOffenseTeam?.teamName || '-' }}</div>
                    <div class="text-caption">{{ bestOffenseTeam?.pointsFor?.toLocaleString() }} points</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card color="info" variant="tonal">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon icon="mdi-shield" size="40" class="mr-4" />
                  <div>
                    <div class="text-h6 font-weight-bold">Best Defense</div>
                    <div class="text-body-1">{{ bestDefenseTeam?.teamName || '-' }}</div>
                    <div class="text-caption">{{ bestDefenseTeam?.pointsAgainst?.toLocaleString() }} allowed</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <EmptyState
        v-else
        title="No Standings Available"
        message="Standings data will appear once games are played"
        icon="mdi-format-list-numbered"
      />
    </LoadingState>
  </NuxtLayout>
</template>

<script setup lang="ts">
const seasonStore = useSeasonStore()
const { fetchSeasonStandings, standings, allTeamStandings, isLoading, error } = useStandings()
const { fetchSeasonRounds, rounds, roundOptions, latestRound } = useRounds()

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)
const selectedRound = ref<number | null>(null)
const selectedTab = ref(0)

// Computed standings stats
const topTeam = computed(() => {
  if (!allTeamStandings.value.length) return null
  return allTeamStandings.value.reduce((best, current) => 
    current.position < best.position ? current : best
  )
})

const bestOffenseTeam = computed(() => {
  if (!allTeamStandings.value.length) return null
  return allTeamStandings.value.reduce((best, current) => 
    (current.pointsFor || 0) > (best.pointsFor || 0) ? current : best
  )
})

const bestDefenseTeam = computed(() => {
  if (!allTeamStandings.value.length) return null
  return allTeamStandings.value.reduce((best, current) => 
    (current.pointsAgainst || 0) < (best.pointsAgainst || Infinity) ? current : best
  )
})

const loadStandings = async () => {
  if (!selectedSeasonCode.value || !selectedRound.value) return
  await fetchSeasonStandings(selectedSeasonCode.value, selectedRound.value)
}

const loadInitialData = async () => {
  if (!selectedSeasonCode.value) return
  
  // First load rounds to get the latest round
  await fetchSeasonRounds(selectedSeasonCode.value)
  
  // Set default round to latest
  if (latestRound.value && !selectedRound.value) {
    selectedRound.value = latestRound.value.roundNumber
  }
  
  // Load standings
  await loadStandings()
}

// Watch for season changes
watch(selectedSeasonCode, () => {
  selectedRound.value = null
  loadInitialData()
}, { immediate: true })

onMounted(() => {
  if (selectedSeasonCode.value) {
    loadInitialData()
  }
})
</script>
