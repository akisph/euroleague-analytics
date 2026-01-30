<template>
  <v-card 
    :class="[cardClass, { 'game-played': game.played, 'game-scheduled': !game.played }]" 
    class="game-card"
    :elevation="game.played ? 2 : 1"
  >
    <v-card-text class="pa-4">
      <!-- Game Header -->
      <div class="d-flex align-center justify-space-between mb-3">
        <v-chip
          v-if="game.phaseTypeName"
          size="small"
          variant="tonal"
          color="primary"
        >
          {{ game.phaseTypeName }}
        </v-chip>
        <div class="text-caption text-medium-emphasis">
          Round {{ game.roundNumber }}
        </div>
      </div>

      <!-- Teams -->
      <div class="d-flex align-center justify-space-between mb-3">
        <!-- Home Team -->
        <div class="team-section text-center flex-grow-1">
          <v-avatar size="48" color="grey-lighten-3" class="mb-2">
            <span class="text-subtitle-2 font-weight-bold">
              {{ game.homeTeamCode?.substring(0, 3) }}
            </span>
          </v-avatar>
          <div class="text-body-2 font-weight-medium text-truncate" style="max-width: 100px;">
            {{ game.homeTeamName }}
          </div>
        </div>

        <!-- Score -->
        <div class="score-section mx-4 text-center">
          <template v-if="game.played">
            <div class="d-flex align-center justify-center">
              <span
                class="text-h4 font-weight-bold"
                :class="isHomeWinner ? 'text-success' : ''"
              >
                {{ game.homeScore }}
              </span>
              <span class="text-h5 mx-2 text-medium-emphasis">-</span>
              <span
                class="text-h4 font-weight-bold"
                :class="isAwayWinner ? 'text-success' : ''"
              >
                {{ game.awayScore }}
              </span>
            </div>
            <v-chip
              size="x-small"
              color="success"
              variant="flat"
              class="mt-1"
            >
              Final
            </v-chip>
          </template>
          <template v-else>
            <div class="text-h5 font-weight-bold text-medium-emphasis">VS</div>
            <div v-if="formattedDate" class="text-caption text-medium-emphasis mt-1">
              {{ formattedDate }}
            </div>
          </template>
        </div>

        <!-- Away Team -->
        <div class="team-section text-center flex-grow-1">
          <v-avatar size="48" color="grey-lighten-3" class="mb-2">
            <span class="text-subtitle-2 font-weight-bold">
              {{ game.awayTeamCode?.substring(0, 3) }}
            </span>
          </v-avatar>
          <div class="text-body-2 font-weight-medium text-truncate" style="max-width: 100px;">
            {{ game.awayTeamName }}
          </div>
        </div>
      </div>

      <!-- Game Info -->
      <v-divider v-if="showDetails" class="my-3" />
      <div v-if="showDetails" class="d-flex align-center justify-space-between text-caption text-medium-emphasis">
        <div v-if="game.arena">
          <v-icon size="14" icon="mdi-stadium" class="mr-1" />
          {{ game.arena }}
        </div>
        <div v-if="game.attendance">
          <v-icon size="14" icon="mdi-account-group" class="mr-1" />
          {{ game.attendance?.toLocaleString() }}
        </div>
      </div>

      <!-- Action Button -->
      <div v-if="showAction" class="mt-3">
        <v-btn
          block
          variant="tonal"
          color="primary"
          @click="$emit('view-details')"
        >
          View Details
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Game } from '~/types'

interface Props {
  game: Game
  showDetails?: boolean
  showAction?: boolean
  cardClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false,
  showAction: false,
})

defineEmits<{
  (e: 'view-details'): void
}>()

const isHomeWinner = computed(() => {
  if (!props.game.played || props.game.homeScore === undefined || props.game.awayScore === undefined) {
    return false
  }
  return props.game.homeScore > props.game.awayScore
})

const isAwayWinner = computed(() => {
  if (!props.game.played || props.game.homeScore === undefined || props.game.awayScore === undefined) {
    return false
  }
  return props.game.awayScore > props.game.homeScore
})

const formattedDate = computed(() => {
  if (!props.game.gameDate) return null
  const date = new Date(props.game.gameDate)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<style scoped>
.game-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-left: 4px solid transparent;
}

.game-card.game-played {
  border-left-color: rgb(var(--v-theme-success));
}

.game-card.game-scheduled {
  border-left-color: rgb(var(--v-theme-info));
}

.game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}
</style>
