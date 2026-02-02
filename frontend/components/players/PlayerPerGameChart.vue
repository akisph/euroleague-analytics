<template>
  <v-card elevation="0" class="stats-card h-100">
    <v-card-title class="pb-3">
      <v-icon icon="mdi-chart-bar" class="mr-2 primary-icon" />
      Per Game Averages
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-6">
      <apexchart type="bar" :options="barChartOptions" :series="barChartSeries" height="350" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import apexchart from 'vue3-apexcharts'
import type { Player } from '~/types'

interface Props {
  player: Player
}

const props = defineProps<Props>()

const barChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: {
      show: false,
    }
  },
  colors: ['#F05323'],
  plotOptions: {
    bar: {
      horizontal: true,
      dataLabels: {
        position: 'top',
      },
    }
  },
  dataLabels: {
    enabled: true,
    offsetX: 0,
    style: {
      fontSize: '12px',
      fontWeight: 600,
      colors: ['#1a2742']
    }
  },
  stroke: {
    show: true,
    width: 1,
    colors: ['#e0e6f0']
  },
  tooltip: {
    theme: 'light',
    style: {
      fontSize: '12px',
      color: '#1a2742'
    },
    x: {
      show: true,
    },
    y: {
      title: {
        formatter: (seriesName: string) => seriesName + ':'
      }
    }
  },
  xaxis: {
    categories: ['PPG', 'RPG', 'APG', 'SPG', 'MPG', 'PIR', 'FC/G', 'FW/G'],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      style: {
        colors: '#8a92a2',
        fontSize: '12px',
      }
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: '#8a92a2',
        fontSize: '12px',
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
</style>
