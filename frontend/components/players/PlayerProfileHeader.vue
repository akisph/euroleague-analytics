<template>
  <v-card elevation="0" class="profile-card h-100">
    <v-card-text class="text-center pa-8">
      <v-avatar size="140" class="mb-6 avatar-shadow" color="grey-lighten-3">
        <v-img v-if="player.imageUrl" :src="player.imageUrl" :alt="player.name" />
        <span v-else class="text-h4 font-weight-bold">{{ playerInitials }}</span>
      </v-avatar>
      <h1 class="text-h5 font-weight-bold mb-2">{{ player.name }}</h1>
      <p v-if="player.alias" class="text-body-2 text-medium-emphasis mb-6">
        {{ player.alias }}
      </p>
      <div class="d-flex gap-2 justify-center flex-wrap">
        <v-chip v-if="player.dorsal" color="primary" variant="flat" size="small" class="font-weight-bold">
          #{{ player.dorsal }}
        </v-chip>
        <v-chip v-if="player.position" variant="tonal" size="small" class="font-weight-bold">
          {{ player.position }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '~/types'

interface Props {
  player: Player
}

const props = defineProps<Props>()

const playerInitials = computed(() => {
  if (!props.player.name) return ''
  const names = props.player.name.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }
  return props.player.name.substring(0, 2).toUpperCase()
})
</script>

<style scoped>
.profile-card {
  background: linear-gradient(135deg, rgba(240, 83, 35, 0.03) 0%, rgba(240, 83, 35, 0.01) 100%);
  border: 1px solid rgba(240, 83, 35, 0.08);
  transition: all 0.3s ease;
}

.profile-card:hover {
  border-color: rgba(240, 83, 35, 0.16);
}

.avatar-shadow {
  box-shadow: 0 8px 16px rgba(240, 83, 35, 0.12);
}
</style>
