import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './sanity/schemas'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

export default defineConfig({
  name: 'derquereinstieg',
  title: 'derquereinstieg.ch',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Inhalt')
          .items([
            S.listItem()
              .title('Startseite')
              .id('homepage')
              .child(
                S.document()
                  .schemaType('homepage')
                  .documentId('homepage')
              ),
            S.divider(),
            S.listItem()
              .title('Branchen-Seiten')
              .child(S.documentTypeList('branchenSeite').title('Branchen-Seiten')),
            S.divider(),
            S.listItem()
              .title('Weitere Seiten')
              .child(S.documentTypeList('page').title('Weitere Seiten')),
          ]),
    }),
  ],
  schema: { types: schemaTypes },
})
