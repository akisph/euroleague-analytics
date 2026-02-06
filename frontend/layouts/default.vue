<template>
  <div class="app-container">
    <!-- Navigation Bar -->
    <header class="app-navbar" :class="{ 'app-navbar--menu-open': isFantasyOpen }">
      <div class="navbar-wrapper" :class="{ 'navbar-wrapper--menu-open': isFantasyOpen }">
        <!-- Logo -->
        <NuxtLink to="/" class="navbar-logo">
          <div class="logo-icon">🏀</div>
          <div class="logo-text">EL HoopsLab</div>
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

          <div class="nav-group" :class="{ 'nav-link--active': isFantasyActive, 'nav-group--open': isFantasyOpen }">
            <button class="nav-link nav-group-trigger" type="button" @click="toggleFantasyMenu">
              Fantasy
              <span class="nav-caret">▾</span>
            </button>
            <div class="nav-submenu">
              <NuxtLink
                to="/fantasy/team"
                :class="['nav-sub-link', { 'nav-sub-link--active': isActiveRoute('/fantasy/team') }]"
              >
                Team
              </NuxtLink>
              <NuxtLink
                to="/fantasy/players"
                :class="['nav-sub-link', { 'nav-sub-link--active': isActiveRoute('/fantasy/players') }]"
              >
                Players
              </NuxtLink>
            </div>
          </div>
        </nav>

        <!-- Right Side Actions -->
        <div class="navbar-right navbar-right--desktop"></div>
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
        <div class="footer-season">
          <v-select
            v-model="selectedSeason"
            :items="seasonOptions"
            label="Season"
            density="compact"
            variant="outlined"
            hide-details
            class="season-selector season-selector--footer"
            :loading="isLoadingSeasons"
          />
        </div>
        <p class="footer-text">© {{ new Date().getFullYear() }}EL HoopsLab by S.Filippou</p>
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
  { title: 'Home', icon: 'mdi-home', to: '/' },
  { title: 'Clubs', icon: 'mdi-shield-home', to: '/clubs' },
  { title: 'Games', icon: 'mdi-basketball', to: '/games' },
  { title: 'Players', icon: 'mdi-account-multiple', to: '/players' },
  { title: 'Standings', icon: 'mdi-format-list-numbered', to: '/standings' },
]

// Check if route is active
const isActiveRoute = (itemPath: string) => {
  if (itemPath === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(itemPath)
}

const isFantasyActive = computed(() => route.path.startsWith('/fantasy'))
const isFantasyOpen = ref(false)

const toggleFantasyMenu = () => {
  isFantasyOpen.value = !isFantasyOpen.value
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

watch(() => route.path, () => {
  isFantasyOpen.value = false
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

.navbar-wrapper--menu-open {
  overflow: visible;
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
  flex-wrap: nowrap;
  position: relative;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.3px;
  border-radius: 999px;
  transition: all 0.2s ease;
  position: relative;
  border: none;
  background: transparent;
}

.nav-link:hover {
  background-color: rgba(240, 83, 35, 0.1);
  color: #F05323;
}

.nav-link--active {
  color: #F05323;
  background-color: rgba(240, 83, 35, 0.2);
  font-weight: 700;
}

.nav-group {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.nav-group-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
}

.nav-caret {
  font-size: 0.75rem;
  opacity: 0.8;
}

.nav-submenu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  display: none;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.6rem;
  background: #1a2742;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  min-width: 140px;
  box-shadow: 0 8px 20px rgba(12, 19, 33, 0.25);
  z-index: 200;
}

.nav-group:hover .nav-submenu,
.nav-group:focus-within .nav-submenu,
.nav-group--open .nav-submenu {
  display: flex;
}

.nav-sub-link {
  color: #ffffff;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-sub-link:hover {
  background-color: rgba(240, 83, 35, 0.15);
  color: #F05323;
}

.nav-sub-link--active {
  background-color: rgba(240, 83, 35, 0.2);
  color: #F05323;
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

.footer-season {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  width: 100%;
}

.season-selector--footer :deep(.v-field) {
  background-color: #ffffff;
  border-color: #e0e6f0;
}

.season-selector--footer :deep(.v-field__input) {
  color: #1a2742;
  font-weight: 600;
}

.season-selector--footer {
  width: 100%;
  max-width: 220px;
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
    flex-wrap: nowrap;
    gap: 0.4rem;
    order: 3;
    width: 100%;
    justify-content: flex-start;
    margin-top: 0.5rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .app-navbar--menu-open .navbar-menu {
    overflow: visible;
  }

  .navbar-menu::-webkit-scrollbar {
    display: none;
  }

  .nav-submenu {
    position: absolute;
    top: calc(100% + 0.35rem);
    left: 0;
    display: none;
    flex-direction: column;
    padding: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: #1a2742;
    box-shadow: 0 8px 20px rgba(12, 19, 33, 0.25);
    gap: 0.35rem;
    min-width: 140px;
  }

  .nav-group {
    width: auto;
    justify-content: flex-start;
    flex-wrap: nowrap;
  }

  .nav-link {
    padding: 0.5rem 0.9rem;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .season-selector {
    min-width: 140px;
    font-size: 0.85rem;
  }

  .navbar-right--desktop {
    display: none;
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
    justify-content: flex-start;
    gap: 0.35rem;
  }

  .nav-group {
    width: auto;
    justify-content: flex-start;
  }

  .nav-sub-link {
    font-size: 0.7rem;
    padding: 0.35rem 0.5rem;
  }

  .nav-link {
    padding: 0.375rem 0.5rem;
    font-size: 0.7rem;
  }

  .content-wrapper {
    padding: 0.75rem;
  }

  .app-footer {
    padding: 1rem 0.75rem;
  }
}
</style>
