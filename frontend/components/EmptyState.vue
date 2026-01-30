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
