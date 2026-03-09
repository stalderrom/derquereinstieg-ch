import type { Profile } from '@/types/database'

// ─── Motivationsschreiben ─────────────────────────────────────────────────────

export function buildCoverLetterPrompt(jobText: string, profile: Partial<Profile>, extras?: {
  strengths?: string
  hook?: string
}) {
  const ap = profile.application_profile
  const toneNote = ap?.tone === 'du' ? 'Du-Form (Ansprache: "du/ihr")' : 'Sie-Form (formell)'

  const profileContext = [
    profile.full_name ? `Name: ${profile.full_name}` : null,
    profile.target_field ? `Angestrebtes Berufsfeld: ${profile.target_field}` : null,
    profile.region ? `Region: ${profile.region}` : null,
    ap?.currentJob ? `Aktuelle/letzte Stelle: ${ap.currentJob}` : null,
    ap?.currentJobDesc ? `Tätigkeiten: ${ap.currentJobDesc}` : null,
    ap?.prevJob ? `Frühere Stelle: ${ap.prevJob}` : null,
    ap?.education ? `Ausbildung: ${ap.education}` : null,
    ap?.skills ? `Fähigkeiten: ${ap.skills}` : null,
    ap?.motivation ? `Quereinstieg-Motivation: ${ap.motivation}` : null,
    extras?.strengths ? `Besondere Stärken: ${extras.strengths}` : null,
    extras?.hook ? `Persönlicher Aufhänger: ${extras.hook}` : null,
  ].filter(Boolean).join('\n')

  return {
    system: `Du bist ein erfahrener Schweizer Karriereberater, der auf Quereinsteiger spezialisiert ist.
Du schreibst professionelle, authentische Motivationsschreiben auf Deutsch (Schweizer Hochdeutsch).
Stil: direkt, persönlich, überzeugend – keine Floskeln, keine Füllwörter.
Format: Klassischer Brief (kein Betreff in der Anrede, ${toneNote}).
Länge: 250–350 Wörter. Keine Aufzählungen im Fliesstext.`,

    user: `Schreibe ein Motivationsschreiben für folgende Stelle:

---
${jobText}
---

Bewerberprofil:
${profileContext || 'Kein Profil vorhanden'}

Wichtig:
- Adressiere den Quereinstieg positiv (Lebenserfahrung, Transferskills)
- Zeige echtes Interesse an dieser konkreten Stelle
- Vermeide Klischees wie "ich bin teamfähig und belastbar"
- Schluss mit klarem CTA (Gesprächsanfrage)`
  }
}

// ─── CV-Highlights ────────────────────────────────────────────────────────────

export function buildCVHighlightsPrompt(jobText: string, profile: Partial<Profile>) {
  const ap = profile.application_profile
  const profileText = ap ? [
    ap.currentJob ? `Aktuelle/letzte Stelle: ${ap.currentJob}` : null,
    ap.currentJobDesc ? `Tätigkeiten: ${ap.currentJobDesc}` : null,
    ap.prevJob ? `Frühere Stelle: ${ap.prevJob}` : null,
    ap.education ? `Ausbildung: ${ap.education}` : null,
    ap.skills ? `Fähigkeiten: ${ap.skills}` : null,
    ap.motivation ? `Motivation für Quereinstieg: ${ap.motivation}` : null,
    profile.target_field ? `Angestrebtes Berufsfeld: ${profile.target_field}` : null,
  ].filter(Boolean).join('\n') : (
    profile.target_field ? `Angestrebtes Berufsfeld: ${profile.target_field}` : 'Kein Profil vorhanden'
  )

  return {
    system: `Du bist ein Schweizer Karriereberater spezialisiert auf Quereinsteiger-CVs.
Du identifizierst die relevantesten Transferskills und formulierst sie stellenspezifisch.
Antworte auf Deutsch, präzise und direkt verwertbar im CV.`,

    user: `Erstelle 4–5 CV-Highlights für folgende Stelle:

---
${jobText}
---

Werdegang des Bewerbers:
${profileText}

Format: Bullet Points, jeder Punkt max. 1–2 Zeilen.
Quereinstieg als Stärke framen. Konkrete Transferskills benennen.
Jeden Punkt so formulieren, dass er direkt in den CV kopiert werden kann.`
  }
}

// ─── Bewerbung prüfen ─────────────────────────────────────────────────────────

export function buildReviewPrompt(text: string, profile?: Partial<Profile>) {
  return {
    system: `Du bist ein kritischer aber konstruktiver Bewerbungscoach für den Schweizer Arbeitsmarkt.
Du analysierst Motivationsschreiben auf: Struktur, Überzeugungskraft, Quereinsteiger-Formulierungen, sprachliche Schwächen.
Antworte auf Deutsch, strukturiert mit klaren Abschnitten.`,

    user: `Analysiere dieses Motivationsschreiben und gib konkrete Verbesserungsvorschläge:

---
${text}
---

${profile?.target_field ? `Kontext: Quereinstieg in ${profile.target_field}` : ''}

Gliederung deiner Antwort:
1. **Gesamteindruck** (2–3 Sätze)
2. **Stärken** (was gut funktioniert)
3. **Schwächen & konkrete Verbesserungen** (mit Before/After-Beispielen)
4. **Quereinsteiger-Formulierungen** (sind sie positiv geframt?)
5. **Überarbeiteter Eröffnungssatz** (direkt verwertbar)`
  }
}

// ─── CV-Tipps ─────────────────────────────────────────────────────────────────

export function buildCVTipsPrompt(background: string, targetField: string) {
  return {
    system: `Du bist ein Schweizer Karriereberater spezialisiert auf Quereinsteiger-CVs.
Du kennst den Schweizer Arbeitsmarkt und weisst, welche Transferskills in welchen Branchen geschätzt werden.
Antworte konkret und umsetzbar auf Deutsch.`,

    user: `Ich steige in folgendes Berufsfeld quer ein: **${targetField}**

Mein bisheriger Werdegang:
---
${background}
---

Gib mir konkrete CV-Tipps:
1. **Transferskills identifizieren**: Welche meiner Erfahrungen sind für ${targetField} relevant?
2. **Formulierungsvorschläge**: Wie beschreibe ich meine bisherige Erfahrung so, dass sie zum Zielberuf passt?
3. **Was weglassen oder minimieren**: Was schadet eher als hilft?
4. **Reihenfolge und Schwerpunkte**: Was soll im CV zuerst stehen?
5. **Lücken oder Schwächen erklären**: Wie gehe ich damit um?`
  }
}
