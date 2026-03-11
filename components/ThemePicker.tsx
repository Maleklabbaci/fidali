'use client'

import { useState, useEffect } from 'react'
import { themes, getTheme, saveTheme, loadTheme, applyTheme } from '@/lib/themes'

export function ThemePicker({ onSelect }: { onSelect?: (themeId: string) => void }) {
  const [selected, setSelected] = useState('default')

  useEffect(() => {
    const saved = loadTheme()
    setSelected(saved)
    applyTheme(getTheme(saved))
  }, [])

  const handleSelect = (id: string) => {
    setSelected(id)
    saveTheme(id)
    applyTheme(getTheme(id))
    onSelect?.(id)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700">🎨 Thème de l&apos;interface</h3>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleSelect(theme.id)}
            className={`relative rounded-xl p-3 text-left transition-all border-2 ${
              selected === theme.id
                ? 'border-blue-500 shadow-lg scale-105'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            style={{ backgroundColor: theme.colors.background }}
          >
            <div className="flex gap-1 mb-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.secondary }} />
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
            </div>
            <p className="text-xs font-bold" style={{ color: theme.colors.text }}>{theme.name}</p>
            {selected === theme.id && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
