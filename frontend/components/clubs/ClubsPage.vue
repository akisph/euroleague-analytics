<template>
  <component
    :is="isMobile ? ClubsMobile : ClubsDesktop"
    :clubs="clubs"
    :page-size="pageSize"
    :current-page="currentPage"
    :total-pages="totalPages"
    @update:page="$emit('update:page', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

import ClubsDesktop from './ClubsDesktop.vue'
import ClubsMobile from './ClubsMobile.vue'

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

defineProps<Props>()
defineEmits(['update:page'])

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
</script>
