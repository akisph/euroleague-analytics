<template>
  <v-card elevation="0" class="info-card">
    <v-card-title class="pb-4">
      <v-icon icon="mdi-account-circle" class="mr-2 primary-icon" />
      Player Information
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-6">
      <v-row>
        <v-col cols="12" sm="6">
          <div class="info-group">
            <v-list density="compact">
              <v-list-item v-if="player.countryName" class="px-0 py-2">
                <template #prepend>
                  <v-icon icon="mdi-flag" class="mr-3 info-icon" size="small" />
                </template>
                <v-list-item-title class="text-caption font-weight-bold">Nationality</v-list-item-title>
                <v-list-item-subtitle>{{ player.countryName }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="player.birthDate" class="px-0 py-2">
                <template #prepend>
                  <v-icon icon="mdi-cake-variant" class="mr-3 info-icon" size="small" />
                </template>
                <v-list-item-title class="text-caption font-weight-bold">Birth Date</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(player.birthDate) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="playerAge" class="px-0 py-2">
                <template #prepend>
                  <v-icon icon="mdi-calendar" class="mr-3 info-icon" size="small" />
                </template>
                <v-list-item-title class="text-caption font-weight-bold">Age</v-list-item-title>
                <v-list-item-subtitle>{{ playerAge }} years</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
        </v-col>
        <v-col cols="12" sm="6">
          <v-list density="compact">
            <v-list-item v-if="player.height" class="px-0 py-2">
              <template #prepend>
                <v-icon icon="mdi-human-male-height" class="mr-3 info-icon" size="small" />
              </template>
              <v-list-item-title class="text-caption font-weight-bold">Height</v-list-item-title>
              <v-list-item-subtitle>{{ player.height }} cm ({{ heightInFeet }})</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="player.position" class="px-0 py-2">
              <template #prepend>
                <v-icon icon="mdi-basketball" class="mr-3 info-icon" size="small" />
              </template>
              <v-list-item-title class="text-caption font-weight-bold">Position</v-list-item-title>
              <v-list-item-subtitle>{{ player.position }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item class="px-0 py-2">
              <template #prepend>
                <v-icon icon="mdi-identifier" class="mr-3 info-icon" size="small" />
              </template>
              <v-list-item-title class="text-caption font-weight-bold">Player Code</v-list-item-title>
              <v-list-item-subtitle>{{ player.playerCode }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
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

const playerAge = computed(() => {
  if (!props.player?.birthDate) return null
  const birthDate = new Date(props.player.birthDate)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
})

const heightInFeet = computed(() => {
  if (!props.player?.height) return ''
  const totalInches = props.player.height / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}"`
})

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.info-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.info-group {
  padding-right: 8px;
}

.info-icon {
  color: #F05323;
}

.primary-icon {
  color: #F05323 !important;
}

:deep(.v-card-title) {
  color: #1a2742 !important;
  font-weight: 600;
  font-size: 16px;
}

:deep(.v-divider) {
  opacity: 0.4;
}

:deep(.v-list-item) {
  min-height: auto;
  padding: 6px 0;
}

:deep(.v-list-item-title) {
  font-size: 12px;
  font-weight: 600;
  color: #8a92a2;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

:deep(.v-list-item-subtitle) {
  font-size: 14px;
  font-weight: 500;
  color: #1a2742;
}
</style>
