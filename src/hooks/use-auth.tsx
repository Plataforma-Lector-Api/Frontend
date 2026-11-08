import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { apiFetch, tokenStore } from '@/lib/api'
import type { TokenResponse, User } from '@/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(() => tokenStore.getUser())
  const [loading, setLoading] = useState(() => Boolean(tokenStore.getAccess()))

  useEffect(() => {
    let active = true

    async function hydrate() {
      if (!tokenStore.getAccess()) {
        setLoading(false)
        return
      }
      try {
        const me = await apiFetch<User>('/auth/me')
        if (!active) return
        tokenStore.setUser(me)
        setUser(me)
      } catch {
        if (!active) return
        tokenStore.clear()
        setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    hydrate()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
      queryClient.clear()
    }
    window.addEventListener('lector:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('lector:unauthorized', handleUnauthorized)
  }, [queryClient])

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await apiFetch<TokenResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
        skipAuthRefresh: true,
      })
      tokenStore.setSession(tokens)
      setUser(tokens.user)
      await queryClient.invalidateQueries()
      return tokens.user
    },
    [queryClient],
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await apiFetch<User>('/auth/register', {
        method: 'POST',
        body: { name, email, password },
        auth: false,
        skipAuthRefresh: true,
      })
      await login(email, password)
    },
    [login],
  )

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.getRefresh()
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: { refresh_token: refreshToken },
        auth: false,
        skipAuthRefresh: true,
      })
    } catch {
      // El token local se limpia aunque el servidor no responda.
    }
    tokenStore.clear()
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  const updateUser = useCallback((nextUser: User) => {
    tokenStore.setUser(nextUser)
    setUser(nextUser)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateUser,
    }),
    [user, loading, login, register, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
