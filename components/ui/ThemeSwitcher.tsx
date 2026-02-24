'use client'

import { useEffect, useState } from 'react'

const THEMES = [
  {
    id: 'v5',
    label: 'Indigo + Türkis',
    description: 'Modern, eigenständig',
    swatch: '#1DB5A8',
    bg: '#252D7A',
  },
  {
    id: 'v6',
    label: 'Smaragd + Pfirsich',
    description: 'Warm, einladend',
    swatch: '#E8844A',
    bg: '#0D4535',
  },
  {
    id: 'v7',
    label: 'Rostbraun + Gold',
    description: 'Handwerklich, warm',
    swatch: '#D4AA30',
    bg: '#5C2A18',
  },
  {
    id: 'v8',
    label: 'Night sands',
    description: 'Warm, organisch',
    swatch: '#CBBD93',
    bg: '#574A24',
  },
  {
    id: 'v9',
    label: 'Calm blue',
    description: 'Ruhig, vertrauensvoll',
    swatch: '#57B9FF',
    bg: '#2C4A5C',
  },
  {
    id: 'v10',
    label: 'Ocean tide',
    description: 'Frisch, dynamisch',
    swatch: '#00D1D1',
    bg: '#004444',
  },
  {
    id: 'v11',
    label: 'Eucalyptus grove',
    description: 'Natürlich, authentisch',
    swatch: '#B2AC88',
    bg: '#2E4430',
  },
  {
    id: 'v12',
    label: 'Coral + Purple',
    description: 'Lebendig, mutig',
    swatch: '#F08A5D',
    bg: '#6A2C70',
  },
  {
    id: 'v13',
    label: 'Burnt Sienna',
    description: 'Warm, geerdet',
    swatch: '#E35336',
    bg: '#5C2810',
  },
  {
    id: 'v14',
    label: 'Zesty Lemon',
    description: 'Frisch, energetisch',
    swatch: '#D6D58B',
    bg: '#5A5A10',
  },
  {
    id: 'v15',
    label: 'Sunny Day',
    description: 'Kontrastreich, lebendig',
    swatch: '#FFBF00',
    bg: '#1A0090',
  },
  {
    id: 'v16',
    label: 'Cobalt Sky',
    description: 'Professionell, klar',
    swatch: '#82C8E5',
    bg: '#000080',
  },
  {
    id: 'v17',
    label: 'Quite Clear',
    description: 'Elegant, kontrastvoll',
    swatch: '#4D1717',
    bg: '#0E3025',
  },
  // ── Sunny Day (#FFBF00 · #807040 · #007EFF · #2400FF) ──
  {
    id: 'v18',
    label: 'Sunny Day A',
    description: 'Nacht: Tiefblau + Bernstein',
    swatch: '#FFBF00',
    bg: '#2400FF',
  },
  {
    id: 'v19',
    label: 'Sunny Day B',
    description: 'Erde: Olive + Tiefblau',
    swatch: '#2400FF',
    bg: '#807040',
  },
  {
    id: 'v20',
    label: 'Sunny Day C',
    description: 'Ozean: Tiefblau + Hellblau',
    swatch: '#007EFF',
    bg: '#2400FF',
  },
  {
    id: 'v21',
    label: 'Sunny Day D',
    description: 'Herbst: Olive + Hellblau',
    swatch: '#007EFF',
    bg: '#807040',
  },
  // ── Sunset (#F9ED69 · #F08A5D · #B83B5E · #6A2C70) ──
  {
    id: 'v22',
    label: 'Sunset A',
    description: 'Violett: Lila + Coral',
    swatch: '#F08A5D',
    bg: '#6A2C70',
  },
  {
    id: 'v23',
    label: 'Sunset B',
    description: 'Rosa: Rose + Lila',
    swatch: '#6A2C70',
    bg: '#B83B5E',
  },
  {
    id: 'v24',
    label: 'Sunset C',
    description: 'Pflaume: Lila + Rose',
    swatch: '#B83B5E',
    bg: '#6A2C70',
  },
  {
    id: 'v25',
    label: 'Sunset D',
    description: 'Coral: Rose + Coral',
    swatch: '#F08A5D',
    bg: '#B83B5E',
  },
  // ── Quer (#4B2EFF · #B6FF00 · #F6F6F4 · #111111) ──
  {
    id: 'v26',
    label: 'Quer A',
    description: 'Tech: Charcoal + Violet',
    swatch: '#4B2EFF',
    bg: '#111111',
  },
  {
    id: 'v27',
    label: 'Quer B',
    description: 'Neon: Violet + Lime',
    swatch: '#B6FF00',
    bg: '#4B2EFF',
  },
  {
    id: 'v28',
    label: 'Quer C',
    description: 'Dunkel: Charcoal + Lime',
    swatch: '#B6FF00',
    bg: '#111111',
  },
  {
    id: 'v29',
    label: 'Quer D',
    description: 'Invert: Violet + Charcoal',
    swatch: '#111111',
    bg: '#4B2EFF',
  },
]

export default function ThemeSwitcher() {
  const [active, setActive] = useState('v5')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme') ?? 'v5'
    setActive(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  function apply(id: string) {
    setActive(id)
    document.documentElement.setAttribute('data-theme', id)
    localStorage.setItem('theme', id)
    setOpen(false)
  }

  const current = THEMES.find((t) => t.id === active)

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 flex flex-col gap-1 w-[220px] max-h-[70vh] overflow-y-auto">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 pb-1">
            Branding
          </p>
          {THEMES.map((t, i) => (
            <button
              key={t.id}
              onClick={() => apply(t.id)}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors w-full group ${
                active === t.id ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              {/* Swatch: Hintergrund + Akzentfarbe */}
              <span
                className="w-8 h-8 rounded-lg flex-shrink-0 shadow-sm border border-black/10"
                style={{
                  background: `linear-gradient(135deg, ${t.bg} 55%, ${t.swatch} 55%)`,
                }}
              />
              <span>
                <span className={`block text-sm ${active === t.id ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                  {i + 1}. {t.label}
                </span>
                <span className="block text-[11px] text-gray-400">{t.description}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Toggle-Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Branding wählen"
        className="w-11 h-11 rounded-full shadow-lg border-2 border-white flex items-center justify-center hover:scale-105 transition-transform overflow-hidden"
        style={{
          background: current
            ? `linear-gradient(135deg, ${current.bg} 55%, ${current.swatch} 55%)`
            : '#252D7A',
        }}
      />
    </div>
  )
}
