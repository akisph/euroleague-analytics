<template>
  <div class="club-mobile">
    <v-card class="club-header-card">
      <v-card-text class="pa-4">
        <div class="header-top">
          <v-avatar size="88" class="club-crest">
            <v-img
              v-if="club.images?.crest"
              :src="club.images.crest"
              :alt="club.name"
              :cover="false"
              class="club-crest-img"
            />
            <span v-else class="club-code">{{ club.code.substring(0, 3) }}</span>
          </v-avatar>
          <div class="header-text">
            <div class="club-name">{{ club.name }}</div>
            <div class="club-alias">{{ club.alias }}</div>
          </div>
        </div>

        <div class="chip-row">
          <v-chip v-if="club.country" size="small" variant="tonal" color="primary">
            <v-icon size="14" icon="mdi-flag" class="mr-1" />
            {{ club.country.name }}
          </v-chip>
          <v-chip v-if="club.city" size="small" variant="outlined">
            <v-icon size="14" icon="mdi-city-variant-outline" class="mr-1" />
            {{ club.city }}
          </v-chip>
          <v-chip v-if="club.isVirtual" size="small" color="warning" variant="flat">
            Virtual
          </v-chip>
        </div>

        <div class="link-row ">
          <v-btn v-if="club.website" :href="club.website" target="_blank" icon="mdi-web" size="small" variant="text" class="icon-btn" />
          <v-btn v-if="club.twitterAccount" :href="`https://twitter.com/${club.twitterAccount}`" target="_blank" icon="mdi-twitter" size="small" variant="text" class="icon-btn" />
          <v-btn v-if="club.instagramAccount" :href="`https://instagram.com/${club.instagramAccount}`" target="_blank" icon="mdi-instagram" size="small" variant="text" class="icon-btn" />
          <v-btn v-if="club.facebookAccount" :href="`https://facebook.com/${club.facebookAccount}`" target="_blank" icon="mdi-facebook" size="small" variant="text" class="icon-btn" />
          <v-btn
            v-if="club.ticketsUrl"
            :href="club.ticketsUrl"
            target="_blank"
            size="small" 
            variant="text" 
            class="icon-btn" 
            icon="mdi-ticket-confirmation-outline"
            
          />
        </div>

        <div class="more-row">
          <v-btn
            size="x-small"
            variant="text"
            class="more-btn"
            @click="showMore = !showMore"
          >
            {{ showMore ? 'Hide more' : 'Show more' }}
            <v-icon :icon="showMore ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="ml-1" />
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-expand-transition>
      <v-card v-show="showMore" class="club-more-card">
        <v-card-title class="more-title">
          <v-icon icon="mdi-information-variant" class="mr-2" />
          Club Details
        </v-card-title>
        <v-card-text class="pa-4">
          <div class="more-section" v-if="club.president || club.address || club.phone || club.fax || coachName || managerNames.length">
            <div class="more-section-title">Club Information</div>
            <div class="more-grid">
            <div class="more-item" v-if="club.president">
              <v-icon icon="mdi-account-tie" class="mr-2" />
              <div>
                <div class="more-label">President</div>
                <div class="more-value">{{ club.president }}</div>
              </div>
            </div>
            <div class="more-item" v-if="club.address">
              <v-icon icon="mdi-map-marker" class="mr-2" />
              <div>
                <div class="more-label">Address</div>
                <div class="more-value">{{ club.address }}</div>
              </div>
            </div>
            <div class="more-item" v-if="club.phone">
              <v-icon icon="mdi-phone" class="mr-2" />
              <div>
                <div class="more-label">Phone</div>
                <div class="more-value">{{ club.phone }}</div>
              </div>
            </div>
            <div class="more-item" v-if="club.fax">
              <v-icon icon="mdi-fax" class="mr-2" />
              <div>
                <div class="more-label">Fax</div>
                <div class="more-value">{{ club.fax }}</div>
              </div>
            </div>
            <div class="more-item" v-if="coachName">
              <v-icon icon="mdi-account-tie" class="mr-2" />
              <div>
                <div class="more-label">Coach</div>
                <div class="more-value">{{ coachName }}</div>
              </div>
            </div>
            <div class="more-item" v-if="managerNames.length">
              <v-icon icon="mdi-clipboard-account" class="mr-2" />
              <div>
                <div class="more-label">Managers</div>
                <div class="more-value">{{ managerNames.join(', ') }}</div>
              </div>
            </div>
          </div>
          </div>

          <div class="more-section" v-if="club.venue">
            <div class="more-section-title">Home Arena</div>
            <div class="arena-row">
              <v-avatar size="48" class="mr-3">
                <v-img
                  v-if="club.venue.images && Object.keys(club.venue.images).length"
                  :src="Object.values(club.venue.images)[0]"
                  :alt="club.venue.name"
                  :cover="false"
                  class="club-crest-img"
                />
                <v-icon v-else icon="mdi-stadium" size="22" />
              </v-avatar>
              <div>
                <div class="more-value">{{ club.venue.name }}</div>
                <div class="more-label">{{ club.venue.address }}</div>
              </div>
            </div>
          </div>

          <div class="more-section" v-if="clubInfo?.info">
            <div class="more-section-title">Club History</div>
            <div v-html="clubInfo.info" class="club-history-content" />
          </div>
        </v-card-text>
      </v-card>
    </v-expand-transition>
    <v-card class="club-tabs-card">
      <v-tabs v-model="activeTab" align-tabs="start" class="club-tabs" height="40">
        <v-tab value="stats">Stats</v-tab>
        <v-tab value="games">Games</v-tab>
        <v-tab value="roster">Roster</v-tab>
      </v-tabs>
      <v-divider />
      <v-window v-model="activeTab" class="club-tabs-window">
        <v-window-item value="stats">
          <v-card-text class="tab-section">
            <div v-if="teamStatsRow" class="team-stats-card">
              <div class="team-stats-section">
                <div class="team-stats-title">Average Per Game</div>
                <div class="team-stats-list">
                  <div v-for="item in averageStats" :key="`avg-${item.key}`" class="stat-row">
                    <span class="stat-label">{{ item.label }}</span>
                    <span class="stat-value">{{ formatStatValue(item.value) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <SharedEmptyState
              v-else
              title="No stats available"
              message="Team statistics are not available for this season."
              icon="mdi-chart-box-outline"
            />
          </v-card-text>
        </v-window-item>

        <v-window-item value="games">
          <v-card-text class="tab-section">
            <SharedErrorAlert
              v-if="gamesError"
              :error="gamesError"
              @retry="$emit('retry-games')"
              @dismiss="$emit('dismiss-games-error')"
            />
            <SharedLoadingState :loading="isGamesLoading" message="Loading games...">
              <div class="section-card">
                <div class="section-header">
                  <div>
                    <div class="section-title">Season Games</div>
                    <div class="section-subtitle">{{ filteredGames.length }} games</div>
                  </div>
                  <v-chip-group
                    v-model="gamesFilter"
                    class="games-filter"
                    mandatory
                    selected-class="is-selected"
                  >
                    <v-chip value="all" size="small" variant="outlined">All</v-chip>
                    <v-chip value="next" size="small" variant="outlined">Next Matches</v-chip>
                    <v-chip value="last" size="small" variant="outlined">Last Matches</v-chip>
                  </v-chip-group>
                </div>

                <div v-if="filteredGames.length" class="games-list">
                  <div
                    v-for="game in filteredGames"
                    :key="game.gameCode"
                    class="game-row"
                    @click="navigateTo(`/games/${seasonCode}/${game.gameCode}`)"
                  >
                    <div class="game-time ">
                      <div class="status">{{ gameStatusLabel(game) }}</div>
                      <div v-if="isFinalGame(game)" class="status-sub result-tag" :class="resultClass(game)">
                        {{ resultLabel(game) }}
                      </div>
                    </div>

                    <div class="game-teams">
                      <div class="game-meta">
                        <span class="round-pill">R{{ game.roundNumber ?? '-' }}</span>
                        <span class="date-text">
                          {{ formatGameDate(game.gameDate) }}
                          <span v-if="isScheduledGame(game)" class="time-inline">({{ formatGameTime(game.gameDate) }})</span>
                        </span>
                      </div>
                      <div class="team-row">
                        <v-avatar size="22" color="#e0e6f0">
                          <v-img v-if="game.homeTeamImage" :src="game.homeTeamImage" :alt="game.homeTeamName" :cover="false" />
                        </v-avatar>
                        <span class="team-name">{{ game.homeTeamName }}</span>
                      </div>
                      <div class="team-row">
                        <v-avatar size="22" color="#e0e6f0">
                          <v-img v-if="game.awayTeamImage" :src="game.awayTeamImage" :alt="game.awayTeamName" :cover="false" />
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

                <SharedEmptyState
                  v-else
                  title="No games available"
                  message="No games found for this team in the selected season."
                  icon="mdi-calendar-remove"
                />
              </div>
            </SharedLoadingState>
          </v-card-text>
        </v-window-item>

        <v-window-item value="roster">
          <v-card-text class="tab-section">
            <SharedErrorAlert
              v-if="rosterError"
              :error="rosterError"
              @retry="$emit('retry-roster')"
              @dismiss="$emit('dismiss-roster-error')"
            />
            <SharedLoadingState :loading="isRosterLoading" message="Loading roster...">
  <div v-if="rosterPlayers.length" class="roster-list">
    <div
      v-for="player in rosterPlayers"
      :key="player.playerCode"
      class="roster-row"
      :class="{ 'roster-inactive': player.active === false }"
      @click="navigateTo(`/players/${seasonCode}/${player.playerCode}`)"
    >
      <v-avatar size="40" class="player-avatar">
        <v-img
          v-if="player.imageUrl"
          :src="player.imageUrl"
          :alt="player.name"
          :cover="false"
          class="player-avatar-img"
        />
        <span v-else class="player-avatar-fallback">
          {{ getInitials(player.name) }}
        </span>
      </v-avatar>

      <div class="player-main">
        <div class="player-top">
                      <div class="player-name">
                        {{ player.name }}
                        <span class="player-number">(#{{ player.dorsal ?? '-' }})</span>
                      </div>
                      <div class="player-team">{{ player.position || '-' }}</div>
        </div>
        <div class="player-stats">
          <div class="stat">
            <span class="stat-label">PIR</span>
            <span class="stat-value">{{ formatValue(getRosterStat(player, 'pir')) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">PTS</span>
            <span class="stat-value">{{ formatValue(getRosterStat(player, 'pts')) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">REB</span>
            <span class="stat-value">{{ formatValue(getRosterStat(player, 'reb')) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">AST</span>
            <span class="stat-value">{{ formatValue(getRosterStat(player, 'ast')) }}</span>
          </div>
        </div>
      </div>

      <v-icon icon="mdi-chevron-right" class="row-chevron" />
    </div>
  </div>
  <SharedEmptyState
    v-else
    title="No roster available"
    message="Roster data is not available for this club/season."
    icon="mdi-account-off"
  />
</SharedLoadingState>
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

interface Props {
  club: any
  clubInfo: any
  coachName: string
  managerNames: string[]
  rosterPlayers: any[]
  rosterHeaders: any[]
  rosterError: string | null
  isRosterLoading: boolean
  teamStats: any
  gamesError: string | null
  isGamesLoading: boolean
  teamGames: any[]
  seasonCode: string | undefined
}

const props = defineProps<Props>()
const { club } = toRefs(props)
defineEmits(['retry-games', 'dismiss-games-error', 'retry-roster', 'dismiss-roster-error'])

const router = useRouter()
const navigateTo = (path: string) => {
  router.push(path)
}

const showMore = ref(false)
const activeTab = ref('stats')
const gamesFilter = ref<'next' | 'last' | 'all'>('all')

const formatGameTime = (value?: string) => {
  if (!value) return '--:--'
  const date = new Date(value)
  return new Intl.DateTimeFormat('el-GR', { hour: '2-digit', minute: '2-digit' }).format(date)
}

const formatGameDate = (value?: string) => {
  if (!value) return '--'
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const gameStatusLabel = (game: any) => {
  if (game?.played) return 'FINAL'
  return 'TBD'
}

const isScheduledGame = (game: any) => !game?.played

const isFinalGame = (game: any) => game?.played

const displayScore = (game: any) => {
  if (!game?.played) return null
  return { homeScore: game.homeScore ?? null, awayScore: game.awayScore ?? null }
}

const filteredGames = computed(() => {
  const sortedAsc = [...props.teamGames].sort((a: any, b: any) => {
    const aDate = a?.gameDate ? new Date(a.gameDate).getTime() : 0
    const bDate = b?.gameDate ? new Date(b.gameDate).getTime() : 0
    return aDate - bDate
  })

  if (gamesFilter.value === 'all') return sortedAsc
  if (gamesFilter.value === 'next') {
    return sortedAsc.filter((g: any) => !g?.played)
  }
  return sortedAsc.filter((g: any) => g?.played).reverse()
})

const teamStatsRow = computed(() => {
  const data = props.teamStats
  if (Array.isArray(data) && data.length) {
    return [...data].sort((a, b) => (b?.gamesPlayed ?? 0) - (a?.gamesPlayed ?? 0))[0]
  }
  return data || null
})

const teamAverage = (key: 'pir' | 'pts' | 'reb' | 'ast') => {
  const row = teamStatsRow.value
  if (!row) return null
  const gamesPlayed = Number(row.gamesPlayed ?? 0)
  if (!Number.isFinite(gamesPlayed) || gamesPlayed <= 0) return null

  if (key === 'pir') return Number(row.valuation ?? 0) / gamesPlayed
  if (key === 'pts') return Number(row.score ?? 0) / gamesPlayed
  if (key === 'reb') return Number(row.totalRebounds ?? 0) / gamesPlayed
  if (key === 'ast') return Number(row.assistances ?? 0) / gamesPlayed
  return null
}

const accumulatedStats = computed(() => {
  const row = teamStatsRow.value
  if (!row) return []
  const source = row.accumulated ?? row
  return [
    { key: 'gp', label: 'GP', value: source.gamesPlayed },
    { key: 'min', label: 'MIN', value: source.timePlayed },
    { key: 'pir', label: 'PIR', value: source.valuation },
    { key: 'pts', label: 'PTS', value: source.points },
    { key: 'reb', label: 'REB', value: source.totalRebounds },
    { key: 'oreb', label: 'OREB', value: source.offensiveRebounds },
    { key: 'dreb', label: 'DREB', value: source.defensiveRebounds },
    { key: 'ast', label: 'AST', value: source.assistances },
    { key: 'stl', label: 'STL', value: source.steals },
    { key: 'blk', label: 'BLK', value: source.blocksFavour },
    { key: 'blkA', label: 'BLK A', value: source.blocksAgainst },
    { key: 'to', label: 'TO', value: source.turnovers },
    { key: 'pf', label: 'PF', value: source.foulsCommited },
    { key: 'rf', label: 'RF', value: source.foulsReceived },
    { key: 'fg2m', label: '2PM', value: source.fieldGoalsMade2 },
    { key: 'fg2a', label: '2PA', value: source.fieldGoalsAttempted2 },
    { key: 'fg3m', label: '3PM', value: source.fieldGoalsMade3 },
    { key: 'fg3a', label: '3PA', value: source.fieldGoalsAttempted3 },
    { key: 'ftm', label: 'FTM', value: source.freeThrowsMade },
    { key: 'fta', label: 'FTA', value: source.freeThrowsAttempted },
    { key: 'pm', label: '+/-', value: source.plusMinus },
  ]
})

const averageStats = computed(() => {
  const row = teamStatsRow.value
  if (!row) return []
  const source = row.averagePerGame ?? row
  return [
    { key: 'gp', label: 'Games Played', value: source.gamesPlayed },
    { key: 'pir', label: 'Performance Index', value: source.valuation },
    { key: 'pts', label: 'Points', value: source.points },
    { key: 'reb', label: 'Total Rebounds', value: source.totalRebounds },
    { key: 'oreb', label: 'Offensive Rebounds', value: source.offensiveRebounds },
    { key: 'dreb', label: 'Defensive Rebounds', value: source.defensiveRebounds },
    { key: 'ast', label: 'Assists', value: source.assistances },
    { key: 'stl', label: 'Steals', value: source.steals },
    { key: 'blk', label: 'Blocks For', value: source.blocksFavour },
    { key: 'blkA', label: 'Blocks Against', value: source.blocksAgainst },
    { key: 'to', label: 'Turnovers', value: source.turnovers },
    { key: 'pf', label: 'Fouls Committed', value: source.foulsCommited },
    { key: 'rf', label: 'Fouls Received', value: source.foulsReceived },
    { key: 'fg2', label: '2PT Made/Attempted', value: formatRatio(source.fieldGoalsMade2, source.fieldGoalsAttempted2) },
    { key: 'fg3', label: '3PT Made/Attempted', value: formatRatio(source.fieldGoalsMade3, source.fieldGoalsAttempted3) },
    { key: 'ft', label: 'FT Made/Attempted', value: formatRatio(source.freeThrowsMade, source.freeThrowsAttempted) },
    { key: 'pm', label: 'Plus/Minus', value: source.plusMinus },
  ]
})


const resultLabel = (game: any) => {
  if (!game?.played) return ''
  const isHome = game?.homeTeamCode === club.value?.code
  const home = game?.homeScore ?? 0
  const away = game?.awayScore ?? 0
  if (home === away) return 'T'
  const won = isHome ? home > away : away > home
  return won ? 'W' : 'L'
}

const resultClass = (game: any) => {
  const label = resultLabel(game)
  if (label === 'W') return 'win'
  if (label === 'L') return 'loss'
  return 'neutral'
}

const getInitials = (name: string) => {
  const names = String(name || '').trim().split(' ').filter(Boolean)
  if (!names.length) return '-'
  if (names.length >= 2) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  return names[0].substring(0, 2).toUpperCase()
}

const formatValue = (value: number | null | undefined) => {
  if (!Number.isFinite(value)) return '-'
  return Number(value).toFixed(2)
}

const formatStatValue = (value: string | number | null | undefined) => {
  if (typeof value === 'string') return value
  return formatValue(value)
}

const formatRatio = (made?: number, attempted?: number) => {
  const madeNum = Number(made)
  const attNum = Number(attempted)
  if (!Number.isFinite(madeNum) && !Number.isFinite(attNum)) return '-/-'
  const left = Number.isFinite(madeNum) ? madeNum.toFixed(2) : '-'
  const right = Number.isFinite(attNum) ? attNum.toFixed(2) : '-'
  const pct = Number.isFinite(madeNum) && Number.isFinite(attNum) && attNum > 0
    ? `${Math.round((madeNum / attNum) * 100)}%`
    : '--%'
  return `${pct} (${left}/${right})`
}

const getRosterStat = (player: any, key: 'pir' | 'pts' | 'reb' | 'ast') => {
  const stats = player?.playerStats || player?.stats || player?.statistics || {}
  const gamesPlayed = Number(
    stats.gamesPlayed ?? stats.gp ?? stats.games ?? stats.played ?? 0,
  )
  const avg = (value: number | null | undefined) => {
    if (!Number.isFinite(value)) return null
    if (!Number.isFinite(gamesPlayed) || gamesPlayed <= 0) return null
    return Number(value) / gamesPlayed
  }

  if (key === 'pir') {
    const total = stats.valuation ?? stats.pir ?? player?.calculatedPIR ?? null
    return avg(Number(total))
  }
  if (key === 'pts') {
    const total = stats.points ?? stats.pts ?? player?.calculatedPPG ?? null
    return avg(Number(total))
  }
  if (key === 'reb') {
    const total = stats.totalRebounds ?? stats.rebounds ?? stats.reb ?? player?.calculatedRPG ?? null
    return avg(Number(total))
  }
  if (key === 'ast') {
    const total = stats.assistances ?? stats.assists ?? stats.assistance ?? stats.ast ?? player?.calculatedAPG ?? null
    return avg(Number(total))
  }
  return null
}
</script>

<style scoped>
.club-mobile {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.club-header-card {
  border-radius: 16px;
}

.header-top {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.club-crest {
  flex-shrink: 0;
}

.club-crest-img {
  object-fit: contain;
}

.club-code {
  font-size: 1rem;
  font-weight: 800;
  color: #1a2742;
}

.header-text {
  min-width: 0;
}

.club-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a2742;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.club-alias {
  font-size: 0.85rem;
  color: #1a2742;
  opacity: 0.75;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.6rem;
}

.chip-row :deep(.v-chip) {
  background: rgba(26, 39, 66, 0.08) !important;
  color: #1a2742 !important;
  border-color: rgba(26, 39, 66, 0.25) !important;
}

.link-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.6rem;
}

.more-row {
  margin-top: 0.35rem;
  display: flex;
  justify-content: center;
}

.icon-btn {
  color: #1a2742;
  background: transparent !important;
  padding-inline: 4px;
}

.tickets-btn {
  color: #F05323 !important;
  letter-spacing: 0.05em;
  padding-inline: 0;
}

.more-btn {
  color: #1a2742;
  background: transparent !important;
  padding-inline: 4px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.club-more-card {
  border-radius: 16px;
}

.more-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a2742;
}

.more-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.6rem;
}

.more-item {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.more-label {
  font-size: 0.7rem;
  color: #1a2742;
  opacity: 0.65;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.more-value {
  font-size: 0.85rem;
  color: #1a2742;
  font-weight: 600;
}

.more-section {
  margin-top: 0.9rem;
}

.more-section-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1a2742;
  margin-bottom: 0.4rem;
}

.arena-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.club-tabs-card {
  border-radius: 16px;
  overflow: hidden;
}

.club-tabs :deep(.v-tab) {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #1a2742;
  opacity: 0.6;
}

.club-tabs :deep(.v-tab--selected) {
  color: #1a2742;
  opacity: 1;
}

.club-tabs :deep(.v-tab__slider) {
  height: 2px;
  background: #F05323;
}

.club-tabs-window {
  min-height: 240px;
}

.tab-section {
  color: #1a2742;
}


.club-history-content {
  line-height: 1.6;
}

.club-history-content :deep(p) {
  margin-bottom: 0.75rem;
}

.section-card {
  background: #ffffff;
  border: 1px solid #e0e6f0;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 10px 24px rgba(26, 39, 66, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  gap: 0.6rem;
  flex-wrap: wrap;
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

.games-filter :deep(.v-chip) {
  text-transform: none;
  font-size: 0.7rem;
  color: #1a2742;
  border-color: rgba(26, 39, 66, 0.25) !important;
}

.games-filter :deep(.v-chip.is-selected) {
  background: rgba(26, 39, 66, 0.12) !important;
  color: #1a2742 !important;
  border-color: rgba(26, 39, 66, 0.4) !important;
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
  justify-content: center;
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
  text-align: center;

  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8a92a2;
}

.game-time .status-sub {
  text-align: center;
  font-size: 0.62rem;
  font-weight: 700;
  color: #516078;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.game-time .status.live {
  color: #28a745;
}

.game-teams {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.game-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: #516078;
}

.round-pill {
  background: rgba(26, 39, 66, 0.08);
  color: #1a2742;
  font-weight: 700;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.65rem;
}

.date-text {
  font-weight: 600;
  letter-spacing: 0.02em;
}

.time-inline {
  font-weight: 600;
  color: #516078;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.team-code {
  font-size: 0.6rem;
  font-weight: 700;
  color: #516078;
}

.roster-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.roster-row {
  display: grid;
  grid-template-columns: 44px 1fr 20px;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.65rem;
  background: #f9fafb;
  border-radius: 14px;
  cursor: pointer;
}

.roster-row:hover {
  background: #f0f7ff;
}

.player-avatar {
  background: #eef1f6;
  color: #1a2742;
  font-weight: 600;
}

.player-avatar-img {
  object-fit: contain;
}

.player-avatar-fallback {
  font-size: 0.75rem;
  font-weight: 600;
}

.player-main {
  min-width: 0;
}

.player-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.player-name {
  font-size: 0.86rem;
  font-weight: 600;
  color: #1a2742;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-number {
  font-size: 0.72rem;
  color: #8a92a2;
  font-weight: 600;
  margin-left: 4px;
}

.player-team {
  font-size: 0.7rem;
  font-weight: 600;
  color: #8a92a2;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex: 0 0 auto;
}

.player-stats {
  margin-top: 0.35rem;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.35rem;
}

.team-stats-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.team-stats-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.team-stats-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #516078;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.team-stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.5rem;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e8edf6;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.62rem;
  color: #8a92a2;
  font-weight: 600;
  letter-spacing: 0.06em;
  flex: 1 1 auto;
}

.stat-value {
  font-size: 0.78rem;
  font-weight: 600;
  color: #1a2742;
  opacity: 0.85;
}

.row-chevron {
  color: #8a92a2;
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

.result-tag {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.result-tag.win {
  color: #1e7e34;
}

.result-tag.loss {
  color: #c82333;
}

.result-tag.neutral {
  color: #516078;
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

@media (max-width: 420px) {
  .player-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.roster-avatar :deep(img) {
  object-fit: contain !important;
}

.roster-inactive {
  opacity: 0.55;
}

.roster-link {
  color: inherit;
  text-decoration: none;
}

.roster-link:hover {
  text-decoration: underline;
}
</style>
