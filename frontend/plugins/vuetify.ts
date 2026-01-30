import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          dark: false,
          colors: {
            primary: '#F05323',
            secondary: '#1a2742',
            accent: '#b92a1a',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8',
            success: '#28a745',
            background: '#f5f7fa',
            surface: '#1a2742',
            'surface-dark': '#0f1a2e',
            'text-primary': '#1a1a1a',
            'text-secondary': '#b0b8c8',
            'text-light': '#8a92a2',
            'border-color': '#e0e6f0',
          },
        },
        dark: {
          dark: true,
          colors: {
            primary: '#F05323',
            secondary: '#4a4a6a',
            accent: '#ef5441',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3',
            success: '#4caf50',
            background: '#121212',
            surface: '#1e1e1e',
            'text-primary': '#ffffff',
            'text-secondary': '#b0b0b0',
            'text-light': '#808080',
            'border-color': '#333333',
          },
        },
      },
    },
    defaults: {
      VBtn: {
        rounded: 'lg',
        fontWeight: 500,
      },
      VCard: {
        rounded: 'lg',
        elevation: 2,
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VDataTable: {
        hover: true,
      },
      VChip: {
        rounded: 'lg',
      },
    },
  })
  app.vueApp.use(vuetify)
})
