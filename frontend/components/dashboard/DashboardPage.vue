<template>
  <component :is="isMobile ? DashboardMobile : DashboardDesktop" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

import DashboardDesktop from './DashboardDesktop.vue'
import DashboardMobile from './DashboardMobile.vue'

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
</script>
