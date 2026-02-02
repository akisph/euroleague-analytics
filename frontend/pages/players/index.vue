<template>
  <div class="players-page">
    <div class="page-container">
      <div class="page-header mb-8">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Players</h1>
        </div>
      </div>

      <v-card class="filters-card mb-6" elevation="0">
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="searchTerm"
                prepend-inner-icon="mdi-magnify"
                placeholder="Search by name, alias or code..."
                variant="outlined"
                density="comfortable"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="selectedTeam"
                :items="teamOptions"
                item-title="clubName"
                item-value="clubCode"
                placeholder="All teams"
                variant="outlined"
                density="comfortable"
                clearable
                prepend-inner-icon="mdi-shield-account"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <SharedLoadingState v-if="isLoading" :loading="true" />

      <SharedErrorAlert v-if="error" :error="error" @dismiss="error = null" />

      <SharedEmptyState
        v-if="!isLoading && filteredPlayers.length === 0"
        icon="mdi-account-off"
        title="No players found"
        :message="searchTerm || selectedTeam ? 'Try adjusting your search or filters' : 'No players available for this season'"
      />

      <v-card v-if="!isLoading && filteredPlayers.length > 0" elevation="0" class="players-table-card">
        <v-data-table
          :headers="tableHeaders"
          :items="filteredPlayers"
          :items-per-page="-1"
          :sort-by="sortBy"
          class="players-table"
          hide-default-footer
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center py-2 player-name-cell" @click="navigateToPlayer(item.playerCode)">
         
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.playerCode }}</div>
              </div>
            </div>
          </template>

          <template #item.position="{ item }">
            <span class="font-weight-medium">{{ formatPosition(item.position) }}</span>
          </template>

          <template #item.clubName="{ item }">
            <span class="club-link font-weight-medium" @click.stop="navigateToClub(item.clubCode)">
              {{ item.clubCode || 'N/A' }}
            </span>
          </template>

          <template #item.gamesPlayed="{ item }">
            {{ item.stats?.gamesPlayed || '-' }}
          </template>

          <template #item.calculatedMPG="{ item }">
            <span class="font-weight-medium">{{ item.calculatedMPG ? item.calculatedMPG.toFixed(2) : '-' }}</span>
          </template>

          <template #item.calculatedPIR="{ item }">
            <v-chip size="small" color="primary" variant="flat">
              {{ item.calculatedPIR ? item.calculatedPIR.toFixed(2) : '-' }}
            </v-chip>
          </template>

          <template #item.calculatedPPG="{ item }">
            <span class="font-weight-medium">{{ item.calculatedPPG ? item.calculatedPPG.toFixed(2) : '-' }}</span>
          </template>

          <template #item.calculatedAPG="{ item }">
            {{ item.calculatedAPG ? item.calculatedAPG.toFixed(2) : '-' }}
          </template>

          <template #item.calculatedRPG="{ item }">
            {{ item.calculatedRPG ? item.calculatedRPG.toFixed(2) : '-' }}
          </template>

          <template #item.calculatedSPG="{ item }">
            {{ item.calculatedSPG ? item.calculatedSPG.toFixed(2) : '-' }}
          </template>

          <template #item.twoPointShootingPercentage="{ item }">
            {{ item.stats?.twoPointShootingPercentage || '-' }}
          </template>

          <template #item.threePointShootingPercentage="{ item }">
            {{ item.stats?.threePointShootingPercentage || '-' }}
          </template>

          <template #item.freeThrowShootingPercentage="{ item }">
            {{ item.stats?.freeThrowShootingPercentage || '-' }}
          </template>
        </v-data-table>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayers } from '~/composables/usePlayers'
import { useSeasons } from '~/composables/useSeasons'
import { useSeasonStore } from '~/stores/season'
import type { Player, Roster } from '~/types'

const seasonStore = useSeasonStore()
const { allPlayers, isLoading: playersLoading, error: playersError, fetchAllPlayers, getFilteredPlayers, getTeams } = usePlayers()
const { fetchSeasons, fetchCurrentSeason } = useSeasons()

const router = useRouter()

// Local state
const searchTerm = ref('')
const selectedTeam = ref<string | null>(null)
const error = ref<string | null>(null)
const sortBy = ref([{ key: 'calculatedPIR', order: 'desc' }])

// Table headers
const tableHeaders = [
  { title: 'Player', key: 'name', sortable: true, width: '240px' },
  { title: 'Pos', key: 'position', sortable: true, width: '80px' },
  { title: 'Team', key: 'clubName', sortable: true, width: '120px' },
  { title: 'GP', key: 'gamesPlayed', sortable: true, width: '80px', value: (item: any) => item.stats?.gamesPlayed || 0 },
  { title: 'MPG', key: 'calculatedMPG', sortable: true, width: '90px' },
  { title: 'PIR', key: 'calculatedPIR', sortable: true, width: '100px' },
  { title: 'PPG', key: 'calculatedPPG', sortable: true, width: '90px' },
  { title: 'APG', key: 'calculatedAPG', sortable: true, width: '90px' },
  { title: 'RPG', key: 'calculatedRPG', sortable: true, width: '90px' },
  { title: 'SPG', key: 'calculatedSPG', sortable: true, width: '90px' },
  { title: '2P%', key: 'twoPointShootingPercentage', sortable: true, width: '80px', value: (item: any) => item.stats?.twoPointShootingPercentage || 0 },
  { title: '3P%', key: 'threePointShootingPercentage', sortable: true, width: '80px', value: (item: any) => item.stats?.threePointShootingPercentage || 0 },
  { title: 'FT%', key: 'freeThrowShootingPercentage', sortable: true, width: '80px', value: (item: any) => item.stats?.freeThrowShootingPercentage || 0 },
]

// Computed properties
const isLoading = computed(() => playersLoading.value)

const filteredPlayers = computed(() => {
  const players = getFilteredPlayers(searchTerm.value, selectedTeam.value || undefined)
  
  // Add calculated per-game stats for sorting
  return players.map(player => {
    const gp = player.stats?.gamesPlayed || 0
    return {
      ...player,
      calculatedMPG: gp > 0 ? (player.stats?.timePlayed || 0) / 60 / gp : 0,
      calculatedPIR: gp > 0 ? (player.stats?.valuation || 0) / gp : 0,
      calculatedPPG: gp > 0 ? (player.stats?.points || 0) / gp : 0,
      calculatedAPG: gp > 0 ? (player.stats?.assistances || 0) / gp : 0,
      calculatedRPG: gp > 0 ? (player.stats?.totalRebounds || 0) / gp : 0,
      calculatedSPG: gp > 0 ? (player.stats?.steals || 0) / gp : 0,
    }
  })
})

const teamOptions = computed(() => {
  return getTeams()
})

// Methods
const getPlayerInitials = (name: string) => {
  const names = name.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const calculatePerGame = (total: number | undefined, gamesPlayed: number | undefined): string => {
  if (!total || !gamesPlayed || gamesPlayed === 0) return '-'
  const value = total / gamesPlayed
  return (Math.floor(value * 100) / 100).toFixed(2)
}

const calculateMinutesPerGame = (timePlayed: number | undefined, gamesPlayed: number | undefined): string => {
  if (!timePlayed || !gamesPlayed || gamesPlayed === 0) return '-'
  // timePlayed is in seconds, convert to minutes
  const minutes = timePlayed / 60 / gamesPlayed
  return (Math.floor(minutes * 100) / 100).toFixed(2)
}

const formatPosition = (position: string | number | undefined): string => {
  if (!position) return '-'
  
  // Handle numeric positions: 1=G, 2=F, 3=C
  if (typeof position === 'number') {
    switch (position) {
      case 1: return 'G'
      case 2: return 'F'
      case 3: return 'C'
      default: return '-'
    }
  }
  
  // Handle string positions
  const posStr = String(position).toUpperCase()
  if (posStr.includes('GUARD')) return 'G'
  if (posStr.includes('FORWARD')) return 'F'
  if (posStr.includes('CENTER')) return 'C'
  return posStr.substring(0, 1)
}

const navigateToClub = (clubCode: string) => {
  router.push(`/clubs/${clubCode}`)
}

const navigateToPlayer = (playerCode: string) => {
  router.push(`/players/${playerCode}`)
}

// Initialize
onMounted(async () => {
  try {
    // Wait for store to be ready
    await nextTick()
    
    // Fetch seasons if not already loaded
    if (seasonStore.seasons.length === 0) {
      console.log('[Players Page] Seasons not loaded, fetching...')
      await fetchSeasons()
    }
    
    // Load saved season from localStorage if not already set
    if (!seasonStore.selectedSeasonCode && seasonStore.seasons.length > 0) {
      seasonStore.loadSavedSeason()
    }
    
    console.log('[Players Page] Mounted, selectedSeasonCode:', seasonStore.selectedSeasonCode)
    
    if (!seasonStore.selectedSeasonCode) {
      console.warn('[Players Page] No season selected')
      error.value = 'Please select a season first'
      return
    }
    
    console.log('[Players Page] Fetching all players for:', seasonStore.selectedSeasonCode)
    await fetchAllPlayers(seasonStore.selectedSeasonCode)
    console.log('[Players Page] Players fetched successfully')
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Failed to load players'
    error.value = errorMsg
    console.error('[Players Page] Error:', errorMsg, e)
  }
})

// Watch for season changes
watch(
  () => seasonStore.selectedSeasonCode,
  async (newSeason) => {
    console.log('[Players Page] Season changed to:', newSeason)
    if (newSeason) {
      searchTerm.value = ''
      selectedTeam.value = null
      try {
        console.log('[Players Page] Fetching players for new season...')
        await fetchAllPlayers(newSeason)
        console.log('[Players Page] Players fetched for new season')
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to load players'
        console.error('[Players Page] Error fetching for new season:', error.value)
      }
    }
  }
)

// Expose error from composable
watch(
  () => playersError.value,
  (newError) => {
    if (newError) {
      error.value = newError
      console.error('[Players Page] Composable error:', newError)
    }
  }
)
</script>

<style scoped>
.players-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  margin-bottom: 24px;
}

.filters-card {
  border: 1px solid #e0e6f0;
  border-radius: 12px;
  background: white;
}

.players-table-card {
  border: 1px solid #e0e6f0;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.v-text-field input),
:deep(.v-select input),
:deep(.v-field__input),
:deep(.v-select__selection-text) {
  color: #1a2742 !important;
}

:deep(.v-field--variant-outlined .v-field__outline) {
  color: #d1d5db !important;
}

:deep(input::placeholder) {
  color: #9ca3af !important;
  opacity: 1 !important;
}

:deep(.v-label) {
  color: #6b7280 !important;
}

:deep(.v-icon) {
  color: #6b7280 !important;
}

.player-name-cell {
  cursor: pointer;
}

.player-name-cell:hover {
  opacity: 0.8;
}

.club-link {
  cursor: pointer;
  color: #F05323;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  padding: 2px 0;
}

.club-link:hover {
  opacity: 0.7;
}

:deep(.v-data-table) {
  background: white;
}

:deep(.v-data-table .v-data-table__thead) {
  background: #fafbfc;
}

:deep(.v-data-table thead th) {
  font-weight: 600 !important;
  color: #1a2742 !important;
  font-size: 0.875rem !important;
  border-bottom: 2px solid #e0e6f0 !important;
  padding: 16px !important;
}

:deep(.v-data-table tbody tr) {
  transition: background-color 0.2s;
}

:deep(.v-data-table tbody tr:hover) {
  background: #fafbfc !important;
}

:deep(.v-data-table tbody td) {
  border-bottom: 1px solid #f0f2f5 !important;
  padding: 12px 16px !important;
  font-size: 0.875rem;
  color: #1a2742;
}

:deep(.v-chip) {
  font-weight: 600;
}

@media (max-width: 960px) {
  .page-container {
    padding: 16px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  :deep(.v-data-table) {
    font-size: 0.75rem;
  }

  :deep(.v-data-table thead th),
  :deep(.v-data-table tbody td) {
    padding: 8px !important;
  }
}
</style>
