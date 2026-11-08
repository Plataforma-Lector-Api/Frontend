export type Role = 'reader' | 'admin'
export type UserStatus = 'active' | 'disabled'
export type ContentType = 'book' | 'article' | 'thesis' | 'magazine' | 'other'
export type ContentStatus = 'draft' | 'published' | 'archived'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  avatar_url: string | null
  bio: string | null
  created_at: string | null
  last_login_at: string | null
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PageMeta
}

export interface Content {
  id: string
  title: string
  author: string
  type: ContentType
  description: string
  cover_url: string | null
  external_url: string | null
  tags: string[]
  language: string
  published_at: string | null
  status: ContentStatus
  popularity: number
  rating_avg: number
  rating_count: number
  has_file: boolean
  is_saved: boolean
  created_at: string | null
  updated_at: string | null
  score?: number
}

export interface Review {
  id: string
  user_id: string
  user_name: string | null
  content_id: string
  rating: number
  comment: string | null
  created_at: string | null
  updated_at: string | null
}

export interface LibraryItem {
  added_at: string
  content: Content
}

export interface Recommendation extends Content {
  match_score?: number
}

export interface ReadingProgress {
  content_id: string
  current_page: number
  total_pages: number
  percentage: number
  updated_at: string | null
  content: Content | null
}

export interface AuthorStat {
  author: string
  total: number
  avg_popularity: number
  titles: string[]
}

export interface TagStat {
  tag: string
  total: number
  avg_rating: number
  total_popularity: number
}

export interface MostSavedItem {
  content: Content
  saves: number
}

export interface Dashboard {
  totals: {
    users: number
    contents: number
    collections: number
    reviews: number
  }
  average_rating: number
  users_per_month: Array<{ month: string; count: number }>
  contents_per_type: Array<{ type: string; count: number }>
  top_tags: TagStat[]
  top_contents: MostSavedItem[]
  recent_reviews: Array<{
    rating: number
    comment: string | null
    created_at: string | null
    user_name: string | null
    content_title: string | null
  }>
}

export interface QueryInfo {
  number: number
  name: string
  description: string
  method: string
  endpoint: string
  operators: string[]
  index: string
}

export interface FileMetadata {
  id: string
  filename: string
  content_type: string
  size: number
  upload_date: string | null
}

export interface ContentInput {
  title: string
  author: string
  type: ContentType
  description: string
  cover_url?: string | null
  external_url?: string | null
  tags: string[]
  language: string
  published_at?: string | null
  status: ContentStatus
}

export interface ApiErrorShape {
  error?: {
    code?: string
    message?: string
    details?: unknown
    request_id?: string
  }
}
