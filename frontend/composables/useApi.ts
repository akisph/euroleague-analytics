import type { ApiError } from '~/types'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: Record<string, unknown>
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBaseUrl

  const buildUrl = (endpoint: string, params?: Record<string, string | number | boolean | undefined>): string => {
    const url = new URL(`${baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return url.toString()
  }

  const request = async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const { method = 'GET', body, params, headers = {} } = options

    const url = buildUrl(endpoint, params)

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body)
    }

    const response = await $fetch<T>(url, {
      ...fetchOptions,
      onResponseError({ response }) {
        const error: ApiError = {
          message: response._data?.message || 'An error occurred',
          statusCode: response.status,
          error: response._data?.error,
        }
        throw error
      },
    })

    return response
  }

  const get = <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> => {
    return request<T>(endpoint, { method: 'GET', params })
  }

  const post = <T>(endpoint: string, body?: Record<string, unknown>): Promise<T> => {
    return request<T>(endpoint, { method: 'POST', body })
  }

  const put = <T>(endpoint: string, body?: Record<string, unknown>): Promise<T> => {
    return request<T>(endpoint, { method: 'PUT', body })
  }

  const del = <T>(endpoint: string): Promise<T> => {
    return request<T>(endpoint, { method: 'DELETE' })
  }

  return {
    baseUrl,
    request,
    get,
    post,
    put,
    del,
  }
}
