<template>
  <v-card class="mt-4">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-broadcast" class="mr-2" />
      Live Events
    </v-card-title>
    <v-card-text>
      <v-expansion-panels
        v-model="openLivePanel"
        variant="accordion"
        class="live-panels"
      >
        <v-expansion-panel
          v-for="(section, idx) in liveEventSections"
          :key="section.key"
        >
          <v-expansion-panel-title>
            <div class="panel-title">
              <span class="panel-label">{{ section.label }}</span>
              <span v-if="section.endScore" class="panel-score text-secondary">
                {{ section.endScore }}
              </span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div v-if="section.items.length">
              <div
                v-for="event in liveEventsToShowBySection(section)"
                :key="event.key"
                class="event-row"
              >
                <div
                  class="event-side event-side--home"
                  :class="{ 'event-side--active': event.side === 'home' }"
                >
                  <div class="event-meta home_team_indicator">
                    <span class="event-quarter">{{ section.label }}</span>
                    <span class="event-time">{{ event.time }}</span>
                  </div>
                  <div class="event-body">
                    <div class="event-title" :class="eventOutcomeClass(event)">{{ event.playInfo }}</div>
                    <div class="event-subtitle">{{ event.player }}</div>
                  </div>
                </div>
                <div
                  class="event-side event-side--center "
                  :class="{ 'event-side--active': event.side === 'neutral' }"
                >
               
                  <div class="event-body">
                    <div class="event-title" :class="eventOutcomeClass(event)">{{ event.playInfo }}</div>

                    <span class="event-quarter">{{ section.label }}</span>
                    <span class="event-time">{{ event.time }}</span>
                  </div>
                </div>
                <div
                  class="event-side event-side--away"
                  :class="{ 'event-side--active': event.side === 'away' }"
                >
                
                  <div class="event-meta away_team_indicator">
                    <span class="event-quarter">{{ section.label }}</span>
                    <span class="event-time">{{ event.time }}</span>
                  </div>
                  <div class="event-body">
                  
                    <div class="event-title" :class="eventOutcomeClass(event)">{{ event.playInfo }}</div>
                    <div class="event-subtitle text-secondary">{{ event.player }}</div>
                  </div>
                </div>
              </div>
              <div class="event-actions">
                <v-btn
                  v-if="idx === openLivePanel && liveEventsLimit < section.items.length"
                  variant="outlined"
                  color="primary"
                  size="small"
                  @click="liveEventsLimit += 40"
                >
                  Show more
                </v-btn>
              </div>
            </div>
            <div v-else class="text-caption text-medium-emphasis">No events for this period.</div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  game?: any
  liveBoxscore?: any
  livePlayByPlay?: any
}>()

const liveEventsLimit = ref(40)
const openLivePanel = ref<number | null>(null)

const normalizeTeamCode = (value: string | undefined) =>
  (value || '').trim().toUpperCase()

const normalizeEvent = (item: any, keyPrefix: string, idx: number) => {
  const codeTeam = normalizeTeamCode(item?.codeTeam || item?.CODETEAM)
  const homeCode = normalizeTeamCode(props.game?.homeTeamCode)
  const awayCode = normalizeTeamCode(props.game?.awayTeamCode)
  const side = codeTeam && codeTeam === homeCode ? 'home' : codeTeam && codeTeam === awayCode ? 'away' : 'neutral'
  const playInfoText = (item?.playInfo || item?.playType || 'Event').toString()
  const displayPlayInfo = formatPlayInfo(playInfoText)

  return {
    key: `${keyPrefix}-${item?.numberOfPlay ?? idx}`,
    time: item?.markerTime || '-',
    playInfo: displayPlayInfo,
    team: item?.team || '-',
    player: item?.player || '',
    side,
    outcome: classifyOutcome(playInfoText),
  }
}

const classifyOutcome = (text: string) => {
  const normalized = text.toLowerCase()
  if (normalized.includes('time out') || normalized.includes('timeout')) return 'neutral'
  if (normalized.includes('missed')) return 'negative'
  if (normalized === 'in' || normalized.includes(' in')) return 'positive'
  if (normalized === 'out' || normalized.includes(' out')) return 'negative'
  if (normalized.includes('foul drawn') || normalized.includes('fouls drawn') || normalized.includes('foul received') || normalized.includes('fouls received')) {
    return 'positive'
  }
  const positive = [
    'made',
    'assist',
    'rebound',
    'jump ball',
    'two pointer',
    'three pointer',
    'steal',
    'block',
  ]
  const negative = [
    'turnover',
    'shot rejected',
  ]

  if (positive.some((term) => normalized.includes(term))) return 'positive'
  if (negative.some((term) => normalized.includes(term))) return 'negative'
  if (normalized.includes('foul')) return 'negative'
  return 'neutral'
}

const formatPlayInfo = (text: string) => {
  const normalized = text.toLowerCase()
  if (normalized.includes('missed free throw')) return text.replace(/missed\s+free throw/ig, 'Missed FT')
  if (normalized.includes('missed two pointer')) return `2PT X · ${text}`
  if (normalized.includes('missed three pointer')) return text.replace(/missed\s+three pointer/ig, 'Missed +3 PT')
  if (normalized.includes('free throw in') || normalized.includes('free throw made')) return text.replace(/free throw in/ig, '+1 FT').replace(/free throw made/ig, '+1 FT')
  if (normalized.includes('two pointer') || normalized.includes('2pt made')) return text.replace(/two pointer/ig, '+2 PT')
  if (normalized.includes('three pointer') || normalized.includes('3pt made')) return text.replace(/three pointer/ig, '+3 PT')
  return text
}

const liveEventSections = computed(() => {
  const pbp = props.livePlayByPlay || {}
  const endRows = props.liveBoxscore?.endOfQuarter || []
  const pairEndScore = (homeIdx: number, awayIdx: number, quarter: 1 | 2 | 3 | 4) => {
    const home = endRows[homeIdx]
    const away = endRows[awayIdx]
    if (!home || !away) return null
    const key = quarter === 1 ? 'quarter1' : quarter === 2 ? 'quarter2' : quarter === 3 ? 'quarter3' : 'quarter4'
    const homeVal = typeof home?.[key] === 'number' ? home[key] : null
    const awayVal = typeof away?.[key] === 'number' ? away[key] : null
    if (homeVal == null || awayVal == null) return null
    const homeCode = (props.game?.homeTeamCode || '').trim().toUpperCase() || 'HOME'
    const awayCode = (props.game?.awayTeamCode || '').trim().toUpperCase() || 'AWAY'
    return `${homeCode} ${homeVal} - ${awayVal} ${awayCode}`
  }

  const sections = [
    {
      key: 'Q1',
      label: '1η περ.',
      items: Array.isArray(pbp.firstQuarter) ? pbp.firstQuarter : [],
      endScore: pairEndScore(0, 1, 1),
      order: 1,
    },
    {
      key: 'Q2',
      label: '2η περ.',
      items: Array.isArray(pbp.secondQuarter) ? pbp.secondQuarter : [],
      endScore: pairEndScore(0, 1, 2),
      order: 2,
    },
    {
      key: 'Q3',
      label: '3η περ.',
      items: Array.isArray(pbp.thirdQuarter) ? pbp.thirdQuarter : [],
      endScore: pairEndScore(0, 1, 3),
      order: 3,
    },
    {
      key: 'Q4',
      label: '4η περ.',
      items: Array.isArray(pbp.fourthQuarter) ? pbp.fourthQuarter : [],
      endScore: pairEndScore(0, 1, 4),
      order: 4,
    },
    {
      key: 'OT',
      label: 'Παράταση',
      items: Array.isArray(pbp.extraTime) ? pbp.extraTime : [],
      endScore: null,
      order: 5,
    },
  ]

  const actualQuarter = Number(pbp.actualQuarter ?? 0)
  const maxOrder = actualQuarter > 4 ? 5 : actualQuarter

  return sections
    .filter(s => s.order > 0 && s.order <= maxOrder)
    .sort((a, b) => b.order - a.order)
    .map((s) => ({
      ...s,
      items: s.items.map((item: any, idx: number) => normalizeEvent(item, s.key, idx)),
    }))
})

watch(liveEventSections, (sections) => {
  if (openLivePanel.value == null && sections.length) {
    openLivePanel.value = 0
  }
}, { immediate: true })

const liveEventsToShowBySection = (section: any) => {
  const items = section.items || []
  const reversed = [...items].reverse()
  return reversed.slice(0, liveEventsLimit.value)
}

const eventOutcomeClass = (event: any) => {
  if (event?.outcome === 'positive') return 'event-title--positive'
  if (event?.outcome === 'negative') return 'event-title--negative'
  return ''
}
</script>

<style scoped>
.live-panels :deep(.v-expansion-panel-title) {
  background: #f9fafb;
  border: 1px solid #e0e6f0;
  border-radius: 10px;
  margin-bottom: 0.5rem;
}

.live-panels :deep(.v-expansion-panel--active > .v-expansion-panel-title) {
  background: #f9fafb;
}

.live-panels :deep(.v-expansion-panel-text__wrapper) {
  background: #ffffff;
  color: #1a1a1a;
}

.live-panels :deep(.v-expansion-panel-text) {
  background: #ffffff;
  color: #1a1a1a;
}

.live-panels :deep(.v-expansion-panel__shadow) {
  display: none;
}

.live-panels :deep(.v-expansion-panel) {
  background: #ffffff;
}

.live-panels :deep(.v-expansion-panels) {
  background: #ffffff;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-weight: 700;
  color: #1a2742;
}

.panel-score {
  font-size: 0.85rem;
  font-weight: 700;
}

.event-row {
  display: block;
  width: 100%;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eef1f5;
}

.event-side {
  display: none;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
}

.event-side--active {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 0.75rem;
  width: 100%;
}

.event-side--away.event-side--active {
  grid-template-columns: 1fr 64px;
  text-align: right;
}

.event-side--center.event-side--active {
  /* grid-template-columns: 64px 1fr; */
  display:flex;
  justify-content: center;
  text-align: center;
}

.event-side--center .event-meta {
  text-align: center;
}

.event-side--center .event-body {
  text-align: center;
}

.event-side--away .event-meta {
  order: 2;
}

.event-side--away .event-body {
  order: 1;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.75rem;
  color: #8a92a2;
  font-weight: 600;
}

.event-quarter {
  color: #1a2742;
}

.event-body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.event-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a2742;
}

.event-title--positive {
  color: #2f9e44;
}

.event-title--negative {
  color: #e55353;
}

.event-subtitle {
  font-size: 0.75rem;
  color: #8a92a2;
}

@media (max-width: 768px) {
  .event-row {
    grid-template-columns: 1fr;
  }

  .event-side--active {
    grid-template-columns: 64px 1fr;
    text-align: left;
  }
}

.event-actions {
  margin-top: 0.75rem;
  display: flex;
  justify-content: center;
}


.away_team_indicator{
  padding-right: 10px;
  border-right:1px solid #8a92a2;
}

.home_team_indicator{
  padding-left: 10px;
  border-left:1px solid #8a92a2;
}
</style>














