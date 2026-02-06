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
              <!-- Live Games -->
              <div v-if="gamesByRound[roundNum].live.length > 0" class="mb-8">
                <div class="d-flex align-center mb-4">
                  <v-icon icon="mdi-access-point" color="#28a745" class="mr-2" />
                  <span class="font-weight-bold text-h6 status-title status-title--live">Live ({{ gamesByRound[roundNum].live.length }})</span>
                </div>

                <template v-if="effectiveViewMode === 'grid'">
                  <div
                    v-for="dayItem in getGamesByDayGrouped(gamesByRound[roundNum].live)"
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
                          :game="getDisplayGame(game)"
                          :is-live="isGameLive(game)"
                          :live-home-score="getLiveScore(game)?.homeScore ?? null"
                          :live-away-score="getLiveScore(game)?.awayScore ?? null"
                          :live-minute="getLiveScore(game)?.minuteLabel ?? null"
                          :live-quarter="getLiveScore(game)?.quarter ?? null"
                          :live-quarter="getLiveScore(game)?.quarter ?? null"
                          :live-quarter="getLiveScore(game)?.quarter ?? null"
                          show-details
                          show-action
                          @view-details="navigateTo(`/games/${selectedSeasonCode}/${game.gameCode}`)"
                        />
                      </v-col>
                    </v-row>
                  </div>
                </template>

                <template v-else>
                  <div v-if="getGamesByDay(gamesByRound[roundNum].live).length > 0">
                    <div
                      v-for="dayItem in getGamesByDayGrouped(gamesByRound[roundNum].live)"
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
                          :class="{ 'schedule-row--live': isGameLive(game) }"
                          @click="navigateTo(`/games/${selectedSeasonCode}/${game.gameCode}`)"
                        >
                          <div class="schedule-team home">
                            <v-avatar size="32" color="#e0e6f0" class="team-avatar">
                              <v-img v-if="game.homeTeamImage" :src="game.homeTeamImage" :alt="game.homeTeamName" />
                              <span v-else class="team-code">{{ game.homeTeamCode?.substring(0, 3) }}</span>
                            </v-avatar>
                            <div class="team-name">{{ game.homeTeamName }}</div>
                            <span v-if="showInlineScore(game)" class="team-score-inline">
                              {{ getDisplayScore(game)?.homeScore }}
                            </span>
                          </div>
                          <div class="schedule-center">
                            <div class="score live">LIVE {{ getLiveScore(game)?.minuteLabel ?? '' }}</div>
                            <div class="score">
                              {{ getDisplayScore(game)?.homeScore }} - {{ getDisplayScore(game)?.awayScore }}
                            </div>
                            <div class="meta">{{ formatEventDate(game.gameDate) }}</div>
                            <div v-if="game.arena" class="meta arena">{{ game.arena }}</div>
                          </div>
                          <div class="schedule-team away">
                            <v-avatar size="32" color="#e0e6f0" class="team-avatar">
                              <v-img v-if="game.awayTeamImage" :src="game.awayTeamImage" :alt="game.awayTeamName" />
                              <span v-else class="team-code">{{ game.awayTeamCode?.substring(0, 3) }}</span>
                            </v-avatar>
                            <div class="team-name">{{ game.awayTeamName }}</div>
                            <span v-if="showInlineScore(game)" class="team-score-inline">
                              {{ getDisplayScore(game)?.awayScore }}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <!-- Completed Games -->
              <div v-if="gamesByRound[roundNum].completed.length > 0" class="mb-8">
                <div class="d-flex align-center mb-4">
                  <v-icon icon="mdi-check-circle" color="#5aa7ff" class="mr-2" />
                  <span class="font-weight-bold text-h6 status-title status-title--final">Completed ({{ gamesByRound[roundNum].completed.length }})</span>
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
                          :game="getDisplayGame(game)"
                          :is-live="isGameLive(game)"
                          :live-home-score="getLiveScore(game)?.homeScore ?? null"
                          :live-away-score="getLiveScore(game)?.awayScore ?? null"
                          :live-minute="getLiveScore(game)?.minuteLabel ?? null"
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
                          <div
                            class="schedule-team home"
                            :class="{ winner: (game.played || isFinishedFromLive(game)) && (getDisplayScore(game)?.homeScore || 0) > (getDisplayScore(game)?.awayScore || 0) }"
                          >
                            <v-avatar size="32" color="#e0e6f0" class="team-avatar">
                              <v-img v-if="game.homeTeamImage" :src="game.homeTeamImage" :alt="game.homeTeamName" />
                              <span v-else class="team-code">{{ game.homeTeamCode?.substring(0, 3) }}</span>
                            </v-avatar>
                            <div class="team-name">{{ game.homeTeamName }}</div>
                            <span v-if="showInlineScore(game)" class="team-score-inline">
                              {{ getDisplayScore(game)?.homeScore }}
                            </span>
                          </div>
                          <div class="schedule-center">
                            <div v-if="showInlineScore(game)" class="score">
                              {{ getDisplayScore(game)?.homeScore }} - {{ getDisplayScore(game)?.awayScore }}
                            </div>
                            <div class="meta">{{ formatEventDate(game.gameDate) }}</div>
                            <div v-if="game.arena" class="meta arena">{{ game.arena }}</div>
                          </div>
                          <div
                            class="schedule-team away"
                            :class="{ winner: (game.played || isFinishedFromLive(game)) && (getDisplayScore(game)?.awayScore || 0) > (getDisplayScore(game)?.homeScore || 0) }"
                          >
                            <v-avatar size="32" color="#e0e6f0" class="team-avatar">
                              <v-img v-if="game.awayTeamImage" :src="game.awayTeamImage" :alt="game.awayTeamName" />
                              <span v-else class="team-code">{{ game.awayTeamCode?.substring(0, 3) }}</span>
                            </v-avatar>
                            <div class="team-name">{{ game.awayTeamName }}</div>
                            <span v-if="showInlineScore(game)" class="team-score-inline">
                              {{ getDisplayScore(game)?.awayScore }}
                            </span>
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
                  <v-icon icon="mdi-clock-outline" color="#F05323" class="mr-2" />
                  <span class="font-weight-bold text-h6 status-title status-title--tbp">Scheduled ({{ gamesByRound[roundNum].scheduled.length }})</span>
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
                          :game="getDisplayGame(game)"
                          :is-live="isGameLive(game)"
                          :live-home-score="getLiveScore(game)?.homeScore ?? null"
                          :live-away-score="getLiveScore(game)?.awayScore ?? null"
                          :live-minute="getLiveScore(game)?.minuteLabel ?? null"
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
                          :class="{ 'schedule-row--live': isGameLive(game) }"
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
                            <div v-if="isGameLive(game)" class="score live">LIVE</div>
                            <div v-else class="score upcoming">Scheduled</div>
                            <div v-if="isGameLive(game)" class="score">
                              {{ getDisplayScore(game)?.homeScore }} - {{ getDisplayScore(game)?.awayScore }}
                            </div>
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

              <div v-if="gamesByRound[roundNum].completed.length === 0 && gamesByRound[roundNum].live.length === 0 && gamesByRound[roundNum].scheduled.length === 0" class="text-center py-8">
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
const api = useApi()
const { toAthensDate } = useTimeZone()
const selectedRoundTab = ref<number | null>(null)
const liveMap = ref<Record<number, { isLive: boolean; homeScore: number | null; awayScore: number | null; minuteLabel?: string | null; quarter?: number | null }>>({})
const livePollId = ref<number | null>(null)

const effectiveViewMode = computed(() => {
  return display.smAndDown.value ? 'list' : 'grid'
})

const gamesByRound = computed(() => {
  const grouped: Record<number, { completed: Game[]; live: Game[]; scheduled: Game[] }> = {}

  props.games.forEach((game) => {
    const round = game.roundNumber || 0
    if (!grouped[round]) {
      grouped[round] = { completed: [], live: [], scheduled: [] }
    }
    if (game.played || isFinishedFromLive(game)) {
      grouped[round].completed.push(game)
    } else if (isGameLive(game)) {
      grouped[round].live.push(game)
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
    group.live.sort((a, b) => {
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
    if (gamesByRound.value[roundNum].live.length > 0) {
      return roundNum
    }
  }

  const nowAthens = toAthensDate(Date.now())
  let closestRound: number | null = null
  let closestDiff = Number.POSITIVE_INFINITY

  props.games.forEach((game) => {
    if (!game.gameDate) return
    const gameDate = new Date(game.gameDate)
    const gameAthens = toAthensDate(gameDate)
    if (!gameAthens || !nowAthens) return
    const diff = Math.abs(gameAthens.getTime() - nowAthens.getTime())
    if (diff < closestDiff) {
      closestDiff = diff
      closestRound = game.roundNumber || 0
    }
  })

  if (closestRound !== null) {
    return closestRound
  }

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

const pickLatestQuarterValue = (row: any) => {
  if (!row) return null
  const candidates = [row.quarter4, row.quarter3, row.quarter2, row.quarter1]
  for (const value of candidates) {
    if (typeof value === 'number' && value > 0) return value
  }
  return null
}

const getLiveScore = (game: Game) => {
  return liveMap.value[game.gameCode]
}

const isFinishedFromLive = (game: Game) => {
  if (game.played) return false
  const live = getLiveScore(game)
  if (!live || live.isLive) return false
  const home = live.homeScore ?? 0
  const away = live.awayScore ?? 0
  return home > 0 || away > 0
}

const getDisplayScore = (game: Game) => {
  if (game.played || isFinishedFromLive(game)) {
    if (!game.played) {
      const live = getLiveScore(game)
      return {
        homeScore: live?.homeScore ?? 0,
        awayScore: live?.awayScore ?? 0,
      }
    }
    return {
      homeScore: game.homeScore ?? null,
      awayScore: game.awayScore ?? null,
    }
  }
  const live = getLiveScore(game)
  if (!live?.isLive) return null
  return {
    homeScore: live.homeScore ?? 0,
    awayScore: live.awayScore ?? 0,
  }
}

const isGameLive = (game: Game) => {
  if (game.played) return false
  return Boolean(liveMap.value[game.gameCode]?.isLive)
}

const showInlineScore = (game: Game) => {
  if (game.played || isFinishedFromLive(game)) return true
  return isGameLive(game)
}

const getDisplayGame = (game: Game) => {
  if (game.played) return game
  if (isFinishedFromLive(game)) {
    const live = getLiveScore(game)
    return {
      ...game,
      played: true,
      homeScore: live?.homeScore ?? 0,
      awayScore: live?.awayScore ?? 0,
    }
  }
  return game
}

const pickLastMarkerTime = (plays: any[] | undefined) => {
  if (!Array.isArray(plays) || !plays.length) return null
  for (let i = plays.length - 1; i >= 0; i -= 1) {
    const marker = plays[i]?.markerTime
    if (marker) return marker
  }
  return null
}

const resolveMinuteLabel = (pbp: any) => {
  const q = pbp?.actualQuarter
  if (!q || q < 1) return null
  if (q === 1) return pickLastMarkerTime(pbp?.firstQuarter)
  if (q === 2) return pickLastMarkerTime(pbp?.secondQuarter)
  if (q === 3) return pickLastMarkerTime(pbp?.thirdQuarter)
  if (q === 4) return pickLastMarkerTime(pbp?.fourthQuarter)
  return pickLastMarkerTime(pbp?.extraTime)
}

const fetchLiveForGame = async (seasonCode: string, gameCode: number) => {
  const [boxscore, pbp] = await Promise.all([
    api.get(`/live-games/season/${seasonCode}/${gameCode}/boxscore`),
    api.get(`/live-games/season/${seasonCode}/${gameCode}/playbyplay`),
  ])
  const data = boxscore || {}
  const rows = data.endOfQuarter || data.byQuarter || []
  const homeRow = rows?.[0]
  const awayRow = rows?.[1]
  return {
    isLive: Boolean(data.isLive),
    homeScore: pickLatestQuarterValue(homeRow),
    awayScore: pickLatestQuarterValue(awayRow),
    minuteLabel: resolveMinuteLabel(pbp) ?? null,
    quarter: pbp?.actualQuarter ?? null,
  }
}

const loadLiveForVisibleGames = async () => {
  const seasonCode = props.selectedSeasonCode
  if (!seasonCode || !selectedRoundTab.value) return
  const round = selectedRoundTab.value
  const scheduled = props.games.filter(
    (game) => (game.roundNumber || 0) === round && !game.played,
  )
  if (!scheduled.length) return

  const updates: Record<number, { isLive: boolean; homeScore: number | null; awayScore: number | null; minuteLabel?: string | null; quarter?: number | null }> = {}
  await Promise.all(
    scheduled.map(async (game) => {
      try {
        const liveData = await fetchLiveForGame(seasonCode, game.gameCode)
        updates[game.gameCode] = liveData
      } catch {
        updates[game.gameCode] = { isLive: false, homeScore: null, awayScore: null, minuteLabel: null, quarter: null }
      }
    }),
  )
  liveMap.value = { ...liveMap.value, ...updates }
}

watch(() => currentRound.value, (newCurrent) => {
  if (newCurrent && !selectedRoundTab.value) {
    selectedRoundTab.value = newCurrent
  }
}, { immediate: true })

watch([selectedRoundTab, () => props.selectedSeasonCode], () => {
  if (livePollId.value) {
    clearInterval(livePollId.value)
    livePollId.value = null
  }
  loadLiveForVisibleGames()
  livePollId.value = window.setInterval(() => {
    loadLiveForVisibleGames()
  }, 20000)
}, { immediate: true })

onBeforeUnmount(() => {
  if (livePollId.value) {
    clearInterval(livePollId.value)
    livePollId.value = null
  }
})

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
const formatEventDate = (dateString: string | undefined) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
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

.status-title {
  letter-spacing: 0.02em;
}

.status-title--live {
  color: #28a745;
}

.status-title--final {
  color: #5aa7ff;
}

.status-title--tbp {
  color: #F05323;
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

.schedule-row--live {
  border-color: rgba(40, 167, 69, 0.6);
  box-shadow: 0 8px 22px rgba(40, 167, 69, 0.15);
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

.schedule-center .score.live {
  font-size: 0.75rem;
  font-weight: 800;
  color: #28a745;
  background: rgba(40, 167, 69, 0.15);
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
