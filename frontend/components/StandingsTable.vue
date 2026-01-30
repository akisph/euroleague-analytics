<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between py-4">
      <span>{{ title }}</span>
      <v-chip v-if="subtitle" size="small" variant="tonal">
        {{ subtitle }}
      </v-chip>
    </v-card-title>

    <v-data-table
      :headers="standingsHeaders"
      :items="standings"
      :items-per-page="-1"
      class="elevation-0"
      density="compact"
    >
      <!-- Position -->
      <template #item.position="{ item }">
        <div class="d-flex align-center">
          <v-avatar
            :color="getPositionColor(item.position)"
            size="28"
            class="mr-2"
          >
            <span class="text-body-2 font-weight-bold text-white">
              {{ item.position }}
            </span>
          </v-avatar>
        </div>
      </template>

      <!-- Team Name -->
      <template #item.teamName="{ item }">
        <div class="d-flex align-center">
          <v-avatar size="32" color="grey-lighten-3" class="mr-2">
            <span class="text-caption font-weight-bold">
              {{ item.teamCode?.substring(0, 3) }}
            </span>
          </v-avatar>
          <NuxtLink
            :to="`/teams/${item.teamCode}`"
            class="text-body-2 font-weight-medium text-decoration-none"
          >
            {{ item.teamName }}
          </NuxtLink>
        </div>
      </template>

      <!-- Record -->
      <template #item.record="{ item }">
        <span class="font-weight-medium">
          {{ item.wins }}-{{ item.losses }}
        </span>
      </template>

      <!-- Win Percentage -->
      <template #item.winPercentage="{ item }">
        <v-progress-linear
          :model-value="(item.winPercentage || 0) * 100"
          :color="getWinPercentageColor(item.winPercentage || 0)"
          height="20"
          rounded
          class="w-100"
        >
          <span class="text-caption font-weight-medium">
            {{ ((item.winPercentage || 0) * 100).toFixed(1) }}%
          </span>
        </v-progress-linear>
      </template>

      <!-- Point Difference -->
      <template #item.pointDifference="{ item }">
        <v-chip
          :color="(item.pointDifference || 0) >= 0 ? 'success' : 'error'"
          size="small"
          variant="flat"
        >
          {{ (item.pointDifference || 0) >= 0 ? '+' : '' }}{{ item.pointDifference || 0 }}
        </v-chip>
      </template>

      <!-- Win Streak -->
      <template #item.winStreak="{ item }">
        <div class="d-flex align-center">
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
  </v-card>
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

const getPositionColor = (position: number): string => {
  if (position <= 4) return 'success'
  if (position <= 8) return 'primary'
  if (position <= 12) return 'warning'
  return 'grey'
}

const getWinPercentageColor = (percentage: number): string => {
  if (percentage >= 0.7) return 'success'
  if (percentage >= 0.5) return 'primary'
  if (percentage >= 0.3) return 'warning'
  return 'error'
}
</script>
