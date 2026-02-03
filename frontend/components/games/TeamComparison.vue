<template>
  <v-card class="h-100 pa-4 rounded-lg elevation-2 team-stats-card">
    <v-card-title class="d-flex flex-column">
      <div class="d-flex align-center justify-space-between w-100">
        <div>
          <div class="text-h6 font-weight-medium">Team Comparison</div>
          <div class="text-caption text-secondary">Totals for both teams</div>
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
        <div class="stat-section">
          <div class="stat-grid">
            <div class="stat-row" v-for="row in shootingRows" :key="row.label">
              <template v-if="isMobile">
                <div class="stat-mobile-line">
                  <span class="stat-value">{{ row.home.made }}/{{ row.home.att }}</span>
                  <span class="stat-label">{{ row.label }}</span>
                  <span class="stat-value">{{ row.away.made }}/{{ row.away.att }}</span>
                </div>
                <div class="stat-side center">
                  <apexchart
                    type="radialBar"
                    height="140"
                    :options="radialOptionsCombined(row.label)"
                    :series="[row.home.pct, row.away.pct]"
                  />
                </div>
              </template>
              <template v-else>
                <div class="stat-side left">
                  <div class="stat-value">{{ row.home.made }}/{{ row.home.att }}</div>
                  <apexchart
                    type="radialBar"
                    height="110"
                    :options="radialOptions(row.label, 'home')"
                    :series="[row.home.pct]"
                  />
                </div>
                <div class="stat-label">{{ row.label }}</div>
                <div class="stat-side right">
                  <apexchart
                    type="radialBar"
                    height="110"
                    :options="radialOptions(row.label, 'away')"
                    :series="[row.away.pct]"
                  />
                  <div class="stat-value">{{ row.away.made }}/{{ row.away.att }}</div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="bar-section">
          <apexchart
            type="bar"
            height="340"
            :options="barOptions"
            :series="barSeries"
          />
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
import { useDisplay } from 'vuetify'

const props = defineProps<{ game?: any }>()

const api = useApi()
const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
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

const toNumber = (v: any) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const pct = (made: number, att: number) => {
  if (!att) return 0
  return Math.round((made / att) * 100)
}

const shootingRows = computed(() => {
  const h = homeTotals.value || {}
  const a = awayTotals.value || {}
  const h2m = toNumber(h.fieldGoalsMade2)
  const h2a = toNumber(h.fieldGoalsAttempted2)
  const h3m = toNumber(h.fieldGoalsMade3)
  const h3a = toNumber(h.fieldGoalsAttempted3)
  const hftm = toNumber(h.freeThrowsMade)
  const hfta = toNumber(h.freeThrowsAttempted)
  const hfgm = toNumber(h.fieldGoalsMadeTotal) || (h2m + h3m)
  const hfga = toNumber(h.fieldGoalsAttemptedTotal) || (h2a + h3a)

  const a2m = toNumber(a.fieldGoalsMade2)
  const a2a = toNumber(a.fieldGoalsAttempted2)
  const a3m = toNumber(a.fieldGoalsMade3)
  const a3a = toNumber(a.fieldGoalsAttempted3)
  const aftm = toNumber(a.freeThrowsMade)
  const afta = toNumber(a.freeThrowsAttempted)
  const afgm = toNumber(a.fieldGoalsMadeTotal) || (a2m + a3m)
  const afga = toNumber(a.fieldGoalsAttemptedTotal) || (a2a + a3a)

  return [
    { label: 'Free Throws', home: { made: hftm, att: hfta, pct: pct(hftm, hfta) }, away: { made: aftm, att: afta, pct: pct(aftm, afta) } },
    { label: 'Two Pointers', home: { made: h2m, att: h2a, pct: pct(h2m, h2a) }, away: { made: a2m, att: a2a, pct: pct(a2m, a2a) } },
    { label: 'Three Pointers', home: { made: h3m, att: h3a, pct: pct(h3m, h3a) }, away: { made: a3m, att: a3a, pct: pct(a3m, a3a) } },
    { label: 'Field Goals', home: { made: hfgm, att: hfga, pct: pct(hfgm, hfga) }, away: { made: afgm, att: afga, pct: pct(afgm, afga) } },
  ]
})

const barRows = computed(() => {
  const h = homeTotals.value || {}
  const a = awayTotals.value || {}
  const rows = [
    { label: 'Rebounds', home: toNumber(h.totalRebounds), away: toNumber(a.totalRebounds) },
    { label: 'Assists', home: toNumber(h.assistances), away: toNumber(a.assistances) },
    { label: 'Steals', home: toNumber(h.steals), away: toNumber(a.steals) },
    { label: 'Turnovers', home: toNumber(h.turnovers), away: toNumber(a.turnovers) },
    { label: 'Blocks', home: toNumber(h.blocksFavour), away: toNumber(a.blocksFavour) },
    { label: 'Fouls', home: toNumber(h.foulsCommited), away: toNumber(a.foulsCommited) },
  ]
  return rows.map((r) => {
    const total = r.home + r.away || 1
    return {
      ...r,
      homePct: Math.round((r.home / total) * 100),
      awayPct: Math.round((r.away / total) * 100),
    }
  })
})

const radialOptions = (label: string, side: 'home' | 'away') => ({
  chart: { type: 'radialBar', sparkline: { enabled: true } },
  colors: [side === 'home' ? '#1a2742' : '#F05323'],
  plotOptions: {
    radialBar: {
      hollow: { size: '42%' },
      track: { background: '#8a92a2', strokeWidth: '100%' },
      dataLabels: {
        name: { show: false },
        value: {
          fontSize: '12px',
          fontWeight: 700,
          formatter: (v: number) => `${Math.round(v)}%`,
        },
      },
    },
  },
  labels: [label],
})

const radialOptionsCombined = (label: string) => ({
  chart: { type: 'radialBar', sparkline: { enabled: true } },
  colors: ['#1a2742', '#F05323'],
  plotOptions: {
    radialBar: {
      hollow: { size: '42%' },
      track: { background: '#8a92a2', strokeWidth: '100%' },
      dataLabels: {
        name: { show: false },
        value: {
          fontSize: '12px',
          fontWeight: 700,
          formatter: (v: number) => `${Math.round(v)}%`,
        },
      },
    },
  },
  labels: [label],
})

const barSeries = computed(() => [
  { name: props.game?.homeTeamName || 'Home', data: barRows.value.map(r => r.home) },
  { name: props.game?.awayTeamName || 'Away', data: barRows.value.map(r => r.away) },
])

const barOptions = computed(() => ({
  chart: { type: 'bar', stacked: false, toolbar: { show: false } },
  colors: ['#1a2742', '#F05323'],
  plotOptions: { bar: { horizontal: true, barHeight: '60%' } },
  dataLabels: { enabled: false },
  xaxis: { categories: barRows.value.map(r => r.label) },
  yaxis: { labels: { style: { fontSize: '12px' } } },
  legend: { position: 'top' },
}))
</script>

<style scoped>
.team-stats-card {
  background: #ffffff;
}

.stat-section {
  border: 1px solid #e6e9f0;
  border-radius: 12px;
  padding: 1rem;
  background: #ffffff;
  margin-bottom: 1rem;
}

.stat-grid {
  display: grid;
  gap: 0.75rem;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
}

.stat-label {
  font-weight: 700;
  color: #1a2742;
  text-align: center;
}

.stat-side {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.stat-side.right {
  justify-content: flex-end;
}

.stat-value {
  font-weight: 700;
  color: #1a2742;
  min-width: 64px;
  text-align: center;
}

.bar-section {
  border: 1px solid #e6e9f0;
  border-radius: 12px;
  padding: 1rem;
  background: #ffffff;
}

@media (max-width: 768px) {
  .stat-row {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .stat-side {
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  .stat-side.center {
    margin-top: 0.5rem;
  }

  .stat-mobile-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
  }

  .stat-mobile-line .stat-label {
    font-size: 0.95rem;
  }

  .stat-value {
    min-width: auto;
  }
}
</style>
