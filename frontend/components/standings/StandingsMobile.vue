<template>
  <div class="standings-mobile">
    <ErrorAlert
      v-if="error"
      :error="error"
      @retry="loadStandings"
      @dismiss="error = null"
    />

    <LoadingState :loading="isLoading" message="Loading standings...">
      <div class="standings-card">
        <div class="standings-top">
          <div class="filter-group">
            <v-btn
              class="filter-btn"
              :variant="selectedFilter === 'stats' ? 'flat' : 'tonal'"
              color="primary"
              size="small"
              @click="selectedFilter = 'stats'"
            >
              Stats
            </v-btn>
            <v-btn
              class="filter-btn"
              :variant="selectedFilter === 'streak' ? 'flat' : 'tonal'"
              color="primary"
              size="small"
              @click="selectedFilter = 'streak'"
            >
              Streak
            </v-btn>
          </div>

          <v-btn class="menu-btn" variant="tonal" icon size="small" disabled>
            <v-icon icon="mdi-format-list-bulleted" />
          </v-btn>
        </div>

        <div v-if="selectedFilter === 'stats'" class="standings-head">
          <span class="head-rank">#</span>
          <span class="head-team">Team</span>
          <span class="head-gp">GP</span>
          <span class="head-wl">W-L</span>
          <span class="head-diff">+/-</span>
          <span class="head-pct">Pct</span>
        </div>
        <div v-else class="standings-head streak">
          <span class="head-rank">#</span>
          <span class="head-team">Team</span>
          <span class="head-gp">GP</span>
          <span class="head-wl">W-L</span>
          <span class="head-form text-center">Form</span>
        </div>

        <div v-if="tableStandings.length" class="standings-list">
          <div
            v-for="team in tableStandings"
            :key="team.teamCode"
            class="standings-row"
            :class="{ streak: selectedFilter === 'streak' }"
          >
            <div class="row-rank">
              <span class="rank-pill" :class="getRankClass(team.position)">
                {{ team.position }}
              </span>
            </div>

            <div v-if="selectedFilter === 'stats' || selectedFilter === 'streak'" class="row-team">
              <v-avatar size="28" color="#e0e6f0">
                <v-img v-if="team.teamImage" :src="team.teamImage" :alt="team.teamName" />
                <span v-else class="team-code">
                  {{ team.teamCode?.substring(0, 3) }}
                </span>
              </v-avatar>
              <NuxtLink :to="`/clubs/${team.teamCode}`" class="team-link">
                {{ team.teamName }}
              </NuxtLink>
            </div>
            <div v-else class="row-team code">
              <NuxtLink :to="`/clubs/${team.teamCode}`" class="team-link code">
                {{ team.teamCode?.substring(0, 3) }}
              </NuxtLink>
            </div>

            <div class="row-gp">{{ team.gamesPlayed ?? 0 }}</div>
            <div v-if="selectedFilter === 'stats'" class="row-wl">{{ team.wins ?? 0 }}-{{ team.losses ?? 0 }}</div>
            <div v-if="selectedFilter === 'stats'" class="row-diff">{{ formatDiff(computedDiff(team)) }}</div>
            <div v-if="selectedFilter === 'stats'" class="row-pct">{{ formatPct(team) }}</div>
            <div v-if="selectedFilter === 'streak'" class="row-wl">{{ team.wins ?? 0 }}-{{ team.losses ?? 0 }}</div>
            <div v-if="selectedFilter === 'streak'" class="row-form">
              <span
                v-for="(result, idx) in getLastFive(team)"
                :key="`${team.teamCode}-${idx}`"
                class="form-pill"
                :class="result === 'W' ? 'form-win' : 'form-loss'"
              >
                {{ result }}
              </span>
            </div>
          </div>
        </div>

        <SharedEmptyState
          v-else
          title="No Standings Available"
          message="Standings data will appear once games are played"
          icon="mdi-format-list-numbered"
        />
      </div>
    </LoadingState>
  </div>
</template>

<script setup lang="ts">
import type { TeamStanding } from '~/types'

interface Props {
  title?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Standings',
  subtitle: 'Regular Season',
})

const seasonStore = useSeasonStore()
const { fetchCurrentStandings, allTeamStandings, isLoading, error } = useStandings()
const selectedFilter = ref<'stats' | 'streak'>('stats')

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)

const loadStandings = async () => {
  if (!selectedSeasonCode.value) return
  try {
    await fetchCurrentStandings(selectedSeasonCode.value)
  } catch (err) {
    console.error('Failed to load standings:', err)
  }
}

watch(selectedSeasonCode, async (newSeason) => {
  if (newSeason) {
    await loadStandings()
  }
})

onMounted(async () => {
  if (!selectedSeasonCode.value) {
    const unwatch = watch(selectedSeasonCode, async (newSeason) => {
      if (newSeason) {
        unwatch()
        await loadStandings()
      }
    })
  } else {
    await loadStandings()
  }
})

const tableStandings = computed(() => {
  return (allTeamStandings.value || []).map((item: TeamStanding) => ({
    ...item,
    gamesPlayed: item.gamesPlayed ?? 0,
    wins: item.wins ?? 0,
    losses: item.losses ?? 0,
  }))
})

const formatPct = (team: TeamStanding) => {
  const raw = typeof team.winPercentage === 'number'
    ? team.winPercentage
    : (() => {
        const gp = team.gamesPlayed ?? 0
        if (!gp) return 0
        return (team.wins ?? 0) / gp
      })()
  const normalized = raw > 1 ? raw : raw * 100
  return `${Math.round(normalized)}%`
}

const formatDiff = (value?: number) => {
  const v = value ?? 0
  return v >= 0 ? `+${v}` : String(v)
}

const computedDiff = (team: TeamStanding) => {
  const pf = team.pointsFor ?? 0
  const pa = team.pointsAgainst ?? 0
  return pf - pa
}

const getLastFive = (team: TeamStanding) => {
  const raw = (team.lastFive || '').trim()
  if (!raw) return ['-']
  return raw.split('').reverse()
}
const getRankClass = (position: number) => {
  if (position <= 4) return 'rank-top4'
  if (position <= 6) return 'rank-top6'
  if (position <= 10) return 'rank-playin'
  return 'rank-lower'
}
</script>

<style scoped>
.standings-card {
  background: #ffffff;
  border: 1px solid #e0e6f0;
  border-radius: 16px;
  padding: 1rem 0.75rem 0.75rem;
  box-shadow: 0 8px 20px rgba(26, 39, 66, 0.08);
}

.standings-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.filter-group {
  display: inline-flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.filter-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 999px;
}

.menu-btn {
  border-radius: 10px;
}

.standings-head {
  display: grid;
  grid-template-columns: 38px 1.4fr 44px 56px 56px 56px;
  gap: 0.25rem;
  padding: 0.35rem 0.25rem 0.5rem;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8a92a2;
  font-weight: 700;
  align-items: center;
}

.standings-head.streak {
  grid-template-columns: 34px 1fr 44px 64px 96px;
}

.head-gp,
.head-wl,
.head-w,
.head-l,
.head-diff,
.head-pf,
.head-pa,
.head-pct {
  text-align: right;
}

.head-rank {
  text-align: center;
}

.standings-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.standings-row {
  display: grid;
  grid-template-columns: 38px 1.4fr 44px 56px 56px 56px;
  align-items: center;
  gap: 0.25rem;
  padding: 0.45rem 0.25rem;
  border-radius: 12px;
  background: #f9fafb;
}

.standings-row.streak {
  grid-template-columns: 34px 1fr 44px 64px 96px;
}

.row-team {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.team-link {
  color: #1a2742;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.78rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-link.code {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.team-code {
  font-size: 0.6rem;
  font-weight: 700;
  color: #516078;
}

.row-gp,
.row-wl,
.row-diff,
.row-pct {
  text-align: right;
  font-weight: 600;
  color: #1a2742;
  font-size: 0.74rem;
}

.row-form {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  flex-wrap: nowrap;
  padding-left: 6px;
}

.form-pill {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: #ffffff;
}

.form-win {
  background: #28a745;
}

.form-loss {
  background: #dc3545;
}

.rank-pill {
  display: inline-flex;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #ffffff;
  font-size: 0.7rem;
}

.rank-top4 {
  background: #28a745;
}

.rank-top6 {
  background: #7fcf8a;
}

.rank-playin {
  background: #F05323;
}

.rank-lower {
  background: #8a92a2;
}

@media (max-width: 420px) {
  .standings-head,
  .standings-row {
    grid-template-columns: 34px 1fr 40px 52px 52px 52px;
  }

  .standings-head.streak,
  .standings-row.streak {
    grid-template-columns: 30px 0.9fr 40px 60px 88px;
  }

  .team-link {
    font-size: 0.72rem;
  }

  .row-gp,
  .row-wl,
  .row-pct {
    font-size: 0.7rem;
  }
}
</style>
