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
          <v-card-text class="pa-5">
            <div class="club-card-header">
              <v-avatar size="64" class="club-avatar">
                <v-img
                  v-if="club.images?.crest"
                  :src="club.images.crest"
                  :alt="club.name"
                  :cover="false"
                  class="club-avatar-img"
                />
                <span v-else class="club-avatar-fallback">
                  {{ club.code.substring(0, 3) }}
                </span>
              </v-avatar>
              <div class="club-main">
                <div class="club-name">{{ club.name }}</div>
                <div class="club-alias">{{ club.alias }}</div>
              </div>
            </div>

            <div class="club-chips">
              <v-chip v-if="club.country" size="small" variant="tonal" class="club-chip">
                <v-icon size="14" icon="mdi-flag" class="mr-1" />
                {{ club.country.name }}
              </v-chip>
              <v-chip v-if="club.city" size="small" variant="outlined" class="club-chip">
                <v-icon size="14" icon="mdi-city-variant-outline" class="mr-1" />
                {{ club.city }}
              </v-chip>
              <v-chip v-if="club.isVirtual" size="small" variant="tonal" class="club-chip">
                Virtual
              </v-chip>
            </div>
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
  border-radius: 16px;
}

.club-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.club-card :deep(.v-card-text) {
  background-color: #ffffff;
}

.club-card :deep(a) {
  color: inherit;
  text-decoration: none;
}

.club-card :deep(a:hover) {
  text-decoration: none;
}

.club-card-header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.club-avatar {
  background: transparent;
  color: #1a2742;
  font-weight: 700;
}

.club-avatar-img {
  object-fit: contain;
}

.club-avatar-fallback {
  font-size: 0.95rem;
  font-weight: 700;
}

.club-main {
  min-width: 0;
}

.club-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1a2742;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.club-alias {
  font-size: 0.82rem;
  color: #516078;
}

.club-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.club-chip {
  background: rgba(26, 39, 66, 0.08) !important;
  color: #1a2742 !important;
  border-color: rgba(26, 39, 66, 0.25) !important;
}
</style>
