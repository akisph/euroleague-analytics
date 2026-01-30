<template>
  <v-card class="stats-card" :class="cardClass">
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-2">
        <v-icon :icon="icon" :color="iconColor" size="40" class="opacity-70" />
        <v-chip v-if="trend" :color="trend > 0 ? 'success' : 'error'" size="small" variant="tonal">
          <v-icon size="14" :icon="trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down'" />
          {{ Math.abs(trend) }}%
        </v-chip>
      </div>
      <div class="text-h4 font-weight-bold mb-1">{{ formattedValue }}</div>
      <div class="text-body-2 text-medium-emphasis">{{ title }}</div>
      <div v-if="subtitle" class="text-caption text-medium-emphasis mt-1">{{ subtitle }}</div>
    </v-card-text>
    <v-progress-linear
      v-if="showProgress && progress !== undefined"
      :model-value="progress"
      :color="iconColor"
      height="4"
      class="rounded-b-lg"
    />
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: number | string
  icon: string
  iconColor?: string
  subtitle?: string
  trend?: number
  showProgress?: boolean
  progress?: number
  cardClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  showProgress: false,
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})
</script>

<style scoped>
.stats-card {
  background-color: #ffffff !important;
  border: 1px solid #e0e6f0 !important;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stats-card :deep(.text-h4) {
  color: #1a2742 !important;
}

.stats-card :deep(.text-body-2) {
  color: #8a92a2 !important;
}

.stats-card :deep(.text-caption) {
  color: #b0b8c8 !important;
}

@media (max-width: 768px) {
  .stats-card {
    margin-bottom: 1rem;
  }
}
</style>
