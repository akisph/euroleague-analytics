<template>
  <div class="page-light-surface">
    <SharedPageHeader
      title="Fantasy Players"
      subtitle="Player fantasy statistics"
    />

    <SharedErrorAlert
      v-if="error"
      :error="error"
      @retry="loadFantasyPlayers"
      @dismiss="error = null"
    />

    <SharedLoadingState :loading="isLoading" message="Loading fantasy players...">
      <FantasyPlayersPage
        v-if="filteredPlayers.length"
        :items="filteredPlayers"
        v-model:positions="positions"
        v-model:teamCode="teamCode"
        v-model:search="search"
        :team-options="teamOptions"
      />

      <SharedEmptyState
        v-else
        title="No Fantasy Data"
        message="Fantasy player stats are not available for the selected season."
        icon="mdi-account-multiple"
      />
    </SharedLoadingState>
  </div>
</template>

<script setup lang="ts">
import FantasyPlayersPage from '~/components/fantasy/FantasyPlayersPage.vue'

const seasonStore = useSeasonStore()
const { playersStats, isLoading, error, fetchPlayersStats } = useFantasy()

const positions = ref<Array<'G' | 'F' | 'C'>>(['G'])
const teamCode = ref('')
const search = ref('')

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)

const teamOptions = computed(() => {
  const base = playersStats.value.map((player) => ({
    title: player.team_name,
    value: player.team_code,
  }))
  const map = new Map<string, { title: string; value: string }>()
  base.forEach((item) => {
    if (!map.has(item.value)) map.set(item.value, item)
  })
  const options = Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title))
  return [{ title: 'All Teams', value: '' }, ...options]
})

const filteredPlayers = computed(() => {
  const term = search.value.trim().toLowerCase()
  const filtered = playersStats.value.filter((player) => {
    const matchesTeam = !teamCode.value || player.team_code === teamCode.value
    const matchesPosition =
      positions.value.length === 0 || positions.value.includes(player.position as 'G' | 'F' | 'C')
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase()
    const matchesSearch = !term || fullName.includes(term)
    const playerCr = Number(player.cr)
    const meetsCrThreshold = Number.isFinite(playerCr) ? playerCr >= 4 : false
    return matchesTeam && matchesPosition && matchesSearch && meetsCrThreshold
  })
  return [...filtered].sort((a, b) => {
    const aCr = Number(a.cr)
    const bCr = Number(b.cr)
    if (!Number.isFinite(aCr) && !Number.isFinite(bCr)) return 0
    if (!Number.isFinite(aCr)) return 1
    if (!Number.isFinite(bCr)) return -1
    return bCr - aCr
  })
})

const loadFantasyPlayers = async () => {
  if (!selectedSeasonCode.value) return
  await fetchPlayersStats(selectedSeasonCode.value, {
    statsType: 'avg',
  })
}

watch([selectedSeasonCode], () => {
  loadFantasyPlayers()
}, { immediate: true })
</script>
