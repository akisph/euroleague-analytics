<template>
  <div class="games-desktop">
    <GamesList
      :games="games"
      :selected-season-code="selectedSeasonCode"
    />
  </div>
</template>

<script setup lang="ts">
import type { Game } from '~/types'
import GamesList from './GamesList.vue'

interface Props {
  games: Game[]
  selectedSeasonCode: string | undefined
}

defineProps<Props>()
</script>

<style scoped>
.games-desktop {
  display: block;
}
</style>
