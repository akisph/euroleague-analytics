<template>
  <template v-if="games.length">
    <v-card>

      <v-tabs
        v-model="selectedRoundTab"
        bg-color="primary"
        class="mb-4"
        show-arrows
        center-active
        @update:model-value="selectedRoundTab = $event"
      >
        <v-tab
          v-for="roundNum in sortedRounds"
          :key="roundNum"
          :value="roundNum"
          :class="{ 'font-weight-bold': isCurrentRound(roundNum) }"
        >
          Round {{ roundNum }}
        </v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="selectedRoundTab">
          <v-window-item
            v-for="roundNum in sortedRounds"
            :key="roundNum"
            :value="roundNum"
          >
            <div v-if="gamesByRound[roundNum]" class="pa-4">
              <!-- Completed Games -->
              <div v-if="gamesByRound[roundNum].completed.length > 0" class="mb-8">
                <div class="d-flex align-center mb-4">
                  <v-icon icon="mdi-check-circle" color="success" class="mr-2" />
                  <span class="text-success font-weight-bold text-h6">Completed ({{ gamesByRound[roundNum].completed.length }})</span>
                </div>

                <template v-if="effectiveViewMode === 'grid'">
                  <div
                    v-for="dayItem in getGamesByDayGrouped(gamesByRound[roundNum].completed)"
                    :key="dayItem.date"
                    class="mb-6"
                  >
                    <div class="day-header">
                      <v-icon icon="mdi-calendar" size="16" class="mr-2" />
                      {{ dayItem.date }}
                    </div>
                    <v-row class="mt-3">
                      <v-col
                        v-for="game in dayItem.games"
                        :key="game.gameCode"
                        cols="12"
                        sm="6"
                        lg="4"
                      >
                        <GamesCard
                          :game="game"
                          show-details
                          show-action
                          @view-details="navigateTo(`/games/${selectedSeasonCode}/${game.gameCode}`)"
                        />
                      </v-col>
                    </v-row>
                  </div>
                </template>

                <template v-else>
                  <div v-if="getGamesByDay(gamesByRound[roundNum].completed).length > 0">
                    <div
                      v-for="dayItem in getGamesByDayGrouped(gamesByRound[roundNum].completed)"
                      :key="dayItem.date"
                      class="mb-4"
                    >
                      <div class="day-header">
                        <v-icon icon="mdi-calendar" size="16" class="mr-2" />
                        {{ dayItem.date }}
                      </div>
                      <div class="schedule-board">
                        <button
                          v-for="game in dayItem.games"
                          :key="game.gameCode"
                          type="button"
                          class="schedule-row"
                          @click="navigateTo(`/games/${selectedSeasonCode}/${game.gameCode}`)"
                        >
                          <div class="schedule-team home" :class="{ winner: (game.homeScore || 0) > (game.awayScore || 0) }">
                            <v-avatar size="32" color="#e0e6f0" class="team-avatar">
                              <v-img v-if="game.homeTeamImage" :src="game.homeTeamImage" :alt="game.homeTeamName" />
                              <span v-else class="team-code">{{ game.homeTeamCode?.substring(0, 3) }}</span>
                            </v-avatar>
                            <div class="team-name">{{ game.homeTeamName }}</div>
                            <span v-if="game.played" class="team-score-inline">{{ game.homeScore }}</span>
                          </div>
                          <div class="schedule-center">
                            <div class="score">
                              {{ game.homeScore }} - {{ game.awayScore }}
                            </div>
                            <div class="meta">{{ formatEventTime(game.gameDate) }}</div>
                            <div v-if="game.arena" class="meta arena">{{ game.arena }}</div>
                          </div>
                          <div class="schedule-team away" :class="{ winner: (game.awayScore || 0) > (game.homeScore || 0) }">
                            <v-avatar size="32" color="#e0e6f0" class="team-avatar">
                              <v-img v-if="game.awayTeamImage" :src="game.awayTeamImage" :alt="game.awayTeamName" />
                              <span v-else class="team-code">{{ game.awayTeamCode?.substring(0, 3) }}</span>
                            </v-avatar>
                            <div class="team-name">{{ game.awayTeamName }}</div>
                            <span v-if="game.played" class="team-score-inline">{{ game.awayScore }}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <!-- Scheduled Games -->
              <div v-if="gamesByRound[roundNum].scheduled.length > 0">
                <div class="d-flex align-center mb-4">
                  <v-icon icon="mdi-clock-outline" color="primary" class="mr-2" />
                  <span class="font-weight-bold text-h6 text-primary">Scheduled ({{ gamesByRound[roundNum].scheduled.length }})</span>
                </div>

                <template v-if="effectiveViewMode === 'grid'">
                  <div
                    v-for="dayItem in getGamesByDayGrouped(gamesByRound[roundNum].scheduled)"
                    :key="dayItem.date"
                    class="mb-6"
                  >
                    <div class="day-header">
                      <v-icon icon="mdi-calendar" size="16" class="mr-2" />
                      {{ dayItem.date }}
                    </div>
                    <v-row class="mt-3">
                      <v-col
                        v-for="game in dayItem.games"
                        :key="game.gameCode"
                        cols="12"
                        sm="6"
                        lg="4"
                      >
                        <GamesCard
                          :game="game"
                          show-details
                          show-action
                          @view-details="navigateTo(`/games/${selectedSeasonCode}/${game.gameCode}`)"
                        />
                      </v-col>
                    </v-row>
                  </div>
                </template>

                <template v-else>
                  <div v-if="getGamesByDay(gamesByRound[roundNum].scheduled).length > 0">
                    <div
                      v-for="dayItem in getGamesByDayGrouped(gamesByRound[roundNum].scheduled)"
                      :key="dayItem.date"
                      class="mb-4"
                    >
                      <div class="day-header">
                        <v-icon icon="mdi-calendar" size="16" class="mr-2" />
                        {{ dayItem.date }}
                      </div>
                      <div class="schedule-board">
                        <button
                          v-for="game in dayItem.games"
                          :key="game.gameCode"
                          type="button"
                          class="schedule-row scheduled"
                          @click="navigateTo(`/games/${selectedSeasonCode}/${game.gameCode}`)"
                        >
                          <div class="schedule-team home">
                            <v-avatar size="32" color="#e0e6f0" class="team-avatar">
                              <v-img v-if="game.homeTeamImage" :src="game.homeTeamImage" :alt="game.homeTeamName" />
                              <span v-else class="team-code">{{ game.homeTeamCode?.substring(0, 3) }}</span>
                            </v-avatar>
                            <div class="team-name">{{ game.homeTeamName }}</div>
                          </div>
                          <div class="schedule-center">
                            <div class="score upcoming">Scheduled</div>
                            <div class="meta">{{ formatEventTime(game.gameDate) }}</div>
                            <div v-if="game.arena" class="meta arena">{{ game.arena }}</div>
                          </div>
                          <div class="schedule-team away">
                            <v-avatar size="32" color="#e0e6f0" class="team-avatar">
                              <v-img v-if="game.awayTeamImage" :src="game.awayTeamImage" :alt="game.awayTeamName" />
                              <span v-else class="team-code">{{ game.awayTeamCode?.substring(0, 3) }}</span>
                            </v-avatar>
                            <div class="team-name">{{ game.awayTeamName }}</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <div v-if="gamesByRound[roundNum].completed.length === 0 && gamesByRound[roundNum].scheduled.length === 0" class="text-center py-8">
                <span class="text-medium-emphasis">No games for this round</span>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </template>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { Game } from '~/types'

const props = defineProps<{
  games: Game[]
  selectedSeasonCode: string | undefined
}>()

const display = useDisplay()
const selectedRoundTab = ref<number | null>(null)

const effectiveViewMode = computed(() => {
  return display.smAndDown.value ? 'list' : 'grid'
})

const gamesByRound = computed(() => {
  const grouped: Record<number, { completed: Game[]; scheduled: Game[] }> = {}

  props.games.forEach((game) => {
    const round = game.roundNumber || 0
    if (!grouped[round]) {
      grouped[round] = { completed: [], scheduled: [] }
    }
    if (game.played) {
      grouped[round].completed.push(game)
    } else {
      grouped[round].scheduled.push(game)
    }
  })

  Object.values(grouped).forEach((group) => {
    group.completed.sort((a, b) => {
      const aTime = a.gameDate ? new Date(a.gameDate).getTime() : 0
      const bTime = b.gameDate ? new Date(b.gameDate).getTime() : 0
      return aTime - bTime
    })
    group.scheduled.sort((a, b) => {
      const aTime = a.gameDate ? new Date(a.gameDate).getTime() : 0
      const bTime = b.gameDate ? new Date(b.gameDate).getTime() : 0
      return aTime - bTime
    })
  })

  return grouped
})

const sortedRounds = computed(() => {
  return Object.keys(gamesByRound.value).map(Number).sort((a, b) => a - b)
})

const currentRound = computed(() => {
  const roundNumbers = Object.keys(gamesByRound.value).map(Number).sort((a, b) => b - a)

  for (const roundNum of roundNumbers) {
    if (gamesByRound.value[roundNum].completed.length > 0) {
      return roundNum
    }
  }

  for (const roundNum of roundNumbers) {
    if (gamesByRound.value[roundNum].scheduled.length > 0) {
      return roundNum
    }
  }

  return null
})

const isCurrentRound = (roundNum: number) => {
  return roundNum === currentRound.value
}

watch(() => currentRound.value, (newCurrent) => {
  if (newCurrent && !selectedRoundTab.value) {
    selectedRoundTab.value = newCurrent
  }
}, { immediate: true })

const getGamesByDay = (gameList: Game[]) => {
  const grouped: Record<string, Game[]> = {}

  gameList.forEach((game) => {
    if (!game.gameDate) return
    const date = new Date(game.gameDate)
    const dateKey = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(game)
  })

  return Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
}

const getGamesByDayGrouped = (gameList: Game[]) => {
  const grouped: Record<string, Game[]> = {}

  gameList.forEach((game) => {
    if (!game.gameDate) return
    const date = new Date(game.gameDate)
    const dateKey = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(game)
  })

  return Object.keys(grouped)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map(key => ({
      date: key,
      games: grouped[key].sort((a, b) => {
        const aTime = a.gameDate ? new Date(a.gameDate).getTime() : 0
        const bTime = b.gameDate ? new Date(b.gameDate).getTime() : 0
        return aTime - bTime
      })
    }))
}

const formatEventTime = (dateString: string | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const event = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${event} · ${time}`
}
</script>

<style scoped>
:deep(.v-card) {
  background-color: #ffffff;
  border: 1px solid #e0e6f0;
}

:deep(.v-tabs__bar) {
  background-color: #1a2742 !important;
}

:deep(.v-tabs) {
  background-color: transparent !important;
}

:deep(.v-tab) {
  color: #8a92a2 !important;
}

:deep(.v-tab--selected) {
  color: #F05323 !important;
  font-weight: 700;
}

:deep(.v-slide-group__content) {
  border-bottom: 2px solid transparent;
}

.day-header {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #1a2742;
  background: #f7f7fb;
  border: 1px solid #e0e6f0;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
}

.schedule-board {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.schedule-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 1px solid #e0e6f0;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(26, 39, 66, 0.05);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  text-align: left;
}

.schedule-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(26, 39, 66, 0.12);
}

.schedule-row.scheduled {
  border-left: none;
}

.schedule-team {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.schedule-team .team-name {
  font-weight: 600;
  color: #1a2742;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.schedule-team.winner .team-name {
  color: #1b7d36;
}

.team-avatar :deep(img) {
  object-fit: contain !important;
}

.team-score-inline {
  font-weight: 800;
  color: #1a2742;
  margin-left: auto;
}

.schedule-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 120px;
}

.schedule-center .score.upcoming {
  font-size: 0.75rem;
  font-weight: 700;
  color: #F05323;
  background: rgba(240, 83, 35, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}

.schedule-center .meta {
  font-size: 0.75rem;
  color: #8a92a2;
}

.schedule-center .arena {
  max-width: 200px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.schedule-center .score {
  font-weight: 800;
  color: #1a2742;
  font-size: 1.1rem;
}

@media (min-width: 769px) {
  .schedule-team.away {
    justify-content: flex-end;
    flex-direction: row-reverse;
    text-align: right;
  }

  .schedule-team .team-name {
    font-size: 1rem;
  }

  .team-score-inline {
    font-size: 1rem;
    display: none;
  }
}

@media (max-width: 768px) {
  .schedule-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: center;
  }

  .schedule-team {
    justify-content: center;
    flex-direction: column;
    gap: 0.35rem;
  }

  .schedule-center {
    display: flex;
  }

  .schedule-center .score {
    display: none;
  }

  .team-score-inline {
    margin-left: 0;
    font-size: 0.95rem;
  }
}
</style>
