<template>
  <v-card :class="cardClass">
    <v-card-text class="pa-4">
      <div class="d-flex align-center">
        <!-- Player Image -->
        <v-avatar size="64" :color="avatarColor" class="mr-4">
          <v-img v-if="player.imageUrl" :src="player.imageUrl" :alt="player.name" />
          <span v-else class="text-h5 font-weight-bold text-white">
            {{ playerInitials }}
          </span>
        </v-avatar>

        <!-- Player Info -->
        <div class="flex-grow-1">
          <div class="d-flex align-center mb-1">
            <span class="text-h6 font-weight-bold mr-2">{{ player.name }}</span>
            <v-chip v-if="player.dorsal" size="x-small" color="primary" variant="flat">
              #{{ player.dorsal }}
            </v-chip>
          </div>
          <div class="d-flex align-center text-body-2 text-medium-emphasis">
            <v-chip
              v-if="player.position"
              size="x-small"
              variant="tonal"
              class="mr-2"
            >
              {{ player.position }}
            </v-chip>
            <span v-if="player.countryName">
              <v-icon size="14" icon="mdi-flag" class="mr-1" />
              {{ player.countryName }}
            </span>
          </div>
          <div v-if="player.height || formattedBirthDate" class="d-flex align-center text-caption text-medium-emphasis mt-1">
            <span v-if="player.height" class="mr-3">
              <v-icon size="14" icon="mdi-human-male-height" class="mr-1" />
              {{ player.height }} cm
            </span>
            <span v-if="formattedBirthDate">
              <v-icon size="14" icon="mdi-cake-variant" class="mr-1" />
              {{ formattedBirthDate }}
            </span>
          </div>
        </div>

        <!-- Action -->
        <div v-if="showAction">
          <v-btn
            icon="mdi-chevron-right"
            variant="text"
            @click="$emit('click')"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Player } from '~/types'

interface Props {
  player: Player
  showAction?: boolean
  cardClass?: string
  avatarColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  showAction: false,
  avatarColor: 'primary',
})

defineEmits<{
  (e: 'click'): void
}>()

const playerInitials = computed(() => {
  const names = props.player.name.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }
  return props.player.name.substring(0, 2).toUpperCase()
})

const formattedBirthDate = computed(() => {
  if (!props.player.birthDate) return null
  const date = new Date(props.player.birthDate)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})
</script>
