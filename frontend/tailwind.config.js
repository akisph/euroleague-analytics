/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  // Important: Tailwind should not override Vuetify styles
  important: '.tailwind',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3f2',
          100: '#fee4e2',
          200: '#fececa',
          300: '#fcaca4',
          400: '#f87c6f',
          500: '#ef5441',
          600: '#dc3524',
          700: '#b92a1a',
          800: '#99261a',
          900: '#7f251b',
          950: '#450f09',
        },
        euroleague: {
          orange: '#F05323',
          dark: '#1a1a2e',
          light: '#f0f0f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // Prevent Tailwind from purging Vuetify classes
  safelist: [
    {
      pattern: /v-.*/,
    },
  ],
}
