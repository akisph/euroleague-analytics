<template>
  <v-card elevation="0" class="detail-card">
    <v-card-title class="pb-3">
      <v-icon icon="mdi-target" class="mr-2 primary-icon" />
      Scoring & Shooting
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-4">
      <div class="stat-row">
        <span class="stat-label-inline">PPG (Average Points)</span>
        <span class="stat-value-inline">{{ calculatePerGame(player.stats?.points) }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label-inline">Games Played</span>
        <span class="stat-value-inline">{{ player.stats?.gamesPlayed || 0 }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label-inline">Total Points</span>
        <span class="stat-value-inline">{{ player.stats?.points || 0 }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label-inline">2PT</span>
        <span class="stat-value-inline">{{ player.stats?.fieldGoalsMade2 || 0 }}/{{ player.stats?.fieldGoalsAttempted2 || 0 }} ({{ player.stats?.twoPointShootingPercentage || '-' }})</span>
      </div>
      <div class="stat-row">
        <span class="stat-label-inline">3PT</span>
        <span class="stat-value-inline">{{ player.stats?.fieldGoalsMade3 || 0 }}/{{ player.stats?.fieldGoalsAttempted3 || 0 }} ({{ player.stats?.threePointShootingPercentage || '-' }})</span>
      </div>
      <div class="stat-row">
        <span class="stat-label-inline">FT</span>
        <span class="stat-value-inline">{{ player.stats?.freeThrowsMade || 0 }}/{{ player.stats?.freeThrowsAttempted || 0 }} ({{ player.stats?.freeThrowShootingPercentage || '-' }})</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '~/types'

interface Props {
  player: Player
}

const props = defineProps<Props>()

const calculatePerGame = (total: number | undefined) => {
  if (!total || !props.player.stats?.gamesPlayed || props.player.stats.gamesPlayed === 0) return '-'
  const value = total / props.player.stats.gamesPlayed
  return (Math.floor(value * 100) / 100).toFixed(2)
}
</script>

<style scoped>
.detail-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.primary-icon {
  color: #F05323 !important;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label-inline {
  font-size: 13px;
  font-weight: 500;
  color: #8a92a2;
}

.stat-value-inline {
  font-size: 15px;
  font-weight: 700;
  color: #1a2742;
  margin-left: 12px;
}

:deep(.v-card-title) {
  color: #1a2742 !important;
  font-weight: 600;
  font-size: 16px;
}

:deep(.v-divider) {
  opacity: 0.4;
}
</style>
