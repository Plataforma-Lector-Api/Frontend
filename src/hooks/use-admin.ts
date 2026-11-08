import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'
import type {
  Content,
  ContentInput,
  Dashboard,
  FileMetadata,
  Paginated,
  User,
} from '@/types'

export function useDashboard(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => apiFetch<Dashboard>('/admin/dashboard'),
    enabled,
  })
}

export function useAdminUsers(page = 1, limit = 20, search = '', enabled = true) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search.trim()) params.set('search', search.trim())
  return useQuery({
    queryKey: ['admin', 'users', page, limit, search],
    queryFn: () => apiFetch<Paginated<User>>(`/admin/users?${params.toString()}`),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      role,
      status,
    }: {
      userId: string
      role?: 'reader' | 'admin'
      status?: 'active' | 'disabled'
    }) =>
      apiFetch<User>(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: { role, status },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useAdminContents(page = 1, limit = 20, status = 'all', enabled = true) {
  return useQuery({
    queryKey: ['admin', 'contents', page, limit, status],
    queryFn: () =>
      apiFetch<Paginated<Content>>(
        `/admin/contents?page=${page}&limit=${limit}&status=${status}`,
      ),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useCreateContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ContentInput) =>
      apiFetch<Content>('/contents', { method: 'POST', body: input }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'contents'] }),
        queryClient.invalidateQueries({ queryKey: ['contents'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
      ])
    },
  })
}

export function useUpdateContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contentId, input }: { contentId: string; input: Partial<ContentInput> }) =>
      apiFetch<Content>(`/contents/${contentId}`, { method: 'PATCH', body: input }),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content', variables.contentId] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'contents'] }),
        queryClient.invalidateQueries({ queryKey: ['contents'] }),
      ])
    },
  })
}

export function useDeleteContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contentId: string) =>
      apiFetch<{ message: string }>(`/contents/${contentId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'contents'] }),
        queryClient.invalidateQueries({ queryKey: ['contents'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
      ])
    },
  })
}

export function useUploadPdf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contentId, file }: { contentId: string; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)
      return apiFetch<FileMetadata>(`/contents/${contentId}/file`, {
        method: 'POST',
        body: formData,
      })
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content', variables.contentId] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'contents'] }),
        queryClient.invalidateQueries({ queryKey: ['contents'] }),
      ])
    },
  })
}

export function useDeletePdf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contentId: string) =>
      apiFetch<{ message: string }>(`/contents/${contentId}/file`, { method: 'DELETE' }),
    onSuccess: async (_data, contentId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content', contentId] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'contents'] }),
      ])
    },
  })
}
