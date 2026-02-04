<template>
  <component
    :is="isMobile ? GamesMobile : GamesDesktop"
    :games="games"
    :selected-season-code="selectedSeasonCode"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import type { Game } from '~/types'

import GamesDesktop from './GamesDesktop.vue'
import GamesMobile from './GamesMobile.vue'

interface Props {
  games: Game[]
  selectedSeasonCode: string | undefined
}

defineProps<Props>()

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
</script>
