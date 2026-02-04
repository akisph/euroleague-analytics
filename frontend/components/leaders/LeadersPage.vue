<template>
  <component
    :is="isMobile ? LeadersMobile : LeadersDesktop"
    :selected-aggregate="selectedAggregate"
    :selected-category="selectedCategory"
    :selected-teams="selectedTeams"
    :aggregate-options="aggregateOptions"
    :category-options="categoryOptions"
    :team-options="teamOptions"
    :leaders="leaders"
    :is-loading="isLoading"
    :error="error"
    :response-json="responseJson"
    @update:aggregate="$emit('update:aggregate', $event)"
    @update:category="$emit('update:category', $event)"
    @update:teams="$emit('update:teams', $event)"
    @dismiss-error="$emit('dismiss-error')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

import LeadersDesktop from './LeadersDesktop.vue'
import LeadersMobile from './LeadersMobile.vue'

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

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
</script>
