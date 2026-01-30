<template>
  <PageHeader
    title="Standings"
    subtitle="Current season standings and rankings"
  />

  <ErrorAlert
    v-if="error"
    :error="error"
    @retry="loadStandings"
    @dismiss="error = null"
  />

  <LoadingState :loading="isLoading" message="Loading standings...">
    <template v-if="standings.length">
      <StandingsTable
        v-if="standings.length === 1"
        :standings="standings[0].standings || []"
        title="Current Standings"
        :subtitle="standings[0].groupName"
      />

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
              subtitle="Current Standings"
            />
          </v-window-item>
        </v-window>
      </template>

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
                  <div class="text-caption">{{ bestOffenseTeam?.pointsFor?.toFixed(1) }} PPG</div>
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
                  <div class="text-caption">{{ bestDefenseTeam?.pointsAgainst?.toFixed(1) }} PPG allowed</div>
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
</template>

<script setup lang="ts">
const seasonStore = useSeasonStore()
const { fetchCurrentStandings, standings, allTeamStandings, isLoading, error } = useStandings()

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)
const selectedTab = ref(0)

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
