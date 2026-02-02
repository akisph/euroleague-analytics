<template>
  <v-card class="h-100 pa-4 rounded-lg elevation-2">
    <v-card-title class="d-flex flex-column">
      <div class="d-flex align-center justify-space-between w-100">
        <div>
          <div class="text-h6 font-weight-medium">Team Comparison</div>
          <div class="text-caption text-secondary">Compare selected team metrics side-by-side</div>
        </div>
        <div class="text-caption text-black">{{ props.game?.homeTeamName || 'Home' }} vs {{ props.game?.awayTeamName || 'Away' }}</div>
      </div>
    </v-card-title>
    <v-card-text class="pt-2">
      <v-row v-if="isLoading" class="align-center justify-center">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" />
        </v-col>
      </v-row>

      <v-alert type="error" v-if="error">{{ error }}</v-alert>

      <div v-if="!isLoading && !error">
        <v-row class="mb-2">
          <v-col cols="12">
            <div class="text-caption text-secondary">Showing all metrics</div>
          </v-col>
        </v-row>

          <div>
            <apexchart v-if="chartOptions && chartSeries" type="bar" :options="chartOptions" :series="chartSeries" height="560" />
          </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import VueApexCharts from 'vue3-apexcharts'
import { useNuxtApp } from '#app'

const props = defineProps<{ game?: any }>()

const api = useApi()
const isLoading = ref(false)
const error = ref<string | null>(null)
const stats = ref<any | null>(null)

const seasonCode = computed(() => props.game?.seasonCode ?? props.game?.value?.seasonCode)
const gameCode = computed(() => (props.game?.gameCode ?? props.game?.value?.gameCode) ? Number(props.game?.gameCode ?? props.game?.value?.gameCode) : undefined)

const fetchStats = async () => {
  if (!seasonCode.value || !gameCode.value) return
  isLoading.value = true
  error.value = null
  stats.value = null
  try {
    const resp = await api.get(`/games/season/${seasonCode.value}/${gameCode.value}/stats`)
    stats.value = resp
  } catch (e: any) {
    error.value = e?.message || 'Failed to fetch stats'
  } finally {
    isLoading.value = false
  }
}
// react to both ref and plain object changes
watch([seasonCode, gameCode], ([s, g]) => {
  if (s && g) fetchStats()
}, { immediate: true })

onMounted(() => { if (seasonCode.value && gameCode.value) fetchStats() })

const normalize = (raw: any) => {
  if (!raw) return {}
  const t = raw.total || raw.totals || raw
  if (!t) return {}
  return {
    score: t.points ?? t.score ?? null,
    accuracyAttempted: t.accuracyAttempted ?? t.accuracy_attempted ?? null,
      accuracyMade: t.accuracyMade ?? t.accuracy_made ?? null,
      accuracyPct: (t.accuracyAttempted || t.accuracy_attempted) ? Math.round(((Number(t.accuracyMade ?? 0) / Number(t.accuracyAttempted ?? t.accuracy_attempted ?? 1)) * 100) * 10) / 10 : null,
    assistances: t.assistances ?? t.assists ?? t.assist ?? null,
    blocksAgainst: t.blocksAgainst ?? t.blocks_against ?? null,
    blocksFavour: t.blocksFavour ?? t.blocksFavour ?? t.blocks ?? null,
    defensiveRebounds: t.defensiveRebounds ?? t.defensive_rebounds ?? t.defReb ?? null,
    offensiveRebounds: t.offensiveRebounds ?? t.offensive_rebounds ?? t.offReb ?? null,
    totalRebounds: t.totalRebounds ?? t.total_rebounds ?? t.totalReb ?? null,
    fieldGoalsAttempted2: t.fieldGoalsAttempted2 ?? t.fieldGoalsAttempted_2 ?? null,
    fieldGoalsAttempted3: t.fieldGoalsAttempted3 ?? t.fieldGoalsAttempted_3 ?? null,
    fieldGoalsAttemptedTotal: t.fieldGoalsAttemptedTotal ?? null,
    fieldGoalsMade2: t.fieldGoalsMade2 ?? t.fieldGoalsMade_2 ?? null,
    fieldGoalsMade3: t.fieldGoalsMade3 ?? t.fieldGoalsMade_3 ?? null,
    fieldGoalsMadeTotal: t.fieldGoalsMadeTotal ?? null,
    foulsCommited: t.foulsCommited ?? t.fouls_commited ?? t.foulsCommitted ?? null,
    foulsReceived: t.foulsReceived ?? t.fouls_received ?? null,
    freeThrowsAttempted: t.freeThrowsAttempted ?? null,
    freeThrowsMade: t.freeThrowsMade ?? null,
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
    const totalsTop = stats.value.totals?.[side]
    if (totalsTop) return normalize(totalsTop)
    return {}
  }
  return normalize(bySide.total || bySide.totals || bySide)
}

const homeTotals = computed(() => extractTotals('local'))
const awayTotals = computed(() => extractTotals('road'))

// Register ApexCharts globally for this component (safe)
try {
  const nuxtApp = useNuxtApp()
  nuxtApp.vueApp.component('apexchart', VueApexCharts)
} catch (e) {
  // ignore if useNuxtApp not available during SSR or if registration fails
}

const metricsOptions = [
  { label: 'Accuracy %', key: 'accuracyPct' },
  { label: 'Points', key: 'points' },
  { label: '2pt FG (Made)', key: 'fieldGoalsMade2' },
  { label: '2pt FG (Att)', key: 'fieldGoalsAttempted2' },
  { label: '3pt FG (Made)', key: 'fieldGoalsMade3' },
  { label: '3pt FG (Att)', key: 'fieldGoalsAttempted3' },
  { label: 'FG (Made)', key: 'fieldGoalsMadeTotal' },
  { label: 'FG (Att)', key: 'fieldGoalsAttemptedTotal' },
  { label: 'FT (Made)', key: 'freeThrowsMade' },
  { label: 'FT (Att)', key: 'freeThrowsAttempted' },
  { label: 'Ast', key: 'assistances' },
  { label: 'TO', key: 'turnovers' },
  { label: 'Stl', key: 'steals' },
  { label: 'Blks', key: 'blocksFavour' },
  { label: 'Off Reb', key: 'offensiveRebounds' },
  { label: 'Def Reb', key: 'defensiveRebounds' },
  { label: 'Tot Reb', key: 'totalRebounds' },
  { label: 'Fouls', key: 'foulsCommited' },
  { label: 'Fouls Rec', key: 'foulsReceived' },
  { label: 'PIR', key: 'valuation' },
]

const metricsMap: Record<string, string> = metricsOptions.reduce((acc, m) => { acc[m.key] = m.label; return acc }, {} as Record<string, string>)

const selectedMetrics = computed(() => metricsOptions.map((m) => m.key))

const chartCategories = computed(() => selectedMetrics.value.map((k) => metricsMap[k] ?? k))

const chartSeries = computed(() => {
  const home = homeTotals.value || {}
  const away = awayTotals.value || {}
  const mapValue = (obj: any, key: string) => Number(obj?.[key] ?? 0)
  return [
    { name: props.game?.homeTeamName || 'Home', data: selectedMetrics.value.map((k) => mapValue(home, k)) },
    { name: props.game?.awayTeamName || 'Away', data: selectedMetrics.value.map((k) => mapValue(away, k)) },
  ]
})

const chartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, height: 560 },
  plotOptions: { bar: { horizontal: true, barHeight: '75%' } },
  dataLabels: { enabled: false },
  xaxis: { categories: chartCategories.value },
  yaxis: { title: { text: undefined }, labels: { style: { fontSize: '11px' } } },
  legend: { position: 'top' },
  colors: ['#1976D2', '#E53935'],
  tooltip: { shared: true, intersect: false },
}))
</script>

<style scoped></style>
