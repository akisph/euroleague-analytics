<template>
  <div class="player-details-mobile page-container">
    <PlayersPlayerInfoCard :player="player" collapsible-info />

    <div class="tab-toggle">
      <v-btn
        class="toggle-btn"
        :variant="activeTab === 'stats' ? 'flat' : 'tonal'"
        color="primary"
        size="small"
        @click="activeTab = 'stats'"
      >
        <v-icon icon="mdi-chart-box" class="mr-1" />
        Stats
      </v-btn>
      <v-btn
        class="toggle-btn"
        :variant="activeTab === 'games' ? 'flat' : 'tonal'"
        color="primary"
        size="small"
        @click="activeTab = 'games'"
      >
        <v-icon icon="mdi-basketball" class="mr-1" />
        Games
      </v-btn>
    </div>

    <div v-if="activeTab === 'stats'">
      <template v-if="player?.stats">
        <div class="stack">
          <PlayersPlayerShootingGauges :player="player" />
          <PlayersPlayerPerGameChart :player="player" />
          <PlayersPlayerScoringStats :player="player" />
          <PlayersPlayerReboundsStats :player="player" />
          <PlayersPlayerDefenseStats :player="player" />
        </div>
      </template>
    </div>
    <div v-else>
      <PlayersPlayerGames :player="player" :season-code="seasonCode" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  player: any
  seasonCode: string
}

defineProps<Props>()

const activeTab = ref<'stats' | 'games'>('stats')
</script>

<style scoped>
.page-container {
  padding: 16px 12px;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
}

.tab-toggle {
  display: inline-flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin: 0.9rem 0 0.75rem;
}

.toggle-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 999px;
}

.stack {
  display: grid;
  gap: 0.75rem;
}

/* Make the shared PlayerInfoCard more compact on mobile. */
.player-details-mobile :deep(.info-card .profile-section) {
  padding: 18px !important;
}

.player-details-mobile :deep(.info-card .profile-section .mb-4) {
  margin-bottom: 10px !important;
}

.player-details-mobile :deep(.info-card .profile-section .mb-3) {
  margin-bottom: 8px !important;
}

.player-details-mobile :deep(.info-card .profile-section .mb-1) {
  margin-bottom: 6px !important;
}

.player-details-mobile :deep(.info-card .profile-section .v-avatar) {
  width: 120px !important;
  height: 120px !important;
}

.player-details-mobile :deep(.info-card .profile-section h1) {
  font-size: 1.1rem !important;
}

.player-details-mobile :deep(.info-card .info-section) {
  padding: 14px 12px !important;
}

.player-details-mobile :deep(.info-card .info-section) {
  margin: -6px !important;
}

.player-details-mobile :deep(.info-card .info-section > .v-col) {
  padding: 6px !important;
}

.player-details-mobile :deep(.info-card .info-item-grid) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 8px;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #fbfcff;
  height: 100%;
}

.player-details-mobile :deep(.info-card .info-item-grid .mb-2) {
  margin-bottom: 0 !important;
}

.player-details-mobile :deep(.info-card .info-icon) {
  margin-top: 2px;
}

.player-details-mobile :deep(.info-card .info-label) {
  display: none;
}

.player-details-mobile :deep(.info-card .info-value) {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.15;
  text-align: center;
}

@media (max-width: 520px) {
  .player-details-mobile :deep(.info-card .info-section > .v-col) {
    flex: 0 0 33.3333% !important;
    max-width: 33.3333% !important;
  }
}

@media (max-width: 360px) {
  .player-details-mobile :deep(.info-card .info-section > .v-col) {
    flex: 0 0 50% !important;
    max-width: 50% !important;
  }
}

.player-details-mobile :deep(.stats-card .v-card-title),
.player-details-mobile :deep(.detail-card .v-card-title) {
  font-size: 14px;
  padding: 14px 14px 10px !important;
}

.player-details-mobile :deep(.stats-card .v-card-text) {
  padding: 14px !important;
}

.player-details-mobile :deep(.detail-card .v-card-text) {
  padding: 12px 14px !important;
}

.player-details-mobile :deep(.detail-card .stat-row) {
  padding: 10px 0;
}
</style>
