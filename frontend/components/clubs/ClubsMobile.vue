<template>
  <div class="clubs-mobile">
    <div v-if="clubs?.data?.length" class="clubs-list">
      <div
        v-for="club in clubs.data"
        :key="club.code"
        class="club-row"
        @click="navigateTo(`/clubs/${club.code}`)"
      >
        <v-avatar size="46" class="club-avatar">
          <v-img
            v-if="club.images?.crest"
            :src="club.images.crest"
            :alt="club.name"
            :cover="false"
            class="club-avatar-img"
          />
          <span v-else class="club-code">{{ club.code.substring(0, 3) }}</span>
        </v-avatar>

        <div class="club-main">
          <div class="club-name">{{ club.name }}</div>
          <div class="club-meta">
            <span class="club-alias">{{ club.alias }}</span>
            <span v-if="club.country" class="club-country">
              <v-icon size="12" icon="mdi-flag" class="mr-1" />
              {{ club.country.name }}
            </span>
          </div>
        </div>

        <v-chip
          v-if="club.isVirtual"
          size="x-small"
          color="warning"
          variant="flat"
          class="virtual-chip"
        >
          Virtual
        </v-chip>
        <v-icon icon="mdi-chevron-right" class="row-chevron" />
      </div>
    </div>

    <SharedEmptyState
      v-else
      title="No Clubs Found"
      message="No clubs available"
      icon="mdi-shield-off"
    />

    <div v-if="clubs?.total && clubs.total > pageSize" class="d-flex justify-center mt-5">
      <v-pagination
        v-model="pageProxy"
        :length="totalPages"
        :total-visible="4"
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
const router = useRouter()

const pageProxy = computed({
  get: () => props.currentPage,
  set: (value: number) => emit('update:page', value),
})

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.clubs-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.club-row {
  display: grid;
  grid-template-columns: 52px 1fr auto 20px;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.8rem;
  border-radius: 14px;
  background: #f9fafb;
  border: 1px solid #eef2f7;
  cursor: pointer;
}

.club-row:hover {
  background: #f0f7ff;
}

.club-avatar {
  color: #1a2742;
  font-weight: 700;
}

.club-avatar-img {
  object-fit: contain;
}

.club-code {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.club-main {
  min-width: 0;
}

.club-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a2742;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.club-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.2rem;
  font-size: 0.72rem;
  color: #8a92a2;
  font-weight: 600;
}

.club-country {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.virtual-chip {
  font-weight: 700;
}

.row-chevron {
  color: #8a92a2;
}
</style>
