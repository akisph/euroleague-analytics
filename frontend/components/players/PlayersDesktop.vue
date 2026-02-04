<template>
  <div class="players-desktop">
    <div class="page-container">
      <v-card class="filters-card mb-6" elevation="0">
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="searchProxy"
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
                v-model="selectedTeamProxy"
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

      <SharedErrorAlert v-if="error" :error="error" @dismiss="$emit('dismiss-error')" />

      <SharedEmptyState
        v-if="!isLoading && players.length === 0"
        icon="mdi-account-off"
        title="No players found"
        :message="emptyMessage"
      />

      <v-card v-if="!isLoading && players.length > 0" elevation="0" class="players-table-card">
        <v-data-table
          :headers="tableHeaders"
          :items="players"
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
import { computed, ref } from 'vue'

interface TeamOption {
  clubCode: string
  clubName: string
}

interface Props {
  searchTerm: string
  selectedTeam: string | null
  teamOptions: TeamOption[]
  players: any[]
  isLoading: boolean
  error: string | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:search-term', 'update:selected-team', 'dismiss-error'])

const router = useRouter()
const seasonStore = useSeasonStore()

const searchProxy = computed({
  get: () => props.searchTerm,
  set: (value: string | null) => emit('update:search-term', value ?? ''),
})

const selectedTeamProxy = computed({
  get: () => props.selectedTeam,
  set: (value: string | null) => emit('update:selected-team', value),
})

const sortBy = ref([{ key: 'calculatedPIR', order: 'desc' }])

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
] as const

const emptyMessage = computed(() => {
  return props.searchTerm || props.selectedTeam
    ? 'Try adjusting your search or filters'
    : 'No players available for this season'
})

const navigateToClub = (clubCode: string) => {
  if (!clubCode) return
  router.push(`/clubs/${clubCode}`)
}

const navigateToPlayer = (playerCode: string) => {
  const season = seasonStore.selectedSeasonCode
  if (!season) return
  router.push(`/players/${season}/${playerCode}`)
}

const formatPosition = (position: string | number | undefined): string => {
  if (!position) return '-'

  if (typeof position === 'number') {
    switch (position) {
      case 1: return 'G'
      case 2: return 'F'
      case 3: return 'C'
      default: return '-'
    }
  }

  const posStr = String(position).toUpperCase()
  if (posStr.includes('GUARD')) return 'G'
  if (posStr.includes('FORWARD')) return 'F'
  if (posStr.includes('CENTER')) return 'C'
  return posStr.substring(0, 1)
}
</script>

<style scoped>
.players-desktop {
  min-height: 100vh;
}

.page-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 32px 24px;
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

@media (max-width: 960px) {
  .page-container {
    padding: 16px;
  }
}
</style>
