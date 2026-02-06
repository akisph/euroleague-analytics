<template>
  <section class="dashboard-current-round">
    <SharedErrorAlert
      v-if="error"
      :error="error"
      @retry="loadGamesData"
      @dismiss="error = null"
    />

    <SharedLoadingState :loading="isLoading" message="Loading current round games...">
      <div class="section-card">
        <div class="section-header">
          <div>
            <div class="section-title">Current Round</div>
            <div class="section-subtitle">Round {{ currentRoundNumber ?? '-' }}</div>
          </div>
          <NuxtLink to="/games" class="section-link">View all</NuxtLink>
        </div>

        <div v-if="groupedGames.length" class="games-list">
          <div v-for="section in groupedGames" :key="section.key" class="game-section">
            <div class="section-status" :class="section.className">
              {{ section.label }} ({{ section.count }})
            </div>

            <div v-for="dateGroup in section.dates" :key="dateGroup.key" class="date-group">
              <div class="date-row">
                <v-icon icon="mdi-calendar-month" size="16" />
                <span>{{ dateGroup.label }}</span>
              </div>

              <div
                v-for="game in dateGroup.games"
                :key="game.gameCode"
                class="game-row"
                @click="navigateTo(`/games/${selectedSeasonCode}/${game.gameCode}`)"
              >
                <div class="game-time" :class="{ 'game-time--center': isMobile, 'game-time--center-desktop': !isMobile }">
                  <div
                    v-if="!isGameLive(game.gameCode) && !game.played && !isFinishedFromLive(game)"
                    class="time"
                  >
                    {{ formatGameTime(game.gameDate) }}
                  </div>
                  <div class="status" :class="statusClass(game)">
                    {{ gameStatusLabel(game) }}
                  </div>
                </div>

                <div class="game-teams">
                  <div class="team-row">
                    <v-avatar size="22" color="#e0e6f0">
                      <v-img v-if="game.homeTeamImage" :src="game.homeTeamImage" :alt="game.homeTeamName" />
                      <span v-else class="team-code">
                        {{ game.homeTeamCode?.substring(0, 3) }}
                      </span>
                    </v-avatar>
                    <span class="team-name">{{ game.homeTeamName }}</span>
                  </div>
                  <div class="team-row">
                    <v-avatar size="22" color="#e0e6f0">
                      <v-img v-if="game.awayTeamImage" :src="game.awayTeamImage" :alt="game.awayTeamName" />
                      <span v-else class="team-code">
                        {{ game.awayTeamCode?.substring(0, 3) }}
                      </span>
                    </v-avatar>
                    <span class="team-name">{{ game.awayTeamName }}</span>
                  </div>
                </div>

                <div class="game-score">
                  <div class="score-line">
                    <span>{{ displayScore(game)?.homeScore ?? '-' }}</span>
                  </div>
                  <div class="score-line">
                    <span>{{ displayScore(game)?.awayScore ?? '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SharedEmptyState
          v-else
          title="No Games"
          message="No games found for the current round."
          icon="mdi-basketball"
        />
      </div>
    </SharedLoadingState>
  </section>
</template>

<script setup lang="ts">
import type { Game } from '~/types'
import { useDisplay } from 'vuetify'

const seasonStore = useSeasonStore()
const { fetchSeasonGames, games } = useGames()
const { fetchSeasonRounds } = useRounds()
const api = useApi()
const { toAthensDate } = useTimeZone()
const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)

const isLoading = ref(true)
const error = ref<string | null>(null)
const liveMap = ref<Record<number, { isLive: boolean; homeScore: number | null; awayScore: number | null; minuteLabel?: string | null }>>({})
const livePollId = ref<number | null>(null)

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)

const parseGameTime = (value?: string) => {
  if (!value) return Number.NaN
  const iso = Date.parse(value)
  if (Number.isFinite(iso)) return iso
  const dateTime = value.trim().replace('T', ' ')
  const match = dateTime.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/)
  if (!match) return Number.NaN
  const day = Number(match[1])
  const month = Number(match[2]) - 1
  const year = Number(match[3])
  const hour = Number(match[4] ?? 0)
  const minute = Number(match[5] ?? 0)
  return new Date(year, month, day, hour, minute).getTime()
}

const currentRoundNumber = computed(() => {
  if (!games.value.length) return null
  const roundNumbers = [...new Set(games.value.map(g => g.roundNumber || 0))].sort((a, b) => b - a)
  const nowAthens = toAthensDate(Date.now())
  if (nowAthens) {
    let closestRound: number | null = null
    let closestDiff = Number.POSITIVE_INFINITY
    games.value.forEach((game) => {
      if (!game.gameDate) return
      const gameDate = new Date(game.gameDate)
      const gameAthens = toAthensDate(gameDate)
      if (!gameAthens) return
      const diff = Math.abs(gameAthens.getTime() - nowAthens.getTime())
      if (diff < closestDiff) {
        closestDiff = diff
        closestRound = game.roundNumber || 0
      }
    })
    if (closestRound !== null) return closestRound
  }
  return roundNumbers[0] ?? null
})

const currentRoundGames = computed(() => {
  if (!currentRoundNumber.value) return []
  return games.value
    .filter(g => (g.roundNumber || 0) === currentRoundNumber.value)
    .sort((a, b) => parseGameTime(a.gameDate) - parseGameTime(b.gameDate))
})

const formatGameDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  const athens = toAthensDate(date) ?? date
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(athens)
}

const gameStatusKey = (game: Game) => {
  if (isGameLive(game.gameCode)) return 'live'
  if (game.played || isFinishedFromLive(game)) return 'final'
  return 'tbp'
}

const groupedGames = computed(() => {
  const buckets: Record<string, Game[]> = {
    live: [],
    final: [],
    tbp: [],
  }

  currentRoundGames.value.forEach((game) => {
    buckets[gameStatusKey(game)].push(game)
  })

  const makeDateGroups = (items: Game[]) => {
    const map = new Map<string, Game[]>()
    items.forEach((game) => {
      const label = formatGameDate(game.gameDate)
      const key = label
      const list = map.get(key) ?? []
      list.push(game)
      map.set(key, list)
    })
    return Array.from(map.entries()).map(([key, gamesList]) => ({
      key,
      label: key,
      games: gamesList.sort((a, b) => parseGameTime(a.gameDate) - parseGameTime(b.gameDate)),
    }))
  }

  return [
    {
      key: 'live',
      label: 'LIVE',
      className: 'section-status--live',
      count: buckets.live.length,
      dates: makeDateGroups(buckets.live),
    },
    {
      key: 'final',
      label: 'FINAL',
      className: 'section-status--final',
      count: buckets.final.length,
      dates: makeDateGroups(buckets.final),
    },
    {
      key: 'tbp',
      label: 'TBP',
      className: 'section-status--tbp',
      count: buckets.tbp.length,
      dates: makeDateGroups(buckets.tbp),
    },
  ].filter((section) => section.count > 0)
})

const getLiveScore = (gameCode: number) => liveMap.value[gameCode]
const isGameLive = (gameCode: number) => Boolean(liveMap.value[gameCode]?.isLive)

const isFinishedFromLive = (game: Game) => {
  if (game.played) return false
  const live = getLiveScore(game.gameCode)
  if (!live || live.isLive) return false
  const home = live.homeScore ?? 0
  const away = live.awayScore ?? 0
  return home > 0 || away > 0
}

const displayScore = (game: Game) => {
  if (game.played) return { homeScore: game.homeScore ?? null, awayScore: game.awayScore ?? null }
  const live = getLiveScore(game.gameCode)
  if (live?.isLive) return { homeScore: live.homeScore ?? 0, awayScore: live.awayScore ?? 0 }
  if (isFinishedFromLive(game)) return { homeScore: live?.homeScore ?? 0, awayScore: live?.awayScore ?? 0 }
  return null
}

const pickLatestQuarterValue = (row: any) => {
  if (!row) return null
  const candidates = [row.quarter4, row.quarter3, row.quarter2, row.quarter1]
  for (const value of candidates) {
    if (typeof value === 'number' && value > 0) return value
  }
  return null
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

const loadLiveForRound = async () => {
  if (!selectedSeasonCode.value || !currentRoundGames.value.length) return
  const updates: Record<number, { isLive: boolean; homeScore: number | null; awayScore: number | null; minuteLabel?: string | null }> = {}
  await Promise.all(
    currentRoundGames.value.map(async (game) => {
      try {
        const liveData = await fetchLiveForGame(selectedSeasonCode.value as string, game.gameCode)
        updates[game.gameCode] = liveData
      } catch {
        updates[game.gameCode] = { isLive: false, homeScore: null, awayScore: null, minuteLabel: null }
      }
    }),
  )
  liveMap.value = { ...liveMap.value, ...updates }
}

const loadGamesData = async () => {
  if (!selectedSeasonCode.value) {
    isLoading.value = false
    return
  }
  isLoading.value = true
  error.value = null
  try {
    await Promise.all([
      fetchSeasonGames(selectedSeasonCode.value),
      fetchSeasonRounds(selectedSeasonCode.value),
    ])
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load games data'
  } finally {
    isLoading.value = false
  }
}

const formatGameTime = (value?: string) => {
  if (!value) return '--:--'
  const date = new Date(value)
  const athens = toAthensDate(date) ?? date
  return new Intl.DateTimeFormat('el-GR', { hour: '2-digit', minute: '2-digit' }).format(athens)
}

const gameStatusLabel = (game: Game) => {
  if (isGameLive(game.gameCode)) {
    const minute = getLiveScore(game.gameCode)?.minuteLabel
    return minute ? `LIVE ${minute}` : 'LIVE'
  }
  if (game.played || isFinishedFromLive(game)) return 'Final'
  return 'TBP'
}

const statusClass = (game: Game) => {
  if (isGameLive(game.gameCode)) return 'status--live'
  if (game.played || isFinishedFromLive(game)) return 'status--final'
  return 'status--tbp'
}

watch(selectedSeasonCode, () => {
  loadGamesData()
}, { immediate: true })

watch([currentRoundNumber, selectedSeasonCode], () => {
  if (livePollId.value) {
    clearInterval(livePollId.value)
    livePollId.value = null
  }
  loadLiveForRound()
  livePollId.value = window.setInterval(() => {
    loadLiveForRound()
  }, 20000)
}, { immediate: true })

onBeforeUnmount(() => {
  if (livePollId.value) {
    clearInterval(livePollId.value)
    livePollId.value = null
  }
})
</script>

<style scoped>
.section-card {
  background: #ffffff;
  border: 1px solid #e0e6f0;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 10px 24px rgba(26, 39, 66, 0.08);
  max-height: 30vh;
  overflow: auto;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a2742;
}

.section-subtitle {
  font-size: 0.75rem;
  color: #8a92a2;
}

.section-link {
  font-size: 0.75rem;
  color: #F05323;
  text-decoration: none;
  font-weight: 600;
}

.games-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.game-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #1a2742;
}

.section-status--live {
  color: #28a745;
}

.section-status--final {
  color: #5aa7ff;
}

.section-status--tbp {
  color: #F05323;
}

.date-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-row {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: #6b7280;
  font-weight: 600;
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

.game-time--center {
  align-items: center;
  text-align: center;
  justify-content: center;
}

.game-time--center-desktop {
  align-items: center;
  text-align: center;
  justify-content: center;
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

.game-time .status.status--live {
  color: #28a745;
}

.game-time .status.status--final {
  color: #5aa7ff;
}

.game-time .status.status--tbp {
  color: #F05323;
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
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.team-code {
  font-size: 0.6rem;
  font-weight: 700;
  color: #516078;
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

.score-line {
  min-width: 24px;
  text-align: right;
}

@media (max-width: 600px) {
  .section-card {
    max-height: 32vh;
  }

  .game-row {
    grid-template-columns: 52px 1fr 32px;
  }

  .team-row {
    font-size: 0.75rem;
  }
}
</style>
