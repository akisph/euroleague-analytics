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
        :items="standings"
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
              <span class="text-caption font-weight-bold text-secondary">
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

        <!-- Win Percentage -->
        <template #item.winPercentage="{ item }">
          <v-progress-linear
            :model-value="(item.winPercentage || 0) * 100"
            :color="getWinPercentageColor(item.winPercentage || 0)"
            height="6"
            class="progress-bar"
          />
        </template>

        <!-- Win Streak -->
        <template #item.winStreak="{ item }">
          <div class="streak-cell">
            <v-icon
              v-if="item.winStreak && item.winStreak > 0"
              icon="mdi-fire"
              color="warning"
              size="16"
              class="mr-1"
            />
            {{ item.winStreak || 0 }}
          </div>
        </template>
      </v-data-table>
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

withDefaults(defineProps<Props>(), {
  title: 'Standings',
})

const standingsHeaders = [
  { title: '#', key: 'position', width: '60px', sortable: false },
  { title: 'Team', key: 'teamName', sortable: false },
  { title: 'GP', key: 'gamesPlayed', width: '60px' },
  { title: 'W-L', key: 'record', width: '80px', sortable: false },
  { title: 'Win %', key: 'winPercentage', width: '150px' },
  { title: 'PF', key: 'pointsFor', width: '80px' },
  { title: 'PA', key: 'pointsAgainst', width: '80px' },
  { title: '+/-', key: 'pointDifference', width: '80px' },
  { title: 'Streak', key: 'winStreak', width: '80px' },
]

const getPositionClass = (position: number): string => {
  if (position <= 4) return 'position-top4'
  if (position <= 8) return 'position-middle'
  return 'position-lower'
}

const getWinPercentageColor = (percentage: number): string => {
  if (percentage >= 0.7) return 'success'
  if (percentage >= 0.5) return 'primary'
  if (percentage >= 0.3) return 'warning'
  return 'error'
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

.progress-bar {
  min-width: 100px;
}

.streak-cell {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1a2742;
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

  .progress-bar {
    min-width: 80px;
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

  .progress-bar {
    min-width: 60px;
    height: 4px;
  }

  .team-cell {
    gap: 0.25rem;
  }

  .v-avatar {
    width: 24px !important;
    height: 24px !important;
  }
}
</style>
