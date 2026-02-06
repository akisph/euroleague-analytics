<template>
  <div class="fantasy-team-page">
    <div class="fantasy-team-filters">
      <v-btn-toggle
        v-model="positionModel"
        mandatory
        density="comfortable"
        class="position-toggle"
      >
        <v-btn
          v-for="option in positionOptions"
          :key="option.value"
          :value="option.value"
          class="position-btn"
          variant="outlined"
        >
          {{ option.label }}
        </v-btn>
      </v-btn-toggle>
    </div>

    <component
      :is="isMobile ? FantasyTeamMobile : FantasyTeamDesktop"
      :items="items"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import type { FantasyTeamPirAllowed } from '~/types'

import FantasyTeamDesktop from './FantasyTeamDesktop.vue'
import FantasyTeamMobile from './FantasyTeamMobile.vue'

interface Props {
  items: FantasyTeamPirAllowed[]
  positionId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:positionId': [number] }>()

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)

const positionOptions = [
  { label: 'Guards', value: 1 },
  { label: 'Forwards', value: 2 },
  { label: 'Centers', value: 3 },
]

const positionModel = computed({
  get: () => props.positionId,
  set: (value: number) => emit('update:positionId', value),
})
</script>

<style scoped>
.fantasy-team-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fantasy-team-filters {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.position-toggle {
  background: transparent;
  border-radius: 999px;
  padding: 0.25rem;
  border: none;
}

.position-btn {
  font-weight: 600;
  letter-spacing: 0.02em;
}

.position-toggle :deep(.v-btn) {
  border-radius: 999px;
  text-transform: uppercase;
}

.position-toggle :deep(.v-btn--variant-outlined) {
  border-color: #e0e6f0;
}

.position-toggle :deep(.v-btn--active) {
  background-color: #F05323 !important;
  color: #ffffff !important;
  border-color: #F05323 !important;
}

.position-toggle :deep(.v-btn:not(.v-btn--active)) {
  background-color: #ffffff !important;
  color: #1a2742 !important;
}

@media (max-width: 768px) {
  .position-toggle {
    padding: 0.15rem;
  }

  .position-toggle :deep(.v-btn) {
    font-size: 0.7rem;
    padding: 0.35rem 0.6rem;
    min-width: auto;
  }
}
</style>
