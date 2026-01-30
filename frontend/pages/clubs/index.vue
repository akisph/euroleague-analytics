<template>
  <PageHeader
    title="Clubs"
    subtitle="All registered Euroleague clubs"
  >
      <template #actions>
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Search clubs"
          single-line
          hide-details
          density="compact"
          variant="outlined"
          class="max-w-[250px]"
          clearable
          @update:model-value="debouncedSearch"
        />
      </template>
    </PageHeader>

    <ErrorAlert
      v-if="error"
      :error="error"
      @retry="loadClubs"
      @dismiss="error = null"
    />

    <LoadingState :loading="isLoading" message="Loading clubs...">
      <v-row v-if="clubs?.data?.length">
        <v-col
          v-for="club in clubs.data"
          :key="club.code"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="club-card h-100"
            :to="`/clubs/${club.code}`"
          >
            <v-card-text class="text-center pa-6">
              <v-avatar size="80" color="grey-lighten-3" class="mb-4">
                <v-img
                  v-if="club.images?.crest"
                  :src="club.images.crest"
                  :alt="club.name"
                />
                <span v-else class="text-h5 font-weight-bold">
                  {{ club.code.substring(0, 3) }}
                </span>
              </v-avatar>
              <div class="text-h6 font-weight-bold mb-1">{{ club.name }}</div>
              <div class="text-body-2 text-medium-emphasis mb-2">{{ club.alias }}</div>
              <v-chip v-if="club.country" size="small" variant="tonal">
                <v-icon size="14" icon="mdi-flag" class="mr-1" />
                {{ club.country.name }}
              </v-chip>
              <v-chip v-if="club.isVirtual" size="small" color="warning" variant="flat" class="ml-2">
                Virtual
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <EmptyState
        v-else
        title="No Clubs Found"
        :message="searchQuery ? 'No clubs match your search criteria' : 'No clubs available'"
        icon="mdi-shield-off"
        :action-text="searchQuery ? 'Clear Search' : undefined"
        @action="clearSearch"
      />

      <!-- Pagination -->
      <div v-if="clubs?.total && clubs.total > pageSize" class="d-flex justify-center mt-6">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="5"
          rounded
        />
      </div>
    </LoadingState>
</template>

<script setup lang="ts">
const { fetchClubs, clubs, isLoading, error } = useClubs()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 20

const totalPages = computed(() => {
  if (!clubs.value?.total) return 1
  return Math.ceil(clubs.value.total / pageSize)
})

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadClubs()
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  loadClubs()
}

const loadClubs = async () => {
  await fetchClubs({
    limit: pageSize,
    offset: (currentPage.value - 1) * pageSize,
    search: searchQuery.value || undefined,
  })
}

// Watch page changes
watch(currentPage, () => {
  loadClubs()
})

// Initial load
onMounted(() => {
  loadClubs()
})
</script>

<style scoped>
.club-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  background-color: #ffffff;
  border: 1px solid #e0e6f0;
}

.club-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.club-card :deep(.v-card-text) {
  background-color: #ffffff;
}

.club-card :deep(.text-h6) {
  color: #1a2742 !important;
}

.club-card :deep(.v-chip) {
  background-color: rgba(240, 83, 35, 0.1) !important;
  color: #F05323 !important;
}

@media (max-width: 768px) {
  .club-card {
    border-radius: 8px;
  }
}
</style>
