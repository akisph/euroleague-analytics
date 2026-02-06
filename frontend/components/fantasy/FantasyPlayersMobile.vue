<template>
  <div class="fantasy-table-card">
    <v-data-table-virtual
      class="fantasy-table"
      :items="sortedItems"
      :headers="headers"
      :height="tableHeight"
      :item-height="rowHeight"
      item-value="id"
      fixed-header
    >
      <template #headers>
        <div class="table-header">
          <div class="cell name">
            <button class="sort-btn" type="button" @click="setSort('name')">
              Player
              <span class="sort-indicator">{{ sortIndicator('name') }}</span>
            </button>
          </div>
          <div class="cell center">
            <button class="sort-btn" type="button" @click="setSort('cr')">
              CR
              <span class="sort-indicator">{{ sortIndicator('cr') }}</span>
            </button>
          </div>
          <div class="cell center">
            <button class="sort-btn" type="button" @click="setSort('pdk')">
              PIR
              <span class="sort-indicator">{{ sortIndicator('pdk') }}</span>
            </button>
          </div>
          <div class="cell center">
            <button class="sort-btn" type="button" @click="setSort('min')">
              MIN
              <span class="sort-indicator">{{ sortIndicator('min') }}</span>
            </button>
          </div>
          <div class="cell center"></div>
        </div>
      </template>
      <template #item="{ item }">
        <div class="table-row">
          <div class="cell name">
            <span class="player-left">
              <span v-if="item.imageUrl" class="player-avatar">
                <img :src="item.imageUrl" :alt="`${item.first_name} ${item.last_name}`" />
              </span>
              <span v-else class="player-avatar player-avatar--empty" aria-hidden="true"></span>
              <span class="player-text">
                <span class="player-main">
                  {{ item.first_name }} {{ item.last_name }}
                  <span class="player-pos">({{ item.position }})</span>
                </span>
                <span class="player-sub">{{ item.team_name }}</span>
              </span>
            </span>
          </div>
          <div class="cell center">{{ formatValue(item.cr) }}</div>
          <div class="cell center">{{ formatValue(item.pdk) }}</div>
          <div class="cell center">{{ formatValue(item.min) }}</div>
          <div class="cell center">
            <button class="expand-btn" type="button" @click="toggleExpanded(item.id)">
              <v-icon size="14">mdi-eye-outline</v-icon>
            </button>
          </div>
        </div>
        <div v-if="isExpanded(item.id)" class="row-details">
          <div class="detail-grid">
            <div class="expanded-item"><span>PTS</span><strong>{{ formatValue(item.pts) }}</strong></div>
            <div class="expanded-item"><span>REB</span><strong>{{ formatValue(item.reb) }}</strong></div>
            <div class="expanded-item"><span>AST</span><strong>{{ formatValue(item.ast) }}</strong></div>
            <div class="expanded-item"><span>OREB</span><strong>{{ formatValue(item.oreb) }}</strong></div>
            <div class="expanded-item"><span>DREB</span><strong>{{ formatValue(item.dreb) }}</strong></div>
            <div class="expanded-item"><span>STL</span><strong>{{ formatValue(item.stl) }}</strong></div>
            <div class="expanded-item"><span>BLK</span><strong>{{ formatValue(item.blk) }}</strong></div>
            <div class="expanded-item"><span>TOV</span><strong>{{ formatValue(item.tov) }}</strong></div>
            <div class="expanded-item"><span>PF</span><strong>{{ formatValue(item.pf) }}</strong></div>
            <div class="expanded-item">
              <span>FGM/FGA</span>
              <strong>{{ formatValue(item.fgm) }}/{{ formatValue(item.fga) }} ({{ formatPercent(item.fgp) }})</strong>
            </div>
            <div class="expanded-item">
              <span>3PM/3PA</span>
              <strong>{{ formatValue(item.tpm) }}/{{ formatValue(item.tpa) }} ({{ formatPercent(item.tpp) }})</strong>
            </div>
            <div class="expanded-item">
              <span>FTM/FTA</span>
              <strong>{{ formatValue(item.ftm) }}/{{ formatValue(item.fta) }} ({{ formatPercent(item.ftp) }})</strong>
            </div>
          </div>
        </div>
      </template>
    </v-data-table-virtual>
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
const tableHeight = '70vh'
const rowHeight = 58
const expandedRows = ref(new Set<string>())

const headers = [
  { title: 'Player', key: 'name' },
  { title: 'CR', key: 'cr' },
  { title: 'PIR', key: 'pdk' },
  { title: 'MIN', key: 'min' },
  { title: '', key: 'eye' },
]

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

const toggleExpanded = (id?: string) => {
  if (!id) return
  const next = new Set(expandedRows.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedRows.value = next
}

const isExpanded = (id?: string) => {
  if (!id) return false
  return expandedRows.value.has(id)
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

.fantasy-table :deep(.v-table__wrapper) {
  overflow-y: auto;
  scrollbar-width: none;
}

.fantasy-table :deep(.v-table__wrapper::-webkit-scrollbar) {
  width: 0;
  height: 0;
}

.fantasy-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
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

.player-avatar--empty {
  background: #f1f5f9;
}

.player-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
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

.row-details {
  padding: 0 0.45rem 0.7rem;
  border-bottom: 1px solid #eef1f6;
  background: #f9fbff;
}

.detail-grid {
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

.table-header {
  display: grid;
  grid-template-columns: 40% 15% 15% 15% 15%;
  gap: 0;
  background: linear-gradient(135deg, #1a2742, #24365a);
  color: #ffffff;
  padding: 0.5rem 0.45rem;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  box-sizing: border-box;
}

.table-row {
  display: grid;
  grid-template-columns: 40% 15% 15% 15% 15%;
  align-items: center;
  padding: 0.5rem 0.45rem;
  border-bottom: 1px solid #eef1f6;
  font-weight: 600;
  color: #1a2742;
  font-size: 0.68rem;
  transition: background-color 0.2s ease;
  word-break: break-word;
  box-sizing: border-box;
}

.cell {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.cell.center {
  justify-content: center;
}

.cell.name {
  justify-content: flex-start;
}
</style>
