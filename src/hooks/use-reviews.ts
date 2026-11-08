import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'
import type { Paginated, Review } from '@/types'

export function useReviews(contentId: string | undefined, page = 1, limit = 8) {
  return useQuery({
    queryKey: ['reviews', contentId, page, limit],
    queryFn: () =>
      apiFetch<Paginated<Review>>(
        `/contents/${contentId}/reviews?page=${page}&limit=${limit}`,
      ),
    enabled: Boolean(contentId),
    placeholderData: keepPreviousData,
  })
}

export interface ReviewPayload {
  contentId: string
  rating: number
  comment?: string
}

export function useUpsertReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contentId, rating, comment }: ReviewPayload) =>
      apiFetch<Review>(`/contents/${contentId}/reviews`, {
        method: 'POST',
        body: { rating, comment: comment?.trim() || null },
      }),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reviews', variables.contentId] }),
        queryClient.invalidateQueries({ queryKey: ['content', variables.contentId] }),
        queryClient.invalidateQueries({ queryKey: ['contents'] }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
      ])
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contentId: string) =>
      apiFetch<{ message: string }>(`/contents/${contentId}/reviews/me`, {
        method: 'DELETE',
      }),
    onSuccess: async (_data, contentId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reviews', contentId] }),
        queryClient.invalidateQueries({ queryKey: ['content', contentId] }),
        queryClient.invalidateQueries({ queryKey: ['contents'] }),
      ])
    },
  })
}
