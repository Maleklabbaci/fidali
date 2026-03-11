'use client'

import { useState, useEffect } from 'react'
import type { Locale } from '@/lib/i18n'

export function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>('fr')

  useEffect(() => {
    const saved = localStorage.getItem('fidali_locale') as Locale
    if (saved) setLocale(saved)
  }, [])

  const switchLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('fidali_locale', newLocale)
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLocale
    window.location.reload()
  }

  return (
    <button
      onClick={() => switchLocale(locale === 'fr' ? 'ar' : 'fr')}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium"
    >
      {locale === 'fr' ? (
        <>🇩🇿 العربية</>
      ) : (
        <>🇫🇷 Français</>
      )}
    </button>
  )
}

export function useLocale() {
  const [locale, setLocale] = useState<Locale>('fr')

  useEffect(() => {
    const saved = localStorage.getItem('fidali_locale') as Locale
    if (saved) {
      setLocale(saved)
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = saved
    }
  }, [])

  return locale
}

export function useTranslation() {
  const locale = useLocale()
  const { translations } = require('@/lib/i18n')
  return { t: translations[locale], locale, isRTL: locale === 'ar' }
}
