import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Startseite',
  type: 'document',
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Hero Titel',
      type: 'string',
      description: 'Haupttitel im Hero-Bereich',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Untertitel',
      type: 'text',
      rows: 3,
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
    defineField({
      name: 'seoTitle',
      title: 'SEO Titel',
      type: 'string',
      description: 'Titel für Suchmaschinen (leer lassen = Standard)',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Beschreibung',
      type: 'text',
      rows: 2,
      description: 'Meta-Description für Suchmaschinen',
    }),
  ],
  preview: {
    select: { title: 'heroTitle' },
    prepare: ({ title }) => ({ title: title || 'Startseite' }),
  },
})
