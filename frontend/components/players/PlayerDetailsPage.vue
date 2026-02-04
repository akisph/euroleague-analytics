<template>
  <component
    :is="isMobile ? PlayerDetailsMobile : PlayerDetailsDesktop"
    :player="player"
    :season-code="seasonCode"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

import PlayerDetailsDesktop from './PlayerDetailsDesktop.vue'
import PlayerDetailsMobile from './PlayerDetailsMobile.vue'

interface Props {
  player: any
  seasonCode: string
}

defineProps<Props>()

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
</script>

