export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    primaryHover: string
    primaryLight: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
  }
  gradient: string
  cardGradient: string
}

export const themes: Theme[] = [
  {
    id: 'default',
    name: 'Classique',
    colors: {
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      primaryLight: '#eff6ff',
      secondary: '#7c3aed',
      accent: '#f59e0b',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
    },
    gradient: 'from-blue-600 to-indigo-600',
    cardGradient: 'from-blue-600 to-purple-600',
  },
  {
    id: 'ocean',
    name: 'Océan',
    colors: {
      primary: '#0891b2',
      primaryHover: '#0e7490',
      primaryLight: '#ecfeff',
      secondary: '#06b6d4',
      accent: '#14b8a6',
      background: '#f0fdfa',
      surface: '#ffffff',
      text: '#134e4a',
      textSecondary: '#5eead4',
      border: '#99f6e4',
    },
    gradient: 'from-cyan-600 to-teal-600',
    cardGradient: 'from-cyan-500 to-teal-500',
  },
  {
    id: 'sunset',
    name: 'Coucher de soleil',
    colors: {
      primary: '#ea580c',
      primaryHover: '#c2410c',
      primaryLight: '#fff7ed',
      secondary: '#f97316',
      accent: '#eab308',
      background: '#fffbeb',
      surface: '#ffffff',
      text: '#431407',
      textSecondary: '#9a3412',
      border: '#fed7aa',
    },
    gradient: 'from-orange-500 to-amber-500',
    cardGradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'forest',
    name: 'Forêt',
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      primaryLight: '#ecfdf5',
      secondary: '#10b981',
      accent: '#34d399',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#064e3b',
      textSecondary: '#6ee7b7',
      border: '#a7f3d0',
    },
    gradient: 'from-emerald-600 to-green-600',
    cardGradient: 'from-emerald-500 to-green-500',
  },
  {
    id: 'royal',
    name: 'Royal',
    colors: {
      primary: '#7c3aed',
      primaryHover: '#6d28d9',
      primaryLight: '#f5f3ff',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#3b0764',
      textSecondary: '#7c3aed',
      border: '#c4b5fd',
    },
    gradient: 'from-purple-600 to-violet-600',
    cardGradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'dark',
    name: 'Sombre',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryLight: '#1e293b',
      secondary: '#8b5cf6',
      accent: '#f472b6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
    },
    gradient: 'from-blue-500 to-purple-500',
    cardGradient: 'from-blue-600 to-purple-600',
  },
]

export function getTheme(id: string): Theme {
  return themes.find((t) => t.id === id) || themes[0]
}

export function saveTheme(id: string) {
  localStorage.setItem('fidali_theme', id)
}

export function loadTheme(): string {
  if (typeof window === 'undefined') return 'default'
  return localStorage.getItem('fidali_theme') || 'default'
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })
}
