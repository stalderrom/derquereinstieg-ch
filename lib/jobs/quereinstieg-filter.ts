/**
 * Filtert Jobs heraus, die eine Berufslizenz oder einen akademischen Abschluss erfordern
 * und daher für Quereinsteiger grundsätzlich nicht erreichbar sind.
 *
 * Verwendung in /api/user/jobs: nur suitable-Jobs an User-Dashboard ausliefern.
 */

// Titel-Muster die auf nicht-Quereinsteiger-geeignete Stellen hinweisen.
// Compound-Wörter (Hausarzt, Facharzt, Oberarzt) werden durch Suffix-Matching erfasst.
const EXCLUDED_PATTERNS: RegExp[] = [
  // Ärzte (alle Varianten: Arzt, Facharzt, Oberarzt, Chefarzt, Assistenzarzt, Hausarzt …)
  /arzt\b/i,
  /ärztin\b/i,

  // Chirurgen (Rolle, nicht Abteilung "Chirurgie")
  /\bchirurg(in)?\b/i,

  // Zahnmedizin
  /\bzahnarzt\b/i,
  /\bzahnärztin\b/i,
  /\bzahnmed\b/i,

  // Tiermedizin
  /tierarzt\b/i,
  /tierärztin\b/i,
  /\bveterinär(in)?\b/i,

  // Fachärzte / Spezialisten
  /\bpsychiater(in)?\b/i,
  /\bpsychotherapeut(in)?\b/i,
  /\bphysiotherapeut(in)?\b/i,  // Vollausbildung HF/FH nötig
  /\bradiologe\b/i,
  /\bradiologin\b/i,
  /\bkardiologe\b/i,
  /\bkardiologin\b/i,
  /\bonkologe\b/i,
  /\bonkologin\b/i,
  /\bneurologe\b/i,
  /\bneurologin\b/i,
  /\bgynäkologe\b/i,
  /\bgynäkologin\b/i,
  /\banästhesist(in)?\b/i,
  /\borthopäde\b/i,
  /\borthopädin\b/i,
  /\burologe\b/i,
  /\burologin\b/i,
  /\bapotheker(in)?\b/i,
  /\bhebamme\b/i,  // Bachelorstudium nötig

  // Recht
  /\bnotar(in)?\b/i,
  /\brichter(in)?\b/i,
  /\brechtsanwalt\b/i,
  /\brechtsanwältin\b/i,
  /\banwalt\b/i,
  /\banwältin\b/i,
  /\bjurist(in)?\b/i,
  /\bstaatsanwalt\b/i,
  /\bstaatsanwältin\b/i,

  // Wirtschaft / Finanzen (lizenzpflichtige Rollen)
  /\bwirtschaftsprüfer(in)?\b/i,
  /\brevisor(in)?\b/i,

  // Luftfahrt
  /\bpilot(in)?\b/i,
  /\bkapitän\b/i,
  /\bcopilot(in)?\b/i,

  // Wissenschaft (akademische Forschung, nicht Labor-Assist)
  /\bprofessor(in)?\b/i,
  /\bdozent(in)?\b/i,
]

/**
 * Gibt true zurück wenn der Job-Titel für Quereinsteiger prinzipiell erreichbar ist.
 * Gibt false zurück für Stellen die eine Berufslizenz / ein Studium erfordern.
 */
export function isQuereinsteigSuitable(title: string): boolean {
  return !EXCLUDED_PATTERNS.some(pattern => pattern.test(title))
}
