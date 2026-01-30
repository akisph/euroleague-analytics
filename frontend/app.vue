<template>
  <v-app :theme="themeStore.isDark ? 'dark' : 'light'">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script setup lang="ts">
const themeStore = useThemeStore()

// Initialize theme on mount
onMounted(() => {
  themeStore.loadTheme()
})
</script>
