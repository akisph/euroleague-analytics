<template>
  <v-card elevation="0" class="stats-card h-100">
    <v-card-title class="pb-3">
      <v-icon icon="mdi-target" class="mr-2 primary-icon" />
      Shooting Percentages
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-6">
      <div class="chart-legend-container">
        <div class="chart-wrapper">
          <apexchart 
            type="radialBar" 
            :options="gaugeOptions" 
            :series="gaugeSeries" 
            height="350" 
          />
        </div>
        
        <!-- Legend -->
        <div class="legend-container">
          <div class="legend-item">
            <div class="legend-color" style="background-color: #F05323;"></div>
            <div class="legend-content">
              <div class="legend-label">2PT%</div>
              <div class="legend-value">{{ player.stats?.twoPointShootingPercentage || '-' }}</div>
            </div>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #FF9800;"></div>
            <div class="legend-content">
              <div class="legend-label">3PT%</div>
              <div class="legend-value">{{ player.stats?.threePointShootingPercentage || '-' }}</div>
            </div>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #1976D2;"></div>
            <div class="legend-content">
              <div class="legend-label">FT%</div>
              <div class="legend-value">{{ player.stats?.freeThrowShootingPercentage || '-' }}</div>
            </div>
          </div>
        </div>
      </div>
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

const gaugeOptions = computed(() => ({
  chart: {
    type: 'radialBar',
  },
  colors: ['#F05323', '#FF9800', '#1976D2'],
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: {
        margin: 0,
        size: '60%',
      },
      track: {
        background: '#e0e6f0',
        strokeWidth: '97%',
        margin: 5,
      },
      dataLabels: {
        name: {
          fontSize: '12px',
          fontWeight: 600,
          color: '#8a92a2',
          offsetY: 10,
        },
        value: {
          offsetY: -5,
          fontSize: '18px',
          fontWeight: 700,
          color: '#1a2742',
        }
      }
    }
  },
  labels: ['2PT%', '3PT%', 'FT%'],
}))

const gaugeSeries = computed(() => {
  const twoPointPct = parseFloat(props.player.stats?.twoPointShootingPercentage) || 0
  const threePointPct = parseFloat(props.player.stats?.threePointShootingPercentage) || 0
  const ftPct = parseFloat(props.player.stats?.freeThrowShootingPercentage) || 0
  
  return [twoPointPct, threePointPct, ftPct]
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

:deep(.v-card-text) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-legend-container {
  display: flex;
  gap: 24px;
  align-items: center;
  flex: 1;
}

.chart-wrapper {
  flex: 1;
  min-width: 0;
}

.legend-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 140px;
  padding-left: 16px;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.legend-label {
  font-size: 12px;
  font-weight: 600;
  color: #8a92a2;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.legend-value {
  font-size: 16px;
  font-weight: 700;
  color: #1a2742;
}

@media (max-width: 960px) {
  .chart-legend-container {
    flex-direction: column;
    gap: 16px;
  }

  .legend-container {
    flex-direction: row;
    border-left: none;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    padding-left: 0;
    padding-top: 16px;
    min-width: unset;
  }
}
</style>
