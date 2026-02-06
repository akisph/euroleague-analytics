// Re-export all types
export * from './club'
export * from './game'
export * from './team'
export * from './standing'
export * from './season'
export * from './round'
export * from './fantasy'

// API Response wrapper types
export interface ApiResponse<T> {
  data: T
  total?: number
}

// API Error type
export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

// Pagination params
export interface PaginationParams {
  limit?: number
  offset?: number
}

// Generic list response
export interface ListResponse<T> {
  data: T[]
  total: number
}

// Loading state
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

// Navigation item
export interface NavItem {
  title: string
  icon: string
  to: string
}

// Dashboard stats
export interface DashboardStats {
  totalClubs: number
  totalGames: number
  totalRounds: number
  currentRound?: number
}
