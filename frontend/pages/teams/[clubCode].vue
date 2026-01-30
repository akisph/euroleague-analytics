<template>
  <NuxtLayout>
    <PageHeader
      :title="roster?.clubName || 'Team Details'"
      subtitle="Team roster and player information"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <v-btn
          variant="outlined"
          prepend-icon="mdi-arrow-left"
          to="/teams"
        >
          Back to Teams
        </v-btn>
      </template>
    </PageHeader>

    <ErrorAlert
      v-if="error"
      :error="error"
      @retry="loadTeam"
      @dismiss="error = null"
    />

    <LoadingState :loading="isLoading" message="Loading team details...">
      <template v-if="roster">
        <!-- Team Header -->
        <v-card class="mb-6">
          <v-card-text class="pa-6">
            <div class="d-flex flex-column flex-md-row align-center">
              <v-avatar size="100" color="grey-lighten-3" class="mb-4 mb-md-0 mr-md-6">
                <span class="text-h3 font-weight-bold">
                  {{ roster.clubCode.substring(0, 3) }}
                </span>
              </v-avatar>
              <div class="text-center text-md-left flex-grow-1">
                <h1 class="text-h4 font-weight-bold mb-2">{{ roster.clubName }}</h1>
                <div class="d-flex flex-wrap justify-center justify-md-start gap-2 mb-3">
                  <v-chip variant="tonal">
                    <v-icon size="16" icon="mdi-calendar" class="mr-1" />
                    {{ roster.seasonCode }}
                  </v-chip>
                  <v-chip v-if="roster.coachName" variant="tonal">
                    <v-icon size="16" icon="mdi-whistle" class="mr-1" />
                    {{ roster.coachName }}
                  </v-chip>
                  <v-chip color="primary" variant="flat">
                    <v-icon size="16" icon="mdi-account-group" class="mr-1" />
                    {{ roster.players?.length || roster.playersCount || 0 }} Players
                  </v-chip>
                </div>
                <div class="d-flex flex-wrap justify-center justify-md-start gap-2">
                  <v-btn
                    variant="tonal"
                    size="small"
                    prepend-icon="mdi-shield-home"
                    :to="`/clubs/${roster.clubCode}`"
                  >
                    Club Info
                  </v-btn>
                  <v-btn
                    variant="tonal"
                    size="small"
                    prepend-icon="mdi-basketball"
                    :to="`/games?team=${roster.clubCode}`"
                  >
                    Team Games
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Players Grid -->
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6 font-weight-bold">Roster</h2>
          <v-btn-toggle v-model="viewMode" density="compact" mandatory>
            <v-btn value="grid" icon="mdi-view-grid" />
            <v-btn value="table" icon="mdi-view-list" />
          </v-btn-toggle>
        </div>

        <!-- Grid View -->
        <template v-if="viewMode === 'grid'">
          <v-row v-if="players.length">
            <v-col
              v-for="player in players"
              :key="player.playerCode"
              cols="12"
              sm="6"
              lg="4"
            >
              <PlayerCard
                :player="player"
                show-action
                @click="viewPlayer(player.playerCode)"
              />
            </v-col>
          </v-row>
        </template>

        <!-- Table View -->
        <template v-else>
          <v-card v-if="players.length">
            <v-data-table
              :headers="playersHeaders"
              :items="players"
              :items-per-page="20"
              class="elevation-0"
            >
              <template #item.dorsal="{ item }">
                <v-chip size="small" color="primary" variant="flat">
                  #{{ item.dorsal || '-' }}
                </v-chip>
              </template>
              <template #item.name="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="36" color="grey-lighten-3" class="mr-3">
                    <v-img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
                    <span v-else class="text-caption font-weight-bold">
                      {{ getInitials(item.name) }}
                    </span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ item.name }}</div>
                    <div v-if="item.alias" class="text-caption text-medium-emphasis">
                      {{ item.alias }}
                    </div>
                  </div>
                </div>
              </template>
              <template #item.position="{ item }">
                <v-chip v-if="item.position" size="small" variant="tonal">
                  {{ item.position }}
                </v-chip>
                <span v-else class="text-medium-emphasis">-</span>
              </template>
              <template #item.height="{ item }">
                {{ item.height ? `${item.height} cm` : '-' }}
              </template>
              <template #item.countryName="{ item }">
                <div v-if="item.countryName" class="d-flex align-center">
                  <v-icon size="14" icon="mdi-flag" class="mr-1" />
                  {{ item.countryName }}
                </div>
                <span v-else class="text-medium-emphasis">-</span>
              </template>
              <template #item.birthDate="{ item }">
                {{ formatDate(item.birthDate) }}
              </template>
              <template #item.actions="{ item }">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  @click="viewPlayer(item.playerCode)"
                />
              </template>
            </v-data-table>
          </v-card>
        </template>

        <EmptyState
          v-if="!players.length"
          title="No Players Found"
          message="Roster information is not available for this team"
          icon="mdi-account-off"
        />
      </template>

      <EmptyState
        v-else
        title="Team Not Found"
        message="The requested team could not be found"
        icon="mdi-account-group-outline"
        action-text="Back to Teams"
        @action="navigateTo('/teams')"
      />
    </LoadingState>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const seasonStore = useSeasonStore()
const { fetchTeamRoster, fetchTeamPlayers, currentRoster: roster, players, isLoading, error } = useTeams()

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)
const clubCode = computed(() => route.params.clubCode as string)
const viewMode = ref<'grid' | 'table'>('grid')

const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: 'Teams', to: '/teams' },
  { title: roster.value?.clubName || clubCode.value, disabled: true },
])

const playersHeaders = [
  { title: '#', key: 'dorsal', width: '70px', sortable: true },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Position', key: 'position', width: '120px' },
  { title: 'Height', key: 'height', width: '100px' },
  { title: 'Country', key: 'countryName', width: '150px' },
  { title: 'Birth Date', key: 'birthDate', width: '130px' },
  { title: '', key: 'actions', width: '60px', sortable: false },
]

const getInitials = (name: string) => {
  const names = name.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const viewPlayer = (playerCode: string) => {
  navigateTo(`/players/${playerCode}`)
}

const loadTeam = async () => {
  if (!selectedSeasonCode.value || !clubCode.value) return
  
  await Promise.all([
    fetchTeamRoster(selectedSeasonCode.value, clubCode.value),
    fetchTeamPlayers(selectedSeasonCode.value, clubCode.value),
  ])
}

// Watch for changes
watch([selectedSeasonCode, clubCode], () => {
  loadTeam()
}, { immediate: true })
</script>
