<template>
  <v-card class="h-100 pa-4 rounded-lg elevation-1">
    <v-card-title>
      <v-row align="center" class="w-100">
        <v-col cols="12" md="6">
          <div class="text-h6 font-weight-medium">Live Player Stats</div>
          <div class="text-caption text-secondary">Live boxscore for both teams</div>
        </v-col>
        <v-col cols="12" md="6" class="d-flex flex-wrap justify-start justify-md-end gap-2">
          <v-tabs v-model="selectedTeam" class="team-tabs" variant="text" color="primary">
            <v-tab :value="homeTeamCode">{{ props.mobile ? homeTeamCode : homeTeamName }}</v-tab>
            <v-tab :value="awayTeamCode">{{ props.mobile ? awayTeamCode : awayTeamName }}</v-tab>
          </v-tabs>
          <v-select
            v-model="sortKey"
            :items="sortOptions"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            class="sort-select"
            placeholder="Sort by"
          />
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
                v-if="!props.mobile"
                :items="sortedPlayers"
                :headers="headers"
                :items-per-page="itemsPerPage"
                dense
                hide-default-footer
              >
                <template #item.name="{ item }">
                  <span :class="{ 'live-playing-name': item.raw?.isPlaying }">
                    {{ item.raw?.name ?? item.name }}
                  </span>
                </template>
              </v-data-table>

              <v-expansion-panels
                v-else
                variant="accordion"
                class="players-panels"
              >
                <v-expansion-panel
                  v-for="player in sortedPlayers"
                  :key="`${player.name}-${player.number}`"
                >
                  <v-expansion-panel-title>
                    <div class="player-row">
                      <div class="player-main">
                        <div class="player-name">
                          {{ player.name }}
                          <span v-if="player.number" class="player-number">(#{{ player.number }})</span>
                        </div>
                        <div class="player-position">{{ player.position || '-' }}</div>
                        <div class="player-stats">
                          <div class="stat-cell">
                            <span class="stat-key">PIR</span>
                            <span class="stat-val">{{ formatNumber(player.pir) }}</span>
                          </div>
                          <div class="stat-cell">
                            <span class="stat-key">PTS</span>
                            <span class="stat-val">{{ formatNumber(player.points) }}</span>
                          </div>
                          <div class="stat-cell">
                            <span class="stat-key">REB</span>
                            <span class="stat-val">{{ formatNumber(player.rebounds) }}</span>
                          </div>
                          <div class="stat-cell">
                            <span class="stat-key">AST</span>
                            <span class="stat-val">{{ formatNumber(player.assists) }}</span>
                          </div>
                          <div class="stat-cell">
                            <span class="stat-key">MIN</span>
                            <span class="stat-val">{{ player.minutes || '-' }}</span>
                          </div>
                        </div>
                      </div>
                      <v-icon icon="mdi-chevron-down" class="row-chevron" />
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div class="player-details">
                      <div class="detail-row">
                        <span class="detail-label">Minutes</span>
                        <span class="detail-value">{{ player.minutes || '-' }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Points</span>
                        <span class="detail-value">{{ formatNumber(player.points) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Assists</span>
                        <span class="detail-value">{{ formatNumber(player.assists) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Rebounds</span>
                        <span class="detail-value">{{ formatNumber(player.rebounds) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Steals</span>
                        <span class="detail-value">{{ formatNumber(player.steals) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Turnovers</span>
                        <span class="detail-value">{{ formatNumber(player.turnovers) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Fouls</span>
                        <span class="detail-value">{{ formatNumber(player.fouls) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">PIR</span>
                        <span class="detail-value">{{ formatNumber(player.pir) }}</span>
                      </div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
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

const props = defineProps<{ game?: any; mobile?: boolean }>()

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
  position: p?.positionName ?? p?.PositionName ?? p?.position ?? p?.Position ?? null,
  gamesPlayed: p?.gamesPlayed ?? p?.GamesPlayed ?? null,
  teamCode: normalizeTeamCode(p?.team ?? p?.Team),
  isPlaying: Number(p?.isPlaying ?? p?.IsPlaying ?? 0) === 1,
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
  { title: 'GP', key: 'gamesPlayed' },
  { title: 'Min', key: 'minutes' },
  { title: 'Pts', key: 'points' },
  { title: 'PIR', key: 'pir' },
  { title: 'Ast', key: 'assists' },
  { title: 'Reb', key: 'rebounds' },
  { title: 'Stl', key: 'steals' },
  { title: 'TO', key: 'turnovers' },
  { title: 'Fls', key: 'fouls' },
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

const sortKey = ref<string>('pir_desc')

const sortOptions = [
  { label: 'PIR Ascending', value: 'pir_asc' },
  { label: 'PIR Descending', value: 'pir_desc' },
  { label: 'PTS Ascending', value: 'points_asc' },
  { label: 'PTS Descending', value: 'points_desc' },
  { label: 'REB Ascending', value: 'rebounds_asc' },
  { label: 'REB Descending', value: 'rebounds_desc' },
  { label: 'AST Ascending', value: 'assists_asc' },
  { label: 'AST Descending', value: 'assists_desc' },
  { label: 'MIN Ascending', value: 'minutes_asc' },
  { label: 'MIN Descending', value: 'minutes_desc' },
  { label: 'GP Ascending', value: 'gamesPlayed_asc' },
  { label: 'GP Descending', value: 'gamesPlayed_desc' },
  { label: 'STL Ascending', value: 'steals_asc' },
  { label: 'STL Descending', value: 'steals_desc' },
  { label: 'TO Ascending', value: 'turnovers_asc' },
  { label: 'TO Descending', value: 'turnovers_desc' },
  { label: 'FLS Ascending', value: 'fouls_asc' },
  { label: 'FLS Descending', value: 'fouls_desc' },
]

const sortedPlayers = computed(() => {
  const list = [...displayPlayers.value]
  const [field, dir] = sortKey.value.split('_')
  const multiplier = dir === 'asc' ? 1 : -1
  return list.sort((a: any, b: any) => {
    const av = Number(a?.[field] ?? -Infinity)
    const bv = Number(b?.[field] ?? -Infinity)
    if (Number.isFinite(av) || Number.isFinite(bv)) {
      return (av - bv) * multiplier
    }
    return 0
  })
})

const formatNumber = (value: number | string | null | undefined) => {
  if (value == null) return '-'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return num.toFixed(2)
}


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

:deep(.live-playing-name) {
  background: rgba(40, 167, 69, 0.18);
  color: #1b7d36;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 8px;
  display: inline-block;
}

.sort-select {
  min-width: 140px;
}

.players-panels :deep(.v-expansion-panel) {
  border-radius: 12px;
  border: 1px solid #e8edf6;
  background: #ffffff;
  overflow: hidden;
}

.players-panels :deep(.v-expansion-panel-title) {
  background: #f9fafb;
}

.player-row {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.6rem;
  justify-content: space-between;
}

.player-main {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1 1 auto;
  min-width: 0;
}

.player-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1a2742;
}

.player-number {
  font-size: 0.72rem;
  color: #8a92a2;
  font-weight: 600;
  margin-left: 4px;
}

.player-position {
  font-size: 0.7rem;
  color: #8a92a2;
  font-weight: 600;
}

.player-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.2rem 0.75rem;
  font-size: 0.72rem;
  color: #516078;
  font-weight: 600;
}

.stat-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-key {
  font-size: 0.6rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #8a92a2;
  font-weight: 600;
}

.stat-val {
  font-size: 0.74rem;
  color: #1a2742;
  font-weight: 700;
}

.row-chevron {
  color: #8a92a2;
  font-size: 1.1rem;
}

.player-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.4rem 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
  font-size: 0.75rem;
}

.detail-label {
  color: #8a92a2;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.detail-value {
  color: #1a2742;
  font-weight: 600;
}
</style>
