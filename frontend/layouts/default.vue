<template>
  <div class="app-container">
    <!-- Navigation Bar -->
    <header class="app-navbar">
      <div class="navbar-wrapper">
        <!-- Logo -->
        <NuxtLink to="/" class="navbar-logo">
          <div class="logo-icon">🏀</div>
          <div class="logo-text">Euroleague</div>
        </NuxtLink>

        <!-- Navigation Menu -->
        <nav class="navbar-menu">
          <NuxtLink 
            v-for="item in navItems" 
            :key="item.to"
            :to="item.to"
            :class="['nav-link', { 'nav-link--active': isActiveRoute(item.to) }]"
          >
            {{ item.title }}
          </NuxtLink>
        </nav>

        <!-- Right Side Actions -->
        <div class="navbar-right">
          <v-select
            v-model="selectedSeason"
            :items="seasonOptions"
            label="Season"
            density="compact"
            variant="outlined"
            hide-details
            class="season-selector"
            :loading="isLoadingSeasons"
          />
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="app-main">
      <div class="content-wrapper">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <p class="footer-text">© {{ new Date().getFullYear() }} Euroleague Basketball Dashboard</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { NavItem } from '~/types'

const seasonStore = useSeasonStore()
const { fetchSeasons, seasonOptions } = useSeasons()
const route = useRoute()

const isLoadingSeasons = ref(false)

// Navigation items
const navItems: NavItem[] = [
  { title: 'DASHBOARD', icon: 'mdi-view-dashboard', to: '/' },
  { title: 'CLUBS', icon: 'mdi-shield-home', to: '/clubs' },
  { title: 'GAMES', icon: 'mdi-basketball', to: '/games' },
  { title: 'PLAYERS', icon: 'mdi-account-multiple', to: '/players' },
  { title: 'STANDINGS', icon: 'mdi-format-list-numbered', to: '/standings' },
]

// Check if route is active
const isActiveRoute = (itemPath: string) => {
  if (itemPath === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(itemPath)
}

// Selected season computed
const selectedSeason = computed({
  get: () => seasonStore.selectedSeasonCode,
  set: (value) => seasonStore.setSelectedSeason(value),
})

// Initialize data
onMounted(async () => {
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
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* Navigation Bar */
.app-navbar {
  background: linear-gradient(to right, #1a2742 0%, #1e3050 100%);
  border-bottom: 3px solid #F05323;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.navbar-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 1rem 2rem;
  gap: 2rem;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #ffffff;
  font-weight: 800;
  font-size: 1.35rem;
  white-space: nowrap;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.navbar-logo:hover {
  opacity: 0.85;
}

.logo-icon {
  font-size: 1.75rem;
  line-height: 1;
}

.logo-text {
  letter-spacing: 0.5px;
}

.navbar-menu {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  align-items: center;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.3px;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  background-color: rgba(240, 83, 35, 0.1);
  color: #F05323;
}

.nav-link--active {
  color: #F05323;
  background-color: rgba(240, 83, 35, 0.15);
  font-weight: 700;
}

.nav-link--active::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #F05323;
  border-radius: 2px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.season-selector {
  min-width: 160px;
}

.season-selector :deep(.v-field) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.season-selector :deep(.v-field__input) {
  color: #ffffff;
  font-weight: 500;
}

.season-selector :deep(.v-field__outline__notch) {
  border-color: rgba(255, 255, 255, 0.2);
}

/* Main Content */
.app-main {
  flex: 1;
  width: 100%;
  background-color: #f5f7fa;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 2rem;
}

/* Footer */
.app-footer {
  background: #ffffff;
  border-top: 1px solid #e0e6f0;
  padding: 2rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.footer-text {
  color: #8a92a2;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .navbar-wrapper {
    padding: 1rem 1.5rem;
    gap: 1.5rem;
  }

  .content-wrapper {
    padding: 1.5rem 1.5rem;
  }
}

@media (max-width: 768px) {
  .navbar-wrapper {
    padding: 0.75rem 1rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .navbar-logo {
    font-size: 1.1rem;
  }

  .navbar-menu {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }

  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .season-selector {
    min-width: 140px;
    font-size: 0.85rem;
  }

  .content-wrapper {
    padding: 1rem;
  }

  .app-footer {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 480px) {
  .navbar-wrapper {
    padding: 0.5rem 0.75rem;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .navbar-logo {
    font-size: 1rem;
    order: 1;
  }

  .logo-icon {
    font-size: 1.5rem;
  }

  .navbar-menu {
    order: 2;
    margin-top: 0;
    justify-content: space-around;
    gap: 0.125rem;
  }

  .nav-link {
    padding: 0.375rem 0.5rem;
    font-size: 0.7rem;
  }

  .navbar-right {
    order: 3;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to right, #1a2742 0%, #1e3050 100%);
    padding: 0.5rem 0.75rem;
    z-index: 101;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .season-selector {
    min-width: 100%;
    font-size: 0.8rem;
  }

  .content-wrapper {
    padding: 0.75rem;
    padding-bottom: 4rem; /* space for fixed selector */
  }

  .app-footer {
    padding: 1rem 0.75rem;
  }
}
</style>
