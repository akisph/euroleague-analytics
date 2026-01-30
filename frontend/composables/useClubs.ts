import type { Club, ClubsListResponse, ClubInfoResponse, ClubsQueryParams } from '~/types'

export const useClubs = () => {
  const api = useApi()

  // State
  const clubs = ref<ClubsListResponse | null>(null)
  const currentClub = ref<Club | null>(null)
  const clubInfo = ref<ClubInfoResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all clubs
  const fetchClubs = async (params?: ClubsQueryParams) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<ClubsListResponse>('/clubs', params as Record<string, string | number | boolean | undefined>)
      clubs.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch clubs'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Fetch club by code
  const fetchClubByCode = async (clubCode: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get<Club>(`/clubs/${clubCode}`)
      currentClub.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch club'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Fetch club info
  const fetchClubInfo = async (clubCode: string) => {
    try {
      const response = await api.get<ClubInfoResponse>(`/clubs/${clubCode}/info`)
      clubInfo.value = response
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch club info'
      throw e
    }
  }

  // Search clubs
  const searchClubs = async (searchTerm: string) => {
    return fetchClubs({ search: searchTerm })
  }

  // Reset state
  const resetState = () => {
    currentClub.value = null
    clubInfo.value = null
    error.value = null
  }

  return {
    // State
    clubs,
    currentClub,
    clubInfo,
    isLoading,
    error,

    // Actions
    fetchClubs,
    fetchClubByCode,
    fetchClubInfo,
    searchClubs,
    resetState,
  }
}
