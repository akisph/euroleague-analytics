<template>
  <div class="fantasy-players-page">
    <div class="fantasy-players-filters">
      <v-btn-toggle
        v-model="positionModel"
        multiple
        density="comfortable"
        class="stats-toggle"
      >
        <v-btn
          v-for="option in positionOptions"
          :key="option.value"
          :value="option.value"
          class="stats-btn"
          variant="outlined"
        >
          {{ option.label }}
        </v-btn>
      </v-btn-toggle>

      <v-select
        v-model="teamModel"
        :items="teamOptions"
        item-title="title"
        item-value="value"
        label="Team"
        density="compact"
        variant="outlined"
        hide-details
        class="team-select"
      />

      <v-text-field
        v-model="searchModel"
        label="Search player"
        persistent-label
        density="compact"
        variant="outlined"
        hide-details
        class="search-input"
        clearable
      />
    </div>

    <component
      :is="isMobile ? FantasyPlayersMobile : FantasyPlayersDesktop"
      :items="items"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import type { FantasyPlayerStats } from '~/types'

import FantasyPlayersDesktop from './FantasyPlayersDesktop.vue'
import FantasyPlayersMobile from './FantasyPlayersMobile.vue'

interface Props {
  items: FantasyPlayerStats[]
  positions: Array<'G' | 'F' | 'C'>
  teamCode: string
  search: string
  teamOptions: Array<{ title: string; value: string }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:positions': [Array<'G' | 'F' | 'C'>]
  'update:teamCode': [string]
  'update:search': [string]
}>()

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)

const positionOptions = [
  { label: 'G', value: 'G' },
  { label: 'F', value: 'F' },
  { label: 'C', value: 'C' },
]

const positionModel = computed({
  get: () => props.positions,
  set: (value: Array<'G' | 'F' | 'C'>) => emit('update:positions', value),
})

const teamModel = computed({
  get: () => props.teamCode,
  set: (value: string) => emit('update:teamCode', value),
})

const searchModel = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value),
})
</script>

<style scoped>
.fantasy-players-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fantasy-players-filters {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.stats-toggle {
  background: transparent;
  border-radius: 999px;
  padding: 0.25rem;
  border: none;
}

.stats-toggle :deep(.v-btn) {
  border-radius: 0;
  text-transform: uppercase;
}

.stats-toggle :deep(.v-btn:first-child) {
  border-top-left-radius: 999px;
  border-bottom-left-radius: 999px;
}

.stats-toggle :deep(.v-btn:last-child) {
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;
}

.stats-toggle :deep(.v-btn--variant-outlined) {
  border-color: #e0e6f0;
}

.stats-toggle :deep(.v-btn--active) {
  background-color: #F05323 !important;
  color: #ffffff !important;
  border-color: #F05323 !important;
}

.stats-toggle :deep(.v-btn:not(.v-btn--active)) {
  background-color: #ffffff !important;
  color: #1a2742 !important;
}

.team-select {
  min-width: 180px;
}

.search-input {
  min-width: 200px;
}

.team-select :deep(.v-field) {
  background: #ffffff;
}

.team-select :deep(.v-field__input) {
  color: #1a2742;
  font-weight: 600;
}

.search-input :deep(.v-field) {
  background: #ffffff;
}

.search-input :deep(.v-field__input) {
  color: #1a2742;
  font-weight: 600;
}

.search-input :deep(.v-label) {
  color: #1a2742;
  font-weight: 700;
}

@media (max-width: 768px) {
  .team-select {
    min-width: 140px;
  }

  .search-input {
    min-width: 160px;
  }
}

@media (max-width: 768px) {
  .stats-toggle {
    padding: 0.15rem;
  }

  .stats-toggle :deep(.v-btn) {
    font-size: 0.7rem;
    padding: 0.35rem 0.6rem;
    min-width: auto;
  }
}
</style>
