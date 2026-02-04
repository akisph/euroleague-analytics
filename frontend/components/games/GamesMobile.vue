<template>
  <div class="games-mobile">
    <v-card class="games-mobile-card">
      <v-tabs
        v-model="selectedRoundTab"
        class="mb-3 mobile-round-tabs"
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
            <div v-if="gamesByRound[roundNum]" class="round-block">
              <div v-if="gamesByRound[roundNum].live.length" class="status-block">
                <div class="status-title live">
                  <v-icon icon="mdi-access-point" size="16" class="mr-2" />
                  Live ({{ gamesByRound[roundNum].live.length }})
                </div>
                <div
                  v-for="dayItem in getGamesByDayGrouped(gamesByRound[roundNum].live)"
                  :key="dayItem.date"
                  class="day-block"
                >
                  <div class="day-header">
                    <v-icon icon="mdi-calendar" size="14" class="mr-2" />
                    {{ dayItem.date }}
                  </div>
                  <div class="games-list">
                    <div
                      v-for="game in dayItem.games"
                      :key="game.gameCode"
                      class="game-row"
                      @click="navigateTo(`/games/${selectedSeasonCode}/${game.gameCode}`)"
                    >
                      <div class="game-time">
                        <div class="time">{{ formatGameTime(game.gameDate) }}</div>
                        <div class="status live">{{ gameStatusLabel(game) }}</div>
                      </div>
                      <div class="game-teams">
                        <div class="team-row">
                          <v-avatar size="22" color="#e0e6f0">
                            <v-img
                              v-if="game.homeTeamImage"
                              :src="game.homeTeamImage"
                              :alt="game.homeTeamName"
                              :cover="false"
                              class="team-avatar-img"
                            />
                            <span v-else class="team-code">{{ game.homeTeamCode?.substring(0, 3) }}</span>
                          </v-avatar>
                          <span class="team-name">{{ game.homeTeamName }}</span>
                        </div>
                        <div class="team-row">
                          <v-avatar size="22" color="#e0e6f0">
                            <v-img
                              v-if="game.awayTeamImage"
                              :src="game.awayTeamImage"
                              :alt="game.awayTeamName"
                              :cover="false"
                              class="team-avatar-img"
                            />
                            <span v-else class="team-code">{{ game.awayTeamCode?.substring(0, 3) }}</span>
                          </v-avatar>
                          <span class="team-name">{{ game.awayTeamName }}</span>
                        </div>
                      </div>
                      <div class="game-score">
                        <div class="score-line">{{ getDisplayScore(game)?.homeScore ?? '-' }}</div>
                        <div class="score-line">{{ getDisplayScore(game)?.awayScore ?? '-' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="gamesByRound[roundNum].completed.length" class="status-block">
                <div class="status-title completed">
                  <v-icon icon="mdi-check-circle" size="16" class="mr-2" />
                  Finished ({{ gamesByRound[roundNum].completed.length }})
                </div>
                <div
                  v-for="dayItem in getGamesByDayGrouped(gamesByRound[roundNum].completed)"
                  :key="dayItem.date"
                  class="day-block"
                >
                  <div class="day-header">
                    <v-icon icon="mdi-calendar" size="14" class="mr-2" />
                    {{ dayItem.date }}
                  </div>
                  <div class="games-list">
                    <div
                      v-for="game in dayItem.games"
                      :key="game.gameCode"
                      class="game-row"
                      @click="navigateTo(`/games/${selectedSeasonCode}/${game.gameCode}`)"
                    >
                      <div class="game-time">
                        <div class="time">{{ formatGameTime(game.gameDate) }}</div>
                        <div class="status">{{ gameStatusLabel(game) }}</div>
                      </div>
                      <div class="game-teams">
                        <div class="team-row">
                          <v-avatar size="22" color="#e0e6f0">
                            <v-img
                              v-if="game.homeTeamImage"
                              :src="game.homeTeamImage"
                              :alt="game.homeTeamName"
                              :cover="false"
                              class="team-avatar-img"
                            />
                            <span v-else class="team-code">{{ game.homeTeamCode?.substring(0, 3) }}</span>
                          </v-avatar>
                          <span class="team-name">{{ game.homeTeamName }}</span>
                        </div>
                        <div class="team-row">
                          <v-avatar size="22" color="#e0e6f0">
                            <v-img
                              v-if="game.awayTeamImage"
                              :src="game.awayTeamImage"
                              :alt="game.awayTeamName"
                              :cover="false"
                              class="team-avatar-img"
                            />
                            <span v-else class="team-code">{{ game.awayTeamCode?.substring(0, 3) }}</span>
                          </v-avatar>
                          <span class="team-name">{{ game.awayTeamName }}</span>
                        </div>
                      </div>
                      <div class="game-score">
                        <div class="score-line">{{ getDisplayScore(game)?.homeScore ?? '-' }}</div>
                        <div class="score-line">{{ getDisplayScore(game)?.awayScore ?? '-' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="gamesByRound[roundNum].scheduled.length" class="status-block">
                <div class="status-title scheduled">
                  <v-icon icon="mdi-calendar-clock" size="16" class="mr-2" />
                  TBP ({{ gamesByRound[roundNum].scheduled.length }})
                </div>
                <div
                  v-for="dayItem in getGamesByDayGrouped(gamesByRound[roundNum].scheduled)"
                  :key="dayItem.date"
                  class="day-block"
                >
                  <div class="day-header">
                    <v-icon icon="mdi-calendar" size="14" class="mr-2" />
                    {{ dayItem.date }}
                  </div>
                  <div class="games-list">
                    <div
                      v-for="game in dayItem.games"
                      :key="game.gameCode"
                      class="game-row"
                      @click="navigateTo(`/games/${selectedSeasonCode}/${game.gameCode}`)"
                    >
                      <div class="game-time">
                        <div class="time">{{ formatGameTime(game.gameDate) }}</div>
                        <div class="status">{{ gameStatusLabel(game) }}</div>
                      </div>
                      <div class="game-teams">
                        <div class="team-row">
                          <v-avatar size="22" color="#e0e6f0">
                            <v-img
                              v-if="game.homeTeamImage"
                              :src="game.homeTeamImage"
                              :alt="game.homeTeamName"
                              :cover="false"
                              class="team-avatar-img"
                            />
                            <span v-else class="team-code">{{ game.homeTeamCode?.substring(0, 3) }}</span>
                          </v-avatar>
                          <span class="team-name">{{ game.homeTeamName }}</span>
                        </div>
                        <div class="team-row">
                          <v-avatar size="22" color="#e0e6f0">
                            <v-img
                              v-if="game.awayTeamImage"
                              :src="game.awayTeamImage"
                              :alt="game.awayTeamName"
                              :cover="false"
                              class="team-avatar-img"
                            />
                            <span v-else class="team-code">{{ game.awayTeamCode?.substring(0, 3) }}</span>
                          </v-avatar>
                          <span class="team-name">{{ game.awayTeamName }}</span>
                        </div>
                      </div>
                      <div class="game-score muted">
                        <div class="score-line">-</div>
                        <div class="score-line">-</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { Game } from '~/types'

const props = defineProps<{
  games: Game[]
  selectedSeasonCode: string | undefined
}>()

const api = useApi()
const { toAthensDate } = useTimeZone()
const selectedRoundTab = ref<number | null>(null)
const liveMap = ref<Record<number, { isLive: boolean; homeScore: number | null; awayScore: number | null; minuteLabel?: string | null }>>({})
const livePollId = ref<number | null>(null)

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

  const updates: Record<number, { isLive: boolean; homeScore: number | null; awayScore: number | null; minuteLabel?: string | null }> = {}
  await Promise.all(
    scheduled.map(async (game) => {
      try {
        const liveData = await fetchLiveForGame(seasonCode, game.gameCode)
        updates[game.gameCode] = liveData
      } catch {
        updates[game.gameCode] = { isLive: false, homeScore: null, awayScore: null, minuteLabel: null }
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

const formatGameTime = (value?: string) => {
  if (!value) return '--:--'
  const date = new Date(value)
  const athens = toAthensDate(date) ?? date
  return new Intl.DateTimeFormat('el-GR', { hour: '2-digit', minute: '2-digit' }).format(athens)
}

const gameStatusLabel = (game: Game) => {
  if (isGameLive(game)) {
    const minute = getLiveScore(game)?.minuteLabel
    return minute ? `LIVE ${minute}` : 'LIVE'
  }
  if (game.played || isFinishedFromLive(game)) return 'Final'
  return 'TBP'
}
</script>

<style scoped>
.games-mobile-card {
  background: #ffffff;
  border: 1px solid #e0e6f0;
  border-radius: 16px;
}

.mobile-round-tabs {
  background: #ffffff;
  border-bottom: 1px solid #e5eaf3;
}

:deep(.mobile-round-tabs .v-tab) {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a92a2;
  padding-inline: 14px;
}

:deep(.mobile-round-tabs .v-tab--selected) {
  color: #F05323;
}

:deep(.mobile-round-tabs .v-tab__slider) {
  height: 3px;
  border-radius: 999px;
  background: #F05323 !important;
}

.mobile-round-tabs :deep(.v-slide-group__content) {
  border-bottom: 2px solid transparent;
}

.mobile-round-tabs :deep(.v-slide-group__prev),
.mobile-round-tabs :deep(.v-slide-group__next) {
  color: #F05323;
  opacity: 0.7;
}

.mobile-round-tabs :deep(.v-slide-group__prev:hover),
.mobile-round-tabs :deep(.v-slide-group__next:hover) {
  opacity: 1;
}

.round-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-title {
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a2742;
}

.status-title.live {
  color: #28a745;
}

.status-title.scheduled {
  color: #516078;
}

.day-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.day-header {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  color: #8a92a2;
  font-weight: 600;
}

.games-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.game-row {
  display: grid;
  grid-template-columns: 56px 1fr 40px;
  gap: 0.75rem;
  padding: 0.5rem 0.35rem;
  border-radius: 12px;
  background: #f9fafb;
  cursor: pointer;
}

.game-row:hover {
  background: #f2f5f9;
}

.game-time {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.7rem;
  color: #516078;
}

.game-time .time {
  font-weight: 700;
  color: #1a2742;
}

.game-time .status {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8a92a2;
}

.game-time .status.live {
  color: #28a745;
}

.game-teams {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.team-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1a2742;
  min-width: 0;
}

.team-name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.team-code {
  font-size: 0.6rem;
  font-weight: 700;
  color: #516078;
}

.team-avatar-img {
  object-fit: contain;
}

.game-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0.25rem;
  font-weight: 700;
  color: #1a2742;
}

.game-score.muted {
  color: #8a92a2;
}

.score-line {
  min-width: 24px;
  text-align: right;
}

@media (max-width: 600px) {
  .game-row {
    grid-template-columns: 52px 1fr 32px;
  }
}
</style>
