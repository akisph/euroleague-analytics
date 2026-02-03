<template>
  <v-card class="h-100 pa-4 rounded-lg elevation-1 live-teams-card">
    <v-card-title>
      <div class="text-h6 font-weight-medium">Live Team Stats</div>
      <div class="text-caption text-secondary">Totals for both teams</div>
    </v-card-title>

    <v-card-text>
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
                <div class="stat-side left">
                  <div class="stat-value">{{ row.home.made }}/{{ row.home.att }}</div>
                </div>
                <div class="stat-label">{{ row.label }}</div>
                <div class="stat-side right">
                  <div class="stat-value">{{ row.away.made }}/{{ row.away.att }}</div>
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
import { ref, watch, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import { useDisplay } from 'vuetify'

const props = defineProps<{ game?: any }>()

const api = useApi()
const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
const isLoading = ref(false)
const error = ref<string | null>(null)
const stats = ref<any | null>(null)
const pollId = ref<number | null>(null)

const seasonCode = computed(() => props.game?.seasonCode ?? props.game?.value?.seasonCode)
const gameCode = computed(() => (props.game?.gameCode ?? props.game?.value?.gameCode) ? Number(props.game?.gameCode ?? props.game?.value?.gameCode) : undefined)

const homeTeamCode = computed(() => (props.game?.homeTeamCode ?? props.game?.value?.homeTeamCode ?? '').trim().toUpperCase())
const awayTeamCode = computed(() => (props.game?.awayTeamCode ?? props.game?.value?.awayTeamCode ?? '').trim().toUpperCase())

const homeTeamName = computed(() => props.game?.homeTeamName ?? props.game?.value?.homeTeamName ?? 'Home')
const awayTeamName = computed(() => props.game?.awayTeamName ?? props.game?.value?.awayTeamName ?? 'Away')

const fetchTeams = async () => {
  if (!seasonCode.value || !gameCode.value) return
  isLoading.value = true
  error.value = null
  stats.value = null
  try {
    const resp = await api.get(`/live-games/season/${seasonCode.value}/${gameCode.value}/boxscore`)
    stats.value = resp
  } catch (e: any) {
    error.value = e?.message || 'Failed to fetch live team stats'
  } finally {
    isLoading.value = false
  }
}

const normalizeTeamCode = (value: string | undefined) => (value || '').trim().toUpperCase()

const extractTeamTotals = (teamCode: string) => {
  const teams = stats.value?.stats ?? []
  const target = normalizeTeamCode(teamCode)
  const team = teams.find((t: any) => {
    const code = normalizeTeamCode(t?.team)
    return code ? code === target : false
  }) || null
  const totals = team?.totr ?? null
  return totals || null
}

const fallbackTotalsFromPlayers = (teamCode: string) => {
  const teams = stats.value?.stats ?? []
  const target = normalizeTeamCode(teamCode)
  const players = teams.flatMap((t: any) =>
    Array.isArray(t?.playersStats) ? t.playersStats : [],
  ).filter((p: any) => normalizeTeamCode(p?.team) === target)

  if (!players.length) return null

  const sum = (key: string) => players.reduce((acc: number, p: any) => acc + toNumber(p?.[key]), 0)

  return {
    fieldGoalsMade2: sum('fieldGoalsMade2'),
    fieldGoalsAttempted2: sum('fieldGoalsAttempted2'),
    fieldGoalsMade3: sum('fieldGoalsMade3'),
    fieldGoalsAttempted3: sum('fieldGoalsAttempted3'),
    freeThrowsMade: sum('freeThrowsMade'),
    freeThrowsAttempted: sum('freeThrowsAttempted'),
    offensiveRebounds: sum('offensiveRebounds'),
    defensiveRebounds: sum('defensiveRebounds'),
    totalRebounds: sum('totalRebounds'),
    assistances: sum('assistances'),
    steals: sum('steals'),
    turnovers: sum('turnovers'),
    blocksFavour: sum('blocksFavour'),
    foulsCommited: sum('foulsCommited'),
    points: sum('points'),
    valuation: sum('valuation'),
  }
}

const homeTotals = computed(() => extractTeamTotals(homeTeamCode.value) || fallbackTotalsFromPlayers(homeTeamCode.value) || {})
const awayTotals = computed(() => extractTeamTotals(awayTeamCode.value) || fallbackTotalsFromPlayers(awayTeamCode.value) || {})

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
  const h2m = toNumber(h.fieldGoalsMade2 ?? h.FieldGoalsMade2)
  const h2a = toNumber(h.fieldGoalsAttempted2 ?? h.FieldGoalsAttempted2)
  const h3m = toNumber(h.fieldGoalsMade3 ?? h.FieldGoalsMade3)
  const h3a = toNumber(h.fieldGoalsAttempted3 ?? h.FieldGoalsAttempted3)
  const hftm = toNumber(h.freeThrowsMade ?? h.FreeThrowsMade)
  const hfta = toNumber(h.freeThrowsAttempted ?? h.FreeThrowsAttempted)
  const hfgm = h2m + h3m
  const hfga = h2a + h3a

  const a2m = toNumber(a.fieldGoalsMade2 ?? a.FieldGoalsMade2)
  const a2a = toNumber(a.fieldGoalsAttempted2 ?? a.FieldGoalsAttempted2)
  const a3m = toNumber(a.fieldGoalsMade3 ?? a.FieldGoalsMade3)
  const a3a = toNumber(a.fieldGoalsAttempted3 ?? a.FieldGoalsAttempted3)
  const aftm = toNumber(a.freeThrowsMade ?? a.FreeThrowsMade)
  const afta = toNumber(a.freeThrowsAttempted ?? a.FreeThrowsAttempted)
  const afgm = a2m + a3m
  const afga = a2a + a3a

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
    { label: 'Rebounds', home: toNumber(h.totalRebounds ?? h.TotalRebounds), away: toNumber(a.totalRebounds ?? a.TotalRebounds) },
    { label: 'Assists', home: toNumber(h.assistances ?? h.Assistances), away: toNumber(a.assistances ?? a.Assistances) },
    { label: 'Steals', home: toNumber(h.steals ?? h.Steals), away: toNumber(a.steals ?? a.Steals) },
    { label: 'Turnovers', home: toNumber(h.turnovers ?? h.Turnovers), away: toNumber(a.turnovers ?? a.Turnovers) },
    { label: 'Blocks', home: toNumber(h.blocksFavour ?? h.BlocksFavour), away: toNumber(a.blocksFavour ?? a.BlocksFavour) },
    { label: 'Fouls', home: toNumber(h.foulsCommited ?? h.FoulsCommited), away: toNumber(a.foulsCommited ?? a.FoulsCommited) },
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
  { name: homeTeamName.value, data: barRows.value.map(r => r.home) },
  { name: awayTeamName.value, data: barRows.value.map(r => r.away) },
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

const setupPolling = () => {
  if (pollId.value) {
    clearInterval(pollId.value)
    pollId.value = null
  }
  pollId.value = window.setInterval(() => {
    fetchTeams()
  }, 150000)
}

watch([seasonCode, gameCode], ([s, g]) => { if (s && g) fetchTeams() }, { immediate: true })
watch([seasonCode, gameCode], () => {
  setupPolling()
}, { immediate: true })

onBeforeUnmount(() => {
  if (pollId.value) {
    clearInterval(pollId.value)
    pollId.value = null
  }
})
</script>

<style scoped>
.live-teams-card {
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

.bar-header {
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: #1a2742;
  font-weight: 600;
}

.bar-label {
  text-align: center;
  color: #1a2742;
}

.bar-row {
  margin-bottom: 0.75rem;
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

  .stat-value {
    min-width: auto;
  }

  .stat-section :deep(.apexcharts-canvas) {
    margin: 0 auto;
  }

  .bar-header {
    grid-template-columns: 40px 1fr 40px;
  }
}
</style>
