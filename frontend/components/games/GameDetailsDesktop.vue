<template>
  <div class="page-light-surface">
    <SharedPageHeader
      :title="gameTitle"
      :subtitle="game?.arena"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-arrow-left"
          to="/games"
        >
          Back to Games
        </v-btn>
      </template>
    </SharedPageHeader>

    <SharedErrorAlert
      v-if="error"
      :error="error"
      @retry="loadGame"
      @dismiss="error = null"
    />

    <SharedLoadingState :loading="isLoading" message="Loading game details...">
      <template v-if="game">
        <!-- Game Score Card -->
        <v-card class="mb-6 game-hero">
          <v-card-text class="pa-6">
            <div class="hero-top">
              <div class="hero-badges">
                <v-chip v-if="!isLive" variant="tonal" color="primary">
                  {{ formattedGameDate }}
                </v-chip>
              </div>
              <v-chip
                v-if="!isLive"
                :color="game.played ? 'success' : 'primary'"
                variant="flat"
                class="status-chip"
              >
                {{ game.played ? 'Final' : 'Scheduled' }}
              </v-chip>
            </div>
            <div v-if="isLive" class="hero-live-mobile">
              <span class="live-dot" aria-hidden="true"></span>
              LIVE{{ liveTotalMinuteLabel ? ` · ${liveTotalMinuteLabel}` : '' }}
            </div>

            <div class="game-score-row">
              <!-- Home Team -->
              <div class="team-block">
                <div class="team-meta">
                  <v-avatar size="88" color="grey-lighten-3" class="team-avatar">
                    <v-img
                      v-if="game.homeTeamImage"
                      :src="game.homeTeamImage"
                      :alt="game.homeTeamName"
                      :cover="false"
                    />
                    <span v-else class="team-code">
                      {{ game.homeTeamCode?.substring(0, 3) }}
                    </span>
                  </v-avatar>
                  <div class="team-info">
                    <div class="team-name">{{ game.homeTeamName }}</div>
                    <NuxtLink
                      :to="`/clubs/${game.homeTeamCode}`"
                      class="team-link"
                    >
                      View Team ->
                    </NuxtLink>
                  </div>
                </div>
                <div class="team-score" v-if="showScores" :class="isHomeWinner ? 'text-success' : ''">
                  {{ displayHomeScore }}
                </div>
              </div>

              <!-- Center -->
              <div class="score-block">
                <div class="center-divider">{{ game.played ? '-' : 'VS' }}</div>
                <div v-if="game.arena" class="arena-text">
                  {{ game.arena }}
                </div>
                <div v-if="isLive" class="live-meta">
                  <span class="live-dot" aria-hidden="true"></span>
                  LIVE{{ liveTotalMinuteLabel ? ` · ${liveTotalMinuteLabel}` : '' }}
                </div>
              </div>

              <!-- Away Team -->
              <div class="team-block">
                <div class="team-meta">
                  <v-avatar size="88" color="grey-lighten-3" class="team-avatar">
                    <v-img
                      v-if="game.awayTeamImage"
                      :src="game.awayTeamImage"
                      :alt="game.awayTeamName"
                      :cover="false"
                    />
                    <span v-else class="team-code">
                      {{ game.awayTeamCode?.substring(0, 3) }}
                    </span>
                  </v-avatar>
                  <div class="team-info">
                    <div class="team-name">{{ game.awayTeamName }}</div>
                    <NuxtLink
                      :to="`/clubs/${game.awayTeamCode}`"
                      class="team-link"
                    >
                      View Team ->
                    </NuxtLink>
                  </div>
                </div>
                <div class="team-score" v-if="showScores" :class="isAwayWinner ? 'text-success' : ''">
                  {{ displayAwayScore }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Scheduled: show pregame comparison only -->
        <template v-if="!game.played && !isLive">
          <v-card class="pregame-card mt-6">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-chart-bar" class="mr-2" />
              Key Players 
            </v-card-title>
            <v-card-text>
              <SharedLoadingState :loading="isPregameLoading" message="Loading player data...">
                <v-row>
                  <v-col cols="6" sm="6" md="6">
                    <div class="team-section">
                      <div class="team-section-title">{{ game.homeTeamName }}</div>
                      <div v-if="homeTopPlayers.length">
                        <div class="player-card">
                          <div class="player-info">
                            <div class="player-name">{{ homeTopPlayers[0].name }}</div>
                            <NuxtLink
                              :to="`/players/${seasonCode}/${homeTopPlayers[0].code}`"
                              class="player-link"
                            >
                              View Profile ->
                            </NuxtLink>
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-caption text-medium-emphasis">No player data.</div>
                    </div>
                  </v-col>
                  <v-col cols="6" sm="6" md="6">
                    <div class="team-section">
                      <div class="team-section-title">{{ game.awayTeamName }}</div>
                      <div v-if="awayTopPlayers.length">
                        <div class="player-card">
                          <div class="player-info">
                            <div class="player-name">{{ awayTopPlayers[0].name }}</div>
                            <NuxtLink
                              :to="`/players/${seasonCode}/${awayTopPlayers[0].code}`"
                              class="player-link"
                            >
                              View Profile ->
                            </NuxtLink>
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-caption text-medium-emphasis">No player data.</div>
                    </div>
                  </v-col>
                </v-row>

                <div v-if="homeTopPlayers.length && awayTopPlayers.length" class="compare-block">
                  <div class="compare-title">Top Player Comparison</div>
                  <div class="compare-subtitle">Games & Minutes</div>
                  <div class="compare-grid">
                    <apexchart
                      v-if="gpGaugeOptions && gpGaugeSeries"
                      type="radialBar"
                      :options="gpGaugeOptions"
                      :series="gpGaugeSeries"
                      height="240"
                    />
                    <apexchart
                      v-if="mpgGaugeOptions && mpgGaugeSeries"
                      type="radialBar"
                      :options="mpgGaugeOptions"
                      :series="mpgGaugeSeries"
                      height="240"
                    />
                  </div>

                  <div class="compare-subtitle">Impact Radar</div>
                  <apexchart
                    v-if="radarOptions && radarSeries"
                    type="radar"
                    :options="radarOptions"
                    :series="radarSeries"
                    height="360"
                  />

                  <div class="compare-subtitle">Efficiency Gauges</div>
                  <div class="compare-grid">
                    <apexchart
                      v-if="twopGaugeOptions && twopGaugeSeries"
                      type="radialBar"
                      :options="twopGaugeOptions"
                      :series="twopGaugeSeries"
                      height="220"
                    />
                    <apexchart
                      v-if="threepGaugeOptions && threepGaugeSeries"
                      type="radialBar"
                      :options="threepGaugeOptions"
                      :series="threepGaugeSeries"
                      height="220"
                    />
                    <apexchart
                      v-if="ftGaugeOptions && ftGaugeSeries"
                      type="radialBar"
                      :options="ftGaugeOptions"
                      :series="ftGaugeSeries"
                      height="220"
                    />
                    <apexchart
                      v-if="fgGaugeOptions && fgGaugeSeries"
                      type="radialBar"
                      :options="fgGaugeOptions"
                      :series="fgGaugeSeries"
                      height="220"
                    />
                  </div>

                  <apexchart
                    v-if="chartOptions && chartSeries"
                    type="bar"
                    :options="chartOptions"
                    :series="chartSeries"
                    height="560"
                  />
                </div>
              </SharedLoadingState>
            </v-card-text>
          </v-card>
        </template>

        <!-- Played: tabs -->
        <template v-else>
          <template v-if="isLive">
            <v-tabs v-model="activeTab" color="primary" class="mt-6 text-secondary">
              <v-tab value="live-events">Live Events</v-tab>
              <v-tab value="players">Players</v-tab>
              <v-tab value="teams">Teams</v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
              <v-window-item value="live-events" v-show="activeTab === 'live-events'">
                <GamesLiveEvents
                  :game="game"
                  :live-boxscore="liveBoxscore"
                  :live-play-by-play="livePlayByPlay"
                />
              </v-window-item>

              <v-window-item value="players" v-show="activeTab === 'players'">
                <GamesLivePlayersStats :game="game" />
              </v-window-item>

              <v-window-item value="teams" v-show="activeTab === 'teams'">
                <GamesLiveTeamsStats :game="game" />
              </v-window-item>
            </v-window>
          </template>
          <template v-else>
          <v-tabs v-model="activeTab" color="primary" class="mt-6 text-secondary">
            <v-tab value="stats">Stats</v-tab>
            <v-tab value="team-comparison">Team Comparison</v-tab>
            <v-tab value="players">Players</v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <v-window-item value="stats" v-show="activeTab === 'stats'">
              <GamesStats :game="game" />
            </v-window-item>

            <v-window-item value="team-comparison" v-show="activeTab === 'team-comparison'">
              <GamesTeamComparison :game="game" />
            </v-window-item>

              <v-window-item value="players" v-show="activeTab === 'players'">
                <GamesPlayersStats :game="game" />
              </v-window-item>
          </v-window>
          </template>
        </template>
      </template>

      <SharedEmptyState
        v-else
        title="Game Not Found"
        message="The requested game could not be found"
        icon="mdi-basketball"
        action-text="Back to Games"
        @action="navigateTo('/games')"
      />
    </SharedLoadingState>
  </div>
</template>

<script setup lang="ts">

import VueApexCharts from 'vue3-apexcharts'
import { useNuxtApp } from '#app'

const route = useRoute()
const { fetchGameDetails, currentGame: game, isLoading, error } = useGames()
const api = useApi()

const seasonCode = computed(() => route.params.seasonCode as string)
const gameCode = computed(() => Number(route.params.gameCode))

const gameTitle = computed(() => {
  if (!game.value) return 'Game Details'
  return `${game.value.homeTeamName} vs ${game.value.awayTeamName}`
})

const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: 'Games', to: '/games' },
  { title: gameTitle.value, disabled: true },
])

const isHomeWinner = computed(() => {
  if (!showScores.value) return false
  return (displayHomeScore.value || 0) > (displayAwayScore.value || 0)
})

const isAwayWinner = computed(() => {
  if (!showScores.value) return false
  return (displayAwayScore.value || 0) > (displayHomeScore.value || 0)
})

const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formattedGameDate = computed(() => formatDateTime(game.value?.gameDate))

const liveBoxscore = ref<any | null>(null)
const livePlayByPlay = ref<any | null>(null)
const livePollId = ref<number | null>(null)
const loadLiveBoxscore = async () => {
  if (!seasonCode.value || !gameCode.value) return
  try {
    const resp = await api.get(
      `/live-games/season/${seasonCode.value}/${gameCode.value}/boxscore`,
    )
    liveBoxscore.value = resp
  } catch {
    liveBoxscore.value = null
  }
}

const loadLivePlayByPlay = async () => {
  if (!seasonCode.value || !gameCode.value) return
  try {
    const resp = await api.get(
      `/live-games/season/${seasonCode.value}/${gameCode.value}/playbyplay`,
    )
    livePlayByPlay.value = resp
  } catch {
    livePlayByPlay.value = null
  }
}

const isPregameLoading = ref(false)
const pregamePlayers = ref<any[]>([])

const normalizePlayer = (p: any) => {
  const person = p.player?.person ?? p.person ?? null
  const totals = p.stats ?? p.player?.stats ?? p.total ?? p.totals ?? p
  return {
    code: person?.code ?? p.playerCode ?? p.code ?? '',
    name: person?.name ?? p.fullName ?? p.name ?? 'Unknown',
    pir: Number(totals?.valuation ?? totals?.pir ?? 0),
    teamCode: p.player?.club?.code ?? p.teamCode ?? p.clubCode ?? p.team?.code ?? null,
  }
}

const extractPlayers = (raw: any) => {
  if (!raw) return []
  if (Array.isArray(raw.players)) return raw.players.map(normalizePlayer)
  if (raw.local?.players || raw.road?.players) {
    const local = (raw.local?.players || []).map(normalizePlayer)
    const road = (raw.road?.players || []).map(normalizePlayer)
    return [...local, ...road]
  }
  if (Array.isArray(raw)) return raw.map(normalizePlayer)
  return []
}

const loadPregamePlayers = async () => {
  if (!seasonCode.value || !gameCode.value) return
  isPregameLoading.value = true
  try {
    const resp = await api.get(`/games/season/${seasonCode.value}/${gameCode.value}/top-pir`)
    pregamePlayers.value = resp
  } catch {
    pregamePlayers.value = []
  } finally {
    isPregameLoading.value = false
  }
}

const mapTopPlayers = (players: any[]) => {
  const maxPir = Math.max(...players.map((p) => p.pir ?? 0), 1)
  return players.map((p) => ({
    code: p.playerCode ?? p.code ?? '',
    name: p.playerName ?? p.name ?? 'Unknown',
    pir: Number(p.pir ?? 0),
    pirAverage: Number(p.pirAverage ?? 0),
    imageUrl: p.imageUrl ?? p.image?.headshot ?? p.image?.action ?? p.images?.headshot ?? p.images?.action ?? null,
    gamesPlayed: Number(p.stats?.gamesPlayed ?? p.stats?.gp ?? 0),
    fieldGoalsMade2: Number(p.stats?.fieldGoalsMade2 ?? 0),
    fieldGoalsAttempted2: Number(p.stats?.fieldGoalsAttempted2 ?? 0),
    fieldGoalsMade3: Number(p.stats?.fieldGoalsMade3 ?? 0),
    fieldGoalsAttempted3: Number(p.stats?.fieldGoalsAttempted3 ?? 0),
    freeThrowsMade: Number(p.stats?.freeThrowsMade ?? 0),
    freeThrowsAttempted: Number(p.stats?.freeThrowsAttempted ?? 0),
    fieldGoalsMadeTotal: Number(p.stats?.fieldGoalsMadeTotal ?? 0),
    fieldGoalsAttemptedTotal: Number(p.stats?.fieldGoalsAttemptedTotal ?? 0),
    points: Number(p.stats?.points ?? 0),
    assistances: Number(p.stats?.assistances ?? 0),
    totalRebounds: Number(p.stats?.totalRebounds ?? 0),
    offensiveRebounds: Number(p.stats?.offensiveRebounds ?? 0),
    defensiveRebounds: Number(p.stats?.defensiveRebounds ?? 0),
    steals: Number(p.stats?.steals ?? 0),
    blocksFavour: Number(p.stats?.blocksFavour ?? 0),
    turnovers: Number(p.stats?.turnovers ?? 0),
    foulsReceived: Number(p.stats?.foulsReceived ?? 0),
    plusMinus: Number(p.stats?.plusMinus ?? 0),
    minutesPerGame: (() => {
      const gp = Number(p.stats?.gamesPlayed ?? p.stats?.gp ?? 0)
      const totalSeconds = Number(p.stats?.timePlayed ?? 0)
      const totalMinutes = Number(p.stats?.minutes ?? p.stats?.time ?? 0)
      if (gp > 0 && totalSeconds > 0) return totalSeconds / 60 / gp
      if (gp > 0 && totalMinutes > 0) return totalMinutes / gp
      return 0
    })(),
    pirPercent: Math.round(((p.pir ?? 0) / maxPir) * 100),
  }))
}

const homeTopPlayers = computed(() => {
  const home = pregamePlayers.value?.homeTopPlayers || []
  return mapTopPlayers(home)
})

const awayTopPlayers = computed(() => {
  const away = pregamePlayers.value?.awayTopPlayers || []
  return mapTopPlayers(away)
})

const safeDiv = (num: number, den: number) => (den > 0 ? num / den : 0)

const pct = (num: number, den: number) => (den > 0 ? (num / den) * 100 : 0)

const formatNumber = (value: number | undefined, digits = 2) => {
  if (value == null || Number.isNaN(value)) return '-'
  return value.toFixed(digits)
}

const formatPercent = (value: number | undefined) => {
  if (value == null || Number.isNaN(value)) return '-'
  return `${value.toFixed(2)}%`
}

const comparisonRows = computed(() => {
  const home = homeTopPlayers.value[0]
  const away = awayTopPlayers.value[0]
  if (!home || !away) return []

  return [
    { key: 'piravg', label: 'PIR / Game', home: home.pirAverage, away: away.pirAverage, format: (v: number) => formatNumber(v) },
    { key: 'gp', label: 'Games Played', home: safeDiv(home.gamesPlayed, 1), away: safeDiv(away.gamesPlayed, 1), format: (v: number) => formatNumber(v) },
    { key: 'mpg', label: 'Minutes / Game', home: home.minutesPerGame, away: away.minutesPerGame, format: (v: number) => formatNumber(v) },
    { key: 'ppg', label: 'Points / Game', home: safeDiv(home.points, home.gamesPlayed), away: safeDiv(away.points, away.gamesPlayed), format: (v: number) => formatNumber(v) },
    { key: 'apg', label: 'Assists / Game', home: safeDiv(home.assistances, home.gamesPlayed), away: safeDiv(away.assistances, away.gamesPlayed), format: (v: number) => formatNumber(v) },
    { key: 'rpg', label: 'Rebounds / Game', home: safeDiv(home.totalRebounds, home.gamesPlayed), away: safeDiv(away.totalRebounds, away.gamesPlayed), format: (v: number) => formatNumber(v) },
    { key: 'orpg', label: 'Off Reb / Game', home: safeDiv(home.offensiveRebounds, home.gamesPlayed), away: safeDiv(away.offensiveRebounds, away.gamesPlayed), format: (v: number) => formatNumber(v) },
    { key: 'drpg', label: 'Def Reb / Game', home: safeDiv(home.defensiveRebounds, home.gamesPlayed), away: safeDiv(away.defensiveRebounds, away.gamesPlayed), format: (v: number) => formatNumber(v) },
    { key: 'spg', label: 'Steals / Game', home: safeDiv(home.steals, home.gamesPlayed), away: safeDiv(away.steals, away.gamesPlayed), format: (v: number) => formatNumber(v) },
    { key: 'bpg', label: 'Blocks / Game', home: safeDiv(home.blocksFavour, home.gamesPlayed), away: safeDiv(away.blocksFavour, away.gamesPlayed), format: (v: number) => formatNumber(v) },
    { key: 'tpg', label: 'Turnovers / Game', home: safeDiv(home.turnovers, home.gamesPlayed), away: safeDiv(away.turnovers, away.gamesPlayed), format: (v: number) => formatNumber(v) },
    { key: 'astto', label: 'Assist/Turnover', home: safeDiv(home.assistances, home.turnovers), away: safeDiv(away.assistances, away.turnovers), format: (v: number) => formatNumber(v, 2) },
    { key: 'fdpg', label: 'Fouls Drawn / Game', home: safeDiv(home.foulsReceived, home.gamesPlayed), away: safeDiv(away.foulsReceived, away.gamesPlayed), format: (v: number) => formatNumber(v) },
    { key: 'pmg', label: '+/- / Game', home: safeDiv(home.plusMinus, home.gamesPlayed), away: safeDiv(away.plusMinus, away.gamesPlayed), format: (v: number) => formatNumber(v) },
    { key: '2p', label: '2P%', home: pct(home.fieldGoalsMade2, home.fieldGoalsAttempted2), away: pct(away.fieldGoalsMade2, away.fieldGoalsAttempted2), format: (v: number) => formatPercent(v) },
    { key: '3p', label: '3P%', home: pct(home.fieldGoalsMade3, home.fieldGoalsAttempted3), away: pct(away.fieldGoalsMade3, away.fieldGoalsAttempted3), format: (v: number) => formatPercent(v) },
    { key: 'ft', label: 'FT%', home: pct(home.freeThrowsMade, home.freeThrowsAttempted), away: pct(away.freeThrowsMade, away.freeThrowsAttempted), format: (v: number) => formatPercent(v) },
    { key: 'fg', label: 'FG%', home: pct(home.fieldGoalsMadeTotal, home.fieldGoalsAttemptedTotal), away: pct(away.fieldGoalsMadeTotal, away.fieldGoalsAttemptedTotal), format: (v: number) => formatPercent(v) },
  ]
})

const chartCategories = computed(() => comparisonRows.value.map((r) => r.label))

const chartSeries = computed(() => {
  if (!homeTopPlayers.value[0] || !awayTopPlayers.value[0]) return null
  return [
    {
      name: homeTopPlayers.value[0].name,
      data: comparisonRows.value.map((r) => r.home),
    },
    {
      name: awayTopPlayers.value[0].name,
      data: comparisonRows.value.map((r) => r.away),
    },
  ]
})

const apexSeriesColors = [
  '#1a2742',
  '#F05323',
  '#8a92a2',
]

const chartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, height: 560 },
  plotOptions: { bar: { horizontal: true, barHeight: '60%' } },
  dataLabels: { enabled: false },
  xaxis: { categories: chartCategories.value },
  yaxis: { labels: { style: { fontSize: '11px' } } },
  legend: { position: 'top' },
  colors: apexSeriesColors,
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: (val: number, opts: any) => {
        const idx = opts?.dataPointIndex ?? 0
        const row = comparisonRows.value[idx]
        return row?.format ? row.format(val) : String(val)
      },
    },
  },
}))

const formatShortName = (name: string) => {
  if (!name) return 'Unknown'
  const cleaned = name.replace(/\s+/g, ' ').trim()
  const parts = cleaned.split(/[,\s]+/).filter(Boolean)
  if (parts.length === 1) return parts[0]
  if (cleaned.includes(',')) {
    const last = parts[0]
    const first = parts[1]?.[0] ?? ''
    return `${last}, ${first}.`
  }
  const last = parts[parts.length - 1]
  const first = parts[0]?.[0] ?? ''
  return `${last}, ${first}.`
}

const gaugeBase = (title: string, labels: string[]) => ({
  chart: { type: 'radialBar', sparkline: { enabled: true } },
  plotOptions: {
    radialBar: {
      hollow: { size: '55%' },
      track: { background: '#eef1f5' },
      dataLabels: {
        name: { fontSize: '12px' },
        value: { fontSize: '16px', fontWeight: 700 },
      },
    },
  },
  yaxis: { min: 0 },
  labels,
  colors: apexSeriesColors,
})

const gpGaugeSeries = computed(() => {
  const home = homeTopPlayers.value[0]
  const away = awayTopPlayers.value[0]
  if (!home || !away) return null
  const maxRound = Math.max(game.value?.roundNumber ?? 0, 1)
  return [
    Math.round((Number(home.gamesPlayed) / maxRound) * 100),
    Math.round((Number(away.gamesPlayed) / maxRound) * 100),
  ]
})

const gpGaugeOptions = computed(() => {
  const home = homeTopPlayers.value[0]
  const away = awayTopPlayers.value[0]
  if (!home || !away) return null
  const maxRound = Math.max(game.value?.roundNumber ?? 0, 1)
  const gamesValues = [
    `${formatNumber(home.gamesPlayed)}/${formatNumber(maxRound)}`,
    `${formatNumber(away.gamesPlayed)}/${formatNumber(maxRound)}`,
  ]
  return {
    chart: { type: 'radialBar', sparkline: { enabled: false } },
    ...gaugeBase('Games Played', [
      `${formatShortName(home.name)} - Games`,
      `${formatShortName(away.name)} - Games`,
    ]),
    plotOptions: {
      radialBar: {
        max: maxRound,
        dataLabels: {
          show: true,
          name: { show: true },
          value: {
            show: true,
            formatter: (val: number, opts: any) => gamesValues[opts?.seriesIndex ?? 0],
          },
        },
      },
    },
    legend: { show: true },
  }
})

const mpgGaugeSeries = computed(() => {
  const home = homeTopPlayers.value[0]
  const away = awayTopPlayers.value[0]
  if (!home || !away) return null
  const maxMinutes = 40
  return [
    Math.round((Number(home.minutesPerGame) / maxMinutes) * 100),
    Math.round((Number(away.minutesPerGame) / maxMinutes) * 100),
  ]
})

const mpgGaugeOptions = computed(() => {
  const home = homeTopPlayers.value[0]
  const away = awayTopPlayers.value[0]
  if (!home || !away) return null
  const maxMinutes = 40
  const minuteValues = [
    `${formatNumber(home.minutesPerGame)}/${formatNumber(maxMinutes)}`,
    `${formatNumber(away.minutesPerGame)}/${formatNumber(maxMinutes)}`,
  ]
  return {
    chart: { type: 'radialBar', sparkline: { enabled: false } },
    ...gaugeBase('Minutes / Game', [
      `${formatShortName(home.name)} - MPG`,
      `${formatShortName(away.name)} - MPG`,
    ]),
    plotOptions: {
      radialBar: {
        max: maxMinutes,
        dataLabels: {
          show: true,
          name: { show: true },
          value: {
            show: true,
            formatter: (val: number, opts: any) => minuteValues[opts?.seriesIndex ?? 0],
          },
        },
      },
    },
    legend: { show: true },
  }
})

const radarSeries = computed(() => {
  const home = homeTopPlayers.value[0]
  const away = awayTopPlayers.value[0]
  if (!home || !away) return null
  const r2 = (value: number) => Number(value.toFixed(2))
  return [
    { name: home.name, data: [
      r2(safeDiv(home.points, home.gamesPlayed)),
      r2(safeDiv(home.assistances, home.gamesPlayed)),
      r2(home.pirAverage),
      r2(safeDiv(home.totalRebounds, home.gamesPlayed)),
      r2(safeDiv(home.steals, home.gamesPlayed)),
      r2(safeDiv(home.blocksFavour, home.gamesPlayed)),
      r2(safeDiv(home.turnovers, home.gamesPlayed)),
    ] },
    { name: away.name, data: [
      r2(safeDiv(away.points, away.gamesPlayed)),
      r2(safeDiv(away.assistances, away.gamesPlayed)),
      r2(away.pirAverage),
      r2(safeDiv(away.totalRebounds, away.gamesPlayed)),
      r2(safeDiv(away.steals, away.gamesPlayed)),
      r2(safeDiv(away.blocksFavour, away.gamesPlayed)),
      r2(safeDiv(away.turnovers, away.gamesPlayed)),
    ] },
  ]
})

const radarOptions = computed(() => ({
  chart: { type: 'radar', toolbar: { show: false } },
  xaxis: { categories: ['PPG', 'APG', 'PIR', 'RPG', 'SPG', 'BPG', 'TPG'] },
  stroke: { width: 2 },
  fill: { opacity: 0.15 },
  markers: { size: 3 },
  colors: apexSeriesColors,
  legend: { position: 'top' },
}))

const twopGaugeSeries = computed(() => {
  const home = homeTopPlayers.value[0]
  const away = awayTopPlayers.value[0]
  if (!home || !away) return null
  return [Math.round(pct(home.fieldGoalsMade2, home.fieldGoalsAttempted2)), Math.round(pct(away.fieldGoalsMade2, away.fieldGoalsAttempted2))]
})
const twopGaugeOptions = computed(() => {
  const home = homeTopPlayers.value[0]
  const away = awayTopPlayers.value[0]
  if (!home || !away) return null
  return {
    ...gaugeBase('2P%', [
      `${formatShortName(home.name)} - 2P%`,
      `${formatShortName(away.name)} - 2P%`,
    ]),
    legend: { show: true },
  }
})

const threepGaugeSeries = computed(() => {
  const home = homeTopPlayers.value[0]
  const away = awayTopPlayers.value[0]
  if (!home || !away) return null
  return [Math.round(pct(home.fieldGoalsMade3, home.fieldGoalsAttempted3)), Math.round(pct(away.fieldGoalsMade3, away.fieldGoalsAttempted3))]
})
const threepGaugeOptions = computed(() => {
  const home = homeTopPlayers.value[0]
  const away = awayTopPlayers.value[0]
  if (!home || !away) return null
  return {
    ...gaugeBase('3P%', [
      `${formatShortName(home.name)} - 3P%`,
      `${formatShortName(away.name)} - 3P%`,
    ]),
    legend: { show: true },
  }
})

const ftGaugeSeries = computed(() => {
  const home = homeTopPlayers.value[0]
  const away = awayTopPlayers.value[0]
  if (!home || !away) return null
  return [Math.round(pct(home.freeThrowsMade, home.freeThrowsAttempted)), Math.round(pct(away.freeThrowsMade, away.freeThrowsAttempted))]
})
const ftGaugeOptions = computed(() => {
  const home = homeTopPlayers.value[0]
  const away = awayTopPlayers.value[0]
  if (!home || !away) return null
  return {
    ...gaugeBase('FT%', [
      `${formatShortName(home.name)} - FT%`,
      `${formatShortName(away.name)} - FT%`,
    ]),
    legend: { show: true },
  }
})

const fgGaugeSeries = computed(() => {
  const home = homeTopPlayers.value[0]
  const away = awayTopPlayers.value[0]
  if (!home || !away) return null
  return [Math.round(pct(home.fieldGoalsMadeTotal, home.fieldGoalsAttemptedTotal)), Math.round(pct(away.fieldGoalsMadeTotal, away.fieldGoalsAttemptedTotal))]
})
const fgGaugeOptions = computed(() => {
  const home = homeTopPlayers.value[0]
  const away = awayTopPlayers.value[0]
  if (!home || !away) return null
  return {
    ...gaugeBase('FG%', [
      `${formatShortName(home.name)} - FG%`,
      `${formatShortName(away.name)} - FG%`,
    ]),
    legend: { show: true },
  }
})

// Register ApexCharts
try {
  const nuxtApp = useNuxtApp()
  nuxtApp.vueApp.component('apexchart', VueApexCharts)
} catch {
  // ignore
}

const loadGame = async () => {
  await fetchGameDetails(seasonCode.value, gameCode.value)
}

const activeTab = ref('stats')

// Load game when route changes
watch([seasonCode, gameCode], () => {
  loadGame()
}, { immediate: true })

watch([game, isLive], ([g, live]) => {
  if (live) {
    activeTab.value = 'live-events'
  } else if (g && g.played) {
    activeTab.value = 'stats'
  }
  if (g && !g.played && !live) {
    loadPregamePlayers()
  }
  if (g && !g.played) {
    loadLiveBoxscore()
    loadLivePlayByPlay()
    if (livePollId.value) {
      clearInterval(livePollId.value)
    }
    livePollId.value = window.setInterval(() => {
      loadLiveBoxscore()
      loadLivePlayByPlay()
    }, 15000)
  } else if (g && g.played) {
    if (livePollId.value) {
      clearInterval(livePollId.value)
      livePollId.value = null
    }
  }
}, { immediate: true })

onBeforeUnmount(() => {
  if (livePollId.value) {
    clearInterval(livePollId.value)
    livePollId.value = null
  }
})
</script>

<style scoped>
/* Ensure no dark backgrounds appear inside pages wrapped with .page-light-surface */
.page-light-surface :deep(.v-card),
.page-light-surface :deep(.v-card-text),
.page-light-surface :deep(.v-card-title),
.page-light-surface :deep(.v-card__title),
.page-light-surface :deep(.v-card-actions),
.page-light-surface :deep(.v-list),
.page-light-surface :deep(.v-list-item),
.page-light-surface :deep(.v-list-item__content),
.page-light-surface :deep(.v-list-item__title),
.page-light-surface :deep(.v-list-item__subtitle),
.page-light-surface :deep(.v-avatar) {
  background-color: #ffffff !important;
  color: #1a1a1a !important;
}

.page-light-surface :deep(.v-card-title),
.page-light-surface :deep(.v-card__title) {
  background-color: transparent !important;
}

.page-light-surface :deep(.v-chip) {
  background-color: rgba(240,83,35,0.08) !important;
  color: #F05323 !important;
}

/* Specific safe overrides for avatars and tiny UI pieces */
.page-light-surface :deep(.v-avatar) {
  background-color: #f3f4f6 !important;
}

.team-avatar :deep(img) {
  object-fit: contain !important;
}

.game-hero {
  border: 1px solid #e0e6f0;
  box-shadow: 0 8px 24px rgba(26, 39, 66, 0.06) !important;
}

.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hero-live-mobile {
  display: none;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #28a745;
  margin-bottom: 0.75rem;
}

.game-score-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
}

.team-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.team-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.team-info {
  text-align: left;
}

.team-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a2742;
}

.team-link {
  font-size: 0.8rem;
  color: #F05323;
  text-decoration: none;
}

.team-link:hover {
  text-decoration: underline;
}

.team-score {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1a2742;
  min-width: 56px;
  text-align: center;
}

.center-divider {
  font-size: 1.5rem;
  color: #8a92a2;
  font-weight: 700;
}

.score-block {
  text-align: center;
}

.arena-text {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #8a92a2;
  font-weight: 600;
}

.live-meta {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #28a745;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.15);
}

.pregame-card {
  border: 1px solid #e0e6f0;
  background: #ffffff;
}

.team-section {
  border: 1px solid #e0e6f0;
  border-radius: 12px;
  padding: 1rem;
  background: #f9fafb;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.team-section-title {
  font-weight: 700;
  color: #1a2742;
  margin-bottom: 0.75rem;
}

.player-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e6e9f0;
  flex: 1 1 auto;
  justify-content: center;
}

.player-info {
  text-align: center;
}

.player-name {
  font-weight: 600;
  color: #1a2742;
}

.player-link {
  font-size: 0.8rem;
  color: #F05323;
  text-decoration: none;
}

.player-link:hover {
  text-decoration: underline;
}

.compare-block {
  margin-top: 1.5rem;
  border-top: 1px solid #e0e6f0;
  padding-top: 1rem;
}

.compare-title {
  font-weight: 700;
  color: #1a2742;
  margin-bottom: 0.75rem;
}

.compare-subtitle {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: #1a2742;
}

.compare-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.live-panels :deep(.v-expansion-panel-title) {
  background: #f9fafb;
  border: 1px solid #e0e6f0;
  border-radius: 10px;
  margin-bottom: 0.5rem;
}

.live-panels :deep(.v-expansion-panel--active > .v-expansion-panel-title) {
  background: #f9fafb;
}

.live-panels :deep(.v-expansion-panel-text__wrapper) {
  background: #ffffff;
  color: #1a1a1a;
}

.live-panels :deep(.v-expansion-panel-text) {
  background: #ffffff;
  color: #1a1a1a;
}

.live-panels :deep(.v-expansion-panel__shadow) {
  display: none;
}

.live-panels :deep(.v-expansion-panel) {
  background: #ffffff;
}

.live-panels :deep(.v-expansion-panels) {
  background: #ffffff;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-weight: 700;
  color: #1a2742;
}

.panel-score {
  font-size: 0.85rem;
  color: #28a745;
  font-weight: 700;
}

.event-row {
  display: block;
  width: 100%;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eef1f5;
}

.event-side {
  display: none;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
}

.event-side--active {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 0.75rem;
  width: 100%;
}

.event-side--away.event-side--active {
  grid-template-columns: 1fr 64px;
  text-align: right;
}

.event-side--center.event-side--active {
  grid-template-columns: 64px 1fr;
  justify-content: center;
  text-align: center;
}

.event-side--center .event-meta {
  text-align: center;
}

.event-side--center .event-body {
  text-align: center;
}

.event-side--away .event-meta {
  order: 2;
}

.event-side--away .event-body {
  order: 1;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.75rem;
  color: #8a92a2;
  font-weight: 600;
}

.event-quarter {
  color: #1a2742;
}

.event-body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.event-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a2742;
}

.event-subtitle {
  font-size: 0.75rem;
  color: #8a92a2;
}

@media (max-width: 768px) {
  .event-row {
    grid-template-columns: 1fr;
  }

  .event-side--active {
    grid-template-columns: 64px 1fr;
    text-align: left;
  }
}

.event-actions {
  margin-top: 0.75rem;
  display: flex;
  justify-content: center;
}

.compare-row {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) 1.5fr minmax(120px, 1fr);
  gap: 1rem;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid #eef1f5;
}

.compare-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a2742;
}

.primary-text {
  color: #F05323;
}

.secondary-text {
  color: #1a2742;
}

@media (max-width: 768px) {
  .game-score-row {
    grid-template-columns: 1fr;
  }

  .team-meta {
    flex-direction: column;
    text-align: center;
  }

  .team-info {
    text-align: center;
  }

  .score-block {
    display: none;
  }

  .hero-live-mobile {
    display: inline-flex;
    justify-content: center;
  }

  .team-score {
    font-size: 1.75rem;
  }

  .team-avatar {
    width: 64px !important;
    height: 64px !important;
  }

  .player-card {
    padding: 0.4rem 0.5rem;
    justify-content: center;
  }

  .player-info {
    text-align: center;
  }

  .compare-row {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .compare-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .team-avatar {
    width: 56px !important;
    height: 56px !important;
  }

  .team-name {
    font-size: 1rem;
  }

  .pa-6 { padding: 1rem !important; }
  .mt-6 { margin-top: 1rem !important; }
}
</style>
