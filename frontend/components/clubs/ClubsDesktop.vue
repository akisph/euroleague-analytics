<template>
  <div class="clubs-desktop">
    <v-row v-if="clubs?.data?.length">
      <v-col
        v-for="club in clubs.data"
        :key="club.code"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="club-card h-100" :to="`/clubs/${club.code}`">
          <v-card-text class="text-center pa-6">
            <v-avatar size="80" class="mb-4">
              <v-img
                v-if="club.images?.crest"
                :src="club.images.crest"
                :alt="club.name"
                :cover="false"
                class="club-avatar-img"
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

    <SharedEmptyState
      v-else
      title="No Clubs Found"
      message="No clubs available"
      icon="mdi-shield-off"
    />

    <div v-if="clubs?.total && clubs.total > pageSize" class="d-flex justify-center mt-6">
      <v-pagination
        v-model="pageProxy"
        :length="totalPages"
        :total-visible="5"
        rounded
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ClubsResponse {
  data?: any[]
  total?: number
}

interface Props {
  clubs: ClubsResponse | null
  pageSize: number
  currentPage: number
  totalPages: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update:page'])

const pageProxy = computed({
  get: () => props.currentPage,
  set: (value: number) => emit('update:page', value),
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

.club-avatar-img {
  object-fit: contain;
}

@media (max-width: 768px) {
  .club-card {
    border-radius: 8px;
  }
}
</style>
