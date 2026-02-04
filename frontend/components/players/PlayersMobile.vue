<template>
  <div class="players-mobile">
    <SharedErrorAlert v-if="error" :error="error" @dismiss="$emit('dismiss-error')" />

    <SharedLoadingState :loading="isLoading" message="Loading players...">
      <div class="players-card">
        <div class="players-filters">
          <v-text-field
            v-model="searchProxy"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search players..."
            variant="outlined"
            density="compact"
            clearable
            hide-details
            class="filter-field"
          />
          <v-select
            v-model="selectedTeamProxy"
            :items="teamOptions"
            item-title="clubName"
            item-value="clubCode"
            placeholder="All teams"
            variant="outlined"
            density="compact"
            clearable
            prepend-inner-icon="mdi-shield-account"
            hide-details
            class="filter-field"
          />
        </div>

        <div v-if="players.length" class="players-list">
          <div
            v-for="player in players"
            :key="player.playerCode"
            class="player-row"
            @click="navigateToPlayer(player.playerCode)"
          >
            <v-avatar size="40" class="player-avatar">
              <v-img
                v-if="player.headshotImageUrl || player.imageUrl"
                :src="player.headshotImageUrl || player.imageUrl"
                :alt="player.name"
                :cover="false"
                class="player-avatar-img"
              />
              <span v-else class="player-avatar-fallback">
                {{ getInitials(player.name) }}
              </span>
            </v-avatar>

            <div class="player-main">
              <div class="player-top">
                <div class="player-name">{{ player.name }}</div>
                <div class="player-team">{{ player.clubCode || '-' }}</div>
              </div>
              <div class="player-stats">
                <div class="stat">
                  <span class="stat-label">PIR</span>
                  <span class="stat-value">{{ formatValue(player.calculatedPIR) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">PTS</span>
                  <span class="stat-value">{{ formatValue(player.calculatedPPG) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">REB</span>
                  <span class="stat-value">{{ formatValue(player.calculatedRPG) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">AST</span>
                  <span class="stat-value">{{ formatValue(player.calculatedAPG) }}</span>
                </div>
              </div>
            </div>

            <v-icon icon="mdi-chevron-right" class="row-chevron" />
          </div>
        </div>

        <SharedEmptyState
          v-else
          icon="mdi-account-off"
          title="No players found"
          :message="emptyMessage"
        />
      </div>
    </SharedLoadingState>

    <v-fade-transition>
      <v-btn
        v-if="showScrollTop"
        class="scroll-top-btn"
        icon
        size="small"
        variant="tonal"
        color="primary"
        @click="scrollToTop"
      >
        <v-icon icon="mdi-arrow-up" />
      </v-btn>
    </v-fade-transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface TeamOption {
  clubCode: string
  clubName: string
}

interface Props {
  searchTerm: string
  selectedTeam: string | null
  teamOptions: TeamOption[]
  players: any[]
  isLoading: boolean
  error: string | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:search-term', 'update:selected-team', 'dismiss-error'])

const router = useRouter()
const seasonStore = useSeasonStore()

const showScrollTop = ref(false)

const searchProxy = computed({
  get: () => props.searchTerm,
  set: (value: string | null) => emit('update:search-term', value ?? ''),
})

const selectedTeamProxy = computed({
  get: () => props.selectedTeam,
  set: (value: string | null) => emit('update:selected-team', value),
})

const emptyMessage = computed(() => {
  return props.searchTerm || props.selectedTeam
    ? 'Try adjusting your search or filters'
    : 'No players available for this season'
})

const navigateToPlayer = (playerCode: string) => {
  const season = seasonStore.selectedSeasonCode
  if (!season) return
  router.push(`/players/${season}/${playerCode}`)
}

const getInitials = (name: string) => {
  const names = String(name || '').trim().split(' ').filter(Boolean)
  if (!names.length) return '-'
  if (names.length >= 2) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  return names[0].substring(0, 2).toUpperCase()
}

const formatValue = (value: number) => {
  if (!Number.isFinite(value)) return '-'
  return value.toFixed(2)
}

const onScroll = () => {
  showScrollTop.value = window.scrollY > 220
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.players-card {
  background: #ffffff;
  border: 1px solid #e0e6f0;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 8px 20px rgba(26, 39, 66, 0.08);
  margin: 16px;
}

.players-filters {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.filter-field {
  background: #f9fafb;
  border-radius: 10px;
}

:deep(.filter-field .v-field) {
  background: #f9fafb;
  color: #1a2742;
}

:deep(.filter-field .v-label) {
  color: #6b7384;
}

:deep(.filter-field .v-field__input) {
  color: #1a2742;
}

:deep(.filter-field .v-field__outline) {
  --v-field-border-opacity: 1;
  border-color: #d6dce8;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.player-row {
  display: grid;
  grid-template-columns: 44px 1fr 20px;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.65rem;
  background: #f9fafb;
  border-radius: 14px;
  cursor: pointer;
}

.player-row:hover {
  background: #f0f7ff;
}

.player-avatar {
  background: #eef1f6;
  color: #1a2742;
  font-weight: 600;
}

.player-avatar-img {
  object-fit: contain;
}

.player-avatar-fallback {
  font-size: 0.75rem;
  font-weight: 600;
}

.player-main {
  min-width: 0;
}

.player-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.player-name {
  font-size: 0.86rem;
  font-weight: 600;
  color: #1a2742;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-team {
  font-size: 0.7rem;
  font-weight: 600;
  color: #8a92a2;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex: 0 0 auto;
}

.player-stats {
  margin-top: 0.35rem;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.35rem;
}

.stat {
  background: #ffffff;
  border: 1px solid #e8edf6;
  border-radius: 10px;
  padding: 0.3rem 0.35rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 0.62rem;
  color: #8a92a2;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.stat-value {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1a2742;
}

.row-chevron {
  color: #8a92a2;
}

.scroll-top-btn {
  position: fixed;
  right: 16px;
  bottom: 18px;
  z-index: 20;
  border: 1px solid #d6dce8;
  box-shadow: 0 10px 24px rgba(26, 39, 66, 0.14);
  backdrop-filter: blur(6px);
}

@media (max-width: 420px) {
  .player-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
