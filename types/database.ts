// Typen für die Supabase-Datenbank
// Wird nach dem Supabase-Setup automatisch generiert:
// npx supabase gen types typescript --project-id DEIN_PROJECT_ID > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type JobCategory =
  | 'pflege'
  | 'it'
  | 'paedagogik'
  | 'soziales'
  | 'handwerk'
  | 'verkauf'
  | 'logistik'
  | 'gastronomie'
  | 'andere'

export type EmploymentType =
  | 'vollzeit'
  | 'teilzeit'
  | 'temporaer'
  | 'praktikum'

export type UserRole = 'jobseeker' | 'employer' | 'admin'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  canton: string
  category: JobCategory
  description: string
  requirements: string | null
  salary_range: string | null
  employment_type: EmploymentType
  is_quereinsteiger_friendly: boolean
  slug: string
  published_at: string | null
  created_at: string
  employer_id: string
  is_active: boolean
}

export interface Profile {
  id: string
  role: UserRole
  company_name: string | null
  created_at: string
}

// ─── Job-Scraping Tabellen ────────────────────────────────────────────────────

export interface Stellenanzeige {
  id: string
  title: string
  company: string
  location: string | null
  canton: string | null
  region: string | null
  description: string | null
  source_url: string
  source_name: string
  source_id: string | null
  keywords: string[] | null
  is_active: boolean
  posted_at: string | null
  first_seen_at: string
  last_verified_at: string
  removed_at: string | null
  dedup_key: string | null
}

export interface JobSource {
  id: string
  name: string
  url: string
  type: 'career' | 'portal' | 'api'
  is_active: boolean
  last_scanned_at: string | null
  created_at: string
}

export interface ApiFetchLog {
  id: string
  api_name: string
  search_term: string | null
  fetched_at: string
  results_found: number
  new_jobs_added: number
  api_calls_used: number
  skipped: boolean
}

export interface VerificationLog {
  id: string
  date: string
  verified: number
  removed: number
  total_active_after: number
  recorded_at: string
}
