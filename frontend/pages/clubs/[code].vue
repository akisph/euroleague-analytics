<template>
  <div class="page-light-surface">
    <SharedPageHeader
      :title="club?.name || 'Club Details'"
      :subtitle="club?.alias"
      :breadcrumbs="breadcrumbs"
    >
        <template #actions>
          <v-btn
            variant="outlined"
            prepend-icon="mdi-arrow-left"
            to="/clubs"
          >
            Back to Clubs
          </v-btn>
        </template>
      </SharedPageHeader>

      <SharedErrorAlert
        v-if="error"
        :error="error"
        @retry="loadClub"
        @dismiss="error = null"
      />

      <SharedLoadingState :loading="isLoading" message="Loading club details...">
        <v-row v-if="club">
          <!-- Club Header Card -->
          <v-col cols="12">
            <v-card class="mb-6">
              <v-card-text class="pa-6">
                <div class="d-flex flex-column flex-md-row align-center">
                  <v-avatar size="120" color="grey-lighten-3" class="mb-4 mb-md-0 mr-md-6">
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
                  <div class="text-center text-md-left flex-grow-1">
                    <h1 class="text-h4 font-weight-bold mb-2">{{ club.name }}</h1>
                    <div class="d-flex flex-wrap justify-center justify-md-start gap-2 mb-3">
                      <v-chip v-if="club.country" color="primary" variant="tonal">
                        <v-icon size="16" icon="mdi-flag" class="mr-1" />
                        {{ club.country.name }}
                      </v-chip>
                      <v-chip v-if="club.city" variant="outlined">
                        <v-icon size="16" icon="mdi-city" class="mr-1" />
                        {{ club.city }}
                      </v-chip>
                      <v-chip v-if="club.isVirtual" color="warning" variant="flat">
                        Virtual Club
                      </v-chip>
                    </div>
                    <!-- Social Links -->
                    <div class="d-flex flex-wrap justify-center justify-md-start gap-2">
                      <v-btn
                        v-if="club.website"
                        :href="club.website"
                        target="_blank"
                        icon="mdi-web"
                        size="small"
                        variant="tonal"
                      />
                      <v-btn
                        v-if="club.twitterAccount"
                        :href="`https://twitter.com/${club.twitterAccount}`"
                        target="_blank"
                        icon="mdi-twitter"
                        size="small"
                        variant="tonal"
                      />
                      <v-btn
                        v-if="club.instagramAccount"
                        :href="`https://instagram.com/${club.instagramAccount}`"
                        target="_blank"
                        icon="mdi-instagram"
                        size="small"
                        variant="tonal"
                      />
                      <v-btn
                        v-if="club.facebookAccount"
                        :href="`https://facebook.com/${club.facebookAccount}`"
                        target="_blank"
                        icon="mdi-facebook"
                        size="small"
                        variant="tonal"
                      />
                      <v-btn
                        v-if="club.ticketsUrl"
                        :href="club.ticketsUrl"
                        target="_blank"
                        prepend-icon="mdi-ticket"
                        size="small"
                        variant="tonal"
                        color="primary"
                      >
                        Tickets
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Club Info -->
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

          <!-- Staff & Venue Info -->
          <v-col cols="12" md="6">
            <v-card class="h-100">
              <v-card-title>
                <v-icon icon="mdi-stadium" class="mr-2" />
                Home Arena
              </v-card-title>
              <v-card-text v-if="club.venue">
                <div class="d-flex align-center mb-4">
                  <v-avatar size="60" color="grey-lighten-3" class="mr-4">
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
                <v-chip
                  v-if="club.venue.active"
                  color="success"
                  variant="flat"
                  size="small"
                  class="mt-2"
                >
                  <v-icon size="14" icon="mdi-check-circle" class="mr-1" />
                  Active Venue
                </v-chip>
              </v-card-text>
              <v-card-text v-else>
                <div class="text-body-2 text-medium-emphasis">No venue information available</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Club History/Info -->
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
                  @retry="loadTeamGames"
                  @dismiss="gamesError = null"
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
                      <div
                        v-for="game in teamGames"
                        :key="game.gameCode"
                        class="carousel-item"
                      >
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
                  @retry="loadRoster"
                  @dismiss="rosterError = null"
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
                        <v-avatar size="36" color="grey-lighten-3" class="mr-3 roster-avatar">
                          <v-img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" :cover="false" />
                          <v-icon v-else icon="mdi-account" />
                        </v-avatar>
                        <div>
                          <NuxtLink :to="`/players/${seasonCode}/${item.playerCode}`" class="roster-link">
                            {{ item.name }}
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
                    <template #item.height="{ item }">
                      {{ item.height ? `${item.height} cm` : '—' }}
                    </template>
                    <template #item.weight="{ item }">
                      {{ item.weight ? `${item.weight} kg` : '—' }}
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

        <SharedEmptyState
          v-else
          title="Club Not Found"
          message="The requested club could not be found"
          icon="mdi-shield-off"
          action-text="Back to Clubs"
          @action="navigateTo('/clubs')"
        />
      </SharedLoadingState>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { fetchClubByCode, fetchClubInfo, currentClub: club, clubInfo, isLoading, error } = useClubs()
const { fetchTeamRoster, currentRoster, isLoading: isRosterLoading, error: rosterError } = useTeams()
const { fetchGamesByTeam, games, isLoading: isGamesLoading, error: gamesError } = useGames()
const { selectedSeasonCode, initializeSeasons } = useSeasons()

const clubCode = computed(() => route.params.code as string)
const seasonCode = computed(() => selectedSeasonCode.value)

const rosterHeaders = [
  { title: 'Player', key: 'player', sortable: false },
  { title: 'Position', key: 'position', sortable: true },
  { title: '#', key: 'dorsal', sortable: true },
  { title: 'Height', key: 'height', sortable: true },
  { title: 'Weight', key: 'weight', sortable: true },
]

const rosterPlayers = computed(() => {
  const roster = currentRoster.value as unknown
  if (!Array.isArray(roster)) {
    return []
  }

  return roster
    .filter((entry: any) => entry?.typeName === 'Player' && entry?.person)
    .map((entry: any) => ({
      playerCode: entry.person.code,
      name: entry.person.name,
      imageUrl: entry.person.images?.headshot || entry.images?.headshot || entry.images?.action || '',
      countryName: entry.person.country?.name || '',
      position: entry.positionName || '',
      dorsal: entry.dorsal || '',
      height: entry.person.height || null,
      weight: entry.person.weight || null,
      active: entry.active === true,
    }))
    .sort((a, b) => {
      const activeSort = Number(b.active) - Number(a.active)
      if (activeSort !== 0) {
        return activeSort
      }
      const aDorsal = Number.parseInt(String(a.dorsal), 10)
      const bDorsal = Number.parseInt(String(b.dorsal), 10)
      if (Number.isNaN(aDorsal) && Number.isNaN(bDorsal)) {
        return 0
      }
      if (Number.isNaN(aDorsal)) {
        return 1
      }
      if (Number.isNaN(bDorsal)) {
        return -1
      }
      return aDorsal - bDorsal
    })
})

const staffCards = computed(() => {
  const roster = currentRoster.value as unknown
  if (!Array.isArray(roster)) {
    return []
  }

  return roster
    .filter((entry: any) => entry?.person && (entry?.typeName === 'Team_Manager' || entry?.typeName === 'Coach'))
    .map((entry: any) => ({
      personCode: entry.person.code,
      name: entry.person.name,
      imageUrl: entry.person.images?.headshot || entry.images?.headshot || entry.images?.action || '',
      countryName: entry.person.country?.name || '',
      role: entry.typeName === 'Coach' ? 'Coach' : 'Team Manager',
      active: entry.active === true,
    }))
    .sort((a, b) => Number(b.active) - Number(a.active))
})

const coachName = computed(() => {
  const coach = staffCards.value.find((staff) => staff.role === 'Coach')
  return coach?.name || ''
})

const managerNames = computed(() => {
  return staffCards.value
    .filter((staff) => staff.role === 'Team Manager')
    .map((staff) => staff.name)
})
const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: 'Clubs', to: '/clubs' },
  { title: club.value?.name || clubCode.value, disabled: true },
])

const loadClub = async () => {
  await fetchClubByCode(clubCode.value)
  // Also fetch club info/history
  try {
    await fetchClubInfo(clubCode.value)
  } catch {
    // Info might not be available for all clubs
  }
}

const loadRoster = async () => {
  if (!seasonCode.value || !clubCode.value) {
    return
  }
  await fetchTeamRoster(seasonCode.value, clubCode.value)
}

const loadTeamGames = async () => {
  if (!seasonCode.value || !clubCode.value) {
    return
  }
  await fetchGamesByTeam(seasonCode.value, clubCode.value)
}

const carouselRow = ref<HTMLElement | null>(null)
const showCarouselArrows = ref(false)

const teamGames = computed(() => {
  const sorted = [...games.value].sort((a, b) => {
    const aDate = a.gameDate ? new Date(a.gameDate).getTime() : 0
    const bDate = b.gameDate ? new Date(b.gameDate).getTime() : 0
    return aDate - bDate
  })
  return sorted
})

const getUpcomingIndex = () => {
  const now = Date.now()
  for (let i = 0; i < teamGames.value.length; i += 1) {
    const g = teamGames.value[i]
    const date = g.gameDate ? new Date(g.gameDate).getTime() : 0
    if (date >= now && !g.played) {
      return i
    }
  }
  return -1
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

// Load club when route changes
watch(clubCode, () => {
  loadClub()
}, { immediate: true })

onMounted(async () => {
  await initializeSeasons()
})

watch([seasonCode, clubCode], async () => {
  await loadRoster()
  await loadTeamGames()
}, { immediate: true })

watch(teamGames, async () => {
  await nextTick()
  updateCarouselControls()
  const index = getUpcomingIndex()
  if (!carouselRow.value || index < 0) return
  const container = carouselRow.value
  const items = Array.from(container.querySelectorAll('.carousel-item')) as HTMLElement[]
  const target = items[index]
  if (!target) return
  const offset = target.offsetLeft - (container.clientWidth - target.clientWidth) / 2
  container.scrollTo({ left: Math.max(offset, 0), behavior: 'smooth' })
}, { immediate: true })

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
.page-light-surface :deep(.v-card),
.page-light-surface :deep(.v-card-text),
.page-light-surface :deep(.v-card-title),
.page-light-surface :deep(.v-card__title),
.page-light-surface :deep(.v-card-actions),
.page-light-surface :deep(.v-list),
.page-light-surface :deep(.v-list-item),
.page-light-surface :deep(.v-list-item__content),
.page-light-surface :deep(.v-list-item__title),
.page-light-surface :deep(.v-list-item__subtitle),
.page-light-surface :deep(.v-avatar) {
  background-color: #ffffff !important;
  color: #1a1a1a !important;
}

.page-light-surface :deep(.v-card-title),
.page-light-surface :deep(.v-card__title) {
  background-color: transparent !important;
}

.page-light-surface :deep(.v-chip) {
  background-color: rgba(240,83,35,0.08) !important;
  color: #F05323 !important;
}

/* Keep avatars transparent to show full crests */
.page-light-surface :deep(.v-avatar) {
  background-color: transparent !important;
}

.roster-avatar :deep(img) {
  object-fit: contain !important;
}

.club-crest-img {
  object-fit: contain;
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

.games-carousel {
  position: relative;
}

@media (max-width: 768px) {
  .v-card-text {
    padding: 1rem !important;
  }

  .v-avatar[size="120"] {
    width: 80px !important;
    height: 80px !important;
  }

  .text-h4 {
    font-size: 1.5rem !important;
  }

  .v-avatar[size="60"] {
    width: 48px !important;
    height: 48px !important;
  }
}

@media (max-width: 480px) {
  .v-card-text {
    padding: 0.75rem !important;
  }

  .v-avatar[size="120"] {
    width: 64px !important;
    height: 64px !important;
  }

  .text-h4 {
    font-size: 1.25rem !important;
  }

  .v-avatar[size="60"] {
    width: 40px !important;
    height: 40px !important;
  }

  .gap-2 {
    gap: 0.5rem !important;
  }
}
</style>
