import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'
import type { PublicProfile } from '@/types'

export function usePublicProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['public-profile', userId],
    queryFn: () => apiFetch<PublicProfile>(`/users/${userId}`, { auth: false }),
    enabled: Boolean(userId),
  })
}
