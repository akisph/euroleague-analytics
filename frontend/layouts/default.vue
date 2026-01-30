<template>
  <div class="tailwind">
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      class="bg-surface"
    >
      <v-list-item
        prepend-icon="mdi-basketball"
        title="Euroleague"
        subtitle="Basketball Dashboard"
        nav
        class="px-4 py-4"
      >
        <template #append>
          <v-btn
            :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
            variant="text"
            @click.stop="rail = !rail"
          />
        </template>
      </v-list-item>

      <v-divider />

      <v-list density="compact" nav class="py-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="$route.path === item.to"
          rounded="lg"
          class="mx-2 my-1"
          active-class="nav-item-active"
        />
      </v-list>

      <template #append>
        <div class="pa-2">
          <v-divider class="mb-2" />
          <v-btn
            block
            :prepend-icon="themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
            variant="tonal"
            @click="themeStore.toggleTheme()"
          >
            {{ rail ? '' : (themeStore.isDark ? 'Light' : 'Dark') }}
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar flat class="px-4 border-b">
      <v-app-bar-nav-icon
        class="d-lg-none"
        @click.stop="drawer = !drawer"
      />

      <v-toolbar-title class="font-weight-bold">
        <span class="text-primary">Euroleague</span> Dashboard
      </v-toolbar-title>

      <v-spacer />

      <!-- Season Selector -->
      <v-select
        v-model="selectedSeason"
        :items="seasonOptions"
        label="Season"
        density="compact"
        variant="outlined"
        hide-details
        class="max-w-[200px]"
        :loading="isLoadingSeasons"
      />
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-6">
        <slot />
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer app class="bg-surface border-t">
      <v-row no-gutters align="center" justify="center">
        <span class="text-body-2 text-medium-emphasis">
          © {{ new Date().getFullYear() }} Euroleague Basketball Dashboard
        </span>
      </v-row>
    </v-footer>
  </div>
</template>

<script setup lang="ts">
import type { NavItem } from '~/types'

const themeStore = useThemeStore()
const seasonStore = useSeasonStore()
const { fetchSeasons, seasonOptions } = useSeasons()

// Drawer state
const drawer = ref(true)
const rail = ref(false)
const isLoadingSeasons = ref(false)

// Navigation items
const navItems: NavItem[] = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
  { title: 'Clubs', icon: 'mdi-shield-home', to: '/clubs' },
  { title: 'Games', icon: 'mdi-basketball', to: '/games' },
  { title: 'Standings', icon: 'mdi-format-list-numbered', to: '/standings' },
]

// Selected season computed
const selectedSeason = computed({
  get: () => seasonStore.selectedSeasonCode,
  set: (value) => seasonStore.setSelectedSeason(value),
})

// Initialize data
onMounted(async () => {
  themeStore.loadTheme()
  isLoadingSeasons.value = true
  try {
    await fetchSeasons()
    seasonStore.loadSavedSeason()
  } catch (error) {
    console.error('Failed to load seasons:', error)
  } finally {
    isLoadingSeasons.value = false
  }
})
</script>

<style scoped>
.nav-item-active {
  background: rgba(240, 83, 35, 0.1) !important;
  border-left: 3px solid rgb(var(--v-theme-primary)) !important;
}
</style>
