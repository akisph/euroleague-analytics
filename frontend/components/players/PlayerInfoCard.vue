<template>
  <v-card elevation="0" class="info-card">
    <!-- Profile Header Section -->
    <v-card-text class="text-center pa-8 profile-section">
      <v-avatar size="180" class="mb-4 avatar-shadow" color="grey-lighten-3">
        <v-img 
          v-if="player.actionImageUrl" 
          :src="player.actionImageUrl" 
          :alt="player.name"
          contain
          position="center top"
          class="player-avatar-img"
        />
        <span v-else class="text-h5 font-weight-bold">{{ playerInitials }}</span>
      </v-avatar>
      <h1 class="text-h5 font-weight-bold mb-1">{{ player.name }}</h1>
      <p v-if="player.clubName" class="text-body-2 text-primary font-weight-600 mb-3">
        {{ player.clubName }}
      </p>
      <div class="d-flex gap-2 justify-center flex-wrap mb-4">
        <v-chip v-if="player.dorsal" color="primary" variant="flat" size="small" class="font-weight-bold">
          #{{ player.dorsal }}
        </v-chip>
        <v-chip v-if="player.position" variant="tonal" size="small" class="font-weight-bold">
          {{ player.position }}
        </v-chip>
      </div>
    </v-card-text>

    <v-divider />

    <!-- Player Information Section -->
    <v-row class="info-section pa-6">
      <v-col cols="12" sm="6" md="3">
        <div v-if="player.countryName" class="info-item-grid">
          <v-icon icon="mdi-flag" class="mb-2 info-icon" size="small" />
          <div class="info-label">Country</div>
          <div class="info-value">{{ player.countryName }}</div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <div v-if="player.height" class="info-item-grid">
          <v-icon icon="mdi-human-male-height" class="mb-2 info-icon" size="small" />
          <div class="info-label">Height</div>
          <div class="info-value">{{ player.height }} cm ({{ heightInFeet }})</div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <div v-if="player.weight" class="info-item-grid">
          <v-icon icon="mdi-weight-kilogram" class="mb-2 info-icon" size="small" />
          <div class="info-label">Weight</div>
          <div class="info-value">{{ player.weight }} kg</div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <div v-if="playerAge" class="info-item-grid">
          <v-icon icon="mdi-calendar" class="mb-2 info-icon" size="small" />
          <div class="info-label">Age</div>
          <div class="info-value">{{ playerAge }} years</div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <div v-if="player.birthDate" class="info-item-grid">
          <v-icon icon="mdi-cake-variant" class="mb-2 info-icon" size="small" />
          <div class="info-label">Birthday</div>
          <div class="info-value">{{ formatDate(player.birthDate) }}</div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <div v-if="player.instagramAccount" class="info-item-grid">
          <v-icon icon="mdi-instagram" class="mb-2 info-icon" size="small" />
          <div class="info-label">Instagram</div>
          <v-btn
            :href="`https://instagram.com/${player.instagramAccount}`"
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            size="x-small"
            color="primary"
            class="pl-0"
          >
            @{{ player.instagramAccount }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
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

.avatar-shadow {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.player-avatar-img {
  width: 100%;
  height: 100%;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.info-item:last-child {
  border-bottom: none;
}

.info-row {
  display: flex;
  gap: 24px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.info-row:last-child {
  border-bottom: none;
}

.info-item-compact {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.info-icon {
  color: #F05323 !important;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.info-label {
  font-size: 11px;
  font-weight: 700;
  color: #8a92a2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #1a2742;
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

:deep(.v-chip) {
  height: auto;
}
</style>
