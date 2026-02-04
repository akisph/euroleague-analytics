<template>
  <component
    :is="isMobile ? PlayersMobile : PlayersDesktop"
    :search-term="searchTerm"
    :selected-team="selectedTeam"
    :team-options="teamOptions"
    :players="players"
    :is-loading="isLoading"
    :error="error"
    @update:search-term="$emit('update:search-term', $event)"
    @update:selected-team="$emit('update:selected-team', $event)"
    @dismiss-error="$emit('dismiss-error')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

import PlayersDesktop from './PlayersDesktop.vue'
import PlayersMobile from './PlayersMobile.vue'

interface TeamOption {
  clubCode: string
  clubName: string
}

interface Props {
  searchTerm: string
  selectedTeam: string | null
  teamOptions: TeamOption[]
  players: any[]
  isLoading: boolean
  error: string | null
}

defineProps<Props>()
defineEmits(['update:search-term', 'update:selected-team', 'dismiss-error'])

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
</script>
