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
          </div>
          <div class="cell center">{{ formatValue(item.cr) }}</div>
          <div class="cell center">{{ formatValue(item.pdk) }}</div>
          <div class="cell center">{{ formatValue(item.min) }}</div>
          <div class="cell center">
            <button class="expand-btn" type="button" @click="toggleExpanded(item.id)">
              <v-icon size="18">mdi-eye-outline</v-icon>
            </button>
          </div>
        </div>
        <div v-if="isExpanded(item.id)" class="row-details">
          <div class="detail-grid">
            <div class="expanded-item"><span>PTS</span><strong>{{ formatValue(item.pts) }}</strong></div>
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
            <div class="expanded-item"><span>+/-</span><strong>{{ formatValue(item.plus_minus) }}</strong></div>
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

const sortKey = ref<'name' | 'min' | 'pdk' | 'cr'>('cr')
const sortDir = ref<'asc' | 'desc'>('desc')
const tableHeight = '70vh'
const rowHeight = 68
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

.player-name {
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.player-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.player-main {
  font-weight: 700;
}

.player-pos {
  font-weight: 600;
  color: #94a3b8;
  font-size: 0.8rem;
}

.player-sub {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
}

.player-avatar {
  width: 26px;
  height: 26px;
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
  font-size: 0.7rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: auto;
}

.row-details {
  padding: 0 1rem 0.9rem;
  border-bottom: 1px solid #eef1f6;
  background: #f9fbff;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(160px, 1fr));
  gap: 0.6rem;
}

.table-header {
  display: grid;
  grid-template-columns: 40% 15% 15% 15% 15%;
  gap: 0;
  background: linear-gradient(135deg, #1a2742, #24365a);
  color: #ffffff;
  padding: 0.85rem 1rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.table-row {
  display: grid;
  grid-template-columns: 40% 15% 15% 15% 15%;
  align-items: center;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #eef1f6;
  font-weight: 600;
  color: #1a2742;
}

.table-row:hover {
  background: #f8fafc;
}

.cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cell.center {
  justify-content: center;
}

.cell.name {
  justify-content: flex-start;
}

.expanded-item {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #1a2742;
  background: #ffffff;
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e6ebf4;
}

.expanded-item span {
  color: #64748b;
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: 0.06em;
}

</style>
