<template>
  <div class="leaders-page">
    <div class="page-container">
      <v-card class="filters-card mb-6" elevation="0">
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                :model-value="selectedAggregate"
                :items="aggregateOptions"
                item-title="label"
                item-value="value"
                label="Aggregate"
                density="comfortable"
                variant="outlined"
                class="filter-select"
                :menu-props="{ contentClass: 'leaders-select-menu' }"
                hide-details
                @update:model-value="$emit('update:aggregate', $event)"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                :model-value="selectedCategory"
                :items="categoryOptions"
                item-title="label"
                item-value="value"
                label="Category"
                density="comfortable"
                variant="outlined"
                class="filter-select"
                :menu-props="{ contentClass: 'leaders-select-menu' }"
                hide-details
                @update:model-value="$emit('update:category', $event)"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                :model-value="selectedTeams"
                :items="teamOptions"
                item-title="label"
                item-value="value"
                label="Teams"
                density="comfortable"
                variant="outlined"
                class="filter-select"
                :menu-props="{ contentClass: 'leaders-select-menu' }"
                multiple
                chips
                clearable
                hide-details
                @update:model-value="$emit('update:teams', $event)"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <SharedLoadingState v-if="isLoading" :loading="true" />
      <SharedErrorAlert v-if="error" :error="error" @dismiss="$emit('dismiss-error')" />

      <SharedEmptyState
        v-if="!isLoading && leaders.length === 0"
        icon="mdi-account-off"
        title="No leaders found"
        message="No data available for the selected filters."
      />

      <v-card v-if="!isLoading && leaders.length > 0" elevation="0" class="leaders-table-card mb-6">
        <v-data-table
          :headers="tableHeaders"
          :items="leaders"
          :items-per-page="-1"
          class="leaders-table"
          hide-default-footer
        >
          <template #item.rank="{ item, index }">
            {{ item.rank ?? index + 1 }}
          </template>
          <template #item.playerName="{ item }">
            <div class="d-flex align-center gap-2">
              <v-avatar size="32" class="leader-avatar">
                <v-img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.playerName || item.name || 'Player'"
                  cover="false"
                  class="leader-avatar-img"
                />
                <span v-else class="leader-avatar-fallback">
                  {{ (item.playerName || item.name || '-').slice(0, 1).toUpperCase() }}
                </span>
              </v-avatar>
              <div class="font-weight-medium">
                {{ item.playerName || item.name || '-' }}
              </div>
            </div>
          </template>
          <template #item.value="{ item }">
            {{ formatValue(item.value) }}
          </template>
        </v-data-table>
      </v-card>

      <v-card v-if="responseJson" elevation="0" class="response-card">
        <v-card-title class="text-subtitle-1 font-weight-bold">
          Raw Response
        </v-card-title>
        <v-card-text class="response-body">
          <pre>{{ responseJson }}</pre>
        </v-card-text>
      </v-card>
    </div>
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
  selectedTeams: string[]
  aggregateOptions: OptionItem[]
  categoryOptions: OptionItem[]
  teamOptions: OptionItem[]
  leaders: any[]
  isLoading: boolean
  error: string | null
  responseJson: string
}

defineProps<Props>()
defineEmits(['update:aggregate', 'update:category', 'update:teams', 'dismiss-error'])

const tableHeaders = [
  { title: 'Rank', key: 'rank', sortable: true, width: '80px' },
  { title: 'Player', key: 'playerName', sortable: true, width: '240px' },
  { title: 'Player Code', key: 'playerCode', sortable: true, width: '120px' },
  { title: 'Club', key: 'clubCode', sortable: true, width: '120px' },
  { title: 'Value', key: 'value', sortable: true, width: '120px' },
] as const

const formatValue = (value: number) => {
  if (!Number.isFinite(value)) return '-'
  return value.toFixed(2)
}
</script>

<style scoped>
.leaders-page {
  min-height: 100vh;
}

.page-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 32px 24px;
}

.filters-card {
  border: 1px solid #e0e6f0;
  border-radius: 12px;
  background: white;
}

.filter-select {
  min-width: 180px;
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

.leaders-table-card {
  border: 1px solid #e0e6f0;
  border-radius: 12px;
  overflow: hidden;
}

.response-card {
  border: 1px solid #e0e6f0;
  border-radius: 12px;
}

.response-body {
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  overflow: auto;
}

.response-body pre {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
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

:deep(.v-data-table) {
  background: white;
}

:deep(.v-data-table .v-data-table__thead) {
  background: #fafbfc;
}

:deep(.v-data-table thead th) {
  font-weight: 600 !important;
  color: #1a2742 !important;
  font-size: 0.875rem !important;
  border-bottom: 2px solid #e0e6f0 !important;
  padding: 16px !important;
}

:deep(.v-data-table tbody td) {
  border-bottom: 1px solid #f0f2f5 !important;
  padding: 12px 16px !important;
  font-size: 0.875rem;
  color: #1a2742;
}

@media (max-width: 960px) {
  .page-container {
    padding: 16px;
  }
}
</style>
