import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'
import type { QueryInfo } from '@/types'

export function useQueryCatalog() {
  return useQuery({
    queryKey: ['queries'],
    queryFn: () => apiFetch<QueryInfo[]>('/queries', { auth: false }),
    staleTime: 5 * 60_000,
  })
}
