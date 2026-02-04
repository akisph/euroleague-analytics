<template>
  <div class="leaders-mobile">
    <SharedErrorAlert v-if="error" :error="error" @dismiss="$emit('dismiss-error')" />

    <SharedLoadingState :loading="isLoading" message="Loading leaders...">
      <div class="leaders-card">
        <div class="leaders-filters">
          <v-select
            :model-value="selectedAggregate"
            :items="aggregateOptions"
            item-title="label"
            item-value="value"
            label="Aggregate"
            density="compact"
            variant="outlined"
            class="filter-select"
            hide-details
            @update:model-value="$emit('update:aggregate', $event)"
          />
          <v-select
            :model-value="selectedCategory"
            :items="categoryOptions"
            item-title="label"
            item-value="value"
            label="Category"
            density="compact"
            variant="outlined"
            class="filter-select"
            hide-details
            @update:model-value="$emit('update:category', $event)"
          />
        </div>

        <div v-if="leaders.length" class="leaders-list">
          <div
            v-for="(player, index) in leaders"
            :key="player.playerCode ?? player.name ?? index"
            class="leader-row"
          >
            <div class="rank-pill">{{ index + 1 }}</div>
            <v-avatar size="36" class="leader-avatar">
              <v-img
                v-if="player.imageUrl"
                :src="player.imageUrl"
                :alt="player.playerName || player.name || 'Player'"
                cover="false"
                class="leader-avatar-img"
              />
              <span v-else class="leader-avatar-fallback">
                {{ (player.playerName || player.name || '-').slice(0, 1).toUpperCase() }}
              </span>
            </v-avatar>
            <div class="leader-info">
              <div class="leader-name">{{ player.playerName || player.name || '-' }}</div>
              <div class="leader-team">{{ player.clubCode || '-' }}</div>
            </div>
            <div class="leader-value">{{ formatValue(player.value) }}</div>
          </div>
        </div>

        <SharedEmptyState
          v-else
          title="No leaders found"
          message="No data available for the selected filters."
          icon="mdi-account"
        />
      </div>
    </SharedLoadingState>
  </div>
</template>

<script setup lang="ts">
interface OptionItem {
  label: string
  value: string
}

interface Props {
  selectedAggregate: string
  selectedCategory: string
  aggregateOptions: OptionItem[]
  categoryOptions: OptionItem[]
  leaders: any[]
  isLoading: boolean
  error: string | null
}

defineProps<Props>()
defineEmits(['update:aggregate', 'update:category', 'dismiss-error'])

const formatValue = (value: number) => {
  if (!Number.isFinite(value)) return '-'
  return value.toFixed(2)
}
</script>

<style scoped>
.leaders-card {
  background: #ffffff;
  border: 1px solid #e0e6f0;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 8px 20px rgba(26, 39, 66, 0.08);
}

.leaders-filters {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.filter-select {
  background: #f9fafb;
  border-radius: 10px;
}

:deep(.filter-select .v-field) {
  background: #f9fafb;
  color: #1a2742;
}

:deep(.filter-select .v-field__outline) {
  --v-field-border-opacity: 1;
  border-color: #d6dce8;
}

:deep(.filter-select .v-label) {
  color: #6b7384;
}

:deep(.filter-select .v-field__input) {
  color: #1a2742;
}

.leaders-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.leader-row {
  display: grid;
  grid-template-columns: 28px 40px 1fr auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  background: #f9fafb;
  border-radius: 12px;
}

.rank-pill {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.7rem;
  color: #ffffff;
  background: #F05323;
}

.leader-avatar {
  flex: 0 0 auto;
  background: #eef1f6;
  color: #1a2742;
  font-weight: 700;
}

.leader-avatar-img {
  object-fit: contain;
}

.leader-avatar-fallback {
  font-size: 0.75rem;
}

.leader-info {
  min-width: 0;
}

.leader-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a2742;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.leader-team {
  font-size: 0.7rem;
  color: #8a92a2;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.leader-value {
  font-weight: 700;
  color: #1a2742;
  font-size: 0.9rem;
}
</style>
