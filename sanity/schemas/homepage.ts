import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Startseite',
  type: 'document',
  fields: [
    // --- Hero ---
    defineField({
      name: 'heroEyebrow',
      title: 'Hero Eyebrow (Zeile über dem Titel)',
      type: 'string',
      description: 'Kleine Zeile in Orange über dem H1, z.B. "Die Plattform für Quereinsteiger in der Schweiz"',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Titel (H1)',
      type: 'string',
      description: 'Haupttitel im Hero-Bereich',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Untertitel (Zeile 1)',
      type: 'text',
      rows: 2,
      description: 'Erste Zeile unter dem Titel, etwas heller',
    }),
    defineField({
      name: 'heroTagline',
      title: 'Hero Tagline (Zeile 2)',
      type: 'string',
      description: 'Zweite Zeile unter dem Titel, noch dezenter, z.B. "Ehrliche Einstiegswege, validierte Daten, kein Bullshit."',
    }),
    defineField({
      name: 'heroCtaText',
      title: 'Hero Button Text',
      type: 'string',
    }),
    defineField({
      name: 'heroCtaUrl',
      title: 'Hero Button Link',
      type: 'string',
    }),

    // --- Sektionen (flexibel erweiterbar) ---
    defineField({
      name: 'sections',
      title: 'Sektionen',
      description: 'Inhaltsbereiche unterhalb des Hero. Reihenfolge per Drag & Drop änderbar.',
      type: 'array',
      of: [
        // Typ 1: Text-Abschnitt
        {
          type: 'object',
          name: 'textSection',
          title: 'Text-Abschnitt',
          fields: [
            defineField({ name: 'title', title: 'Titel (H2)', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'content',
              title: 'Text',
              type: 'array',
              of: [
                {
                  type: 'block',
                  styles: [
                    { title: 'Normal', value: 'normal' },
                    { title: 'H3', value: 'h3' },
                  ],
                  marks: {
                    decorators: [
                      { title: 'Fett', value: 'strong' },
                      { title: 'Kursiv', value: 'em' },
                    ],
                    annotations: [
                      {
                        name: 'link',
                        type: 'object',
                        title: 'Link',
                        fields: [
                          { name: 'href', type: 'string', title: 'URL' },
                        ],
                      },
                    ],
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: 'title' },
            prepare: ({ title }) => ({ title: `Text: ${title}` }),
          },
        },

        // Typ 2: Aufzählungs-Abschnitt
        {
          type: 'object',
          name: 'bulletSection',
          title: 'Aufzählung',
          fields: [
            defineField({ name: 'title', title: 'Titel (H2)', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'items',
              title: 'Punkte',
              type: 'array',
              of: [{ type: 'string' }],
            }),
          ],
          preview: {
            select: { title: 'title' },
            prepare: ({ title }) => ({ title: `Liste: ${title}` }),
          },
        },

        // Typ 3: CTA-Box (Hervorgehobener Bereich)
        {
          type: 'object',
          name: 'ctaSection',
          title: 'CTA-Box',
          fields: [
            defineField({ name: 'title', title: 'Titel', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'subtitle', title: 'Untertitel', type: 'text', rows: 2 }),
            defineField({ name: 'ctaText', title: 'Button Text', type: 'string' }),
            defineField({ name: 'ctaUrl', title: 'Button Link', type: 'string' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare: ({ title }) => ({ title: `CTA: ${title}` }),
          },
        },
      ],
    }),

    // --- SEO ---
    defineField({
      name: 'seoTitle',
      title: 'SEO Titel',
      type: 'string',
      description: 'Leer lassen = Standard-Titel wird verwendet',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Beschreibung',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: { title: 'heroTitle' },
    prepare: ({ title }) => ({ title: title || 'Startseite' }),
  },
})
