import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false,
  }),

  actions: {
    toggleTheme() {
      this.isDark = !this.isDark
      this.saveTheme()
    },

    setTheme(dark: boolean) {
      this.isDark = dark
      this.saveTheme()
    },

    loadTheme() {
      if (import.meta.client) {
        const saved = localStorage.getItem('euroleague_theme')
        if (saved) {
          this.isDark = saved === 'dark'
        } else {
          // Check system preference
          this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
      }
    },

    saveTheme() {
      if (import.meta.client) {
        localStorage.setItem('euroleague_theme', this.isDark ? 'dark' : 'light')
      }
    },
  },
})
