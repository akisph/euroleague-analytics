<template>
  <component :is="isMobile ? StandingsMobile : StandingsDesktop" :title="title" :subtitle="subtitle" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

import StandingsDesktop from './StandingsDesktop.vue'
import StandingsMobile from './StandingsMobile.vue'

interface Props {
  title?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Standings',
  subtitle: 'Regular Season',
})

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
</script>
