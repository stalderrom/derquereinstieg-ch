import type { EntryField, SkillLearnInfo } from '@/lib/dashboard/entry-paths'
import { SKILLS, ENTRY_PATHS } from '@/lib/dashboard/entry-paths'

// Maps scraped category labels → EntryField (our 9 Einstiegspfade)
export const CATEGORY_TO_FIELD: Partial<Record<string, EntryField>> = {
  'Pflege & Gesundheit':         'pflege',
  'IT & Technik':                'it',
  'Ingenieurwesen & Produktion': 'handwerk',
  'Verkauf & Handel':            'verkauf',
  'Kundenservice':               'verkauf',
  'Marketing & Kommunikation':   'verkauf',  // communication/persuasion overlap
  'Transport & Logistik':        'logistik',
  'Reinigung & Facility':        'logistik',  // physical, reliability-focused
  'Sicherheit & Schutz':         'logistik',  // physical, reliability-focused
  'Gastronomie & Hotel':         'gastronomie',
  'Handwerk & Bau':              'handwerk',
  'Soziales & Bildung':          'soziales',
  'Büro & Administration':       'buero',
  'HR & Personal':               'buero',
}

export const QUEREINSTIEG_TIPS: Record<EntryField, string> = {
  it:               'Zeige was du selbst gebaut oder gelernt hast — GitHub-Projekte und Online-Kurse zählen mehr als formale Abschlüsse. Betone Lernbereitschaft.',
  pflege:           'Lebens- und Alltagserfahrung ist ein echter Vorteil. Empathie und persönliche Reife werden geschätzt — auch ohne Pflegeausbildung.',
  handwerk:         'Praktische Erfahrung aus Hobbys oder Eigenrenovierungen zählt! Viele Betriebe suchen Hilfsarbeiter zum Einstieg mit Ausbildung on-the-job.',
  verkauf:          'Deine Branchenkenntnisse aus früherer Arbeit sind ein Pluspunkt. Kommunikationsstärke, Zuverlässigkeit und echtes Interesse an Menschen betonen.',
  logistik:         'Körperliche Fitness und Führerausweise (Kat. C, Staplerschein) sind oft genug für den Einstieg. Pünktlichkeit und Zuverlässigkeit sind entscheidend.',
  gastronomie:      'Quereinsteiger willkommen! Viele Betriebe schulen on-the-job ein. Betone Belastbarkeit, Teamgeist und dass du auch im Stress ruhig bleibst.',
  paedagogik:       'Erfahrung mit Kindern aus Familie, Vereinsarbeit oder Kursen zählt stark. Authentizität und Geduld sind wichtiger als pädagogische Theorie.',
  soziales:         'Eigene Lebenserfahrung und Menschenkenntnis sind dein grösster Vorteil. Ergänze mit einem Einführungskurs Soziale Arbeit oder einem Praktikum.',
  buero:            'Hebe koordinierende und organisatorische Aufgaben aus früheren Jobs hervor — auch Vereinsarbeit zählt. Solide Excel- und Deutschkenntnisse sowie sorgfältige Bewerbungsunterlagen sind der Schlüssel.',
  selbstaendigkeit: 'Du brauchst keinen Arbeitgeber — nur einen ersten Kunden. Nutze deine Branchenkenntnisse als Alleinstellungsmerkmal und starte mit einem konkreten Angebot.',
}

export interface EnrichedSkill {
  id: string
  label: string
  icon: string
  learnInfo?: SkillLearnInfo
}

export interface JobEnrichment {
  field: EntryField | null
  category: string
  matchingSkills: EnrichedSkill[]
  missingSkills: EnrichedSkill[]  // top 3 for display
  allMissingSkillIds: string[]    // all missing, for goal tracking
  matchPercent: number
  tip: string | null
  entryStep: { nr: number; title: string; description: string; descriptionMature?: string } | null
  entryPathLabel: string | null
  salary: { einstieg: string; nach2Jahren: string; nach5Jahren: string } | null
  timeToFirstJob: string | null
  totalInvestment: { costCHF: number; durationWeeks: number } | null
}

export function getJobEnrichment(category: string, userSkillIds: string[]): JobEnrichment {
  const field = (CATEGORY_TO_FIELD[category] ?? null) as EntryField | null

  if (!field) {
    return {
      field: null,
      category,
      matchingSkills: [],
      missingSkills: [],
      allMissingSkillIds: [],
      matchPercent: 0,
      tip: null,
      entryStep: null,
      entryPathLabel: null,
      salary: null,
      timeToFirstJob: null,
      totalInvestment: null,
    }
  }

  const relevantSkills = SKILLS.filter(s => (s.affinities[field] ?? 0) > 0)

  const matchingSkills: EnrichedSkill[] = relevantSkills
    .filter(s => userSkillIds.includes(s.id))
    .map(s => ({ id: s.id, label: s.label, icon: s.icon, learnInfo: s.learnInfo }))

  const allMissingSkills: EnrichedSkill[] = relevantSkills
    .filter(s => !userSkillIds.includes(s.id))
    .sort((a, b) => (b.affinities[field] ?? 0) - (a.affinities[field] ?? 0))
    .map(s => ({ id: s.id, label: s.label, icon: s.icon, learnInfo: s.learnInfo }))

  // Top 3 for display in drawer; full list for goal progress tracking
  const missingSkills = allMissingSkills.slice(0, 3)

  const matchPercent = relevantSkills.length > 0
    ? Math.round((matchingSkills.length / relevantSkills.length) * 100)
    : 0

  const path = ENTRY_PATHS[field]
  const entryStep = path?.steps[path.steps.length - 1] ?? null

  const totalInvestment = allMissingSkills.reduce(
    (acc, s) => ({
      costCHF: acc.costCHF + (s.learnInfo?.costCHF ?? 0),
      durationWeeks: acc.durationWeeks + (s.learnInfo?.durationWeeks ?? 0),
    }),
    { costCHF: 0, durationWeeks: 0 }
  )

  return {
    field,
    category,
    matchingSkills,
    missingSkills,
    allMissingSkillIds: allMissingSkills.map(s => s.id),
    matchPercent,
    tip: QUEREINSTIEG_TIPS[field],
    entryStep: entryStep ? { nr: entryStep.nr, title: entryStep.title, description: entryStep.description, descriptionMature: entryStep.descriptionMature } : null,
    entryPathLabel: path?.label ?? null,
    salary: path ? path.salary : null,
    timeToFirstJob: path?.timeToFirstJob ?? null,
    totalInvestment: totalInvestment.costCHF > 0 || totalInvestment.durationWeeks > 0 ? totalInvestment : null,
  }
}
