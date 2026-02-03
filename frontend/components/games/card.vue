<template>
  <div class="game-card-wrapper">
    <v-card 
      :class="[
        'game-card',
        {
          'game-card--played': game.played,
          'game-card--scheduled': !game.played && !isLive,
          'game-card--live': isLive,
        },
      ]"
    >
      <div class="card-header">
        <div class="header-left">
          <v-chip
            v-if="game.phaseTypeName"
            size="x-small"
            variant="flat"
            color="primary"
            class="phase-badge"
          >
            {{ game.phaseTypeName }}
          </v-chip>
        </div>
        <div class="header-right">
          <span class="round-label">Round {{ game.roundNumber }}</span>
        </div>
      </div>

      <div class="card-content">
        <!-- Teams Section -->
        <div class="teams-container">
          <!-- Home Team -->
          <div class="team-info">
            <v-avatar size="48" color="#e0e6f0" class="team-avatar">
              <v-img v-if="game.homeTeamImage" :src="game.homeTeamImage" :alt="game.homeTeamName" :cover="false" />
              <span v-else class="team-code">{{ game.homeTeamCode?.substring(0, 3) }}</span>
            </v-avatar>
            <div class="team-name">{{ game.homeTeamName }}</div>
          </div>

          <!-- Score Section -->
          <div class="score-container">
            <template v-if="showScores">
              <div class="score-display">
                <span class="score" :class="isHomeWinner ? 'score--win' : ''">
                  {{ displayHomeScore }}
                </span>
                <span class="score-divider">-</span>
                <span class="score" :class="isAwayWinner ? 'score--win' : ''">
                  {{ displayAwayScore }}
                </span>
              </div>
              <v-chip
                size="x-small"
                :color="game.played ? 'success' : 'success'"
                variant="flat"
                :class="['status-badge', { 'status-badge--live': !game.played }]"
              >
                {{ game.played ? 'Final' : liveLabel }}
              </v-chip>
            </template>
            <template v-else>
              <div class="score-display">VS</div>
              <div v-if="formattedDate" class="game-date">
                {{ formattedDate }}
              </div>
            </template>
          </div>

          <!-- Away Team -->
          <div class="team-info">
            <v-avatar size="48" color="#e0e6f0" class="team-avatar">
              <v-img v-if="game.awayTeamImage" :src="game.awayTeamImage" :alt="game.awayTeamName" :cover="false" />
              <span v-else class="team-code">{{ game.awayTeamCode?.substring(0, 3) }}</span>
            </v-avatar>
            <div class="team-name">{{ game.awayTeamName }}</div>
          </div>
        </div>

        <!-- Game Details -->
        <div v-if="showDetails && (game.arena || game.attendance)" class="game-details">
          <div v-if="game.arena" class="detail-item">
            <v-icon size="16" icon="mdi-stadium" class="mr-1" />
            <span>{{ game.arena }}</span>
          </div>
          <div v-if="game.attendance" class="detail-item">
            <v-icon size="16" icon="mdi-account-group" class="mr-1" />
            <span>{{ game.attendance?.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Action Button -->
        <v-btn
          v-if="showAction"
          block
          :color="isLive ? 'success' : 'secondary'"
          variant="flat"
          size="small"
          class="action-btn"
          @click="$emit('view-details')"
        >
          View Details
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { Game } from '~/types'

interface Props {
  game: Game
  showDetails?: boolean
  showAction?: boolean
  cardClass?: string
  isLive?: boolean
  liveHomeScore?: number | null
  liveAwayScore?: number | null
  liveMinute?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false,
  showAction: false,
  isLive: false,
})

defineEmits<{
  (e: 'view-details'): void
}>()

const isHomeWinner = computed(() => {
  if (!props.game.played || displayHomeScore.value === null || displayAwayScore.value === null) {
    return false
  }
  return displayHomeScore.value > displayAwayScore.value
})

const isAwayWinner = computed(() => {
  if (!props.game.played || displayHomeScore.value === null || displayAwayScore.value === null) {
    return false
  }
  return displayAwayScore.value > displayHomeScore.value
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

const showScores = computed(() => props.game.played || props.isLive)

const displayHomeScore = computed(() => {
  if (props.game.played) return props.game.homeScore ?? null
  return props.liveHomeScore ?? 0
})

const displayAwayScore = computed(() => {
  if (props.game.played) return props.game.awayScore ?? null
  return props.liveAwayScore ?? 0
})

const liveLabel = computed(() => {
  if (props.game.played) return 'Final'
  return props.liveMinute ? `Live ${props.liveMinute}` : 'Live'
})
</script>

<style scoped>
.game-card-wrapper {
  height: 100%;
}

.game-card {
  background-color: #ffffff !important;
  border: 2px solid transparent !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s ease;
  overflow: hidden;
}

.game-card--played {
  border-left-color: transparent !important;
}

.game-card--scheduled {
  border-left-color: transparent !important;
}

.game-card--live {
  border-color: rgba(40, 167, 69, 0.6) !important;
  box-shadow: 0 8px 24px rgba(40, 167, 69, 0.15) !important;
}

.game-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e0e6f0;
  background-color: #f9fafb;
  min-height: 56px; /* consistent header height */
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.phase-badge {
  background-color: rgba(240, 83, 35, 0.1) !important;
  color: #F05323 !important;
}

.round-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #8a92a2;
  letter-spacing: 0.3px;
}

.card-content {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.teams-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 0.5rem;
  /* ensure teams/score area has consistent height across cards */
  flex: 1 1 auto;
  min-height: 110px;
}

.team-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.team-code {
  font-size: 0.75rem;
  font-weight: 700;
  color: #1a2742;
}

.team-avatar :deep(img) {
  object-fit: contain !important;
}

.team-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a2742;
  text-align: center;
  word-break: break-word;
  /* Limit team name to two lines to avoid height differences */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.6rem;
}

.score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
  min-width: fit-content;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.75rem;
  font-weight: 800;
  color: #1a2742;
}

.score {
  line-height: 1;
}

.score--win {
  color: #28a745;
}

.score-divider {
  opacity: 0.5;
  font-size: 1.5rem;
}

.game-date {
  font-size: 0.75rem;
  color: #8a92a2;
  font-weight: 500;
}

.status-badge {
  background-color: rgba(40, 167, 69, 0.2) !important;
  color: #28a745 !important;
}

.status-badge--live {
  background-color: rgba(40, 167, 69, 0.22) !important;
  color: #28a745 !important;
}

.game-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 8px;
  min-height: 64px; /* consistent details box height */
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #8a92a2;
  gap: 0.5rem;
}

.action-btn {
  margin-top: 0.75rem;
}

@media (max-width: 768px) {
  .card-content {
    padding: 1rem;
    gap: 0.75rem;
  }

  .score-display {
    font-size: 1.5rem;
  }

  .teams-container {
    min-height: 100px;
  }

  .team-name {
    font-size: 0.8rem;
    min-height: 2.4rem;
  }
}

@media (max-width: 480px) {
  .card-header {
    padding: 0.5rem 0.75rem;
    min-height: 48px;
  }

  .card-content {
    padding: 0.75rem;
  }

  .teams-container {
    min-height: 90px;
    gap: 0.25rem;
  }

  .team-info {
    gap: 0.25rem;
  }

  .v-avatar {
    width: 40px !important;
    height: 40px !important;
  }

  .team-code {
    font-size: 0.7rem;
  }

  .team-name {
    font-size: 0.75rem;
    min-height: 2.2rem;
  }

  .score-container {
    padding: 0 0.5rem;
  }

  .score-display {
    font-size: 1.25rem;
  }

  .score-divider {
    font-size: 1.25rem;
  }

  .game-details {
    min-height: 56px;
    padding: 0.5rem;
  }

  .detail-item {
    font-size: 0.7rem;
  }
}
</style>
