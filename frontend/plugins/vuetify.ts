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
            secondary: '#1a1a2e',
            accent: '#b92a1a',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8',
            success: '#28a745',
            background: '#f5f5f5',
            surface: '#ffffff',
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
