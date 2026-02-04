<template>
  <div class="page-light-surface">
    <SharedPageHeader
      title="Players Leaders"
      subtitle="All leaders by selected category and aggregation"
    />

    <SharedLoadingState :loading="false" message="Loading leaders...">
      <LeadersPage
        :selected-aggregate="selectedAggregate"
        :selected-category="selectedCategory"
        :selected-teams="selectedTeams"
        :aggregate-options="aggregateOptions"
        :category-options="categoryOptions"
        :team-options="teamOptions"
        :leaders="leaders"
        :is-loading="isLoading"
        :error="error"
        :response-json="responseJson"
        @update:aggregate="selectedAggregate = $event"
        @update:category="selectedCategory = $event"
        @update:teams="selectedTeams = $event"
        @dismiss-error="error = null"
      />
    </SharedLoadingState>
  </div>
</template>

<script setup lang="ts">
import LeadersPage from '~/components/leaders/LeadersPage.vue'

const api = useApi()
const seasonStore = useSeasonStore()

const isLoading = ref(false)
const error = ref<string | null>(null)
const leadersData = ref<any | null>(null)

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)
const { fetchCurrentStandings, allTeamStandings } = useStandings()

const aggregateOptions = [
  { label: 'Per Game', value: 'PerGame' },
  { label: 'Accumulated', value: 'Accumulated' },
  { label: 'Per Minute', value: 'PerMinute' },
  { label: 'Per 100 Possessions', value: 'Per100Possesions' },
] as const

const categoryOptions = [
  { label: 'PIR', value: 'Valuation' },
  { label: 'Score', value: 'Score' },
  { label: 'Total Rebounds', value: 'TotalRebounds' },
  { label: 'Offensive Rebounds', value: 'OffensiveRebounds' },
  { label: 'Defensive Rebounds', value: 'DefensiveRebounds' },
  { label: 'Assistances', value: 'Assistances' },
  { label: 'Steals', value: 'Steals' },
  { label: 'Blocks Favour', value: 'BlocksFavour' },
  { label: 'Blocks Against', value: 'BlocksAgainst' },
  { label: 'Turnovers', value: 'Turnovers' },
  { label: 'Fouls Received', value: 'FoulsReceived' },
  { label: 'Fouls Commited', value: 'FoulsCommited' },
  { label: 'Free Throws Made', value: 'FreeThrowsMade' },
  { label: 'Free Throws Attempted', value: 'FreeThrowsAttempted' },
  { label: 'Free Throws Percent', value: 'FreeThrowsPercent' },
  { label: 'Field Goals Made 2', value: 'FieldGoalsMade2' },
  { label: 'Field Goals Attempted 2', value: 'FieldGoalsAttempted2' },
  { label: 'Field Goals 2 Percent', value: 'FieldGoals2Percent' },
  { label: 'Field Goals Made 3', value: 'FieldGoalsMade3' },
  { label: 'Field Goals Attempted 3', value: 'FieldGoalsAttempted3' },
  { label: 'Field Goals 3 Percent', value: 'FieldGoals3Percent' },
  { label: 'Field Goals Made Total', value: 'FieldGoalsMadeTotal' },
  { label: 'Field Goals Attempted Total', value: 'FieldGoalsAttemptedTotal' },
  { label: 'Field Goals Percent', value: 'FieldGoalsPercent' },
  { label: 'Accuracy Made', value: 'AccuracyMade' },
  { label: 'Accuracy Attempted', value: 'AccuracyAttempted' },
  { label: 'Accuracy Percent', value: 'AccuracyPercent' },
  { label: 'AST/TO Ratio', value: 'AssistancesTurnoversRatio' },
  { label: 'Games Played', value: 'GamesPlayed' },
  { label: 'Games Started', value: 'GamesStarted' },
  { label: 'Time Played', value: 'TimePlayed' },
  { label: 'Contras', value: 'Contras' },
  { label: 'Dunks', value: 'Dunks' },
  { label: 'Off Rebound %', value: 'OffensiveReboundPercentage' },
  { label: 'Def Rebound %', value: 'DefensiveReboundPercentage' },
  { label: 'Rebound %', value: 'ReboundPercentage' },
  { label: 'eFG %', value: 'EffectiveFieldGoalPercentage' },
  { label: 'TS %', value: 'TrueShootingPercentage' },
  { label: 'Assist Ratio', value: 'AssistRatio' },
  { label: 'Turnover Ratio', value: 'TurnoverRatio' },
  { label: 'FG2 Attempted Ratio', value: 'FieldGoals2AttemptedRatio' },
  { label: 'FG3 Attempted Ratio', value: 'FieldGoals3AttemptedRatio' },
  { label: 'Free Throw Rate', value: 'FreeThrowRate' },
  { label: 'Possessions', value: 'Possesions' },
  { label: 'Games Won', value: 'GamesWon' },
  { label: 'Games Lost', value: 'GamesLost' },
  { label: 'Double Doubles', value: 'DoubleDoubles' },
  { label: 'Triple Doubles', value: 'TripleDoubles' },
  { label: 'FG2 Attempted Share', value: 'FieldGoalsAttempted2Share' },
  { label: 'FG3 Attempted Share', value: 'FieldGoalsAttempted3Share' },
  { label: 'FT Attempted Share', value: 'FreeThrowsAttemptedShare' },
  { label: 'FG2 Made Share', value: 'FieldGoalsMade2Share' },
  { label: 'FG3 Made Share', value: 'FieldGoalsMade3Share' },
  { label: 'FT Made Share', value: 'FreeThrowsMadeShare' },
  { label: 'Points Made 2 Rate', value: 'PointsMade2Rate' },
  { label: 'Points Made 3 Rate', value: 'PointsMade3Rate' },
  { label: 'Points Made FT Rate', value: 'PointsMadeFreeThrowsRate' },
  { label: 'Points Attempted 2 Rate', value: 'PointsAttempted2Rate' },
  { label: 'Points Attempted 3 Rate', value: 'PointsAttempted3Rate' },
  { label: 'Age', value: 'Age' },
] as const

const route = useRoute()
const router = useRouter()

const normalizeAggregate = (value: string | undefined) => {
  if (!value) return undefined
  return aggregateOptions.find(option => option.value === value)?.value
}

const normalizeCategory = (value: string | undefined) => {
  if (!value) return undefined
  return categoryOptions.find(option => option.value === value)?.value
}

const parseCsvQuery = (value: unknown): string[] => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.flatMap(v => parseCsvQuery(v)).filter(Boolean)
  }
  if (typeof value !== 'string') return []
  return value
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
}

const selectedAggregate = ref<(typeof aggregateOptions)[number]['value']>(
  normalizeAggregate(route.query.aggregate as string | undefined) || 'PerGame',
)
const selectedCategory = ref<(typeof categoryOptions)[number]['value']>(
  normalizeCategory(route.query.category as string | undefined) || 'Valuation',
)
const selectedTeams = ref<string[]>(parseCsvQuery(route.query.teams))

const teamOptions = computed(() => {
  const map = new Map<string, { label: string; value: string }>()
  for (const team of allTeamStandings.value || []) {
    if (!team?.teamCode) continue
    map.set(team.teamCode, {
      label: team.teamName || team.teamCode,
      value: team.teamCode,
    })
  }
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
})

const leadersAll = computed(() => {
  const rawLeaders = leadersData.value?.leaders
  const list = Array.isArray(rawLeaders) ? rawLeaders : []
  return list.map((item: any, index: number) => ({
    ...item,
    rank: index + 1,
  }))
})

const leaders = computed(() => {
  const list = leadersAll.value
  if (!selectedTeams.value.length) return list
  return list.filter((item: any) => item?.clubCode && selectedTeams.value.includes(item.clubCode))
})

const responseJson = computed(() => {
  if (!leadersData.value) return ''
  return JSON.stringify(leadersData.value, null, 2)
})

const loadLeaders = async () => {
  if (!selectedSeasonCode.value) return
  if (!selectedCategory.value || !selectedAggregate.value) return
  isLoading.value = true
  error.value = null
  try {
    const params = new URLSearchParams({
      seasonCode: selectedSeasonCode.value,
      category: selectedCategory.value,
      aggregate: selectedAggregate.value,
      limit: '200',
    })
    leadersData.value = await api.get(
      `/players/season/${selectedSeasonCode.value}/leaders?${params.toString()}`,
    )
  } catch (err: any) {
    error.value = err?.message || 'Failed to load leaders'
  } finally {
    isLoading.value = false
  }
}

watch([selectedSeasonCode, selectedCategory, selectedAggregate], () => {
  loadLeaders()
}, { immediate: true })

watch(selectedSeasonCode, async (seasonCode) => {
  if (!seasonCode) return
  try {
    await fetchCurrentStandings(seasonCode)
  } catch {
    // team filter is optional; ignore standings load failures
  }
}, { immediate: true })

watch([selectedCategory, selectedAggregate, selectedTeams], () => {
  const teamsQuery = selectedTeams.value.length ? selectedTeams.value.join(',') : undefined
  router.replace({
    query: {
      ...route.query,
      category: selectedCategory.value,
      aggregate: selectedAggregate.value,
      teams: teamsQuery,
    },
  })
})
</script>
