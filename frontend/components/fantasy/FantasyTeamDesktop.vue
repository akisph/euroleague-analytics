<template>
  <div class="fantasy-table-card">
    <table class="fantasy-table">
      <thead>
        <tr>
          <th>
            <button class="sort-btn" type="button" @click="setSort('name')">
              Team
              <span class="sort-indicator">{{ sortIndicator('name') }}</span>
            </button>
          </th>
          <th>
            <button class="sort-btn" type="button" @click="setSort('l3')">
              Last 3
              <span class="sort-indicator">{{ sortIndicator('l3') }}</span>
            </button>
          </th>
          <th>
            <button class="sort-btn" type="button" @click="setSort('l5')">
              Last 5
              <span class="sort-indicator">{{ sortIndicator('l5') }}</span>
            </button>
          </th>
          <th>
            <button class="sort-btn" type="button" @click="setSort('l10')">
              Last 10
              <span class="sort-indicator">{{ sortIndicator('l10') }}</span>
            </button>
          </th>
          <th>
            <button class="sort-btn" type="button" @click="setSort('all')">
              All
              <span class="sort-indicator">{{ sortIndicator('all') }}</span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="team in sortedItems"
          :key="team.id"
          class="row-clickable"
          @click="goToClub(team.id)"
        >
          <td class="team-name">{{ team.name }}</td>
          <td :style="scoreStyle(team.l3, 'l3')">{{ formatValue(team.l3) }}</td>
          <td :style="scoreStyle(team.l5, 'l5')">{{ formatValue(team.l5) }}</td>
          <td :style="scoreStyle(team.l10, 'l10')">{{ formatValue(team.l10) }}</td>
          <td :style="scoreStyle(team.all, 'all')">{{ formatValue(team.all) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FantasyTeamPirAllowed } from '~/types'

interface Props {
  items: FantasyTeamPirAllowed[]
}

const props = defineProps<Props>()
const router = useRouter()

const sortKey = ref<'name' | 'l3' | 'l5' | 'l10' | 'all'>('all')
const sortDir = ref<'asc' | 'desc'>('desc')

const columnStats = computed(() => {
  const columns: Array<'l3' | 'l5' | 'l10' | 'all'> = ['l3', 'l5', 'l10', 'all']
  const stats: Record<string, { avg: number }> = {}
  columns.forEach((col) => {
    const values = props.items
      .map((item) => Number(item[col]))
      .filter((value) => Number.isFinite(value))
    const avg = values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : 0
    stats[col] = { avg }
  })
  return stats
})

const formatValue = (value?: string) => {
  if (!value) return '-'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return value
  return numeric.toFixed(2)
}

const sortedItems = computed(() => {
  const items = [...props.items]
  const key = sortKey.value
  const direction = sortDir.value === 'asc' ? 1 : -1
  return items.sort((a, b) => {
    if (key === 'name') {
      return a.name.localeCompare(b.name) * direction
    }
    const aVal = Number(a[key])
    const bVal = Number(b[key])
    if (!Number.isFinite(aVal) && !Number.isFinite(bVal)) return 0
    if (!Number.isFinite(aVal)) return 1 * direction
    if (!Number.isFinite(bVal)) return -1 * direction
    return (aVal - bVal) * direction
  })
})

const setSort = (key: typeof sortKey.value) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    return
  }
  sortKey.value = key
  sortDir.value = key === 'name' ? 'asc' : 'desc'
}

const sortIndicator = (key: typeof sortKey.value) => {
  if (sortKey.value !== key) return ''
  return sortDir.value === 'asc' ? '▲' : '▼'
}

const scoreStyle = (value: string | undefined, col: 'l3' | 'l5' | 'l10' | 'all') => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return {}
  const { avg } = columnStats.value[col] ?? { avg: 0 }
  if (!Number.isFinite(avg) || avg === 0) return {}
  const diffRatio = Math.min(Math.abs(numeric - avg) / avg, 1)
  const intensity = Math.min(1, Math.sqrt(diffRatio) * 1.1)
  const opacity = Math.max(0.3, Math.min(0.8, 0.3 + intensity * 0.5))
  const isAbove = numeric > avg
  const isBelow = numeric < avg
  if (!isAbove && !isBelow) {
    return {}
  }
  const backgroundColor = isAbove
    ? `rgba(64, 167, 110, ${opacity})`
    : `rgba(210, 94, 86, ${opacity})`
  return { backgroundColor }
}

const goToClub = (clubCode: string) => {
  if (!clubCode) return
  router.push(`/clubs/${clubCode}`)
}
</script>

<style scoped>
.fantasy-table-card {
  background: #ffffff;
  border: 1px solid #e0e6f0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(26, 39, 66, 0.06);
}

.fantasy-table {
  width: 100%;
  border-collapse: collapse;
}

.fantasy-table thead {
  background: linear-gradient(135deg, #1a2742, #24365a);
}

.fantasy-table th {
  text-align: left;
  padding: 0.85rem 1rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ffffff;
}

.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
  cursor: pointer;
  padding: 0;
}

.sort-indicator {
  font-size: 0.7rem;
  opacity: 0.7;
}

.fantasy-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #eef1f6;
  font-weight: 600;
  color: #1a2742;
  transition: background-color 0.2s ease;
}

.row-clickable {
  cursor: pointer;
}

.row-clickable:hover {
  background: #f6f8fb;
}

.fantasy-table tbody tr:hover {
  background: #f8fafc;
}

.team-name {
  font-weight: 700;
}

</style>
