<template>
  <v-card class="h-100 pa-4 rounded-lg elevation-1">
    <v-card-title class="d-flex align-center justify-space-between">
      <div>
        <div class="text-h6 font-weight-medium">Player Statistics</div>
        <div class="text-caption text-secondary">Per-player boxscore for both teams</div>
      </div>
        <div>
          <v-tabs v-model="selectedTeam" class="team-tabs" variant="text" color="primary">
            <v-tab value="">All</v-tab>
            <v-tab :value="homeTeamCode">{{ homeTeamName }}</v-tab>
            <v-tab :value="awayTeamCode">{{ awayTeamName }}</v-tab>
          </v-tabs>
        </div>
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

const props = defineProps<{ game?: any }>()

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
    const resp = await api.get(`/games/season/${seasonCode.value}/${gameCode.value}/players`)
    stats.value = resp
  } catch (e: any) {
    error.value = e?.message || 'Failed to fetch player stats'
  } finally {
    isLoading.value = false
  }
}

watch([seasonCode, gameCode], ([s, g]) => { if (s && g) fetchPlayers() }, { immediate: true })

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

const selectedTeam = ref<string>('')

const homeTeamName = computed(() => props.game?.homeTeamName ?? props.game?.value?.homeTeamName ?? 'Home')
const awayTeamName = computed(() => props.game?.awayTeamName ?? props.game?.value?.awayTeamName ?? 'Away')

const teamOptions = computed(() => [
  { label: 'All teams', value: null },
  { label: `${homeTeamName.value} (${homeTeamCode.value || ''})`, value: homeTeamCode.value },
  { label: `${awayTeamName.value} (${awayTeamCode.value || ''})`, value: awayTeamCode.value },
])

const combinedPlayers = computed(() => {
  return [...homePlayers.value, ...awayPlayers.value]
})

const displayPlayers = computed(() => {
  if (selectedTeam.value === '') return combinedPlayers.value
  if (selectedTeam.value === homeTeamCode.value) return homePlayers.value
  if (selectedTeam.value === awayTeamCode.value) return awayPlayers.value
  // fallback: filter combined by teamCode
  return combinedPlayers.value.filter((p: any) => p.teamCode === selectedTeam.value)
})

const selectedTeamLabel = computed(() => {
  if (selectedTeam.value === '') return 'All players'
  if (selectedTeam.value === homeTeamCode.value) return homeTeamName.value
  if (selectedTeam.value === awayTeamCode.value) return awayTeamName.value
  return `Team ${selectedTeam.value}`
})

const itemsPerPage = computed(() => {
  // If no team selected, show all combined players (usually 24)
  if (selectedTeam.value === '') return Math.max(combinedPlayers.value.length, 24)
  // otherwise show all players for the selected team
  return Math.max(displayPlayers.value.length, 24)
})
</script>

<style scoped>
.v-data-table tbody tr td:first-child { font-weight: 600 }
</style>
