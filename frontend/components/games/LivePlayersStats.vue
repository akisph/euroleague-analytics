<template>
  <v-card class="h-100 pa-4 rounded-lg elevation-1">
    <v-card-title>
      <v-row align="center" class="w-100">
        <v-col cols="12" md="6">
          <div class="text-h6 font-weight-medium">Live Player Stats</div>
          <div class="text-caption text-secondary">Live boxscore for both teams</div>
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

const props = defineProps<{ game?: any }>()

const api = useApi()
const isLoading = ref(false)
const error = ref<string | null>(null)
const stats = ref<any | null>(null)
const pollId = ref<number | null>(null)

const seasonCode = computed(() => props.game?.seasonCode ?? props.game?.value?.seasonCode)
const gameCode = computed(() => (props.game?.gameCode ?? props.game?.value?.gameCode) ? Number(props.game?.gameCode ?? props.game?.value?.gameCode) : undefined)

const homeTeamCode = computed(() => props.game?.homeTeamCode ?? props.game?.value?.homeTeamCode)
const awayTeamCode = computed(() => props.game?.awayTeamCode ?? props.game?.value?.awayTeamCode)
const homeTeamName = computed(() => props.game?.homeTeamName ?? props.game?.value?.homeTeamName ?? 'Home')
const awayTeamName = computed(() => props.game?.awayTeamName ?? props.game?.value?.awayTeamName ?? 'Away')

const fetchPlayers = async () => {
  if (!seasonCode.value || !gameCode.value) return
  isLoading.value = true
  error.value = null
  stats.value = null
  try {
    const resp = await api.get(`/live-games/season/${seasonCode.value}/${gameCode.value}/boxscore`)
    stats.value = resp
  } catch (e: any) {
    error.value = e?.message || 'Failed to fetch live player stats'
  } finally {
    isLoading.value = false
  }
}

watch([seasonCode, gameCode], ([s, g]) => { if (s && g) fetchPlayers() }, { immediate: true })

const normalizeTeamCode = (value: string | undefined) => (value || '').trim().toUpperCase()

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
  teamCode: normalizeTeamCode(p?.team ?? p?.Team),
})

const extractPlayersByTeam = (teamCode: string | undefined) => {
  if (!stats.value) return []
  const teams = stats.value?.stats ?? []
  const target = normalizeTeamCode(teamCode)
  const allPlayers = teams.flatMap((t: any) =>
    Array.isArray(t?.playersStats) ? t.playersStats.map(mapPlayer) : [],
  )
  return allPlayers.filter(p => p.teamCode === target)
}

const homePlayers = computed(() => extractPlayersByTeam(homeTeamCode.value))
const awayPlayers = computed(() => extractPlayersByTeam(awayTeamCode.value))

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

const itemsPerPage = computed(() => Math.max(displayPlayers.value.length, 24))

const setupPolling = () => {
  if (pollId.value) {
    clearInterval(pollId.value)
    pollId.value = null
  }
  pollId.value = window.setInterval(() => {
    fetchPlayers()
  }, 150000)
}

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
.v-data-table tbody tr td:first-child { font-weight: 600 }
</style>
