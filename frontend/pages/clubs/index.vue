<template>
  <div class="page-light-surface">
    <SharedPageHeader
      title="Clubs"
    >
    </SharedPageHeader>

    <SharedErrorAlert
      v-if="error"
      :error="error"
      @retry="loadClubs"
      @dismiss="error = null"
    />

    <SharedLoadingState :loading="isLoading" message="Loading clubs...">
      <ClubsPage
        :clubs="clubs"
        search-query=""
        :page-size="pageSize"
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:page="currentPage = $event"
      />
    </SharedLoadingState>
  </div>
</template>

<script setup lang="ts">
import ClubsPage from '~/components/clubs/ClubsPage.vue'


const { fetchClubs, clubs, isLoading, error } = useClubs()

const currentPage = ref(1)
const pageSize = 20

const totalPages = computed(() => {
  if (!clubs.value?.total) return 1
  return Math.ceil(clubs.value.total / pageSize)
})

const loadClubs = async () => {
  await fetchClubs({
    limit: pageSize,
    offset: (currentPage.value - 1) * pageSize,
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
