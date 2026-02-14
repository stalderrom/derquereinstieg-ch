'use client'

import { useEffect, useState } from 'react'

const THEMES = [
  {
    id: 'v1',
    label: 'Navy & Orange',
    description: 'Seriös, direkt',
    swatch: '#E67E22',
    bg: '#1A2332',
  },
  {
    id: 'v2',
    label: 'Blau & Orange',
    description: 'Markenfarbe als Basis',
    swatch: '#E67E22',
    bg: '#2E5C8A',
  },
  {
    id: 'v3',
    label: 'Warm & Sand',
    description: 'Menschlich, nahbar',
    swatch: '#C97D2E',
    bg: '#2C2A26',
  },
  {
    id: 'v4',
    label: 'Tief & Orange',
    description: 'Premium, fokussiert',
    swatch: '#E67E22',
    bg: '#0D1117',
  },
  {
    id: 'v5',
    label: 'Hell & Frisch',
    description: 'Modern, zugänglich',
    swatch: '#E8841C',
    bg: '#1B3A5F',
  },
]

export default function ThemeSwitcher() {
  const [active, setActive] = useState('v1')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme') ?? 'v1'
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
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 flex flex-col gap-1 w-[220px]">
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
            : '#1A2332',
        }}
      />
    </div>
  )
}
