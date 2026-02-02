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

const loadPlayerGames = async () => {
  try {
    isLoading.value = true
    error.value = null
    
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
