<template>
  <div class="loading-container">
    <v-container v-if="loading" class="d-flex justify-center align-center" style="min-height: 200px;">
      <v-progress-circular
        indeterminate
        :color="color"
        :size="size"
        :width="4"
      />
      <span v-if="message" class="ml-4 text-body-1">{{ message }}</span>
    </v-container>
    
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
  message?: string
  color?: string
  size?: number
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
  size: 48,
})
</script>

<style scoped>
.loading-container {
  width: 100%;
}
</style>
