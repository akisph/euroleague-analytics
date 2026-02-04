<template>
  <v-row>
    <!-- Club Header Card -->
    <v-col cols="12">
      <v-card class="mb-6">
        <v-card-text class="pa-6">
          <div class="d-flex flex-column flex-md-row align-center">
            <v-avatar size="120" class="mb-4 mb-md-0 mr-md-6">
              <v-img
                v-if="club.images?.crest"
                :src="club.images.crest"
                :alt="club.name"
                :cover="false"
                class="club-crest-img"
              />
              <span v-else class="text-h3 font-weight-bold">
                {{ club.code.substring(0, 3) }}
              </span>
            </v-avatar>
            <div class="text-center text-md-left flex-grow-1 club-header-meta">
              <h1 class="text-h4 font-weight-bold mb-1">{{ club.name }}</h1>
              <div class="club-alias">{{ club.alias }}</div>
              <div class="chip-row">
                <v-chip v-if="club.country" size="small" color="primary" variant="tonal">
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
              <div class="link-row">
                <v-btn
                  v-if="club.website"
                  :href="club.website"
                  target="_blank"
                  icon="mdi-web"
                  size="small"
                  variant="text"
                  class="icon-btn"
                />
                <v-btn
                  v-if="club.twitterAccount"
                  :href="`https://twitter.com/${club.twitterAccount}`"
                  target="_blank"
                  icon="mdi-twitter"
                  size="small"
                  variant="text"
                  class="icon-btn"
                />
                <v-btn
                  v-if="club.instagramAccount"
                  :href="`https://instagram.com/${club.instagramAccount}`"
                  target="_blank"
                  icon="mdi-instagram"
                  size="small"
                  variant="text"
                  class="icon-btn"
                />
                <v-btn
                  v-if="club.facebookAccount"
                  :href="`https://facebook.com/${club.facebookAccount}`"
                  target="_blank"
                  icon="mdi-facebook"
                  size="small"
                  variant="text"
                  class="icon-btn"
                />
                <v-btn
                  v-if="club.ticketsUrl"
                  :href="club.ticketsUrl"
                  target="_blank"
                  size="small"
                  variant="text"
                  color="primary"
                  class="tickets-btn icon-btn"
                >
                  <v-icon icon="mdi-ticket-confirmation-outline" />
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card>
        <v-card-text class="d-flex align-center justify-space-between">
          <div class="text-subtitle-1 font-weight-bold">Club Details</div>
          <v-btn variant="text" size="small" class="more-btn" @click="showMore = !showMore">
            {{ showMore ? 'Hide more' : 'Show more' }}
            <v-icon :icon="showMore ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="ml-1" />
          </v-btn>
        </v-card-text>
        <v-expand-transition>
          <div v-show="showMore">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-card class="h-100">
                    <v-card-title>
                      <v-icon icon="mdi-information" class="mr-2" />
                      Club Information
                    </v-card-title>
                    <v-card-text>
                      <v-list density="compact">
                        <v-list-item v-if="club.president">
                          <template #prepend>
                            <v-icon icon="mdi-account-tie" class="mr-3" />
                          </template>
                          <v-list-item-title>President</v-list-item-title>
                          <v-list-item-subtitle>{{ club.president }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="club.address">
                          <template #prepend>
                            <v-icon icon="mdi-map-marker" class="mr-3" />
                          </template>
                          <v-list-item-title>Address</v-list-item-title>
                          <v-list-item-subtitle>{{ club.address }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="club.phone">
                          <template #prepend>
                            <v-icon icon="mdi-phone" class="mr-3" />
                          </template>
                          <v-list-item-title>Phone</v-list-item-title>
                          <v-list-item-subtitle>{{ club.phone }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="club.fax">
                          <template #prepend>
                            <v-icon icon="mdi-fax" class="mr-3" />
                          </template>
                          <v-list-item-title>Fax</v-list-item-title>
                          <v-list-item-subtitle>{{ club.fax }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="coachName">
                          <template #prepend>
                            <v-icon icon="mdi-account-tie" class="mr-3" />
                          </template>
                          <v-list-item-title>Coach</v-list-item-title>
                          <v-list-item-subtitle>{{ coachName }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="managerNames.length">
                          <template #prepend>
                            <v-icon icon="mdi-clipboard-account" class="mr-3" />
                          </template>
                          <v-list-item-title>Team Managers</v-list-item-title>
                          <v-list-item-subtitle>{{ managerNames.join(', ') }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card class="h-100">
                    <v-card-title>
                      <v-icon icon="mdi-stadium" class="mr-2" />
                      Home Arena
                    </v-card-title>
                    <v-card-text v-if="club.venue">
                      <div class="d-flex align-center mb-4">
                        <v-avatar size="60" class="mr-4">
                          <v-img
                            v-if="club.venue.images && Object.keys(club.venue.images).length"
                            :src="Object.values(club.venue.images)[0]"
                            :alt="club.venue.name"
                            :cover="false"
                            class="club-crest-img"
                          />
                          <v-icon v-else icon="mdi-stadium" size="30" />
                        </v-avatar>
                        <div>
                          <div class="text-h6 font-weight-bold">{{ club.venue.name }}</div>
                          <div class="text-body-2 text-medium-emphasis">{{ club.venue.code }}</div>
                        </div>
                      </div>
                      <v-list density="compact">
                        <v-list-item v-if="club.venue.capacity">
                          <template #prepend>
                            <v-icon icon="mdi-account-group" class="mr-3" />
                          </template>
                          <v-list-item-title>Capacity</v-list-item-title>
                          <v-list-item-subtitle>{{ club.venue.capacity.toLocaleString() }} seats</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="club.venue.address">
                          <template #prepend>
                            <v-icon icon="mdi-map-marker" class="mr-3" />
                          </template>
                          <v-list-item-title>Address</v-list-item-title>
                          <v-list-item-subtitle>{{ club.venue.address }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="club.venue.notes">
                          <template #prepend>
                            <v-icon icon="mdi-note-text" class="mr-3" />
                          </template>
                          <v-list-item-title>Notes</v-list-item-title>
                          <v-list-item-subtitle>{{ club.venue.notes }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                      <v-chip v-if="club.venue.active" color="success" variant="flat" size="small" class="mt-2">
                        <v-icon size="14" icon="mdi-check-circle" class="mr-1" />
                        Active Venue
                      </v-chip>
                    </v-card-text>
                    <v-card-text v-else>
                      <div class="text-body-2 text-medium-emphasis">No venue information available</div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col v-if="clubInfo?.info" cols="12">
                  <v-card>
                    <v-card-title>
                      <v-icon icon="mdi-history" class="mr-2" />
                      Club History
                    </v-card-title>
                    <v-card-text>
                      <div v-html="clubInfo.info" class="club-history-content" />
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </div>
        </v-expand-transition>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card>
        <v-card-title>
          <v-icon icon="mdi-chart-box-outline" class="mr-2" />
          Team Stats (Average Per Game)
        </v-card-title>
        <v-card-text>
          <div v-if="teamStatsRow" class="team-stats-list">
            <div v-for="item in averageStats" :key="`avg-${item.key}`" class="stat-row">
              <span class="stat-label">{{ item.label }}</span>
              <span class="stat-value">{{ formatStatValue(item.value) }}</span>
            </div>
          </div>
          <SharedEmptyState
            v-else
            title="No stats available"
            message="Team statistics are not available for this season."
            icon="mdi-chart-box-outline"
          />
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Team Games -->
    <v-col cols="12">
      <v-card>
        <v-card-title>
          <v-icon icon="mdi-basketball" class="mr-2" />
          Team Games
        </v-card-title>
        <v-card-text>
          <SharedErrorAlert
            v-if="gamesError"
            :error="gamesError"
            @retry="$emit('retry-games')"
            @dismiss="$emit('dismiss-games-error')"
          />
          <SharedLoadingState :loading="isGamesLoading" message="Loading games...">
            <div v-if="teamGames.length" class="games-carousel">
              <button
                v-if="showCarouselArrows"
                class="carousel-arrow left"
                type="button"
                aria-label="Scroll games left"
                @click="scrollCarousel(-1)"
              >
                <v-icon icon="mdi-chevron-left" />
              </button>
              <div ref="carouselRow" class="carousel-row">
                <div v-for="game in teamGames" :key="game.gameCode" class="carousel-item">
                  <GamesCard
                    :game="game"
                    :show-details="false"
                    :show-action="true"
                    @view-details="navigateTo(`/games/${seasonCode}/${game.gameCode}`)"
                  />
                </div>
              </div>
              <button
                v-if="showCarouselArrows"
                class="carousel-arrow right"
                type="button"
                aria-label="Scroll games right"
                @click="scrollCarousel(1)"
              >
                <v-icon icon="mdi-chevron-right" />
              </button>
            </div>
            <SharedEmptyState
              v-else
              title="No games available"
              message="No games found for this team in the selected season."
              icon="mdi-calendar-remove"
            />
          </SharedLoadingState>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Club Roster -->
    <v-col cols="12">
      <v-card>
        <v-card-title>
          <v-icon icon="mdi-account-group" class="mr-2" />
          Roster
        </v-card-title>
        <v-card-text>
          <SharedErrorAlert
            v-if="rosterError"
            :error="rosterError"
            @retry="$emit('retry-roster')"
            @dismiss="$emit('dismiss-roster-error')"
          />
          <SharedLoadingState :loading="isRosterLoading" message="Loading roster...">
            <v-data-table
              v-if="rosterPlayers.length"
              :headers="rosterHeaders"
              :items="rosterPlayers"
              :items-per-page="-1"
              class="elevation-0 roster-table"
              density="compact"
              hide-default-footer
            >
              <template #item.player="{ item }">
                <div class="d-flex align-center" :class="{ 'roster-inactive': !item.active }">
                  <v-avatar size="36" class="mr-3 roster-avatar">
                    <v-img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" :cover="false" />
                    <v-icon v-else icon="mdi-account" />
                  </v-avatar>
                  <div>
                    <NuxtLink :to="`/players/${seasonCode}/${item.playerCode}`" class="roster-link">
                      {{ item.name }} <span class="roster-number">(#{{ item.dorsal ?? '-' }})</span>
                    </NuxtLink>
                    <div class="text-caption text-medium-emphasis">
                      {{ item.countryName || '—' }}
                    </div>
                  </div>
                </div>
              </template>
              <template #item.position="{ item }">
                {{ item.position || '—' }}
              </template>
              <template #item.dorsal="{ item }">
                {{ item.dorsal ?? '—' }}
              </template>
              <template #item.gamesPlayed="{ item }">
                {{ item.gamesPlayed ?? '—' }}
              </template>
              <template #item.avgMin="{ item }">
                {{ formatValue(item.avgMin) }}
              </template>
              <template #item.avgPir="{ item }">
                {{ formatValue(item.avgPir) }}
              </template>
              <template #item.avgPts="{ item }">
                {{ formatValue(item.avgPts) }}
              </template>
              <template #item.avgReb="{ item }">
                {{ formatValue(item.avgReb) }}
              </template>
              <template #item.avgAst="{ item }">
                {{ formatValue(item.avgAst) }}
              </template>
              <template #item.pct2="{ item }">
                {{ item.pct2 || '—' }}
              </template>
              <template #item.pct3="{ item }">
                {{ item.pct3 || '—' }}
              </template>
              <template #item.pctFt="{ item }">
                {{ item.pctFt || '—' }}
              </template>
            </v-data-table>
            <SharedEmptyState
              v-else
              title="No roster available"
              message="Roster data is not available for this club/season."
              icon="mdi-account-off"
            />
          </SharedLoadingState>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import GamesCard from '~/components/games/card.vue'

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
defineEmits(['retry-games', 'dismiss-games-error', 'retry-roster', 'dismiss-roster-error'])

const router = useRouter()
const carouselRow = ref<HTMLElement | null>(null)
const showCarouselArrows = ref(false)
const showMore = ref(false)

const teamStatsRow = computed(() => {
  const data = props.teamStats
  if (Array.isArray(data) && data.length) {
    return [...data].sort((a, b) => (b?.gamesPlayed ?? 0) - (a?.gamesPlayed ?? 0))[0]
  }
  return data || null
})

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

const navigateTo = (path: string) => {
  router.push(path)
}

const scrollCarousel = (direction: -1 | 1) => {
  if (!carouselRow.value) return
  const container = carouselRow.value
  const amount = Math.floor(container.clientWidth * 0.8)
  container.scrollBy({ left: direction * amount, behavior: 'smooth' })
}

const updateCarouselControls = () => {
  if (!carouselRow.value) {
    showCarouselArrows.value = false
    return
  }
  const container = carouselRow.value
  showCarouselArrows.value = container.scrollWidth > container.clientWidth + 8
}

watch(() => props.teamGames, async () => {
  await nextTick()
  updateCarouselControls()
}, { deep: true })

onMounted(() => {
  if (carouselRow.value) {
    carouselRow.value.addEventListener('scroll', updateCarouselControls)
  }
})

onBeforeUnmount(() => {
  if (carouselRow.value) {
    carouselRow.value.removeEventListener('scroll', updateCarouselControls)
  }
})
</script>

<style scoped>
.club-history-content {
  line-height: 1.7;
}

.club-history-content :deep(p) {
  margin-bottom: 1rem;
}

.club-crest-img {
  object-fit: contain;
}

.club-header-meta {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.club-alias {
  font-size: 0.9rem;
  color: #1a2742;
  opacity: 0.75;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
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
  align-items: center;
}

.icon-btn {
  color: #1a2742;
  background: transparent !important;
  padding-inline: 4px;
}

.tickets-btn {
  color: #F05323 !important;
  background: transparent !important;
}

.more-btn {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.7rem;
  color: #1a2742;
}

.team-stats-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.45rem 0.6rem;
  border-radius: 12px;
  border: 1px solid #e8edf6;
  background: #ffffff;
}

.stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #8a92a2;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a2742;
  opacity: 0.85;
}

.roster-avatar :deep(img) {
  object-fit: contain !important;
}

.roster-inactive {
  opacity: 0.55;
}

.roster-table :deep(.v-table__wrapper table) {
  width: 100%;
}

.roster-link {
  color: inherit;
  text-decoration: none;
}

.roster-link:hover {
  text-decoration: underline;
}

.roster-number {
  font-size: 0.75rem;
  color: #8a92a2;
  font-weight: 600;
}

.games-carousel {
  overflow-x: auto;
}

.games-carousel::-webkit-scrollbar {
  display: none;
}

.carousel-row {
  display: flex;
  gap: 1rem;
  padding-bottom: 0.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
}

.carousel-row::-webkit-scrollbar {
  display: none;
}

.carousel-item {
  min-width: 280px;
  max-width: 320px;
  flex: 0 0 auto;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}

.carousel-arrow.left {
  left: 8px;
}

.carousel-arrow.right {
  right: 8px;
}
</style>




