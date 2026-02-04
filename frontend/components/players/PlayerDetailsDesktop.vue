<template>
  <div class="page-container">
    <v-row class="mb-8">
      <v-col cols="12" md="12">
        <PlayersPlayerInfoCard :player="player" />
      </v-col>
    </v-row>

    <v-tabs v-model="activeTab" color="primary" class="mt-6 text-secondary">
      <v-tab key="stats" value="stats">
        <v-icon icon="mdi-chart-box" class="mr-2" />
        Stats
      </v-tab>

      <v-tab key="games" value="games">
        <v-icon icon="mdi-basketball" class="mr-2" />
        Games
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab" class="mt-6">
      <v-window-item key="stats" value="stats">
        <template v-if="player?.stats">
          <v-row class="gap-6 mb-8">
            <v-col cols="12" md="6">
              <PlayersPlayerShootingGauges :player="player" />
            </v-col>
            <v-col cols="12" md="6">
              <PlayersPlayerPerGameChart :player="player" />
            </v-col>
          </v-row>

          <v-row class="gap-4">
            <v-col cols="12">
              <PlayersPlayerScoringStats :player="player" />
            </v-col>

            <v-col cols="12">
              <PlayersPlayerReboundsStats :player="player" />
            </v-col>

            <v-col cols="12">
              <PlayersPlayerDefenseStats :player="player" />
            </v-col>
          </v-row>
        </template>
      </v-window-item>

      <v-window-item key="games" value="games">
        <PlayersPlayerGames :player="player" :season-code="seasonCode" />
      </v-window-item>
    </v-window>
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
  padding: 32px 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 960px) {
  .page-container {
    padding: 20px 16px;
  }
}
</style>

