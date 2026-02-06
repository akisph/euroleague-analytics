<template>
  <div class="fantasy-table-card">
    <table class="fantasy-table">
      <thead>
        <tr>
          <th>
            <button class="sort-btn" type="button" @click="setSort('name')">
              Player
              <span class="sort-indicator">{{ sortIndicator('name') }}</span>
            </button>
          </th>
          <th>
            <button class="sort-btn" type="button" @click="setSort('cr')">
              CR
              <span class="sort-indicator">{{ sortIndicator('cr') }}</span>
            </button>
          </th>
          <th>
            <button class="sort-btn" type="button" @click="setSort('pdk')">
              PIR
              <span class="sort-indicator">{{ sortIndicator('pdk') }}</span>
            </button>
          </th>
          <th>
            <button class="sort-btn" type="button" @click="setSort('min')">
              MIN
              <span class="sort-indicator">{{ sortIndicator('min') }}</span>
            </button>
          </th>
          <th class="eye-col"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="player in sortedItems" :key="player.id">
          <tr>
            <td class="player-name">
              <span class="player-left">
                <span v-if="player.imageUrl" class="player-avatar">
                  <img :src="player.imageUrl" :alt="`${player.first_name} ${player.last_name}`" />
                </span>
                <span class="player-text">
                  <span class="player-main">
                    {{ player.first_name }} {{ player.last_name }}
                    <span class="player-pos">({{ player.position }})</span>
                  </span>
                  <span class="player-sub">{{ player.team_name }}</span>
                </span>
              </span>
            </td>
            <td>{{ formatValue(player.cr) }}</td>
            <td>{{ formatValue(player.pdk) }}</td>
            <td>{{ formatValue(player.min) }}</td>
            <td class="eye-col">
              <button
                class="expand-btn"
                type="button"
                :aria-expanded="isExpanded(player.id)"
                :aria-label="isExpanded(player.id) ? 'Hide details' : 'Show details'"
                @click="toggleExpanded(player.id)"
              >
                <v-icon size="14">
                  {{ isExpanded(player.id) ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
                </v-icon>
              </button>
            </td>
          </tr>
          <tr v-if="isExpanded(player.id)" class="expanded-row">
            <td :colspan="5">
              <div class="expanded-grid">
                <div class="expanded-item"><span>PTS</span><strong>{{ formatValue(player.pts) }}</strong></div>
                <div class="expanded-item"><span>REB</span><strong>{{ formatValue(player.reb) }}</strong></div>
                <div class="expanded-item"><span>AST</span><strong>{{ formatValue(player.ast) }}</strong></div>
                <div class="expanded-item"><span>OREB</span><strong>{{ formatValue(player.oreb) }}</strong></div>
                <div class="expanded-item"><span>DREB</span><strong>{{ formatValue(player.dreb) }}</strong></div>
                <div class="expanded-item"><span>STL</span><strong>{{ formatValue(player.stl) }}</strong></div>
                <div class="expanded-item"><span>BLK</span><strong>{{ formatValue(player.blk) }}</strong></div>
                <div class="expanded-item"><span>TOV</span><strong>{{ formatValue(player.tov) }}</strong></div>
                <div class="expanded-item"><span>PF</span><strong>{{ formatValue(player.pf) }}</strong></div>
                <div class="expanded-item">
                  <span>FGM/FGA</span>
                  <strong>{{ formatValue(player.fgm) }}/{{ formatValue(player.fga) }} ({{ formatPercent(player.fgp) }})</strong>
                </div>
                <div class="expanded-item">
                  <span>3PM/3PA</span>
                  <strong>{{ formatValue(player.tpm) }}/{{ formatValue(player.tpa) }} ({{ formatPercent(player.tpp) }})</strong>
                </div>
                <div class="expanded-item">
                  <span>FTM/FTA</span>
                  <strong>{{ formatValue(player.ftm) }}/{{ formatValue(player.fta) }} ({{ formatPercent(player.ftp) }})</strong>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FantasyPlayerStats } from '~/types'

interface Props {
  items: FantasyPlayerStats[]
}

const props = defineProps<Props>()

const sortKey = ref<'name' | 'min' | 'pdk' | 'cr'>('pdk')
const sortDir = ref<'asc' | 'desc'>('desc')
const expandedRows = ref(new Set<string>())

const formatValue = (value?: string) => {
  if (!value) return '-'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return value
  return numeric.toFixed(2)
}

const formatPercent = (value?: string) => {
  if (!value) return '-'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return value
  return `${numeric.toFixed(1)}%`
}

const sortedItems = computed(() => {
  const items = [...props.items]
  const key = sortKey.value
  const direction = sortDir.value === 'asc' ? 1 : -1
  return items.sort((a, b) => {
    if (key === 'name') {
      return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`) * direction
    }
    if (key === 'min' || key === 'pdk' || key === 'cr') {
      const aVal = Number(a[key])
      const bVal = Number(b[key])
      if (!Number.isFinite(aVal) && !Number.isFinite(bVal)) return 0
      if (!Number.isFinite(aVal)) return 1 * direction
      if (!Number.isFinite(bVal)) return -1 * direction
      return (aVal - bVal) * direction
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
  return sortDir.value === 'asc' ? '^' : 'v'
}

const toggleExpanded = (id: string) => {
  const next = new Set(expandedRows.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedRows.value = next
}

const isExpanded = (id: string) => expandedRows.value.has(id)
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
  table-layout: fixed;
  border-collapse: collapse;
}

.fantasy-table thead {
  background: linear-gradient(135deg, #1a2742, #24365a);
}

.fantasy-table th {
  text-align: left;
  padding: 0.5rem 0.45rem;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ffffff;
  white-space: nowrap;
  box-sizing: border-box;
}

.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
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
  font-size: 0.55rem;
  opacity: 0.7;
}

.fantasy-table td {
  padding: 0.5rem 0.45rem;
  border-bottom: 1px solid #eef1f6;
  font-weight: 600;
  color: #1a2742;
  font-size: 0.68rem;
  transition: background-color 0.2s ease;
  word-break: break-word;
  box-sizing: border-box;
}

.player-name {
  font-weight: 700;
  white-space: normal;
  font-size: 0.56rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.player-left {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
}

.player-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.player-main {
  font-weight: 700;
}

.player-pos {
  font-weight: 600;
  color: #94a3b8;
  font-size: 0.55rem;
}

.player-sub {
  font-size: 0.5rem;
  color: #64748b;
  font-weight: 600;
}

.player-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #e0e6f0;
  background: #ffffff;
  flex-shrink: 0;
}

.player-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.expand-btn {
  border: none;
  background: #eef1f6;
  color: #1a2742;
  font-weight: 700;
  font-size: 0.55rem;
  padding: 0.25rem 0.45rem;
  border-radius: 999px;
  cursor: pointer;
  flex-shrink: 0;
}

.expanded-row td {
  background: #f9fbff;
  border-bottom: 1px solid #e8edf5;
  padding: 0.6rem 0.45rem 0.8rem;
}

.expanded-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
}

.expanded-item {
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
  font-size: 0.6rem;
  color: #1a2742;
  background: #ffffff;
  border-radius: 8px;
  padding: 0.35rem 0.4rem;
  border: 1px solid #e6ebf4;
}

.expanded-item span {
  color: #64748b;
  text-transform: uppercase;
  font-size: 0.5rem;
  letter-spacing: 0.05em;
}

.fantasy-table th:first-child,
.fantasy-table td:first-child {
  width: 60%;
}

.fantasy-table th:nth-child(2),
.fantasy-table td:nth-child(2) {
  width: 15%;
  text-align: center;
}

.fantasy-table th:nth-child(3),
.fantasy-table td:nth-child(3) {
  width: 15%;
  text-align: center;
}

.fantasy-table th:nth-child(4),
.fantasy-table td:nth-child(4) {
  width: 15%;
  text-align: center;
}

.fantasy-table th.eye-col,
.fantasy-table td.eye-col {
  width: 15%;
  text-align: center;
}
</style>
