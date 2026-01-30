import type { Round } from '~/types'

export const useRounds = () => {
  const api = useApi()

  // State
  const rounds = ref<Round[]>([])
  const currentRound = ref<Round | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all rounds for a season
  const fetchSeasonRounds = async (seasonCode: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<any>(`/rounds/season/${seasonCode}`)
      // Check if response has a data property (wrapped response)
      rounds.value = response.data || response
      return rounds.value
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch rounds'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Fetch round details
  const fetchRoundDetails = async (seasonCode: string, roundNumber: number) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<Round>(`/rounds/season/${seasonCode}/${roundNumber}`)
      currentRound.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch round details'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Fetch rounds by phase
  const fetchRoundsByPhase = async (seasonCode: string, phaseCode: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<Round[]>(`/rounds/season/${seasonCode}/phase/${phaseCode}`)
      rounds.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch phase rounds'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Get round options for dropdowns
  const roundOptions = computed(() => {
    return rounds.value.map((r) => ({
      title: `Round ${r.roundNumber}`,
      value: r.roundNumber,
    }))
  })

  // Get latest round
  const latestRound = computed(() => {
    if (rounds.value.length === 0) return null
    return rounds.value.reduce((latest, current) => 
      current.roundNumber > latest.roundNumber ? current : latest
    )
  })

  // Get round by number
  const getRoundByNumber = (roundNumber: number) => {
    return rounds.value.find((r) => r.roundNumber === roundNumber)
  }

  // Reset state
  const resetState = () => {
    currentRound.value = null
    error.value = null
  }

  return {
    // State
    rounds,
    currentRound,
    isLoading,
    error,
    roundOptions,
    latestRound,

    // Actions
    fetchSeasonRounds,
    fetchRoundDetails,
    fetchRoundsByPhase,
    getRoundByNumber,
    resetState,
  }
}
