<template>
  <component :is="isMobile ? GameDetailsMobile : GameDetailsDesktop" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

import GameDetailsDesktop from './GameDetailsDesktop.vue'
import GameDetailsMobile from './GameDetailsMobile.vue'

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
</script>
