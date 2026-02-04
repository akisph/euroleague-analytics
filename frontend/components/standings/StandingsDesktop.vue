<template>
  <StandingsContent :title="title" :subtitle="subtitle" />
</template>

<script setup lang="ts">
import StandingsContent from './StandingsContent.vue'

interface Props {
  title?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Standings',
  subtitle: 'Regular Season',
})
</script>
