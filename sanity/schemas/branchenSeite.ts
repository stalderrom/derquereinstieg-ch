import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'branchenSeite',
  title: 'Branchen-Seite',
  type: 'document',
  fields: [
    // ─── Grunddaten ───────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Seitentitel (H1)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-Pfad',
      type: 'slug',
      description: 'z.B. "quereinstieg-buero" → derquereinstieg.ch/quereinstieg-buero',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brancheLabel',
      title: 'Branche (Kurzname für Breadcrumb & Tags)',
      type: 'string',
      description: 'z.B. "Büro & Verwaltung"',
    }),

    // ─── Hero ─────────────────────────────────────────────────────
    defineField({
      name: 'heroHeadline',
      title: 'Hero: Überschrift',
      type: 'string',
    }),
    defineField({
      name: 'heroSubline',
      title: 'Hero: Unterzeile',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'heroStats',
      title: 'Hero: Statistiken (3 Kennzahlen)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'stat',
          fields: [
            defineField({ name: 'value', title: 'Wert', type: 'string', description: 'z.B. "1.300"' }),
            defineField({ name: 'label', title: 'Bezeichnung', type: 'string', description: 'z.B. "Suchanfragen/Monat"' }),
          ],
          preview: {
            select: { title: 'value', subtitle: 'label' },
          },
        },
      ],
      validation: (Rule) => Rule.max(3),
    }),

    // ─── Einleitung ───────────────────────────────────────────────
    defineField({
      name: 'introText',
      title: 'Einleitung (1–2 Absätze)',
      type: 'text',
      rows: 4,
    }),

    // ─── Warum diese Branche ──────────────────────────────────────
    defineField({
      name: 'warumHeadline',
      title: 'Warum-Abschnitt: Überschrift',
      type: 'string',
    }),
    defineField({
      name: 'warumGruende',
      title: 'Warum-Gründe (4 Punkte)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'grund',
          fields: [
            defineField({ name: 'titel', title: 'Titel', type: 'string' }),
            defineField({ name: 'text', title: 'Beschreibung', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'titel', subtitle: 'text' } },
        },
      ],
      validation: (Rule) => Rule.max(4),
    }),

    // ─── Typische Stellen ─────────────────────────────────────────
    defineField({
      name: 'stellenHeadline',
      title: 'Stellen-Abschnitt: Überschrift',
      type: 'string',
    }),
    defineField({
      name: 'typischeStellen',
      title: 'Typische Stellen / Berufsprofile',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'stelle',
          fields: [
            defineField({ name: 'titel', title: 'Berufsbezeichnung', type: 'string' }),
            defineField({ name: 'gehalt', title: 'Gehaltsspanne', type: 'string', description: 'z.B. CHF 50–65k' }),
            defineField({
              name: 'barrier',
              title: 'Einstiegshürde',
              type: 'string',
              options: { list: ['Niedrig', 'Mittel', 'Hoch'] },
            }),
            defineField({ name: 'beschreibung', title: 'Kurzbeschreibung', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'titel', subtitle: 'gehalt' } },
        },
      ],
    }),

    // ─── Schritte ─────────────────────────────────────────────────
    defineField({
      name: 'schritteHeadline',
      title: 'Schritte-Abschnitt: Überschrift',
      type: 'string',
    }),
    defineField({
      name: 'schritte',
      title: 'Schritte zum Quereinstieg (max. 6)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'schritt',
          fields: [
            defineField({ name: 'nummer', title: 'Nummer', type: 'number' }),
            defineField({ name: 'titel', title: 'Schritt-Titel', type: 'string' }),
            defineField({ name: 'text', title: 'Erklärung', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'titel' } },
        },
      ],
      validation: (Rule) => Rule.max(6),
    }),

    // ─── Lohntabelle ──────────────────────────────────────────────
    defineField({
      name: 'lohnTabelle',
      title: 'Lohntabelle (Jahresbrutto CHF)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'lohnZeile',
          fields: [
            defineField({ name: 'position', title: 'Position', type: 'string' }),
            defineField({ name: 'einsteiger', title: 'Einsteiger', type: 'string', description: 'z.B. CHF 48.000' }),
            defineField({ name: 'erfahren', title: 'Erfahren', type: 'string', description: 'z.B. CHF 58.000' }),
            defineField({ name: 'senior', title: 'Senior', type: 'string', description: 'z.B. CHF 72.000' }),
          ],
          preview: { select: { title: 'position', subtitle: 'einsteiger' } },
        },
      ],
    }),

    // ─── Bedenken / Mythen ────────────────────────────────────────
    defineField({
      name: 'bedenken',
      title: 'Häufige Bedenken & Antworten (max. 4)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'bedenken',
          fields: [
            defineField({ name: 'mythos', title: 'Mythos / Bedenken', type: 'string' }),
            defineField({ name: 'realitaet', title: 'Realität / Antwort', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'mythos' } },
        },
      ],
      validation: (Rule) => Rule.max(4),
    }),

    // ─── FAQ ──────────────────────────────────────────────────────
    defineField({
      name: 'faq',
      title: 'FAQ (erscheint bei Google als Rich Result)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({ name: 'frage', title: 'Frage', type: 'string' }),
            defineField({ name: 'antwort', title: 'Antwort', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'frage' } },
        },
      ],
    }),

    // ─── SEO ──────────────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      title: 'SEO Titel (max. 60 Zeichen)',
      type: 'string',
      description: 'Leer lassen = Seitentitel wird verwendet',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Beschreibung (max. 155 Zeichen)',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(155),
    }),
  ],

  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare: ({ title, slug }) => ({ title, subtitle: slug ? `/${slug}` : '(kein Slug)' }),
  },
})
