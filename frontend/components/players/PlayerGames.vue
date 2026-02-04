<template>
  <v-card elevation="0" class="games-card">
    <v-card-title class="pb-3">
      <v-icon icon="mdi-basketball" class="mr-2 primary-icon" />
      Game-by-Game Statistics
    </v-card-title>
    <v-divider />

    <v-card-text v-if="isLoading" class="pa-8 text-center">
      <v-progress-circular indeterminate color="primary" class="mb-4" />
      <p class="text-body-2 text-medium-emphasis">Loading games...</p>
    </v-card-text>

    <v-card-text v-else-if="error" class="pa-8 text-center">
      <p class="text-body-2 text-error">{{ error }}</p>
    </v-card-text>

    <v-card-text v-else-if="gameStats.length === 0" class="pa-8 text-center">
      <p class="text-body-2 text-medium-emphasis">No game data available</p>
    </v-card-text>

    <v-card-text v-else-if="isMobile" class="pa-6">
      <div class="games-mobile-list">
        <div
          v-for="item in gameStats"
          :key="item.game.gameCode"
          class="game-row"
        >
          <div class="game-header" @click="toggleExpanded(item.game.gameCode)">
            <div class="game-main">
              <div class="game-top">
                <div class="game-opponent">
                  <span class="home-away-indicator">{{ getHomeAway(item) }}</span>
                  {{ getOpponentClub(item).name }}
                </div>
                <div class="game-meta">
                  <span class="game-code">{{ getOpponentClub(item).code }}</span>
                  <span class="game-date">{{ formatDate(item.game.date) }}</span>
                  <v-chip
                    :color="getResult(item) === 'W' ? 'success' : 'error'"
                    size="x-small"
                    variant="flat"
                    class="result-chip"
                  >
                    {{ getResult(item) }}
                  </v-chip>
                </div>
              </div>

              <div class="game-stats">
                <div class="stat">
                  <span class="stat-label">PIR</span>
                  <span class="stat-value">{{ formatNumber(item.stats?.valuation) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">PTS</span>
                  <span class="stat-value">{{ formatNumber(item.stats?.points) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">REB</span>
                  <span class="stat-value">{{ formatNumber(item.stats?.totalRebounds) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">AST</span>
                  <span class="stat-value">{{ formatNumber(item.stats?.assistances) }}</span>
                </div>
              </div>
            </div>

            <v-icon
              icon="mdi-chevron-right"
              class="row-chevron"
              :class="{ expanded: isExpanded(item.game.gameCode) }"
            />
          </div>

          <v-expand-transition>
            <div v-show="isExpanded(item.game.gameCode)" class="game-details">
              <div class="game-details-header">
                <div class="game-scoreline">
                  <span class="score-team">{{ item.game.local.club.code }}</span>
                  <span class="score-value">{{ item.game.local.score }}</span>
                  <span class="score-sep">-</span>
                  <span class="score-value">{{ item.game.road.score }}</span>
                  <span class="score-team">{{ item.game.road.club.code }}</span>
                </div>
                <div class="game-subline">
                  <span>Round {{ item.game.round }}</span>
                  <span v-if="shouldShowRoundName(item)" class="dot">&middot;</span>
                  <span v-if="shouldShowRoundName(item)">{{ item.game.roundName }}</span>
                </div>
              </div>

              <div class="details-stats">
                <div class="detail-stat">
                  <span class="detail-label">MIN</span>
                  <span class="detail-value">{{ formatMinutes(item.stats?.timePlayed) }}</span>
                </div>
                <div class="detail-stat">
                  <span class="detail-label">PTS</span>
                  <span class="detail-value">{{ formatNumber(item.stats?.points) }}</span>
                </div>
                <div class="detail-stat">
                  <span class="detail-label">REB</span>
                  <span class="detail-value">{{ formatNumber(item.stats?.totalRebounds) }}</span>
                </div>
                <div class="detail-stat">
                  <span class="detail-label">AST</span>
                  <span class="detail-value">{{ formatNumber(item.stats?.assistances) }}</span>
                </div>
                <div class="detail-stat">
                  <span class="detail-label">OREB</span>
                  <span class="detail-value">{{ formatNumber(item.stats?.offensiveRebounds) }}</span>
                </div>
                <div class="detail-stat">
                  <span class="detail-label">DREB</span>
                  <span class="detail-value">{{ formatNumber(item.stats?.defensiveRebounds) }}</span>
                </div>
                <div class="detail-stat">
                  <span class="detail-label">STL</span>
                  <span class="detail-value">{{ formatNumber(item.stats?.steals) }}</span>
                </div>
                <div class="detail-stat">
                  <span class="detail-label">BLK</span>
                  <span class="detail-value">{{ formatNumber((item.stats as any)?.blocksFavour) }}</span>
                </div>
                <div class="detail-stat">
                  <span class="detail-label">TO</span>
                  <span class="detail-value">{{ formatNumber(item.stats?.turnovers) }}</span>
                </div>
                <div class="detail-stat">
                  <span class="detail-label">+/-</span>
                  <span class="detail-value">{{ formatPlusMinus(item.stats?.plusMinus) }}</span>
                </div>
                <div class="detail-stat">
                  <span class="detail-label">FG</span>
                  <span class="detail-value">{{ formatShooting(
                    Number(item.stats?.fieldGoalsMade2 || 0) + Number(item.stats?.fieldGoalsMade3 || 0),
                    Number(item.stats?.fieldGoalsAttempted2 || 0) + Number(item.stats?.fieldGoalsAttempted3 || 0)
                  ) }}</span>
                </div>
                <div class="detail-stat">
                  <span class="detail-label">3P</span>
                  <span class="detail-value">{{ formatShooting(item.stats?.fieldGoalsMade3, item.stats?.fieldGoalsAttempted3) }}</span>
                </div>
                <div class="detail-stat">
                  <span class="detail-label">FT</span>
                  <span class="detail-value">{{ formatShooting(item.stats?.freeThrowsMade, item.stats?.freeThrowsAttempted) }}</span>
                </div>
                <div class="detail-stat">
                  <span class="detail-label">PIR</span>
                  <span class="detail-value">{{ formatNumber(item.stats?.valuation) }}</span>
                </div>
              </div>
            </div>
          </v-expand-transition>
        </div>
      </div>
    </v-card-text>

    <v-data-table
      v-else
      :headers="tableHeaders"
      :items="gameStats"
      :items-per-page="-1"
      hide-default-footer
      class="games-table"
    >
      <!-- Opponent column -->
      <template #[`item.opponent`]="{ item }">
        <span class="opponent-cell font-weight-500">
          <span class="home-away-indicator">{{ getHomeAway(item) }}</span>
          {{ getOpponentTeam(item) }}
        </span>
      </template>

      <!-- Result column -->
      <template #item.result="{ item }">
        <v-chip :color="getResult(item) === 'W' ? 'success' : 'error'" size="small" variant="flat">
          {{ getResult(item) }}
        </v-chip>
      </template>

      <!-- Time Played (convert from milliseconds to minutes) -->
      <template #item.stats.timePlayed="{ item }">
        {{ (item.stats.timePlayed / 60).toFixed(0) }}'
      </template>

      <!-- Points column (highlighted) -->
      <template #item.stats.points="{ item }">
        <span class="highlight font-weight-bold">{{ item.stats.points }}</span>
      </template>

      <!-- Rebounds -->
      <template #item.stats.totalRebounds="{ item }">
        {{ item.stats.totalRebounds }}
      </template>

      <!-- Assists -->
      <template #item.stats.assistances="{ item }">
        {{ item.stats.assistances }}
      </template>

      <!-- Steals -->
      <template #item.stats.steals="{ item }">
        {{ item.stats.steals }}
      </template>

      <!-- Blocks -->
      <template #item.stats.blocksFavour="{ item }">
        {{ item.stats.blocksFavour || 0 }}
      </template>

      <!-- Turnovers -->
      <template #item.stats.turnovers="{ item }">
        {{ item.stats.turnovers }}
      </template>

      <!-- Shooting percentages -->
      <template #item.fgPercentage="{ item }">
        {{ calculatePercentage(item.stats.fieldGoalsMade2 + item.stats.fieldGoalsMade3, item.stats.fieldGoalsAttempted2 + item.stats.fieldGoalsAttempted3) }}
      </template>

      <template #item.threePointPercentage="{ item }">
        {{ calculatePercentage(item.stats.fieldGoalsMade3, item.stats.fieldGoalsAttempted3) }}
      </template>

      <template #item.ftPercentage="{ item }">
        {{ calculatePercentage(item.stats.freeThrowsMade, item.stats.freeThrowsAttempted) }}
      </template>

      <!-- Plus/Minus -->
      <template #item.stats.plusMinus="{ item }">
        <span :class="{ 'text-success': item.stats.plusMinus > 0, 'text-error': item.stats.plusMinus < 0 }">
          {{ item.stats.plusMinus > 0 ? '+' : '' }}{{ item.stats.plusMinus }}
        </span>
      </template>

      <!-- PIR (Valuation) -->
      <template #item.stats.valuation="{ item }">
        <span class="font-weight-medium">{{ item.stats.valuation }}</span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useDisplay } from 'vuetify'
import type { Player } from '~/types'

interface Props {
  player: Player
  seasonCode?: string
}

interface GameData {
  game: {
    gameCode: number
    date: string
    round: number
    roundName: string
    local: {
      club: { name: string; code: string }
      score: number
    }
    road: {
      club: { name: string; code: string }
      score: number
    }
    winner: { code: string; name: string }
  }
  stats: {
    timePlayed: number
    points: number
    totalRebounds: number
    defensiveRebounds: number
    offensiveRebounds: number
    assistances: number
    steals: number
    blocksFavour: number
    turnovers: number
    fieldGoalsMade2: number
    fieldGoalsAttempted2: number
    fieldGoalsMade3: number
    fieldGoalsAttempted3: number
    freeThrowsMade: number
    freeThrowsAttempted: number
    valuation: number
    plusMinus: number
  }
  playerClubCode: string
}

const props = defineProps<Props>()

const gameStats = ref<GameData[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const playersComposable = usePlayers()
const display = useDisplay()

const isMobile = computed(() => display.smAndDown.value)
const expanded = ref<Record<string, boolean>>({})

const isExpanded = (gameCode: number) => Boolean(expanded.value[String(gameCode)])
const toggleExpanded = (gameCode: number) => {
  const key = String(gameCode)
  expanded.value[key] = !expanded.value[key]
}

const tableHeaders = [
  { title: 'Opponent', key: 'opponent', sortable: true, width: '150px' },
  { title: 'Result', key: 'result', sortable: true, width: '80px' },
  { title: 'MIN', key: 'stats.timePlayed', sortable: true, width: '70px' },
  { title: 'PTS', key: 'stats.points', sortable: true, width: '70px' },
  { title: 'FGA', key: 'stats.fieldGoalsAttemptedTotal', sortable: true, width: '70px' },
  { title: 'FG%', key: 'fgPercentage', sortable: false, width: '70px' },
  { title: '3P%', key: 'threePointPercentage', sortable: false, width: '70px' },
  { title: 'FT%', key: 'ftPercentage', sortable: false, width: '70px' },
  { title: 'REB', key: 'stats.totalRebounds', sortable: true, width: '70px' },
  { title: 'AST', key: 'stats.assistances', sortable: true, width: '70px' },
  { title: 'TO', key: 'stats.turnovers', sortable: true, width: '70px' },
  { title: 'STL', key: 'stats.steals', sortable: true, width: '70px' },
  { title: 'BLK', key: 'stats.blocksFavour', sortable: true, width: '70px' },
  { title: 'BLK-A', key: 'stats.blocksAgainst', sortable: true, width: '70px' },
  { title: 'FC', key: 'stats.foulsCommited', sortable: true, width: '70px' },
  { title: 'FD', key: 'stats.foulsReceived', sortable: true, width: '70px' },
  { title: '+/-', key: 'stats.plusMinus', sortable: true, width: '70px' },
  { title: 'PIR', key: 'stats.valuation', sortable: true, width: '70px' },
]

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const getOpponentClub = (item: GameData) => {
  const isLocal = item.playerClubCode === item.game.local.club.code
  return isLocal ? item.game.road.club : item.game.local.club
}

const getOpponentTeam = (item: GameData) => {
  const isLocal = item.playerClubCode === item.game.local.club.code
  return isLocal ? item.game.road.club.name : item.game.local.club.name
}

const getResult = (item: GameData) => {
  const isLocal = item.playerClubCode === item.game.local.club.code
  const playerScore = isLocal ? item.game.local.score : item.game.road.score
  const opponentScore = isLocal ? item.game.road.score : item.game.local.score
  return playerScore > opponentScore ? 'W' : 'L'
}

const getHomeAway = (item: GameData) => {
  return item.playerClubCode === item.game.local.club.code ? 'vs' : '@'
}

const calculatePercentage = (made: number, attempted: number) => {
  if (attempted === 0) return '-'
  return `${((made / attempted) * 100).toFixed(1)}%`
}

const normalizeText = (value: unknown) => String(value ?? '').toLowerCase().replace(/\s+/g, ' ').trim()

const shouldShowRoundName = (item: GameData) => {
  const name = normalizeText(item.game.roundName)
  if (!name) return false
  const primary = normalizeText(`Round ${item.game.round}`)
  return name !== primary
}

const formatNumber = (value: unknown) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '-'
  return String(Math.round(numberValue))
}

const formatMinutes = (timePlayed: unknown) => {
  const seconds = Number(timePlayed)
  if (!Number.isFinite(seconds)) return '-'
  return `${Math.round(seconds / 60)}'`
}

const formatPlusMinus = (value: unknown) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '-'
  return `${numberValue > 0 ? '+' : ''}${Math.round(numberValue)}`
}

const formatShooting = (made: unknown, attempted: unknown) => {
  const madeValue = Number(made)
  const attemptedValue = Number(attempted)
  if (!Number.isFinite(madeValue) || !Number.isFinite(attemptedValue) || attemptedValue === 0) return '-'
  const pct = ((madeValue / attemptedValue) * 100).toFixed(1)
  return `${Math.round(madeValue)}/${Math.round(attemptedValue)} (${pct}%)`
}

const loadPlayerGames = async () => {
  try {
    isLoading.value = true
    error.value = null
    expanded.value = {}
    
    console.log('[PlayerGames] Loading games for player:', props.player.playerCode, 'season:', props.seasonCode)
    
    const games = await playersComposable.fetchPlayerGames(props.player.playerCode, props.seasonCode)
    
    // Sort games from most recent to oldest by date
    const sortedGames = (games || []).sort((a: GameData, b: GameData) => {
      return new Date(b.game.date).getTime() - new Date(a.game.date).getTime()
    })
    
    gameStats.value = sortedGames
    
    console.log('[PlayerGames] Loaded', gameStats.value.length, 'games')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load games'
    console.error('[PlayerGames] Error loading games:', error.value)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPlayerGames()
})

// Reload games if props change
watch(() => [props.player.playerCode, props.seasonCode], () => {
  loadPlayerGames()
}, { deep: true })
</script>

<style scoped>
.games-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.primary-icon {
  color: #F05323 !important;
}

.round-cell {
  color: #6b7280;
  font-weight: 500;
}

.date-cell {
  color: #6b7280;
  font-weight: 500;
}

.opponent-cell {
  color: #1a2742;
}

.home-away-indicator {
  font-weight: 600;
  color: #F05323;
  margin-right: 4px;
}

.highlight {
  color: #F05323;
}

:deep(.v-card-title) {
  color: #1a2742 !important;
  font-weight: 600;
  font-size: 16px;
}

:deep(.v-divider) {
  opacity: 0.4;
}

:deep(.v-chip) {
  font-weight: 600;
  height: auto;
}

.games-mobile-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.game-row {
  background: #f9fafb;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  overflow: hidden;
}

.game-header {
  display: grid;
  grid-template-columns: 1fr 20px;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.65rem;
  cursor: pointer;
}

.game-header:hover {
  background: #f0f7ff;
}

.game-main {
  min-width: 0;
}

.game-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.game-opponent {
  font-size: 0.86rem;
  font-weight: 600;
  color: #1a2742;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex: 0 0 auto;
}

.game-date {
  font-size: 0.7rem;
  font-weight: 500;
  color: #8a92a2;
  letter-spacing: 0.02em;
}

.game-code {
  font-size: 0.7rem;
  font-weight: 600;
  color: #8a92a2;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

:deep(.result-chip) {
  font-weight: 700;
  letter-spacing: 0.06em;
  padding-inline: 6px;
}

.game-stats {
  margin-top: 0.35rem;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.35rem;
}

.stat {
  background: #ffffff;
  border: 1px solid #e8edf6;
  border-radius: 10px;
  padding: 0.3rem 0.35rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 0.62rem;
  color: #8a92a2;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.stat-value {
  font-size: 0.78rem;
  font-weight: 600;
  color: #1a2742;
}

.row-chevron {
  color: #8a92a2;
  transition: transform 0.18s ease;
}

.row-chevron.expanded {
  transform: rotate(90deg);
}

.game-details {
  border-top: 1px solid #eef2f7;
  background: #ffffff;
  padding: 0.65rem 0.65rem 0.75rem;
}

.game-details-header {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-bottom: 0.6rem;
}

.game-scoreline {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.4rem;
  font-weight: 700;
  color: #1a2742;
}

.score-team {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #6b7280;
}

.score-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a2742;
}

.score-sep {
  color: #8a92a2;
}

.game-subline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  color: #8a92a2;
  font-weight: 500;
}

.dot {
  opacity: 0.8;
}

.details-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
}

.detail-stat {
  border: 1px solid #e8edf6;
  background: #fbfcff;
  border-radius: 12px;
  padding: 0.45rem 0.55rem;
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  min-width: 0;
}

.detail-label {
  font-size: 0.62rem;
  font-weight: 600;
  color: #6b7280;
  letter-spacing: 0.06em;
}

.detail-value {
  font-size: 0.78rem;
  font-weight: 600;
  color: #1a2742;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 420px) {
  .game-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .details-stats {
    grid-template-columns: 1fr;
  }
}

:deep(.games-table) {
  background: white;
}

:deep(.games-table .v-data-table__thead) {
  background: #fafbfc;
}

:deep(.games-table thead th) {
  font-weight: 600 !important;
  color: #1a2742 !important;
  font-size: 0.875rem !important;
  border-bottom: 2px solid #e0e6f0 !important;
  padding: 12px !important;
}

:deep(.games-table tbody tr) {
  transition: background-color 0.2s;
}

:deep(.games-table tbody tr:hover) {
  background: #fafbfc !important;
}

:deep(.games-table tbody td) {
  border-bottom: 1px solid #f0f2f5 !important;
  padding: 12px !important;
  font-size: 0.875rem;
  color: #1a2742;
}

@media (max-width: 960px) {
  :deep(.games-table thead th),
  :deep(.games-table tbody td) {
    padding: 8px !important;
    font-size: 0.75rem !important;
  }
}
</style>
