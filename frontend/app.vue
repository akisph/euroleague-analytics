<template>
  <v-app :theme="themeStore.isDark ? 'dark' : 'light'">
    <NuxtPage />
  </v-app>
</template>

<script setup lang="ts">
const themeStore = useThemeStore()

// Initialize theme on mount
onMounted(() => {
  themeStore.loadTheme()
})
</script>
