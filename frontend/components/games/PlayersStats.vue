<template>
  <v-card class="h-100 pa-4 rounded-lg elevation-1">
    <v-card-title>
      <v-row align="center" class="w-100">
        <v-col cols="12" md="6">
          <div class="text-h6 font-weight-medium">Player Statistics</div>
          <div class="text-caption text-secondary">Per-player boxscore for both teams</div>
        </v-col>
        <v-col cols="12" md="6" class="d-flex justify-start justify-md-end">
          <v-tabs v-model="selectedTeam" class="team-tabs" variant="text" color="primary">
            <v-tab :value="homeTeamCode">{{ homeTeamName }}</v-tab>
            <v-tab :value="awayTeamCode">{{ awayTeamName }}</v-tab>
          </v-tabs>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text>
      <v-row v-if="isLoading" class="align-center justify-center">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" />
        </v-col>
      </v-row>

      <v-alert type="error" v-if="error">{{ error }}</v-alert>

      <div v-if="!isLoading && !error">
        <v-row>
          <v-col cols="12">
            <v-card class="pa-3">
              <div class="text-subtitle-1 mb-3">{{ selectedTeamLabel }}</div>
              <v-data-table
                :items="displayPlayers"
                :headers="headers"
                :items-per-page="itemsPerPage"
                dense
                hide-default-footer
              />
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useApi } from '~/composables/useApi'

const props = defineProps<{ game?: any; live?: boolean }>()

const api = useApi()
const isLoading = ref(false)
const error = ref<string | null>(null)
const stats = ref<any | null>(null)

const seasonCode = computed(() => props.game?.seasonCode ?? props.game?.value?.seasonCode)
const gameCode = computed(() => (props.game?.gameCode ?? props.game?.value?.gameCode) ? Number(props.game?.gameCode ?? props.game?.value?.gameCode) : undefined)

const homeTeamCode = computed(() => props.game?.homeTeamCode ?? props.game?.value?.homeTeamCode)
const awayTeamCode = computed(() => props.game?.awayTeamCode ?? props.game?.value?.awayTeamCode)

const fetchPlayers = async () => {
  if (!seasonCode.value || !gameCode.value) return
  isLoading.value = true
  error.value = null
  stats.value = null
  try {
    if (props.live) {
      const resp = await api.get(`/live-games/season/${seasonCode.value}/${gameCode.value}/boxscore`)
      const teams = resp?.stats || []
      const homeCode = (homeTeamCode.value || '').trim().toUpperCase()
      const awayCode = (awayTeamCode.value || '').trim().toUpperCase()

      const mapPlayer = (p: any) => ({
        name: p?.player ?? p?.Player ?? 'Unknown',
        number: p?.dorsal ?? p?.Dorsal ?? null,
        minutes: p?.minutes ?? p?.Minutes ?? null,
        points: p?.points ?? p?.Points ?? 0,
        assists: p?.assistances ?? p?.Assistances ?? 0,
        rebounds: p?.totalRebounds ?? p?.TotalRebounds ?? 0,
        steals: p?.steals ?? p?.Steals ?? 0,
        turnovers: p?.turnovers ?? p?.Turnovers ?? 0,
        fouls: p?.foulsCommited ?? p?.FoulsCommited ?? 0,
        pir: p?.valuation ?? p?.Valuation ?? 0,
        teamCode: (p?.team ?? p?.Team ?? '').trim().toUpperCase() || null,
      })

      const mapTeam = (team: any) =>
        Array.isArray(team?.playersStats) ? team.playersStats.map(mapPlayer) : []

      let homePlayersList: any[] = []
      let awayPlayersList: any[] = []

      teams.forEach((team: any) => {
        const players = mapTeam(team)
        // team name may not match codes; rely on player team codes
        if (!players.length) return
        const homePlayers = players.filter(p => p.teamCode === homeCode)
        const awayPlayers = players.filter(p => p.teamCode === awayCode)
        if (homePlayers.length) homePlayersList = homePlayers
        if (awayPlayers.length) awayPlayersList = awayPlayers
      })

      // fallback by player team code
      if (!homePlayersList.length || !awayPlayersList.length) {
        const allPlayers = teams.flatMap((t: any) =>
          Array.isArray(t?.playersStats) ? t.playersStats.map(mapPlayer) : [],
        )
        if (!homePlayersList.length) {
          homePlayersList = allPlayers.filter(p => p.teamCode === homeCode)
        }
        if (!awayPlayersList.length) {
          awayPlayersList = allPlayers.filter(p => p.teamCode === awayCode)
        }
      }

      stats.value = {
        local: { players: homePlayersList },
        road: { players: awayPlayersList },
      }
    } else {
      const resp = await api.get(`/games/season/${seasonCode.value}/${gameCode.value}/players`)
      stats.value = resp
    }
  } catch (e: any) {
    error.value = e?.message || 'Failed to fetch player stats'
  } finally {
    isLoading.value = false
  }
}

const pollId = ref<number | null>(null)

const setupPolling = () => {
  if (pollId.value) {
    clearInterval(pollId.value)
    pollId.value = null
  }
  if (props.live) {
    pollId.value = window.setInterval(() => {
      fetchPlayers()
    }, 150000)
  }
}

watch([seasonCode, gameCode], ([s, g]) => {
  if (s && g) fetchPlayers()
}, { immediate: true })

watch(() => props.live, () => {
  setupPolling()
}, { immediate: true })

onBeforeUnmount(() => {
  if (pollId.value) {
    clearInterval(pollId.value)
    pollId.value = null
  }
})

const formatMinutes = (v: any) => {
  if (v == null) return null
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  const mm = Math.floor(n / 60)
  const ss = n % 60
  return `${mm}:${String(ss).padStart(2, '0')}`
}

const normalizePlayer = (p: any) => {
  const person = p.player?.person ?? p.person ?? null
  const totals = p.stats ?? p.player?.stats ?? p.total ?? p.totals ?? p
  return {
    name: person?.name ?? person?.fullName ?? p.fullName ?? p.name ?? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
    number: p.player?.dorsal ?? p.number ?? p.jersey ?? p.dorsal ?? null,
    minutes: formatMinutes(totals?.timePlayed ?? totals?.minutes ?? totals?.time ?? null),
    points: totals?.points ?? totals?.pts ?? 0,
    assists: totals?.assistances ?? totals?.assists ?? 0,
    rebounds: totals?.totalRebounds ?? totals?.rebounds ?? 0,
    steals: totals?.steals ?? 0,
    turnovers: totals?.turnovers ?? 0,
    fouls: totals?.foulsCommited ?? totals?.fouls ?? 0,
    pir: totals?.valuation ?? totals?.pir ?? 0,
    teamCode: p.player?.club?.code ?? p.teamCode ?? p.clubCode ?? p.team?.code ?? null,
  }
}

const extractPlayersBySide = (side: 'local' | 'road') => {
  if (!stats.value) return []
  // support structures: { local: { players: [...] } } or { players: [...] }
  if (stats.value[side]) {
    const arr = stats.value[side].players ?? stats.value[side].playersList ?? stats.value[side].lineup ?? stats.value[side]
    if (Array.isArray(arr)) return arr.map(normalizePlayer)
  }

  if (Array.isArray(stats.value.players)) {
    const arr = stats.value.players.filter((p: any) => {
      const code = p.player?.club?.code ?? p.teamCode ?? p.clubCode ?? p.team?.code
      return code && (code === homeTeamCode.value || code === awayTeamCode.value) && ((side === 'local' && code === homeTeamCode.value) || (side === 'road' && code === awayTeamCode.value))
    })
    return arr.map(normalizePlayer)
  }

  // fallback: if stats.value is array
  if (Array.isArray(stats.value)) return stats.value.map(normalizePlayer)

  return []
}

const homePlayers = computed(() => extractPlayersBySide('local'))
const awayPlayers = computed(() => extractPlayersBySide('road'))

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Min', key: 'minutes' },
  { title: 'Pts', key: 'points' },
  { title: 'Ast', key: 'assists' },
  { title: 'Reb', key: 'rebounds' },
  { title: 'Stl', key: 'steals' },
  { title: 'TO', key: 'turnovers' },
  { title: 'Fls', key: 'fouls' },
  { title: 'PIR', key: 'pir' },
]

const selectedTeam = ref<string>(homeTeamCode.value || '')

const homeTeamName = computed(() => props.game?.homeTeamName ?? props.game?.value?.homeTeamName ?? 'Home')
const awayTeamName = computed(() => props.game?.awayTeamName ?? props.game?.value?.awayTeamName ?? 'Away')

const teamOptions = computed(() => [
  { label: 'All teams', value: null },
  { label: `${homeTeamName.value} (${homeTeamCode.value || ''})`, value: homeTeamCode.value },
  { label: `${awayTeamName.value} (${awayTeamCode.value || ''})`, value: awayTeamCode.value },
])

const displayPlayers = computed(() => {
  if (selectedTeam.value === homeTeamCode.value) return homePlayers.value
  if (selectedTeam.value === awayTeamCode.value) return awayPlayers.value
  return homePlayers.value
})

const selectedTeamLabel = computed(() => {
  if (selectedTeam.value === homeTeamCode.value) return homeTeamName.value
  if (selectedTeam.value === awayTeamCode.value) return awayTeamName.value
  return `Team ${selectedTeam.value}`
})

const itemsPerPage = computed(() => {
  // otherwise show all players for the selected team
  return Math.max(displayPlayers.value.length, 24)
})
</script>

<style scoped>
.v-data-table tbody tr td:first-child { font-weight: 600 }
</style>
