import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'
import type { Content, LibraryItem, Paginated, ReadingProgress, Recommendation } from '@/types'

export function useLibrary(page = 1, limit = 12, enabled = true) {
  return useQuery({
    queryKey: ['library', page, limit],
    queryFn: () =>
      apiFetch<Paginated<LibraryItem>>(`/collections/me?page=${page}&limit=${limit}`),
    enabled,
  })
}

export function useRecommendations(limit = 8, enabled = true) {
  return useQuery({
    queryKey: ['recommendations', limit],
    queryFn: () => apiFetch<Recommendation[]>(`/collections/me/recommendations?limit=${limit}`),
    enabled,
  })
}

export function useAddToLibrary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contentId: string) =>
      apiFetch<{ message: string }>(`/collections/${contentId}`, { method: 'POST' }),
    onSuccess: async (_data, contentId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content', contentId] }),
        queryClient.invalidateQueries({ queryKey: ['contents'] }),
        queryClient.invalidateQueries({ queryKey: ['library'] }),
        queryClient.invalidateQueries({ queryKey: ['recommendations'] }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
      ])
    },
  })
}

export function useRemoveFromLibrary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contentId: string) =>
      apiFetch<{ message: string }>(`/collections/${contentId}`, { method: 'DELETE' }),
    onSuccess: async (_data, contentId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content', contentId] }),
        queryClient.invalidateQueries({ queryKey: ['contents'] }),
        queryClient.invalidateQueries({ queryKey: ['library'] }),
        queryClient.invalidateQueries({ queryKey: ['recommendations'] }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
      ])
    },
  })
}

export function useProgressList(enabled = true, limit = 20) {
  return useQuery({
    queryKey: ['progress', 'list', limit],
    queryFn: () => apiFetch<ReadingProgress[]>(`/users/me/progress?limit=${limit}`),
    enabled,
  })
}

export function useContentProgress(contentId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['progress', contentId],
    queryFn: () => apiFetch<ReadingProgress | null>(`/users/me/progress/${contentId}`),
    enabled: Boolean(contentId) && enabled,
  })
}

export interface ProgressPayload {
  contentId: string
  currentPage: number
  totalPages: number
  percentage?: number
}

export function useSaveProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contentId, currentPage, totalPages, percentage }: ProgressPayload) =>
      apiFetch<ReadingProgress>(`/users/me/progress/${contentId}`, {
        method: 'PUT',
        body: {
          current_page: currentPage,
          total_pages: totalPages,
          ...(percentage !== undefined ? { percentage } : {}),
        },
      }),
    onSuccess: async (data) => {
      queryClient.setQueryData(['progress', data.content_id], data)
      await queryClient.invalidateQueries({ queryKey: ['progress', 'list'] })
    },
  })
}

export function useToggleSave(content: Content | undefined) {
  const add = useAddToLibrary()
  const remove = useRemoveFromLibrary()
  const isPending = add.isPending || remove.isPending

  function toggle() {
    if (!content) return
    if (content.is_saved) {
      remove.mutate(content.id)
    } else {
      add.mutate(content.id)
    }
  }

  return { toggle, isPending, isSaved: content?.is_saved ?? false }
}
