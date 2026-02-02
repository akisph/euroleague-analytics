<template>
  <div class="standings-table">
    <div class="table-header">
      <div class="header-content">
        <h3 class="table-title">{{ title }}</h3>
        <v-chip v-if="subtitle" size="small" variant="flat" color="primary">
          {{ subtitle }}
        </v-chip>
      </div>
    </div>

    <div class="table-container">
      <v-data-table
        :headers="standingsHeaders"
        :items="tableStandings"
        :items-per-page="-1"
        class="standings-data-table"
        hide-default-footer
        density="comfortable"
      >
        <!-- Position -->
        <template #item.position="{ item }">
          <div class="position-cell">
            <div class="position-badge" :class="getPositionClass(item.position)">
              {{ item.position }}
            </div>
          </div>
        </template>

        <!-- Team Name -->
        <template #item.teamName="{ item }">
          <div class="team-cell">
            <v-avatar size="32" color="#e0e6f0" class="mr-2">
              <v-img v-if="item.teamImage" :src="item.teamImage" :alt="item.teamName" />
              <span v-else class="text-caption font-weight-bold text-secondary">
                {{ item.teamCode?.substring(0, 3) }}
              </span>
            </v-avatar>
            <NuxtLink
              :to="`/clubs/${item.teamCode}`"
              class="team-link"
            >
              {{ item.teamName }}
            </NuxtLink>
          </div>
        </template>

        <!-- Record -->
        <template #item.record="{ item }">
          <span class="record-cell">{{ item.wins }}-{{ item.losses }}</span>
        </template>
        <!-- Win Streak -->
        <template #item.winStreak="{ item }">
          <div v-if="item.lastFive" class="streak-cell">
            <span
              v-for="(result, idx) in item.lastFive.split('')"
              :key="`${item.teamCode}-${idx}`"
              class="streak-pill"
              :class="result === 'W' ? 'streak-win' : 'streak-loss'"
            >
              {{ result }}
            </span>
          </div>
          <span v-else class="streak-cell">-</span>
        </template>
        <!-- Avg Points For -->
        <template #item.avgPointsFor="{ item }">
          {{ item.avgPointsFor ? item.avgPointsFor.toFixed(1) : '0.0' }}
        </template>

        <!-- Avg Points Against -->
        <template #item.avgPointsAgainst="{ item }">
          {{ item.avgPointsAgainst ? item.avgPointsAgainst.toFixed(1) : '0.0' }}
        </template>
      </v-data-table>
    </div>

    <div class="standings-legend">
      1-6 playoff - 7-10 play in - 10+ elimination
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TeamStanding } from '~/types'

interface Props {
  standings: TeamStanding[]
  title?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Standings',
})

const tableStandings = computed(() => {
  return (props.standings || []).map((item: any) => {
    const gamesPlayed = item.gamesPlayed ?? 0
    const pointsFor = item.pointsFor ?? 0
    const pointsAgainst = item.pointsAgainst ?? 0
    const avgPointsFor = gamesPlayed > 0 ? pointsFor / gamesPlayed : 0
    const avgPointsAgainst = gamesPlayed > 0 ? pointsAgainst / gamesPlayed : 0

    return {
      ...item,
      avgPointsFor,
      avgPointsAgainst,
      pointDifference: item.pointDifference ?? item.difference ?? 0,
    }
  })
})

const standingsHeaders = [
  { title: '#', key: 'position', width: '60px', sortable: false, class: 'hide-mobile' },
  { title: 'Team', key: 'teamName', sortable: false, class: 'hide-mobile' },
  { title: 'GP', key: 'gamesPlayed', width: '60px' },
  { title: 'W-L', key: 'record', width: '80px', sortable: false },
  { title: 'APF', key: 'avgPointsFor', width: '80px', class: 'hide-mobile' },
  { title: 'APA', key: 'avgPointsAgainst', width: '80px', class: 'hide-mobile' },
  { title: '+/-', key: 'pointDifference', width: '80px', class: 'hide-mobile' },
  { title: 'Streak', key: 'winStreak', width: '120px' },
]

const getPositionClass = (position: number): string => {
  if (position <= 4) return 'position-top4'
  if (position <= 6) return 'position-top6'
  if (position <= 10) return 'position-middle'
  return 'position-lower'
}

</script>

<style scoped>
.standings-table {
  background-color: #ffffff;
  border: 1px solid #e0e6f0;
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e6f0;
  background-color: #f9fafb;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.table-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a2742;
  letter-spacing: -0.3px;
}

.table-container {
  padding: 0;
  overflow-x: auto;
}

.standings-data-table {
  background-color: #ffffff !important;
}

.standings-data-table :deep(thead) {
  background-color: #F05323;
}

.standings-data-table :deep(thead th) {
  background-color: #F05323 !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  font-size: 0.875rem;
  letter-spacing: 0.3px;
}

.standings-data-table :deep(tbody tr) {
  border-bottom: 1px solid #e0e6f0 !important;
}

.standings-data-table :deep(tbody tr:hover) {
  background-color: #f9fafb !important;
}

.standings-data-table :deep(tbody td) {
  background-color: #ffffff !important;
  color: #1a1a1a;
  padding: 1rem 0.75rem !important;
}

.position-cell {
  display: flex;
  align-items: center;
}

.position-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.875rem;
  color: #ffffff;
}

.position-top4 {
  background-color: #28a745;
}

.position-middle {
  background-color: #F05323;
}

.position-top6 {
  background-color: #7fcf8a;
}

.position-lower {
  background-color: #8a92a2;
}

.team-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.team-link {
  color: #1a2742;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.team-link:hover {
  color: #F05323;
}

.record-cell {
  font-weight: 600;
  color: #1a2742;
}

.streak-cell {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1a2742;
}

.streak-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  margin-right: 4px;
}

.streak-win {
  background-color: #28a745;
}

.streak-loss {
  background-color: #dc3545;
}

.standings-legend {
  border-top: 1px solid #e0e6f0;
  padding: 0.75rem 1.25rem 1rem;
  color: #516078;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .table-header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-title {
    font-size: 1.1rem;
  }

  .standings-data-table :deep(tbody td) {
    padding: 0.75rem 0.5rem !important;
  }

  .position-badge {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .table-header {
    padding: 0.75rem;
  }

  .table-title {
    font-size: 1rem;
  }

  .standings-data-table :deep(tbody td) {
    padding: 0.5rem 0.25rem !important;
  }

  .position-badge {
    width: 24px;
    height: 24px;
    font-size: 0.7rem;
  }
  .team-cell {
    gap: 0.25rem;
  }

  .v-avatar {
    width: 24px !important;
    height: 24px !important;
  }
}

@media (max-width: 600px) {
  .standings-data-table :deep(th.hide-mobile),
  .standings-data-table :deep(td.hide-mobile) {
    display: none !important;
  }
}
</style>
