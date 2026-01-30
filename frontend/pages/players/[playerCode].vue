<template>
  <PageHeader
    :title="player?.name || 'Player Details'"
    :subtitle="player?.position"
    :breadcrumbs="breadcrumbs"
  >
      <template #actions>
        <v-btn
          variant="outlined"
          prepend-icon="mdi-arrow-left"
          @click="$router.back()"
        >
          Go Back
        </v-btn>
      </template>
    </PageHeader>

    <ErrorAlert
      v-if="error"
      :error="error"
      @retry="loadPlayer"
      @dismiss="error = null"
    />

    <LoadingState :loading="isLoading" message="Loading player details...">
      <template v-if="player">
        <v-row>
          <!-- Player Profile Card -->
          <v-col cols="12" md="4">
            <v-card>
              <v-card-text class="text-center pa-6">
                <v-avatar size="150" color="grey-lighten-3" class="mb-4">
                  <v-img v-if="player.imageUrl" :src="player.imageUrl" :alt="player.name" />
                  <span v-else class="text-h2 font-weight-bold">
                    {{ playerInitials }}
                  </span>
                </v-avatar>
                <h2 class="text-h5 font-weight-bold mb-2">{{ player.name }}</h2>
                <div v-if="player.alias" class="text-body-1 text-medium-emphasis mb-3">
                  "{{ player.alias }}"
                </div>
                <div class="d-flex flex-wrap justify-center gap-2">
                  <v-chip v-if="player.dorsal" color="primary" variant="flat" size="large">
                    #{{ player.dorsal }}
                  </v-chip>
                  <v-chip v-if="player.position" variant="tonal" size="large">
                    {{ player.position }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Player Info Card -->
          <v-col cols="12" md="8">
            <v-card class="h-100">
              <v-card-title>
                <v-icon icon="mdi-account" class="mr-2" />
                Player Information
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-list density="compact">
                      <v-list-item v-if="player.countryName">
                        <template #prepend>
                          <v-icon icon="mdi-flag" class="mr-3" />
                        </template>
                        <v-list-item-title>Nationality</v-list-item-title>
                        <v-list-item-subtitle>{{ player.countryName }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="player.birthDate">
                        <template #prepend>
                          <v-icon icon="mdi-cake-variant" class="mr-3" />
                        </template>
                        <v-list-item-title>Birth Date</v-list-item-title>
                        <v-list-item-subtitle>{{ formatDate(player.birthDate) }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="playerAge">
                        <template #prepend>
                          <v-icon icon="mdi-calendar" class="mr-3" />
                        </template>
                        <v-list-item-title>Age</v-list-item-title>
                        <v-list-item-subtitle>{{ playerAge }} years</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-list density="compact">
                      <v-list-item v-if="player.height">
                        <template #prepend>
                          <v-icon icon="mdi-human-male-height" class="mr-3" />
                        </template>
                        <v-list-item-title>Height</v-list-item-title>
                        <v-list-item-subtitle>{{ player.height }} cm ({{ heightInFeet }})</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="player.position">
                        <template #prepend>
                          <v-icon icon="mdi-basketball" class="mr-3" />
                        </template>
                        <v-list-item-title>Position</v-list-item-title>
                        <v-list-item-subtitle>{{ player.position }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <template #prepend>
                          <v-icon icon="mdi-identifier" class="mr-3" />
                        </template>
                        <v-list-item-title>Player Code</v-list-item-title>
                        <v-list-item-subtitle>{{ player.playerCode }}</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <EmptyState
        v-else
        title="Player Not Found"
        message="The requested player could not be found"
        icon="mdi-account-off"
        action-text="Go Back"
        @action="$router.back()"
      />
    </LoadingState>
</template>

<script setup lang="ts">
const route = useRoute()
const { fetchPlayerByCode, currentPlayer: player, isLoading, error } = useTeams()

const playerCode = computed(() => route.params.playerCode as string)

const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: 'Teams', to: '/teams' },
  { title: player.value?.name || playerCode.value, disabled: true },
])

const playerInitials = computed(() => {
  if (!player.value?.name) return ''
  const names = player.value.name.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }
  return player.value.name.substring(0, 2).toUpperCase()
})

const playerAge = computed(() => {
  if (!player.value?.birthDate) return null
  const birthDate = new Date(player.value.birthDate)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
})

const heightInFeet = computed(() => {
  if (!player.value?.height) return ''
  const totalInches = player.value.height / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}"`
})

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const loadPlayer = async () => {
  await fetchPlayerByCode(playerCode.value)
}

// Load player when route changes
watch(playerCode, () => {
  loadPlayer()
}, { immediate: true })
</script>
