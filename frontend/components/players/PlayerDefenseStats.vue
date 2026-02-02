<template>
  <v-card elevation="0" class="detail-card">
    <v-card-title class="pb-3">
      <v-icon icon="mdi-shield" class="mr-2 primary-icon" />
      Defense & Fouls
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-4">
      <div class="stat-row">
        <span class="stat-label-inline">Steals</span>
        <span class="stat-value-inline">{{ calculatePerGame(player.stats?.steals) }} S/G</span>
      </div>
      <div class="stat-row">
        <span class="stat-label-inline">Blocks Against</span>
        <span class="stat-value-inline">{{ calculatePerGame(player.stats?.blocksAgainst) }} B/G</span>
      </div>
      <div class="stat-row">
        <span class="stat-label-inline">Blocks Favor</span>
        <span class="stat-value-inline">{{ calculatePerGame(player.stats?.blocksFavour) }} BF/G</span>
      </div>
      <div class="stat-row">
        <span class="stat-label-inline">Fouls Won</span>
        <span class="stat-value-inline">{{ calculatePerGame(player.stats?.foulsReceived) }} FW/G</span>
      </div>
      <div class="stat-row">
        <span class="stat-label-inline">Fouls Committed</span>
        <span class="stat-value-inline">{{ calculatePerGame(player.stats?.foulsCommited) }} FC/G</span>
      </div>
      <div class="stat-row">
        <span class="stat-label-inline">Turnovers</span>
        <span class="stat-value-inline">{{ calculatePerGame(player.stats?.turnovers) }} TO/G</span>
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
