<template>
  <section class="leaders-section">
    <SharedLoadingState :loading="isLoading" message="Loading player leaders...">
      <div class="leaders-card">
        <div class="leaders-header">
          <div>
            <div class="leaders-title">Player Leaders</div>
            <div class="leaders-subtitle">Top 5 by category</div>
          </div>
          <NuxtLink
            :to="{
              path: '/players/leaders',
              query: {
                aggregate: selectedAggregate,
                category: selectedCategory,
              },
            }"
            class="leaders-link"
          >
            <v-btn
              size="small"
              variant="text"
              color="primary"
              append-icon="mdi-arrow-right"
            >
              Show more
            </v-btn>
          </NuxtLink>
        </div>

        <div class="leaders-filters">
          <v-select
            v-model="selectedAggregate"
            :items="aggregateOptions"
            item-title="label"
            item-value="value"
            label="Aggregate"
            density="compact"
            variant="outlined"
            class="filter-select"
            :menu-props="{ contentClass: 'leaders-select-menu' }"
          />
          <v-select
            v-model="selectedCategory"
            :items="categoryOptions"
            item-title="label"
            item-value="value"
            label="Category"
            density="compact"
            variant="outlined"
            class="filter-select"
            :menu-props="{ contentClass: 'leaders-select-menu' }"
          />
        </div>

        <div v-if="leaders.length" class="leaders-list">
          <div v-for="player in leaders" :key="player.playerCode ?? player.name" class="leader-row">
            <div class="leader-info">
              <v-avatar size="32" class="leader-avatar">
                <v-img
                  v-if="player.imageUrl"
                  :src="player.imageUrl"
                  :alt="player.name || 'Player'"
                  cover="false"
                  class="leader-avatar-img"
                />
                <span v-else class="leader-avatar-fallback">
                  {{ (player.name || '-').slice(0, 1).toUpperCase() }}
                </span>
              </v-avatar>
              <div class="leader-name">{{ player.name }}</div>
              <div class="leader-team">{{ player.clubCode || '-' }}</div>
            </div>
            <div class="leader-value">{{ formatStatValue(player.value ?? 0) }}</div>
          </div>
        </div>

        <SharedEmptyState
          v-else
          title="No player stats"
          message="Player statistics will appear once data is available."
          icon="mdi-account"
        />
      </div>
    </SharedLoadingState>
  </section>
</template>

<script setup lang="ts">
const seasonStore = useSeasonStore()
const api = useApi()
const isLoading = ref(false)
const error = ref<string | null>(null)
const leadersData = ref<any | null>(null)

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)

const aggregateOptions = [
  { label: 'Per Game', value: 'PerGame' },
  { label: 'Accumulated', value: 'Accumulated' },
  { label: 'Per Minute', value: 'PerMinute' },
  { label: 'Per 100 Possessions', value: 'Per100Possesions' },
] as const

const categoryOptions = [
  { label: 'PIR', value: 'Valuation' },
  { label: 'Score', value: 'Score' },
  { label: 'Total Rebounds', value: 'TotalRebounds' },
  { label: 'Offensive Rebounds', value: 'OffensiveRebounds' },
  { label: 'Defensive Rebounds', value: 'DefensiveRebounds' },
  { label: 'Assistances', value: 'Assistances' },
  { label: 'Steals', value: 'Steals' },
  { label: 'Blocks Favour', value: 'BlocksFavour' },
  { label: 'Blocks Against', value: 'BlocksAgainst' },
  { label: 'Turnovers', value: 'Turnovers' },
  { label: 'Fouls Received', value: 'FoulsReceived' },
  { label: 'Fouls Commited', value: 'FoulsCommited' },
  { label: 'Free Throws Made', value: 'FreeThrowsMade' },
  { label: 'Free Throws Attempted', value: 'FreeThrowsAttempted' },
  { label: 'Free Throws Percent', value: 'FreeThrowsPercent' },
  { label: 'Field Goals Made 2', value: 'FieldGoalsMade2' },
  { label: 'Field Goals Attempted 2', value: 'FieldGoalsAttempted2' },
  { label: 'Field Goals 2 Percent', value: 'FieldGoals2Percent' },
  { label: 'Field Goals Made 3', value: 'FieldGoalsMade3' },
  { label: 'Field Goals Attempted 3', value: 'FieldGoalsAttempted3' },
  { label: 'Field Goals 3 Percent', value: 'FieldGoals3Percent' },
  { label: 'Field Goals Made Total', value: 'FieldGoalsMadeTotal' },
  { label: 'Field Goals Attempted Total', value: 'FieldGoalsAttemptedTotal' },
  { label: 'Field Goals Percent', value: 'FieldGoalsPercent' },
  { label: 'Accuracy Made', value: 'AccuracyMade' },
  { label: 'Accuracy Attempted', value: 'AccuracyAttempted' },
  { label: 'Accuracy Percent', value: 'AccuracyPercent' },
  { label: 'AST/TO Ratio', value: 'AssistancesTurnoversRatio' },
  { label: 'Games Played', value: 'GamesPlayed' },
  { label: 'Games Started', value: 'GamesStarted' },
  { label: 'Time Played', value: 'TimePlayed' },
  { label: 'Contras', value: 'Contras' },
  { label: 'Dunks', value: 'Dunks' },
  { label: 'Off Rebound %', value: 'OffensiveReboundPercentage' },
  { label: 'Def Rebound %', value: 'DefensiveReboundPercentage' },
  { label: 'Rebound %', value: 'ReboundPercentage' },
  { label: 'eFG %', value: 'EffectiveFieldGoalPercentage' },
  { label: 'TS %', value: 'TrueShootingPercentage' },
  { label: 'Assist Ratio', value: 'AssistRatio' },
  { label: 'Turnover Ratio', value: 'TurnoverRatio' },
  { label: 'FG2 Attempted Ratio', value: 'FieldGoals2AttemptedRatio' },
  { label: 'FG3 Attempted Ratio', value: 'FieldGoals3AttemptedRatio' },
  { label: 'Free Throw Rate', value: 'FreeThrowRate' },
  { label: 'Possessions', value: 'Possesions' },
  { label: 'Games Won', value: 'GamesWon' },
  { label: 'Games Lost', value: 'GamesLost' },
  { label: 'Double Doubles', value: 'DoubleDoubles' },
  { label: 'Triple Doubles', value: 'TripleDoubles' },
  { label: 'FG2 Attempted Share', value: 'FieldGoalsAttempted2Share' },
  { label: 'FG3 Attempted Share', value: 'FieldGoalsAttempted3Share' },
  { label: 'FT Attempted Share', value: 'FreeThrowsAttemptedShare' },
  { label: 'FG2 Made Share', value: 'FieldGoalsMade2Share' },
  { label: 'FG3 Made Share', value: 'FieldGoalsMade3Share' },
  { label: 'FT Made Share', value: 'FreeThrowsMadeShare' },
  { label: 'Points Made 2 Rate', value: 'PointsMade2Rate' },
  { label: 'Points Made 3 Rate', value: 'PointsMade3Rate' },
  { label: 'Points Made FT Rate', value: 'PointsMadeFreeThrowsRate' },
  { label: 'Points Attempted 2 Rate', value: 'PointsAttempted2Rate' },
  { label: 'Points Attempted 3 Rate', value: 'PointsAttempted3Rate' },
  { label: 'Age', value: 'Age' },
] as const

const selectedAggregate = ref<(typeof aggregateOptions)[number]['value']>('PerGame')
const selectedCategory = ref<(typeof categoryOptions)[number]['value']>('Valuation')
const leaders = computed(() => {
  const rawLeaders = leadersData.value?.leaders
  if (Array.isArray(rawLeaders)) return rawLeaders
  const data = leadersData.value?.categories || {}
  const list = data?.pir || []
  return Array.isArray(list) ? list : []
})

const formatStatValue = (value: number) => {
  if (!Number.isFinite(value)) return '-'
  return value.toFixed(2)
}

const loadLeaders = async () => {
  if (!selectedSeasonCode.value) return
  if (!selectedCategory.value || !selectedAggregate.value) return
  isLoading.value = true
  error.value = null
  try {
    const params = new URLSearchParams({
      seasonCode: selectedSeasonCode.value,
      category: selectedCategory.value,
      aggregate: selectedAggregate.value,
      limit: '5',
    })
    leadersData.value = await api.get(
      `/players/season/${selectedSeasonCode.value}/leaders?${params.toString()}`,
    )
  } catch (err: any) {
    error.value = err?.message || 'Failed to load leaders'
  } finally {
    isLoading.value = false
  }
}

watch([selectedSeasonCode, selectedCategory, selectedAggregate], () => {
  loadLeaders()
}, { immediate: true })
</script>

<style scoped>
.leaders-card {
  background: #ffffff;
  border: 1px solid #e0e6f0;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 10px 24px rgba(26, 39, 66, 0.08);
}

.leaders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.leaders-link {
  text-decoration: none;
}

.leaders-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a2742;
}

.leaders-subtitle {
  font-size: 0.75rem;
  color: #8a92a2;
}

.leaders-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.filter-select {
  min-width: 180px;
  background: #f9fafb;
  border-radius: 10px;
}

:deep(.filter-select .v-field) {
  background: #f9fafb;
  color: #1a2742;
}

:deep(.filter-select .v-field__outline) {
  --v-field-border-opacity: 1;
  border-color: #d6dce8;
}

:deep(.filter-select .v-label) {
  color: #6b7384;
}

:deep(.filter-select .v-field__input) {
  color: #1a2742;
}

.leaders-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.leader-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.6rem;
  background: #f9fafb;
  border-radius: 12px;
}

.leader-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.leader-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a2742;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.leader-team {
  font-size: 0.7rem;
  color: #8a92a2;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.leader-avatar {
  flex: 0 0 auto;
  background: #eef1f6;
  color: #1a2742;
  font-weight: 700;
}

.leader-avatar-img {
  object-fit: contain;
}

.leader-avatar-fallback {
  font-size: 0.75rem;
}

.leader-value {
  font-weight: 700;
  color: #1a2742;
  font-size: 0.9rem;
}
</style>
