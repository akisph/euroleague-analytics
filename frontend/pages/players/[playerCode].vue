<template>
  <div class="player-details-page">
    <SharedPageHeader
      :title="player?.name || 'Player Details'"
      :subtitle="player?.position"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="$router.back()">
          Back
        </v-btn>
      </template>
    </SharedPageHeader>

    <SharedErrorAlert v-if="error" :error="error" @retry="loadPlayer" @dismiss="error = null" />

    <SharedLoadingState :loading="isLoading" message="Loading player details...">
      <template v-if="player">
        <div class="page-container">
          <!-- Profile Header Section -->
          <v-row class="mb-8">
            <v-col cols="12" md="4">
              <v-card elevation="0" class="profile-card h-100">
                <v-card-text class="text-center pa-8">
                  <v-avatar size="140" class="mb-6 avatar-shadow" color="grey-lighten-3">
                    <v-img v-if="player.imageUrl" :src="player.imageUrl" :alt="player.name" />
                    <span v-else class="text-h4 font-weight-bold">{{ playerInitials }}</span>
                  </v-avatar>
                  <h1 class="text-h5 font-weight-bold mb-2">{{ player.name }}</h1>
                  <p v-if="player.alias" class="text-body-2 text-medium-emphasis mb-6">
                    {{ player.alias }}
                  </p>
                  <div class="d-flex gap-2 justify-center flex-wrap">
                    <v-chip v-if="player.dorsal" color="primary" variant="flat" size="small" class="font-weight-bold">
                      #{{ player.dorsal }}
                    </v-chip>
                    <v-chip v-if="player.position" variant="tonal" size="small" class="font-weight-bold">
                      {{ player.position }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Info Card -->
            <v-col cols="12" md="8">
              <v-card elevation="0" class="info-card">
                <v-card-title class="pb-4">
                  <v-icon icon="mdi-account-circle" class="mr-2 primary-icon" />
                  Player Information
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-6">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <div class="info-group">
                        <v-list density="compact">
                          <v-list-item v-if="player.countryName" class="px-0 py-2">
                            <template #prepend>
                              <v-icon icon="mdi-flag" class="mr-3 info-icon" size="small" />
                            </template>
                            <v-list-item-title class="text-caption font-weight-bold">Nationality</v-list-item-title>
                            <v-list-item-subtitle>{{ player.countryName }}</v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item v-if="player.birthDate" class="px-0 py-2">
                            <template #prepend>
                              <v-icon icon="mdi-cake-variant" class="mr-3 info-icon" size="small" />
                            </template>
                            <v-list-item-title class="text-caption font-weight-bold">Birth Date</v-list-item-title>
                            <v-list-item-subtitle>{{ formatDate(player.birthDate) }}</v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item v-if="playerAge" class="px-0 py-2">
                            <template #prepend>
                              <v-icon icon="mdi-calendar" class="mr-3 info-icon" size="small" />
                            </template>
                            <v-list-item-title class="text-caption font-weight-bold">Age</v-list-item-title>
                            <v-list-item-subtitle>{{ playerAge }} years</v-list-item-subtitle>
                          </v-list-item>
                        </v-list>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-list density="compact">
                        <v-list-item v-if="player.height" class="px-0 py-2">
                          <template #prepend>
                            <v-icon icon="mdi-human-male-height" class="mr-3 info-icon" size="small" />
                          </template>
                          <v-list-item-title class="text-caption font-weight-bold">Height</v-list-item-title>
                          <v-list-item-subtitle>{{ player.height }} cm ({{ heightInFeet }})</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="player.position" class="px-0 py-2">
                          <template #prepend>
                            <v-icon icon="mdi-basketball" class="mr-3 info-icon" size="small" />
                          </template>
                          <v-list-item-title class="text-caption font-weight-bold">Position</v-list-item-title>
                          <v-list-item-subtitle>{{ player.position }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item class="px-0 py-2">
                          <template #prepend>
                            <v-icon icon="mdi-identifier" class="mr-3 info-icon" size="small" />
                          </template>
                          <v-list-item-title class="text-caption font-weight-bold">Player Code</v-list-item-title>
                          <v-list-item-subtitle>{{ player.playerCode }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Stats Sections -->
          <v-row v-if="player.stats" class="gap-6">
            <!-- Gauge Charts - Shooting Percentages -->
            <v-col cols="12" sm="6" md="4">
              <v-card elevation="0" class="stats-card h-100">
                <v-card-title class="pb-3">
                  <v-icon icon="mdi-target" class="mr-2 primary-icon" />
                  2PT%
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-6">
                  <apexchart type="radialBar" :options="gauge2PTOptions" :series="[parseFloat(player.stats.twoPointShootingPercentage) || 0]" height="250" />
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-card elevation="0" class="stats-card h-100">
                <v-card-title class="pb-3">
                  <v-icon icon="mdi-target" class="mr-2 primary-icon" />
                  3PT%
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-6">
                  <apexchart type="radialBar" :options="gauge3PTOptions" :series="[parseFloat(player.stats.threePointShootingPercentage) || 0]" height="250" />
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-card elevation="0" class="stats-card h-100">
                <v-card-title class="pb-3">
                  <v-icon icon="mdi-target" class="mr-2 primary-icon" />
                  FT%
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-6">
                  <apexchart type="radialBar" :options="gaugeFTOptions" :series="[parseFloat(player.stats.freeThrowShootingPercentage) || 0]" height="250" />
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Bar Chart - Per Game Averages -->
            <v-col cols="12">
              <v-card elevation="0" class="stats-card">
                <v-card-title class="pb-3">
                  <v-icon icon="mdi-chart-bar" class="mr-2 primary-icon" />
                  Per Game Averages
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-6">
                  <apexchart type="bar" :options="barChartOptions" :series="barChartSeries" height="320" />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Detailed Stats Grid -->
          <v-row v-if="player.stats" class="mt-4">
            <v-col cols="12">
              <v-card elevation="0" class="detail-card">
                <v-card-title class="pb-3">
                  <v-icon icon="mdi-target" class="mr-2 primary-icon" />
                  Scoring & Shooting
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-4">
                  <div class="stat-row">
                    <span class="stat-label-inline">Total Points</span>
                    <span class="stat-value-inline">{{ player.stats.points || 0 }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label-inline">Games Played</span>
                    <span class="stat-value-inline">{{ player.stats.gamesPlayed || 0 }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label-inline">PPG</span>
                    <span class="stat-value-inline">{{ calculatePerGame(player.stats.points) }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label-inline">2PT</span>
                    <span class="stat-value-inline">{{ player.stats.fieldGoalsMade2 || 0 }}/{{ player.stats.fieldGoalsAttempted2 || 0 }} ({{ player.stats.twoPointShootingPercentage || '-' }})</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label-inline">3PT</span>
                    <span class="stat-value-inline">{{ player.stats.fieldGoalsMade3 || 0 }}/{{ player.stats.fieldGoalsAttempted3 || 0 }} ({{ player.stats.threePointShootingPercentage || '-' }})</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label-inline">FT</span>
                    <span class="stat-value-inline">{{ player.stats.freeThrowsMade || 0 }}/{{ player.stats.freeThrowsAttempted || 0 }} ({{ player.stats.freeThrowShootingPercentage || '-' }})</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card elevation="0" class="detail-card">
                <v-card-title class="pb-3">
                  <v-icon icon="mdi-arrow-expand-vertical" class="mr-2 primary-icon" />
                  Rebounds & Assists
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-4">
                  <div class="stat-row">
                    <span class="stat-label-inline">Total Rebounds</span>
                    <span class="stat-value-inline">{{ calculatePerGame(player.stats.totalRebounds) }} RPG</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label-inline">Assists</span>
                    <span class="stat-value-inline">{{ calculatePerGame(player.stats.assistances) }} APG</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label-inline">Defensive Rebounds</span>
                    <span class="stat-value-inline">{{ calculatePerGame(player.stats.defensiveRebounds) }} DRbnd/G</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label-inline">Offensive Rebounds</span>
                    <span class="stat-value-inline">{{ calculatePerGame(player.stats.offensiveRebounds) }} ORbnd/G</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card elevation="0" class="detail-card">
                <v-card-title class="pb-3">
                  <v-icon icon="mdi-shield" class="mr-2 primary-icon" />
                  Defense & Fouls
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-4">
                  <div class="stat-row">
                    <span class="stat-label-inline">Steals</span>
                    <span class="stat-value-inline">{{ calculatePerGame(player.stats.steals) }} S/G</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label-inline">Blocks Against</span>
                    <span class="stat-value-inline">{{ calculatePerGame(player.stats.blocksAgainst) }} B/G</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label-inline">Blocks Favor</span>
                    <span class="stat-value-inline">{{ calculatePerGame(player.stats.blocksFavour) }} BF/G</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label-inline">Fouls Won</span>
                    <span class="stat-value-inline">{{ calculatePerGame(player.stats.foulsReceived) }} FW/G</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label-inline">Fouls Committed</span>
                    <span class="stat-value-inline">{{ calculatePerGame(player.stats.foulsCommited) }} FC/G</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label-inline">Turnovers</span>
                    <span class="stat-value-inline">{{ calculatePerGame(player.stats.turnovers) }} TO/G</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

          </v-row>
        </div>
      </template>

      <SharedEmptyState
        v-else
        title="Player Not Found"
        message="The requested player could not be found"
        icon="mdi-account-off"
        action-text="Go Back"
        @action="$router.back()"
      />
    </SharedLoadingState>
  </div>
</template>

<script setup lang="ts">
import apexchart from 'vue3-apexcharts'

defineComponent({
  components: {
    apexchart,
  },
})

const route = useRoute()
const { fetchPlayerByCode, currentPlayer: player, isLoading, error } = usePlayers()

const playerCode = computed(() => route.params.playerCode as string)

const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: 'Clubs', to: '/clubs' },
  { title: player.value?.name || playerCode.value, disabled: true },
])

const playerInitials = computed(() => {
  if (!player.value?.name) return ''
  const names = player.value.name.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }
  return player.value.name.substring(0, 2).toUpperCase()
})

const playerAge = computed(() => {
  if (!player.value?.birthDate) return null
  const birthDate = new Date(player.value.birthDate)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
})

const heightInFeet = computed(() => {
  if (!player.value?.height) return ''
  const totalInches = player.value.height / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}"`
})

const gauge2PTOptions = computed(() => ({
  chart: {
    type: 'radialBar',
  },
  colors: ['#F05323'],
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      hollow: {
        margin: 15,
        size: '70%',
      },
      track: {
        background: '#e0e6f0',
        strokeWidth: '97%',
        margin: 5,
      },
      dataLabels: {
        name: {
          show: false,
        },
        value: {
          offsetY: 0,
          fontSize: '20px',
          fontWeight: 600,
          color: '#1a2742',
        }
      }
    }
  },
  labels: ['2PT%'],
}))

const gauge3PTOptions = computed(() => ({
  chart: {
    type: 'radialBar',
  },
  colors: ['#F05323'],
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      hollow: {
        margin: 15,
        size: '70%',
      },
      track: {
        background: '#e0e6f0',
        strokeWidth: '97%',
        margin: 5,
      },
      dataLabels: {
        name: {
          show: false,
        },
        value: {
          offsetY: 0,
          fontSize: '20px',
          fontWeight: 600,
          color: '#1a2742',
        }
      }
    }
  },
  labels: ['3PT%'],
}))

const gaugeFTOptions = computed(() => ({
  chart: {
    type: 'radialBar',
  },
  colors: ['#F05323'],
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      hollow: {
        margin: 15,
        size: '70%',
      },
      track: {
        background: '#e0e6f0',
        strokeWidth: '97%',
        margin: 5,
      },
      dataLabels: {
        name: {
          show: false,
        },
        value: {
          offsetY: 0,
          fontSize: '20px',
          fontWeight: 600,
          color: '#1a2742',
        }
      }
    }
  },
  labels: ['FT%'],
}))

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
  if (!player.value?.stats?.gamesPlayed) return []
  
  const ppg = player.value.stats.points ? player.value.stats.points / player.value.stats.gamesPlayed : 0
  const rpg = player.value.stats.totalRebounds ? player.value.stats.totalRebounds / player.value.stats.gamesPlayed : 0
  const apg = player.value.stats.assistances ? player.value.stats.assistances / player.value.stats.gamesPlayed : 0
  const spg = player.value.stats.steals ? player.value.stats.steals / player.value.stats.gamesPlayed : 0
  const mpg = player.value.stats.timePlayed ? player.value.stats.timePlayed / 60 / player.value.stats.gamesPlayed : 0
  const pir = player.value.stats.valuation ? player.value.stats.valuation / player.value.stats.gamesPlayed : 0
  const fcg = player.value.stats.foulsCommited ? player.value.stats.foulsCommited / player.value.stats.gamesPlayed : 0
  const fwg = player.value.stats.foulsReceived ? player.value.stats.foulsReceived / player.value.stats.gamesPlayed : 0

  return [
    {
      name: player.value.name,
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

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const calculatePerGame = (total: number | undefined) => {
  if (!total || !player.value?.stats?.gamesPlayed || player.value.stats.gamesPlayed === 0) return '-'
  const value = total / player.value.stats.gamesPlayed
  return (Math.floor(value * 100) / 100).toFixed(2)
}

const calculateMinutes = (timePlayed: number | undefined) => {
  if (!timePlayed || !player.value?.stats?.gamesPlayed || player.value.stats.gamesPlayed === 0) return '-'
  const minutes = timePlayed / 60 / player.value.stats.gamesPlayed
  return (Math.floor(minutes * 100) / 100).toFixed(2)
}

const formatMinutes = (seconds: number | undefined) => {
  if (!seconds) return '-'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const loadPlayer = async () => {
  await fetchPlayerByCode(playerCode.value)
}

// Load player when route changes
watch(playerCode, () => {
  loadPlayer()
}, { immediate: true })
</script>
<style scoped>
.player-details-page {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.page-container {
  padding: 32px 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Profile Card */
.profile-card {
  background: linear-gradient(135deg, rgba(240, 83, 35, 0.03) 0%, rgba(240, 83, 35, 0.01) 100%);
  border: 1px solid rgba(240, 83, 35, 0.08);
  transition: all 0.3s ease;
}

.profile-card:hover {
  border-color: rgba(240, 83, 35, 0.16);
}

.avatar-shadow {
  box-shadow: 0 8px 16px rgba(240, 83, 35, 0.12);
}

/* Info Card */
.info-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.info-group {
  padding-right: 8px;
}

.info-icon {
  color: #F05323;
}

/* Stats Cards */
.stats-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.stats-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.detail-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.primary-icon {
  color: #F05323 !important;
}

.stat-cell {
  padding: 0 !important;
}

.stat-row-gap {
  row-gap: 2px !important;
}

.radar-stat {
  text-align: center;
  padding: 8px;
  background: rgba(240, 83, 35, 0.05);
  border-radius: 6px;
}

.radar-stat-label {
  font-size: 11px;
  font-weight: 700;
  color: #8a92a2;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
}

.radar-stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #1a2742;
}

.simple-stat-card {
  text-align: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  width: 100%;
  transition: all 0.2s ease;
}

.simple-stat-card:hover {
  background: #f0f3f7;
  transform: translateY(-1px);
}

.stat-block {
  text-align: center;
  padding: 16px 12px;
  background: linear-gradient(135deg, rgba(240, 83, 35, 0.08) 0%, rgba(240, 83, 35, 0.03) 100%);
  border-radius: 12px;
  border-left: 3px solid #F05323;
  transition: all 0.2s ease;
}

.stat-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(240, 83, 35, 0.1);
}

.stat-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #1a2742;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}

.stat-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #8a92a2;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

/* Inline stat rows */
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label-inline {
  font-size: 13px;
  font-weight: 500;
  color: #8a92a2;
}

.stat-value-inline {
  font-size: 15px;
  font-weight: 700;
  color: #1a2742;
  margin-left: 12px;
}

:deep(.v-card-title) {
  color: #1a2742 !important;
  font-weight: 600;
  font-size: 16px;
}

:deep(.v-divider) {
  opacity: 0.4;
}

:deep(.v-list-item) {
  min-height: auto;
  padding: 6px 0;
}

:deep(.v-list-item-title) {
  font-size: 12px;
  font-weight: 600;
  color: #8a92a2;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

:deep(.v-list-item-subtitle) {
  font-size: 14px;
  font-weight: 500;
  color: #1a2742;
}

@media (max-width: 960px) {
  .page-container {
    padding: 20px 16px;
  }
  
  .stat-block {
    padding: 12px 8px;
  }
  
  .stat-value {
    font-size: 18px;
  }
}

@media (max-width: 600px) {
  .page-container {
    padding: 16px 12px;
  }
  
  .stat-row {
    padding: 10px 0;
  }
  
  .stat-label-inline {
    font-size: 12px;
  }
  
  .stat-value-inline {
    font-size: 14px;
  }
}
</style>