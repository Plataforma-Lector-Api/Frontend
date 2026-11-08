import type { ApiErrorShape, TokenResponse, User } from '@/types'

const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000/api/v1'
).replace(/\/$/, '')

const ACCESS_KEY = 'lector.access_token'
const REFRESH_KEY = 'lector.refresh_token'
const USER_KEY = 'lector.user'

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const tokenStore = {
  getAccess(): string | null {
    return localStorage.getItem(ACCESS_KEY)
  },
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_KEY)
  },
  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  },
  setSession(tokens: TokenResponse): void {
    localStorage.setItem(ACCESS_KEY, tokens.access_token)
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
    localStorage.setItem(USER_KEY, JSON.stringify(tokens.user))
  },
  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear(): void {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

let refreshPromise: Promise<boolean> | null = null

function clearSession(): void {
  tokenStore.clear()
  window.dispatchEvent(new Event('lector:unauthorized'))
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = tokenStore.getRefresh()
    if (!refreshToken) return false
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
      if (!response.ok) {
        clearSession()
        return false
      }
      const data = (await response.json()) as TokenResponse
      tokenStore.setSession(data)
      return true
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
  skipAuthRefresh?: boolean
}

async function parseError(response: Response): Promise<ApiError> {
  let payload: ApiErrorShape | null = null
  try {
    payload = (await response.json()) as ApiErrorShape
  } catch {
    // Respuesta sin cuerpo JSON.
  }
  const message =
    payload?.error?.message ??
    (response.status === 429
      ? 'Demasiadas solicitudes. Intenta de nuevo en un momento.'
      : 'Ocurrió un error inesperado. Intenta de nuevo.')
  return new ApiError(message, response.status, payload?.error?.code, payload?.error?.details)
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, skipAuthRefresh = false, headers, ...rest } = options

  const execute = async (): Promise<Response> => {
    const finalHeaders = new Headers(headers)
    if (body !== undefined && !(body instanceof FormData)) {
      finalHeaders.set('Content-Type', 'application/json')
    }
    if (auth) {
      const token = tokenStore.getAccess()
      if (token) finalHeaders.set('Authorization', `Bearer ${token}`)
    }
    return fetch(`${API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    })
  }

  let response = await execute()

  if (response.status === 401 && auth && !skipAuthRefresh && tokenStore.getRefresh()) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      response = await execute()
    }
  }

  if (!response.ok) {
    const error = await parseError(response)
    if (response.status === 401 && auth) clearSession()
    throw error
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export async function apiFetchBlob(path: string): Promise<Blob> {
  const execute = async (): Promise<Response> => {
    const headers = new Headers()
    const token = tokenStore.getAccess()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return fetch(`${API_URL}${path}`, { headers })
  }

  let response = await execute()
  if (response.status === 401 && tokenStore.getRefresh()) {
    const refreshed = await refreshAccessToken()
    if (refreshed) response = await execute()
  }
  if (!response.ok) {
    throw await parseError(response)
  }
  return response.blob()
}

export { API_URL }
