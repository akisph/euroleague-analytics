<template>
  <component
    :is="isMobile ? LeadersMobile : LeadersDesktop"
    :selected-aggregate="selectedAggregate"
    :selected-category="selectedCategory"
    :aggregate-options="aggregateOptions"
    :category-options="categoryOptions"
    :leaders="leaders"
    :is-loading="isLoading"
    :error="error"
    :response-json="responseJson"
    @update:aggregate="$emit('update:aggregate', $event)"
    @update:category="$emit('update:category', $event)"
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
  aggregateOptions: OptionItem[]
  categoryOptions: OptionItem[]
  leaders: any[]
  isLoading: boolean
  error: string | null
  responseJson: string
}

defineProps<Props>()
defineEmits(['update:aggregate', 'update:category', 'dismiss-error'])

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
</script>
