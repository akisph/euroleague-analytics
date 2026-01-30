<template>
  <v-card class="empty-state text-center pa-8">
    <v-icon :icon="icon" :size="80" color="grey-lighten-2" class="mb-4" />
    <div class="text-h6 mb-2">{{ title }}</div>
    <div class="text-body-2 text-medium-emphasis mb-4">{{ message }}</div>
    <v-btn
      v-if="actionText"
      color="primary"
      variant="flat"
      @click="$emit('action')"
    >
      {{ actionText }}
    </v-btn>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  title: string
  message: string
  icon?: string
  actionText?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'mdi-magnify',
})

defineEmits<{
  (e: 'action'): void
}>()
</script>

<style scoped>
.empty-state {
  background-color: #ffffff !important;
  border: 1px solid #e0e6f0 !important;
  color: #8a92a2;
}

.empty-state :deep(.v-icon) {
  color: #c8d1e0 !important;
}

.empty-state :deep(.text-h6) {
  color: #1a2742 !important;
  font-weight: 700;
}

.empty-state :deep(.text-body-2) {
  color: #8a92a2 !important;
}

@media (max-width: 768px) {
  .empty-state {
    padding: 2rem 1rem !important;
  }
}
</style>
