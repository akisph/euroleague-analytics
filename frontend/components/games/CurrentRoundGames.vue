<template>
  <div>
    <SharedErrorAlert
      v-if="error"
      :error="error"
      @retry="loadGamesData"
      @dismiss="error = null"
    />

    <SharedLoadingState :loading="isLoading" message="Loading games...">
      <div class="games-container">
        <div class="section-header">
          <div class="header-left">
            <h2 class="section-title">
              <v-icon icon="mdi-basketball" size="28" class="mr-2" />
              {{ title || 'All Games' }}
            </h2>
          </div>
          <v-btn
            v-if="showViewAllButton"
            to="/games"
            color="primary"
            variant="flat"
            size="small"
          >
            View All
          </v-btn>
        </div>
        
        <div class="games-grid-container">
          <SharedEmptyState
            v-if="sortedGames.length === 0"
            title="No Games"
            message="No games found for this season"
            icon="mdi-basketball-hoop"
          />

          <!-- Single-row horizontal carousel: full-length, scrollable -->
            <div v-else class="carousel-viewport">
              <v-btn
                icon
                class="carousel-arrow left"
                v-if="isOverflowing"
                @click="scrollLeft"
              >
                <v-icon icon="mdi-chevron-left" size="28" />
              </v-btn>

              <div ref="carouselRow" class="carousel-row">
                <div
                  v-for="game in sortedGames"
                  :key="game.gameCode"
                  class="carousel-item"
                  :data-game-code="game.gameCode"
                >
                  <GamesCard
                    :game="game"
                    :is-live="isGameLive(game.gameCode)"
                    :live-home-score="getLiveScore(game.gameCode)?.homeScore ?? null"
                    :live-away-score="getLiveScore(game.gameCode)?.awayScore ?? null"
                    :live-minute="getLiveScore(game.gameCode)?.minuteLabel ?? null"
                    show-details
                    show-action
                    @view-details="navigateTo(`/games/${selectedSeasonCode}/${game.gameCode}`)"
                  />
                </div>
              </div>

              <v-btn
                icon
                class="carousel-arrow right"
                v-if="isOverflowing"
                @click="scrollRight"
              >
                <v-icon icon="mdi-chevron-right" size="28" />
              </v-btn>
            </div>
        </div>
      </div>
    </SharedLoadingState>
  </div>
</template>

<script setup lang="ts">
const seasonStore = useSeasonStore()
const { fetchSeasonGames, games } = useGames()
const { fetchSeasonRounds, rounds } = useRounds()
const api = useApi()
const { toAthensTimestamp } = useTimeZone()

interface Props {
  title?: string
  showViewAllButton?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  showViewAllButton: true,
})

const isLoading = ref(true)
const error = ref<string | null>(null)

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)
const liveMap = ref<Record<number, { isLive: boolean; homeScore: number | null; awayScore: number | null; minuteLabel?: string | null }>>({})
const livePollId = ref<number | null>(null)

const parseGameTime = (value?: string) => {
  if (!value) return Number.NaN
  const iso = Date.parse(value)
  if (Number.isFinite(iso)) return iso
  const dateTime = value.trim().replace('T', ' ')
  const match = dateTime.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/)
  if (!match) return Number.NaN
  const day = Number(match[1])
  const month = Number(match[2]) - 1
  const year = Number(match[3])
  const hour = Number(match[4] ?? 0)
  const minute = Number(match[5] ?? 0)
  return new Date(year, month, day, hour, minute).getTime()
}

// Sort all games by date
const sortedGames = computed(() => {
  return [...games.value].sort((a, b) => {
    const aTime = parseGameTime(a.gameDate)
    const bTime = parseGameTime(b.gameDate)
    if (!Number.isFinite(aTime) && !Number.isFinite(bTime)) return 0
    if (!Number.isFinite(aTime)) return 1
    if (!Number.isFinite(bTime)) return -1
    return aTime - bTime
  })
})

const pickLatestQuarterValue = (row: any) => {
  if (!row) return null
  const candidates = [row.quarter4, row.quarter3, row.quarter2, row.quarter1]
  for (const value of candidates) {
    if (typeof value === 'number' && value > 0) return value
  }
  return null
}

const pickLastMarkerTime = (plays: any[] | undefined) => {
  if (!Array.isArray(plays) || !plays.length) return null
  for (let i = plays.length - 1; i >= 0; i -= 1) {
    const marker = plays[i]?.markerTime
    if (marker) return marker
  }
  return null
}

const resolveMinuteLabel = (pbp: any) => {
  const q = pbp?.actualQuarter
  if (!q || q < 1) return null
  if (q === 1) return pickLastMarkerTime(pbp?.firstQuarter)
  if (q === 2) return pickLastMarkerTime(pbp?.secondQuarter)
  if (q === 3) return pickLastMarkerTime(pbp?.thirdQuarter)
  if (q === 4) return pickLastMarkerTime(pbp?.fourthQuarter)
  return pickLastMarkerTime(pbp?.extraTime)
}

const getLiveScore = (gameCode: number) => liveMap.value[gameCode]
const isGameLive = (gameCode: number) => Boolean(liveMap.value[gameCode]?.isLive)

const fetchLiveForGame = async (seasonCode: string, gameCode: number) => {
  const [boxscore, pbp] = await Promise.all([
    api.get(`/live-games/season/${seasonCode}/${gameCode}/boxscore`),
    api.get(`/live-games/season/${seasonCode}/${gameCode}/playbyplay`),
  ])
  const data = boxscore || {}
  const rows = data.endOfQuarter || data.byQuarter || []
  const homeRow = rows?.[0]
  const awayRow = rows?.[1]
  return {
    isLive: Boolean(data.isLive),
    homeScore: pickLatestQuarterValue(homeRow),
    awayScore: pickLatestQuarterValue(awayRow),
    minuteLabel: resolveMinuteLabel(pbp) ?? null,
  }
}

const loadLiveForGames = async () => {
  const seasonCode = selectedSeasonCode.value
  if (!seasonCode) return
  const scheduled = sortedGames.value.filter(g => !g.played)
  if (!scheduled.length) return
  const updates: Record<number, { isLive: boolean; homeScore: number | null; awayScore: number | null; minuteLabel?: string | null }> = {}
  await Promise.all(
    scheduled.map(async (game) => {
      try {
        const liveData = await fetchLiveForGame(seasonCode, game.gameCode)
        updates[game.gameCode] = liveData
      } catch {
        updates[game.gameCode] = { isLive: false, homeScore: null, awayScore: null, minuteLabel: null }
      }
    }),
  )
  liveMap.value = { ...liveMap.value, ...updates }
}

// No chunking/carousel: render all games in a responsive grid

const loadGamesData = async () => {
  if (!selectedSeasonCode.value) {
    isLoading.value = false
    return
  }
  
  isLoading.value = true
  error.value = null
  
  try {
    await Promise.all([
      fetchSeasonGames(selectedSeasonCode.value).catch(err => {
        console.error('Error loading games:', err)
        throw err
      }),
      fetchSeasonRounds(selectedSeasonCode.value).catch(err => {
        console.error('Error loading rounds:', err)
        throw err
      }),
    ])
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load games data'
    console.error('Games load error:', err)
  } finally {
    isLoading.value = false
  }
}

watch(selectedSeasonCode, () => {
  loadGamesData()
}, { immediate: true })

onMounted(() => {
  if (selectedSeasonCode.value) {
    loadGamesData()
  }
})

// Carousel scrolling & overflow detection
const carouselRow = ref<HTMLElement | null>(null)
const isOverflowing = ref(false)

const updateOverflow = () => {
  if (!carouselRow.value) {
    isOverflowing.value = false
    return
  }
  // determine overflow and set side padding so selected card can center
  const container = carouselRow.value
  const items = Array.from(container.querySelectorAll('.carousel-item')) as HTMLElement[]
  // determine how many columns to show: prefer 3 on wide screens
  const width = container.clientWidth
  const columns = width >= 1100 ? 3 : (width >= 800 ? 2 : 1)
  const gapPx = parseFloat(getComputedStyle(container).gap) || 16
  const totalGap = gapPx * Math.max(0, columns - 1)
  const itemWidth = Math.floor((container.clientWidth - totalGap) / columns)
  // apply exact width to each item so exactly `columns` are visible
  items.forEach(it => {
    it.style.flex = `0 0 ${itemWidth}px`
    it.style.maxWidth = `${itemWidth}px`
  })
  // no extra side padding needed when items fill the container
  container.style.paddingLeft = `0px`
  container.style.paddingRight = `0px`
  isOverflowing.value = container.scrollWidth > container.clientWidth + 1
}

const scrollByAmount = () => {
  if (!carouselRow.value) return 360
  return Math.floor(carouselRow.value.clientWidth * 0.8)
}

const scrollLeft = () => {
  if (!carouselRow.value) return
  carouselRow.value.scrollBy({ left: -scrollByAmount(), behavior: 'smooth' })
}

const scrollRight = () => {
  if (!carouselRow.value) return
  carouselRow.value.scrollBy({ left: scrollByAmount(), behavior: 'smooth' })
}

watch(sortedGames, async () => {
  await nextTick()
  updateOverflow()
}, { immediate: true })

watch([sortedGames, selectedSeasonCode], () => {
  if (livePollId.value) {
    clearInterval(livePollId.value)
    livePollId.value = null
  }
  loadLiveForGames()
  livePollId.value = window.setInterval(() => {
    loadLiveForGames()
  }, 20000)
}, { immediate: true })

onBeforeUnmount(() => {
  if (livePollId.value) {
    clearInterval(livePollId.value)
    livePollId.value = null
  }
})

onMounted(() => {
  updateOverflow()
  const onResize = () => updateOverflow()
  window.addEventListener('resize', onResize)
  const onScroll = () => markCentered()
  if (carouselRow.value) carouselRow.value.addEventListener('scroll', onScroll)
  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
    if (carouselRow.value) carouselRow.value.removeEventListener('scroll', onScroll)
  })
})

// Center live game first; fallback to closest-by-time (Europe/Athens)
const findNextGameIndex = () => {
  const candidates = sortedGames.value.map((g, idx) => ({
    idx,
    g,
    time: parseGameTime(g.gameDate),
  }))

  const live = candidates.find(({ g }) => isGameLive(g.gameCode))
  if (live) return live.idx

  const nowAthens = toAthensTimestamp(Date.now())
  let closestIdx = -1
  let closestDiff = Number.POSITIVE_INFINITY
  candidates.forEach(({ idx, time }) => {
    if (!Number.isFinite(time)) return
    const gameAthens = toAthensTimestamp(time)
    if (!Number.isFinite(gameAthens)) return
    const diff = Math.abs(gameAthens - nowAthens)
    if (diff < closestDiff) {
      closestDiff = diff
      closestIdx = idx
    }
  })
  if (closestIdx >= 0) return closestIdx

  return sortedGames.value.length ? 0 : -1
}

const scrollToGameIndex = (index: number) => {
  if (!carouselRow.value || index < 0) return
  const container = carouselRow.value
  const items = Array.from(container.querySelectorAll('.carousel-item')) as HTMLElement[]
  const el = items[index]
  if (!el) return
  const containerCenter = container.clientWidth / 2
  const elCenter = el.offsetLeft + el.clientWidth / 2
  const targetScroll = Math.max(0, elCenter - containerCenter)
  container.scrollTo({ left: targetScroll, behavior: 'smooth' })
  // mark centered element after scrolling settles
  markCentered()
}

let scrollRaf = 0
const markCentered = () => {
  if (!carouselRow.value) return
  cancelAnimationFrame(scrollRaf)
  scrollRaf = requestAnimationFrame(() => {
    const container = carouselRow.value as HTMLElement
    const items = Array.from(container.querySelectorAll('.carousel-item')) as HTMLElement[]
    const centerPos = container.scrollLeft + container.clientWidth / 2
    let closestIndex = -1
    let closestDistance = Infinity
    items.forEach((it, idx) => {
      const itCenter = it.offsetLeft + it.clientWidth / 2
      const dist = Math.abs(itCenter - centerPos)
      if (dist < closestDistance) {
        closestDistance = dist
        closestIndex = idx
      }
    })
    items.forEach((it, idx) => {
      if (idx === closestIndex) it.classList.add('is-centered')
      else it.classList.remove('is-centered')
    })
  })
}

watch(sortedGames, async () => {
  await nextTick()
  updateOverflow()
  const idx = findNextGameIndex()
  if (idx >= 0) scrollToGameIndex(idx)
}, { immediate: true })
</script>

<style scoped>
.games-container {
  background-color: #ffffff;
  border: 1px solid #e0e6f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e6f0;
  background-color: #f9fafb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a2742;
  letter-spacing: -0.3px;
}

.games-grid-container {
  padding: 1.5rem;
}

.carousel-item {
  padding: 0 !important;
}

.carousel-viewport {
  padding: 1rem 1.5rem;
}

.carousel-row {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.carousel-row::-webkit-scrollbar { display: none; }

.carousel-item {
  flex: 0 0 360px; /* card width */
  scroll-snap-align: start;
}

/* Make items slightly narrower on small screens */
@media (max-width: 768px) {
  .carousel-item {
    flex: 0 0 86%;
  }
}

.games-carousel {
  margin: 0;
}

@media (max-width: 1024px) {
  .carousel-item {
    flex: 0 0 320px;
  }
}

/* Arrow buttons */
.carousel-viewport {
  position: relative;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 12;
  background: rgba(26,39,66,0.06); /* discreet soft dark */
  border: none;
  box-shadow: 0 6px 18px rgba(15,23,42,0.06);
  border-radius: 999px;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.carousel-arrow.left { left: 8px; }
.carousel-arrow.right { right: 8px; }

.carousel-arrow v-icon { color: #F05323; } /* orange icon for discreet accent */
.carousel-arrow:hover { background: rgba(26,39,66,0.10); }

/* Subtle highlight for centered item */
.carousel-item.is-centered {
  transform: translateY(-4px) scale(1.02);
  transition: transform 220ms ease, box-shadow 220ms ease;
  box-shadow: 0 10px 30px rgba(15,23,42,0.06);
}

/* Make the centered item's action button use primary color and stand out subtly */
.carousel-item.is-centered ::v-deep .v-btn {
  background-color: var(--v-primary-base, #F05323) !important;
  color: #fff !important;
}

/* reduce opacity for non-centered items slightly */
.carousel-item:not(.is-centered) {
  opacity: 0.95;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }

  .games-grid-container {
    padding: 1rem;
  }

  .carousel-viewport {
    padding: 0.5rem 1rem;
  }

  .carousel-row {
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .section-header {
    padding: 0.75rem;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .games-grid-container {
    padding: 0.75rem;
  }

  .carousel-viewport {
    padding: 0.25rem 0.75rem;
  }

  .carousel-row {
    gap: 0.5rem;
  }

  .carousel-arrow {
    width: 36px;
    height: 36px;
  }

  .carousel-arrow v-icon {
    font-size: 20px;
  }
}
</style>
