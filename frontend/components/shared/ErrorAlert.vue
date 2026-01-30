<template>
  <v-alert
    v-if="error"
    :type="type"
    variant="tonal"
    :title="title"
    class="mb-4"
    closable
    @click:close="$emit('dismiss')"
  >
    {{ error }}
    <template v-if="showRetry" #append>
      <v-btn
        variant="text"
        size="small"
        @click="$emit('retry')"
      >
        Retry
      </v-btn>
    </template>
  </v-alert>
</template>

<script setup lang="ts">
interface Props {
  error: string | null
  title?: string
  type?: 'error' | 'warning' | 'info' | 'success'
  showRetry?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Error',
  type: 'error',
  showRetry: true,
})

defineEmits<{
  (e: 'retry'): void
  (e: 'dismiss'): void
}>()
</script>

<style scoped>
.v-alert {
  border-radius: 8px !important;
}

.v-alert :deep(.v-alert__title) {
  font-weight: 700;
}
</style>
