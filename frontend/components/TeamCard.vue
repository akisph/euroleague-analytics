<template>
  <v-card :class="cardClass">
    <v-card-text class="pa-4">
      <div class="d-flex align-center">
        <!-- Team Logo / Placeholder -->
        <div class="team-logo mr-4">
          <v-avatar size="60" :color="teamColor">
            <v-img v-if="logoUrl" :src="logoUrl" :alt="teamName" />
            <span v-else class="text-h5 font-weight-bold text-white">
              {{ teamInitials }}
            </span>
          </v-avatar>
        </div>

        <!-- Team Info -->
        <div class="flex-grow-1">
          <div class="text-h6 font-weight-bold">{{ teamName }}</div>
          <div class="text-body-2 text-medium-emphasis">{{ teamCode }}</div>
          <div v-if="country" class="text-caption text-medium-emphasis mt-1">
            <v-icon size="14" icon="mdi-map-marker" class="mr-1" />
            {{ country }}
          </div>
        </div>

        <!-- Stats -->
        <div v-if="showStats" class="text-right">
          <div class="text-h5 font-weight-bold text-primary">
            {{ wins }}-{{ losses }}
          </div>
          <div class="text-caption text-medium-emphasis">W-L Record</div>
        </div>

        <!-- Action -->
        <div v-if="showAction" class="ml-4">
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
interface Props {
  teamCode: string
  teamName: string
  logoUrl?: string
  country?: string
  wins?: number
  losses?: number
  showStats?: boolean
  showAction?: boolean
  cardClass?: string
  teamColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  showStats: false,
  showAction: false,
  teamColor: 'primary',
})

defineEmits<{
  (e: 'click'): void
}>()

const teamInitials = computed(() => {
  return props.teamCode.substring(0, 3).toUpperCase()
})
</script>
