<template>
  <v-card elevation="0" class="stats-card h-100">
    <v-card-title class="pb-3">
      <v-icon icon="mdi-chart-bar" class="mr-2 primary-icon" />
      Per Game Averages
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-6">
      <apexchart type="bar" :options="barChartOptions" :series="barChartSeries" :height="chartHeight" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import apexchart from 'vue3-apexcharts'
import type { Player } from '~/types'

interface Props {
  player: Player
}

const props = defineProps<Props>()
const display = useDisplay()

const chartHeight = computed(() => (display.smAndDown.value ? 280 : 350))

const barChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: {
      show: false,
    }
  },
  theme: {
    mode: 'light',
  },
  colors: ['#1a2742'],
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 0,
      borderRadiusApplication: 'end',
      barHeight: '68%',
      dataLabels: {
        position: 'top',
      },
    }
  },
  dataLabels: {
    enabled: true,
    // Render values as a "chip" to the right of each bar.
    textAnchor: 'start',
    offsetX: 20,
    formatter: (value: number) => Number(value).toFixed(1),
    style: {
      fontSize: '11px',
      fontWeight: 800,
      colors: ['#1a2742'],
    },
    background: {
      enabled: true,
      foreColor: '#1a2742',
      backgroundColor: '#ffffff',
      borderRadius: 2,
      padding: 6,
      opacity: 1,
      borderWidth: 1,
      borderColor: '#dbeafe',
    }
  },
  stroke: {
    show: false,
  },
  grid: {
    borderColor: '#e0e6f0',
    strokeDashArray: 4,
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: false,
      },
    },
    padding: {
      left: 6,
      right: 72,
    },
  },
  tooltip: {
    enabled: true,
    theme: 'light',
    marker: {
      show: false,
    },
    custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
      const label =
        w?.globals?.labels?.[dataPointIndex] ||
        w?.globals?.categoryLabels?.[dataPointIndex] ||
        ''

      const rawValue = series?.[seriesIndex]?.[dataPointIndex]
      const value = Number.isFinite(rawValue) ? Number(rawValue).toFixed(1) : '-'

      return `
        <div class="apex-tooltip-chip">
          <div class="apex-tooltip-label">${label}</div>
          <div class="apex-tooltip-value">${value}</div>
        </div>
      `
    },
  },
  xaxis: {
    categories: ['PTS', 'REB', 'AST', 'STL', 'MIN', 'PIR', 'FC', 'FD'],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      formatter: (value: string) => String(value),
      style: {
        colors: '#6b7280',
        fontSize: '12px',
      }
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: '#6b7280',
        fontSize: '12px',
        fontWeight: 700,
      }
    }
  },
}))

const barChartSeries = computed(() => {
  if (!props.player.stats?.gamesPlayed) return []
  
  const gp = props.player.stats.gamesPlayed
  const ppg = props.player.stats.points ? props.player.stats.points / gp : 0
  const rpg = props.player.stats.totalRebounds ? props.player.stats.totalRebounds / gp : 0
  const apg = props.player.stats.assistances ? props.player.stats.assistances / gp : 0
  const spg = props.player.stats.steals ? props.player.stats.steals / gp : 0
  const mpg = props.player.stats.timePlayed ? props.player.stats.timePlayed / 60 / gp : 0
  const pir = props.player.stats.valuation ? props.player.stats.valuation / gp : 0
  const fcg = props.player.stats.foulsCommited ? props.player.stats.foulsCommited / gp : 0
  const fwg = props.player.stats.foulsReceived ? props.player.stats.foulsReceived / gp : 0

  return [
    {
      name: props.player.name,
      data: [
        Math.round(ppg * 10) / 10,
        Math.round(rpg * 10) / 10,
        Math.round(apg * 10) / 10,
        Math.round(spg * 10) / 10,
        Math.round(mpg * 10) / 10,
        Math.round(pir * 10) / 10,
        Math.round(fcg * 10) / 10,
        Math.round(fwg * 10) / 10,
      ]
    }
  ]
})
</script>

<style scoped>
.stats-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.v-card-text) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stats-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.primary-icon {
  color: #F05323 !important;
}

:deep(.v-card-title) {
  color: #1a2742 !important;
  font-weight: 600;
  font-size: 16px;
}

:deep(.v-divider) {
  opacity: 0.4;
}

:deep(.apexcharts-tooltip) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

:deep(.apex-tooltip-chip) {
  background: #ffffff;
  border: 1px solid #dbeafe;
  border-radius: 14px;
  padding: 8px 10px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
}

:deep(.apex-tooltip-label) {
  font-size: 11px;
  font-weight: 800;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

:deep(.apex-tooltip-value) {
  font-size: 14px;
  font-weight: 900;
  color: #1a2742;
}
</style>
