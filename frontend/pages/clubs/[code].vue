<template>
  <div class="page-light-surface">
    <SharedPageHeader
      :title="club?.name || 'Club Details'"
      :breadcrumbs="breadcrumbs"
    >
        <template #actions>
          <v-btn
            size="small"
            color="primary"
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
                <ClubDetailsPage
          v-if="club"
          :club="club"
          :club-info="clubInfo"
          :coach-name="coachName"
          :manager-names="managerNames"
          :roster-players="rosterPlayers"
          :roster-headers="rosterHeaders"
          :roster-error="rosterError"
          :is-roster-loading="isRosterLoading"
          :team-stats="teamStats"
          :games-error="gamesError"
          :is-games-loading="isGamesLoading"
          :team-games="teamGames"
          :season-code="seasonCode"
          @retry-games="loadTeamGames"
          @dismiss-games-error="gamesError = null"
          @retry-roster="loadRoster"
          @dismiss-roster-error="rosterError = null"
        />

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
import ClubDetailsPage from '~/components/clubs/ClubDetailsPage.vue'
const route = useRoute()
const { fetchClubByCode, fetchClubInfo, currentClub: club, clubInfo, isLoading, error } = useClubs()
const { fetchTeamRoster, fetchTeamStats, currentRoster, currentTeamStats, isLoading: isRosterLoading, error: rosterError } = useTeams()
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
      playerStats: entry.playerStats || entry.stats || entry.statistics || entry.person?.statistics || null,
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

const teamGames = computed(() => {
  const sorted = [...games.value].sort((a, b) => {
    const aDate = a.gameDate ? new Date(a.gameDate).getTime() : 0
    const bDate = b.gameDate ? new Date(b.gameDate).getTime() : 0
    return aDate - bDate
  })
  return sorted
})

const teamStats = computed(() => currentTeamStats.value)

// Load club when route changes
watch(clubCode, () => {
  loadClub()
}, { immediate: true })

onMounted(async () => {
  await initializeSeasons()
})

watch([seasonCode, clubCode], async () => {
  await loadRoster()
  if (seasonCode.value && clubCode.value) {
    await fetchTeamStats(seasonCode.value, clubCode.value)
  }
  await loadTeamGames()
}, { immediate: true })

</script>


