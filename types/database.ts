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
