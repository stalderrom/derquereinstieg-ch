// Typen für die Supabase-Datenbank

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

// Legacy – wird durch UserRole unten ersetzt
export type LegacyUserRole = 'jobseeker' | 'employer' | 'admin'

// ─── Auth & User ──────────────────────────────────────────────────────────────

export type UserRole = 'superuser' | 'user'

export type UserTier = 1 | 2 | 3

export interface ApplicationProfile {
  currentJob: string          // "Projektmanager bei Migros, 8 Jahre"
  currentJobDesc: string      // Was genau gemacht? 2-3 Sätze
  prevJob?: string            // optional: vorherige Rolle, 1 Satz
  education: string           // "KV-Abschluss, CAS Projektmanagement"
  skills: string              // "Kundenberatung, Teamführung, Excel, ..."
  motivation: string          // Warum Quereinstieg? 2-3 Sätze
  tone: 'formal' | 'du'       // Sie-Form vs Du-Form
}

export interface Profile {
  id: string
  role: UserRole
  tier: UserTier
  full_name: string | null
  target_field: string | null  // 'it'|'pflege'|'handwerk'|'verkauf'|'logistik'|'gastronomie'|'paedagogik'|'soziales'
  region: string | null       // legacy single region
  regions: string[] | null    // multi-region selection
  birthdate: string | null    // YYYY-06-15 (nur Jahr gespeichert)
  application_profile?: ApplicationProfile | null
  created_at: string
}

export interface JobBookmark {
  id: string
  user_id: string
  stellenanzeige_id: string
  created_at: string
}

export interface Bewerbung {
  id: string
  user_id: string
  firma: string
  stelle: string
  status: 'gespeichert' | 'beworben' | 'interview' | 'zusage' | 'absage'
  notiz: string | null
  datum: string | null
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
