'use client'

import { useState, useEffect } from 'react'

const THEMES = [
  { id: 'default', name: 'Classique', primary: '#2563eb', secondary: '#7c3aed', accent: '#f59e0b' },
  { id: 'ocean', name: 'Océan', primary: '#0891b2', secondary: '#06b6d4', accent: '#14b8a6' },
  { id: 'sunset', name: 'Coucher de soleil', primary: '#ea580c', secondary: '#f97316', accent: '#eab308' },
  { id: 'forest', name: 'Forêt', primary: '#059669', secondary: '#10b981', accent: '#34d399' },
  { id: 'royal', name: 'Royal', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
  { id: 'dark', name: 'Sombre', primary: '#3b82f6', secondary: '#8b5cf6', accent: '#f472b6' },
]

export function ThemePicker() {
  const [selected, setSelected] = useState('default')

  useEffect(() => {
    const saved = localStorage.getItem('fidali_theme')
    if (saved) setSelected(saved)
  }, [])

  const handleSelect = (id: string) => {
    setSelected(id)
    localStorage.setItem('fidali_theme', id)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700">🎨 Thème</h3>
      <div className="grid grid-cols-3 gap-3">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleSelect(theme.id)}
            className={`relative rounded-xl p-3 text-left transition-all border-2 bg-white ${
              selected === theme.id
                ? 'border-blue-500 shadow-lg scale-105'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex gap-1 mb-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }} />
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary }} />
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.accent }} />
            </div>
            <p className="text-xs font-bold text-gray-700">{theme.name}</p>
            {selected === theme.id && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
            )}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-400">Le thème sera appliqué aux futures fonctionnalités</p>
    </div>
  )
}
