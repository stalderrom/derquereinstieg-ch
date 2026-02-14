'use client'

import { useEffect, useState } from 'react'

const THEMES = [
  {
    id: 'default',
    label: 'Navy & Orange',
    swatch: '#E67E22',
    bg: '#1A2332',
  },
  {
    id: 'green',
    label: 'Grün & Weiss',
    swatch: '#2D7D52',
    bg: '#1B3A2D',
  },
  {
    id: 'slate',
    label: 'Slate & Gold',
    swatch: '#F5C842',
    bg: '#1E2936',
  },
  {
    id: 'terracotta',
    label: 'Tinte & Terrakotta',
    swatch: '#C1603F',
    bg: '#2C2C3E',
  },
]

export default function ThemeSwitcher() {
  const [active, setActive] = useState('default')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme') ?? 'default'
    setActive(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  function apply(id: string) {
    setActive(id)
    document.documentElement.setAttribute('data-theme', id)
    localStorage.setItem('theme', id)
    setOpen(false)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 flex flex-col gap-1 min-w-[180px]">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-1">Farbpalette</p>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => apply(t.id)}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-left transition-colors w-full ${
                active === t.id ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'
              }`}
            >
              <span
                className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${t.bg} 50%, ${t.swatch} 50%)` }}
              />
              <span className="text-gray-700">{t.label}</span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Farbpalette wählen"
        className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center bg-white border border-gray-200 hover:scale-105 transition-transform"
        style={{
          background: `conic-gradient(#E67E22 0% 25%, #2D7D52 25% 50%, #F5C842 50% 75%, #C1603F 75% 100%)`,
        }}
      />
    </div>
  )
}
