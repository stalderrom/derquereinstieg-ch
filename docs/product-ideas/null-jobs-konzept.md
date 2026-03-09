# "0 Jobs in meiner Region" — Lösungskonzepte

Kontext: Nutzer (z.B. im Wallis / Tessin) sieht 0 Stellen in seiner Region.
Wie zeigen wir trotzdem einen Weg auf?

---

## Option A — Smart-Banner mit Nachbarregionen

Wenn eine gewählte Region 0 Jobs hat, erscheint direkt über der Jobliste ein Banner:

> "In **Wallis** gibt es aktuell keine passenden Stellen.
> In **Westschweiz** (64 km) und **Bern** (120 km) sind **284 Stellen** verfügbar."
> [+ Westschweiz hinzufügen] [+ Bern hinzufügen]

**Logik:**
- Nachbarregionen (statisch definiert, z.B. Wallis → Westschweiz, Bern)
- 1-Klick-Add ohne RegionPicker zu öffnen
- Nur anzeigen wenn Suchresultat 0 ist

**Aufwand:** Mittel — `NEIGHBOR_REGIONS` Mapping + Banner-Komponente

---

## Option B — Remote-Tag auf Berufsfeldern

Im Einstiegspfad werden Berufsfelder mit "Remote möglich" markiert.
Nutzer wählt Region → IT/Softwareentwicklung zeigt:

> "💻 Remote-Jobs möglich — schweizweit bewerben"
> [Schweizweit suchen]

**Logik:**
- `ENTRY_PATHS` ergänzen mit `remoteFreundlich: true/false`
- Im Einstiegspfad + Jobliste als Tag anzeigen
- CTA "Schweizweit suchen" setzt regions auf `[]`

**Aufwand:** Klein — statische Daten + UI-Indikator

---

## Option C — Regionale Arbeitgeber-Karte

Neue Seite `/dashboard/arbeitgeber` (Tier 2+):

Interaktive Karte zeigt die **50 grössten Arbeitgeber pro Region** — auch wenn sie gerade keine offenen Stellen inseriert haben. Nutzer kann direkt deren Karriereseite besuchen oder "beobachten" (Alert wenn Stelle erscheint).

**Logik:**
- Statische Tabelle: `Kanton → [Firma, Branche, Karriere-URL]`
- Einmal redaktionell gepflegt, kein Scraping nötig
- Direktbewerbung ohne Inserat als Quereinsteiger-Strategie

**Aufwand:** Mittel — statische Daten kuratieren + neue Seite

---

## Option D — Job-Alert System

Nutzer mit 0 Stellen sieht CTA:

> "Aktuell keine Stellen in Wallis.
> Wir benachrichtigen dich, sobald etwas erscheint."
> [Alert aktivieren]

**Logik:**
- Tabelle `job_alerts`: `user_id, regions[], category, created_at`
- Cron-Job (täglich): prüft ob neue Jobs in alert-Regionen → E-Mail via Resend
- E-Mail: "3 neue Stellen in Wallis — jetzt ansehen"

**Aufwand:** Gross — DB-Tabelle + Cron + E-Mail-System (Resend)

---

## Empfehlung Reihenfolge

1. **Option B** (Remote-Tag): Kleinster Aufwand, sofortige Wirkung für IT-Quereinsteiger
2. **Option A** (Smart-Banner): Direkt hilfreich, konkret, 1-2 Stunden Aufwand
3. **Option D** (Alerts): Hoher Wert für Retention, lohnt sich ab ~100 aktiven Usern
4. **Option C** (Arbeitgeber-Karte): Grosse redaktionelle Arbeit, differenzierend für Paid-Tier

---

*Erstellt: März 2026*
