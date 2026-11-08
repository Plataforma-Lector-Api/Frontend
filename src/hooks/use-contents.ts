import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'
import type { AuthorStat, Content, Paginated, TagStat } from '@/types'

export interface ContentFilters {
  page?: number
  limit?: number
  tags?: string
  type?: string
  year_from?: string
  year_to?: string
  language?: string
  sort?: string
  q?: string
}

export function buildQuery(filters: object): string {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'all') {
      params.set(key, String(value))
    }
  })
  return params.toString()
}

export function useContents(filters: ContentFilters) {
  const query = buildQuery(filters)
  return useQuery({
    queryKey: ['contents', query],
    queryFn: () => apiFetch<Paginated<Content>>(`/contents?${query}`),
    placeholderData: keepPreviousData,
  })
}

export function useContentSearch(query: string, page = 1, limit = 12) {
  return useQuery({
    queryKey: ['contents', 'search', query, page, limit],
    queryFn: () =>
      apiFetch<Paginated<Content>>(
        `/contents/search?${buildQuery({ q: query, page, limit })}`,
      ),
    enabled: query.trim().length > 0,
    placeholderData: keepPreviousData,
  })
}

export function useContent(contentId: string | undefined) {
  return useQuery({
    queryKey: ['content', contentId],
    queryFn: () => apiFetch<Content>(`/contents/${contentId}`),
    enabled: Boolean(contentId),
  })
}

export function usePopular(limit = 8) {
  return useQuery({
    queryKey: ['contents', 'popular', limit],
    queryFn: () => apiFetch<Content[]>(`/contents/popular?limit=${limit}`),
  })
}

export function useTopRated(limit = 8, minReviews = 1) {
  return useQuery({
    queryKey: ['contents', 'top-rated', limit, minReviews],
    queryFn: () =>
      apiFetch<Content[]>(
        `/contents/top-rated?limit=${limit}&min_reviews=${minReviews}`,
      ),
  })
}

export function useTagStats(limit = 14) {
  return useQuery({
    queryKey: ['stats', 'tags', limit],
    queryFn: () => apiFetch<TagStat[]>(`/stats/tags?limit=${limit}`),
  })
}

export function useAuthors(limit = 12) {
  return useQuery({
    queryKey: ['contents', 'by-author', limit],
    queryFn: () => apiFetch<AuthorStat[]>(`/contents/by-author?limit=${limit}`),
  })
}
