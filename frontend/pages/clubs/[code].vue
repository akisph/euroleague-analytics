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
  { title: 'PST', key: 'position', sortable: true },
  { title: '#', key: 'dorsal', sortable: true },
  { title: 'GP', key: 'gamesPlayed', sortable: true },
  { title: 'MIN', key: 'avgMin', sortable: true },
  { title: 'PIR', key: 'avgPir', sortable: true },
  { title: 'PTS', key: 'avgPts', sortable: true },
  { title: 'REB', key: 'avgReb', sortable: true },
  { title: 'AST', key: 'avgAst', sortable: true },
  { title: '2PT%', key: 'pct2', sortable: true },
  { title: '3PT%', key: 'pct3', sortable: true },
  { title: 'FT%', key: 'pctFt', sortable: true },
]

const calcAvg = (stats: any, key: string) => {
  if (!stats) return null
  const gamesPlayed = Number(stats.gamesPlayed ?? 0)
  if (!Number.isFinite(gamesPlayed) || gamesPlayed <= 0) return null
  const value = Number(stats[key] ?? 0)
  if (!Number.isFinite(value)) return null
  return value / gamesPlayed
}

const calcAvgMinutes = (stats: any) => {
  if (!stats) return null
  const gamesPlayed = Number(stats.gamesPlayed ?? 0)
  if (!Number.isFinite(gamesPlayed) || gamesPlayed <= 0) return null
  const timePlayed = Number(stats.timePlayed ?? stats.timePlayedSeconds ?? 0)
  if (!Number.isFinite(timePlayed)) return null
  const minutes = timePlayed / 60
  return minutes / gamesPlayed
}

const formatPosition = (position?: string) => {
  const value = String(position || '').toLowerCase()
  if (!value) return 'â€”'
  if (value.includes('guard')) return 'G'
  if (value.includes('forward')) return 'F'
  if (value.includes('center')) return 'C'
  return position || 'â€”'
}

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
      position: formatPosition(entry.positionName),
      dorsal: entry.dorsal || '',
      height: entry.person.height || null,
      weight: entry.person.weight || null,
      playerStats: entry.playerStats || entry.stats || entry.statistics || entry.person?.statistics || null,
      gamesPlayed: entry.playerStats?.gamesPlayed ?? null,
      avgPir: calcAvg(entry.playerStats, 'valuation'),
      avgPts: calcAvg(entry.playerStats, 'points'),
      avgReb: calcAvg(entry.playerStats, 'totalRebounds'),
      avgAst: calcAvg(entry.playerStats, 'assistances'),
      avgMin: calcAvgMinutes(entry.playerStats),
      pct2: entry.playerStats?.twoPointShootingPercentage ?? null,
      pct3: entry.playerStats?.threePointShootingPercentage ?? null,
      pctFt: entry.playerStats?.freeThrowShootingPercentage ?? null,
      active: entry.active === true,
    }))
    .sort((a, b) => {
      const activeSort = Number(b.active) - Number(a.active)
      if (activeSort !== 0) {
        return activeSort
      }
      const aPir = Number(a.avgPir ?? -Infinity)
      const bPir = Number(b.avgPir ?? -Infinity)
      if (Number.isFinite(aPir) || Number.isFinite(bPir)) {
        return bPir - aPir
      }
      return 0
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


