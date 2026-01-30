<template>
  <div>
    <ErrorAlert
      v-if="error"
      :error="error"
      @retry="loadGamesData"
      @dismiss="error = null"
    />

    <LoadingState :loading="isLoading" message="Loading games...">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>
            <v-icon icon="mdi-basketball" class="mr-2" />
            <span>{{ title || 'All Games' }}</span>
          </span>
          <v-btn
            v-if="showViewAllButton"
            variant="text"
            size="small"
            to="/games"
          >
            View All Games
          </v-btn>
        </v-card-title>
        <v-card-text v-if="sortedGames.length === 0">
          <EmptyState
            title="No Games"
            message="No games found for this season"
            icon="mdi-basketball-hoop"
          />
        </v-card-text>
        <v-carousel
          v-else
          v-model="carouselIndex"
          height="auto"
          hide-delimiters
          show-arrows="hover"
        >
          <v-carousel-item
            v-for="(chunk, index) in gameChunks"
            :key="index"
          >
            <div class="pa-4">
              <v-row>
                <v-col
                  v-for="game in chunk"
                  :key="game.gameCode"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <GameCard
                    :game="game"
                    show-details
                    show-action
                    @view-details="navigateTo(`/games/${selectedSeasonCode}/${game.gameCode}`)"
                  />
                </v-col>
              </v-row>
            </div>
          </v-carousel-item>
        </v-carousel>
      </v-card>
    </LoadingState>
  </div>
</template>

<script setup lang="ts">
const seasonStore = useSeasonStore()
const { fetchSeasonGames, games } = useGames()
const { fetchSeasonRounds, rounds } = useRounds()

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
const carouselIndex = ref(0)

const selectedSeasonCode = computed(() => seasonStore.selectedSeasonCode)

// Sort all games by date
const sortedGames = computed(() => {
  return [...games.value].sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime())
})

// Group games into chunks of 3
const gameChunks = computed(() => {
  const chunks = []
  const gamesArray = sortedGames.value
  for (let i = 0; i < gamesArray.length; i += 3) {
    chunks.push(gamesArray.slice(i, i + 3))
  }
  return chunks
})

// Find the next scheduled game index (which chunk it's in)
const nextGameIndex = computed(() => {
  const nextGameGlobalIndex = sortedGames.value.findIndex(game => !game.played)
  if (nextGameGlobalIndex >= 0) {
    return Math.floor(nextGameGlobalIndex / 3)
  }
  return 0
})

// Set carousel to chunk with next game when games load
watch(gameChunks, (newChunks) => {
  if (newChunks.length > 0) {
    carouselIndex.value = nextGameIndex.value
  }
}, { immediate: true })

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
</script>
