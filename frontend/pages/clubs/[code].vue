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
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Venue Info -->
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

          <!-- Quick Actions -->
          <v-col cols="12">
            <v-card>
              <v-card-title>Quick Actions</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="4">
                    <v-btn
                      block
                      variant="tonal"
                      color="primary"
                      prepend-icon="mdi-account-group"
                      :to="`/clubs/${clubCode}`"
                    >
                      View Roster
                    </v-btn>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-btn
                      block
                      variant="tonal"
                      color="primary"
                      prepend-icon="mdi-basketball"
                      :to="`/games?team=${clubCode}`"
                    >
                      View Games
                    </v-btn>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-btn
                      block
                      variant="tonal"
                      color="primary"
                      prepend-icon="mdi-chart-line"
                      to="/standings"
                    >
                      View Standings
                    </v-btn>
                  </v-col>
                </v-row>
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

const clubCode = computed(() => route.params.code as string)

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

// Load club when route changes
watch(clubCode, () => {
  loadClub()
}, { immediate: true })
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

/* Slightly muted avatar background so initials/icons remain visible */
.page-light-surface :deep(.v-avatar) {
  background-color: #f3f4f6 !important;
}
</style>
