<template>
  <v-card class="h-100 pa-6">
    <v-card-title>Statistics</v-card-title>
    <v-card-text>
        
      <v-row v-if="isLoading" class="align-center justify-center">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" />
        </v-col>
      </v-row>

      <v-alert type="error" v-if="error">{{ error }}</v-alert>

      <v-row v-if="!isLoading && !error" class="g-4">
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <span>{{ game?.homeTeamName || 'Home' }}</span>
              <span class="text-h6 font-weight-bold">{{ homeTotals.score ?? '-' }}</span>
            </v-card-title>
            <v-card-text>
              <v-list density="compact" class="stat-list">
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'ACC%' : 'Accuracy' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ accuracyLabel(homeTotals) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'AST' : 'Assists' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ homeTotals.assistances ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'BLK' : 'Blocks' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ homeTotals.blocksFavour ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'DREB' : 'Defensive Rebounds' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ homeTotals.defensiveRebounds ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'OREB' : 'Offensive Rebounds' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ homeTotals.offensiveRebounds ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? '2PT' : 'Field Goals 2pt (Made / Attempted)' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ shotLabel(homeTotals.fieldGoalsMade2, homeTotals.fieldGoalsAttempted2) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? '3PT' : 'Field Goals 3pt (Made / Attempted)' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ shotLabel(homeTotals.fieldGoalsMade3, homeTotals.fieldGoalsAttempted3) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'FG' : 'Field Goals Total (Made / Attempted)' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ shotLabel(homeTotals.fieldGoalsMadeTotal, homeTotals.fieldGoalsAttemptedTotal) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'FLS' : 'Fouls' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ homeTotals.foulsCommited ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'FR' : 'Fouls Received' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ homeTotals.foulsReceived ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'FT' : 'Free Throws (Made / Attempted)' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ shotLabel(homeTotals.freeThrowsMade, homeTotals.freeThrowsAttempted) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'PTS' : 'Points' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ homeTotals.points ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'STL' : 'Steals' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ homeTotals.steals ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'REB' : 'Total Rebounds' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ homeTotals.totalRebounds ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'TO' : 'Turnovers' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ homeTotals.turnovers ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>PIR</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ homeTotals.valuation ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <span>{{ game?.awayTeamName || 'Away' }}</span>
              <span class="text-h6 font-weight-bold">{{ awayTotals.score ?? '-' }}</span>
            </v-card-title>
            <v-card-text>
              <v-list density="compact" class="stat-list">
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'ACC%' : 'Accuracy' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ accuracyLabel(awayTotals) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'AST' : 'Assists' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ awayTotals.assistances ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'BLK' : 'Blocks' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ awayTotals.blocksFavour ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'DREB' : 'Defensive Rebounds' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ awayTotals.defensiveRebounds ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'OREB' : 'Offensive Rebounds' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ awayTotals.offensiveRebounds ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? '2PT' : 'Field Goals 2pt (Made / Attempted)' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ shotLabel(awayTotals.fieldGoalsMade2, awayTotals.fieldGoalsAttempted2) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? '3PT' : 'Field Goals 3pt (Made / Attempted)' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ shotLabel(awayTotals.fieldGoalsMade3, awayTotals.fieldGoalsAttempted3) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'FG' : 'Field Goals Total (Made / Attempted)' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ shotLabel(awayTotals.fieldGoalsMadeTotal, awayTotals.fieldGoalsAttemptedTotal) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'FLS' : 'Fouls' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ awayTotals.foulsCommited ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'FR' : 'Fouls Received' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ awayTotals.foulsReceived ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'FT' : 'Free Throws (Made / Attempted)' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ shotLabel(awayTotals.freeThrowsMade, awayTotals.freeThrowsAttempted) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'PTS' : 'Points' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ awayTotals.points ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'STL' : 'Steals' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ awayTotals.steals ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'REB' : 'Total Rebounds' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ awayTotals.totalRebounds ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ isMobile ? 'TO' : 'Turnovers' }}</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ awayTotals.turnovers ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>PIR</v-list-item-title>
                  <v-list-item-subtitle class="text-right">{{ awayTotals.valuation ?? '-' }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useApi } from '~/composables/useApi'

const props = defineProps<{ game?: any }>()
const homeTeamName = computed(() => props.game?.homeTeamName ?? 'Home')
const awayTeamName = computed(() => props.game?.awayTeamName ?? 'Away')

const api = useApi()
const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
const isLoading = ref(false)
const error = ref<string | null>(null)
const stats = ref<any | null>(null)

const fetchStats = async () => {
  if (!props.game?.seasonCode || !props.game?.gameCode) return
  isLoading.value = true
  error.value = null
  stats.value = null
  try {
    const resp = await api.get(`/games/season/${props.game.seasonCode}/${props.game.gameCode}/stats`)
    stats.value = resp
  } catch (e: any) {
    error.value = e?.message || 'Failed to fetch stats'
  } finally {
    isLoading.value = false
  }
}

watch(() => props.game, (g) => {
  if (g) fetchStats()
}, { immediate: true })

const normalize = (raw: any) => {
  if (!raw) return {}
  // raw might be { total: {...} } or { totals: {...} } or direct totals
  const t = raw.total || raw.totals || raw
  if (!t) return {}
  return {
    // scoring / accuracy
    score: t.points ?? t.score ?? null,
    accuracyAttempted: t.accuracyAttempted ?? t.accuracy_attempted ?? null,
    accuracyMade: t.accuracyMade ?? t.accuracy_made ?? null,

    // team stats
    assistances: t.assistances ?? t.assists ?? t.assist ?? null,
    blocksAgainst: t.blocksAgainst ?? t.blocks_against ?? null,
    blocksFavour: t.blocksFavour ?? t.blocksFavour ?? t.blocks ?? null,
    defensiveRebounds: t.defensiveRebounds ?? t.defensive_rebounds ?? t.defReb ?? null,
    offensiveRebounds: t.offensiveRebounds ?? t.offensive_rebounds ?? t.offReb ?? null,
    totalRebounds: t.totalRebounds ?? t.total_rebounds ?? t.totalReb ?? null,

    // field goals
    fieldGoalsAttempted2: t.fieldGoalsAttempted2 ?? t.fieldGoalsAttempted_2 ?? t.fieldGoalsAttempted2 ?? null,
    fieldGoalsAttempted3: t.fieldGoalsAttempted3 ?? t.fieldGoalsAttempted_3 ?? null,
    fieldGoalsAttemptedTotal: t.fieldGoalsAttemptedTotal ?? t.fieldGoalsAttemptedTotal ?? t.fieldGoalsAttemptedTotal ?? null,
    fieldGoalsMade2: t.fieldGoalsMade2 ?? t.fieldGoalsMade_2 ?? null,
    fieldGoalsMade3: t.fieldGoalsMade3 ?? t.fieldGoalsMade_3 ?? null,
    fieldGoalsMadeTotal: t.fieldGoalsMadeTotal ?? t.fieldGoalsMadeTotal ?? null,

    // fouls / free throws / misc
    foulsCommited: t.foulsCommited ?? t.fouls_commited ?? t.foulsCommitted ?? null,
    foulsReceived: t.foulsReceived ?? t.fouls_received ?? null,
    freeThrowsAttempted: t.freeThrowsAttempted ?? t.freeThrowsAttempted ?? null,
    freeThrowsMade: t.freeThrowsMade ?? t.freeThrowsMade ?? null,
    plusMinus: t.plusMinus ?? t.plus_minus ?? null,
    points: t.points ?? null,
    steals: t.steals ?? null,
    timePlayed: t.timePlayed ?? t.time_played ?? null,
    turnovers: t.turnovers ?? null,
    valuation: t.valuation ?? null,

    raw: t,
  }
}

const extractTotals = (side: 'local' | 'road') => {
  if (!stats.value) return {}
  const bySide = stats.value[side] || stats.value[side === 'local' ? 'local' : 'road']
  if (!bySide) {
    // sometimes totals at top-level under totals.local / totals.road
    const totalsTop = stats.value.totals?.[side]
    if (totalsTop) return normalize(totalsTop)
    return {}
  }
  // prefer nested total property
  return normalize(bySide.total || bySide.totals || bySide)
}

const homeTotals = computed(() => extractTotals('local'))
const awayTotals = computed(() => extractTotals('road'))

const formatNumber = (value: any) => {
  const num = Number(value)
  return Number.isFinite(num) ? String(num) : '-'
}

const formatPct = (made: any, attempted: any) => {
  const m = Number(made)
  const a = Number(attempted)
  if (!Number.isFinite(m) || !Number.isFinite(a) || a === 0) return '-'
  return `${Math.round((m / a) * 100)}%`
}

const shotLabel = (made: any, attempted: any) => {
  const pctLabel = formatPct(made, attempted)
  const madeLabel = formatNumber(made)
  const attLabel = formatNumber(attempted)
  return pctLabel === '-' ? `${madeLabel} / ${attLabel}` : `${pctLabel} (${madeLabel}/${attLabel})`
}

const accuracyLabel = (totals: any) => {
  if (totals?.accuracyPct != null) return `${totals.accuracyPct}%`
  return shotLabel(totals?.accuracyMade, totals?.accuracyAttempted)
}

// Stats.vue shows numeric totals per team; chart moved to TeamComparison component
</script>

<style scoped>
.stat-list :deep(.v-list-item__content) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.stat-list :deep(.v-list-item-title) {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a2742;
  flex: 1 1 auto;
}

.stat-list :deep(.v-list-item-subtitle) {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
  flex: 0 0 auto;
}
</style>
