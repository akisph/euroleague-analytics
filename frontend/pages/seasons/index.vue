<template>
  <NuxtLayout>
    <PageHeader
      title="Seasons"
      subtitle="All available Euroleague seasons"
    />

    <ErrorAlert
      v-if="error"
      :error="error"
      @retry="loadSeasons"
      @dismiss="error = null"
    />

    <LoadingState :loading="isLoading" message="Loading seasons...">
      <v-row v-if="seasons.length">
        <v-col
          v-for="season in seasons"
          :key="season.code"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="season-card h-100"
            :class="{ 'border-primary': season.active }"
            @click="selectSeason(season)"
          >
            <v-card-text class="text-center pa-6">
              <v-avatar
                size="80"
                :color="season.active ? 'primary' : 'grey-lighten-2'"
                class="mb-4"
              >
                <v-icon
                  size="40"
                  :icon="season.active ? 'mdi-basketball' : 'mdi-history'"
                  :color="season.active ? 'white' : 'grey'"
                />
              </v-avatar>
              <div class="text-h5 font-weight-bold mb-2">
                {{ season.year }}-{{ season.year + 1 }}
              </div>
              <div class="text-body-2 text-medium-emphasis mb-3">
                {{ season.code }}
              </div>
              <v-chip
                :color="season.active ? 'success' : 'default'"
                :variant="season.active ? 'flat' : 'outlined'"
                size="small"
              >
                {{ season.active ? 'Current Season' : 'Completed' }}
              </v-chip>
              <div v-if="season.code === selectedSeasonCode" class="mt-3">
                <v-chip color="primary" variant="tonal" size="small">
                  <v-icon size="14" icon="mdi-check" class="mr-1" />
                  Selected
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <EmptyState
        v-else
        title="No Seasons Available"
        message="Unable to load seasons data"
        icon="mdi-calendar-blank"
      />

      <!-- Season Details Dialog -->
      <v-dialog v-model="showSeasonDialog" max-width="600">
        <v-card v-if="selectedSeasonDetails">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>Season {{ selectedSeasonDetails.year }}-{{ selectedSeasonDetails.year + 1 }}</span>
            <v-btn icon="mdi-close" variant="text" @click="showSeasonDialog = false" />
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-identifier" class="mr-3" />
                </template>
                <v-list-item-title>Season Code</v-list-item-title>
                <v-list-item-subtitle>{{ selectedSeasonDetails.code }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="selectedSeasonDetails.competition">
                <template #prepend>
                  <v-icon icon="mdi-trophy" class="mr-3" />
                </template>
                <v-list-item-title>Competition</v-list-item-title>
                <v-list-item-subtitle>{{ selectedSeasonDetails.competition.name }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-flag-checkered" class="mr-3" />
                </template>
                <v-list-item-title>Status</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip :color="selectedSeasonDetails.active ? 'success' : 'default'" size="small">
                    {{ selectedSeasonDetails.active ? 'Active' : 'Completed' }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>

            <!-- Phases -->
            <div v-if="selectedSeasonDetails.phases?.length" class="mt-4">
              <div class="text-subtitle-1 font-weight-bold mb-2">Phases</div>
              <v-chip
                v-for="phase in selectedSeasonDetails.phases"
                :key="phase.phaseType.code"
                variant="tonal"
                class="mr-2 mb-2"
              >
                {{ phase.phaseType.alias }} (Rounds {{ phase.roundFrom }}-{{ phase.roundTo }})
              </v-chip>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="showSeasonDialog = false">
              Close
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="useSelectedSeason"
            >
              Use This Season
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </LoadingState>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Season, SeasonListItem } from '~/types'

const seasonStore = useSeasonStore()
const { fetchSeasons, fetchSeasonByCode, seasons, isLoading, error, setSelectedSeason } = useSeasons()

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)
const showSeasonDialog = ref(false)
const selectedSeasonDetails = ref<Season | null>(null)

const selectSeason = async (season: SeasonListItem) => {
  try {
    selectedSeasonDetails.value = await fetchSeasonByCode(season.code)
    showSeasonDialog.value = true
  } catch (e) {
    console.error('Failed to load season details:', e)
  }
}

const useSelectedSeason = () => {
  if (selectedSeasonDetails.value) {
    setSelectedSeason(selectedSeasonDetails.value.code)
    showSeasonDialog.value = false
    navigateTo('/')
  }
}

const loadSeasons = async () => {
  await fetchSeasons()
}

onMounted(() => {
  loadSeasons()
})
</script>

<style scoped>
.season-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.season-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.border-primary {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
}
</style>
