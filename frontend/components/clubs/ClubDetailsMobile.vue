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
        <v-tab value="games">Games</v-tab>
        <v-tab value="roster">Roster</v-tab>
      </v-tabs>
      <v-divider />
      <v-window v-model="activeTab" class="club-tabs-window">
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
                    <div class="section-subtitle">{{ teamGames.length }} games</div>
                  </div>
                </div>

                <div v-if="teamGames.length" class="games-list">
                  <div
                    v-for="game in teamGames"
                    :key="game.gameCode"
                    class="game-row"
                    @click="navigateTo(`/games/${seasonCode}/${game.gameCode}`)"
                  >
                    <div class="game-time">
                      <div class="status">{{ gameStatusLabel(game) }}</div>
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
                          <span v-else class="team-code">
                            {{ game.homeTeamCode?.substring(0, 3) }}
                          </span>
                        </v-avatar>
                        <span class="team-name">{{ game.homeTeamName }}</span>
                      </div>
                      <div class="team-row">
                        <v-avatar size="22" color="#e0e6f0">
                          <v-img v-if="game.awayTeamImage" :src="game.awayTeamImage" :alt="game.awayTeamName" :cover="false" />
                          <span v-else class="team-code">
                            {{ game.awayTeamCode?.substring(0, 3) }}
                          </span>
                        </v-avatar>
                        <span class="team-name">{{ game.awayTeamName }}</span>
                      </div>
                    </div>

                    <div class="game-score">
                      <div class="result-pill" :class="resultClass(game)">
                        {{ resultLabel(game) }}
                      </div>
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
          <div class="player-name">{{ player.name }}</div>
          <div class="player-team">{{ club.code }}</div>
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
import { toRefs } from 'vue'

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

const props = defineProps<Props>()
const { club } = toRefs(props)
defineEmits(['retry-games', 'dismiss-games-error', 'retry-roster', 'dismiss-roster-error'])

const router = useRouter()
const navigateTo = (path: string) => {
  router.push(path)
}

const showMore = ref(false)
const activeTab = ref('games')

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
  return 'SCHEDULED'
}

const isScheduledGame = (game: any) => !game?.played

const displayScore = (game: any) => {
  if (!game?.played) return null
  return { homeScore: game.homeScore ?? null, awayScore: game.awayScore ?? null }
}

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

.stat {
  background: #ffffff;
  border: 1px solid #e8edf6;
  border-radius: 10px;
  padding: 0.3rem 0.35rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 0.62rem;
  color: #8a92a2;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.stat-value {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1a2742;
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

.result-pill {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
}

.result-pill.win {
  background: rgba(40, 167, 69, 0.12);
  color: #1e7e34;
}

.result-pill.loss {
  background: rgba(220, 53, 69, 0.12);
  color: #c82333;
}

.result-pill.neutral {
  background: rgba(26, 39, 66, 0.08);
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
