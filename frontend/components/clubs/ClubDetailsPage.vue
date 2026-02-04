<template>
  <component
    :is="isMobile ? ClubDetailsMobile : ClubDetailsDesktop"
    :club="club"
    :club-info="clubInfo"
    :coach-name="coachName"
    :manager-names="managerNames"
    :roster-players="rosterPlayers"
    :roster-headers="rosterHeaders"
    :roster-error="rosterError"
    :is-roster-loading="isRosterLoading"
    :games-error="gamesError"
    :is-games-loading="isGamesLoading"
    :team-games="teamGames"
    :season-code="seasonCode"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

import ClubDetailsDesktop from './ClubDetailsDesktop.vue'
import ClubDetailsMobile from './ClubDetailsMobile.vue'

interface Props {
  club: any
  clubInfo: any
  coachName: string
  managerNames: string[]
  rosterPlayers: any[]
  rosterHeaders: any[]
  rosterError: string | null
  isRosterLoading: boolean
  gamesError: string | null
  isGamesLoading: boolean
  teamGames: any[]
  seasonCode: string | undefined
}

defineProps<Props>()

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
</script>
