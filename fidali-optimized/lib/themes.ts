export interface Theme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
}

export const themes: Theme[] = [
  { id: 'default', name: 'Classique', primary: '#2563eb', secondary: '#7c3aed', accent: '#f59e0b' },
  { id: 'ocean', name: 'Océan', primary: '#0891b2', secondary: '#06b6d4', accent: '#14b8a6' },
  { id: 'sunset', name: 'Coucher de soleil', primary: '#ea580c', secondary: '#f97316', accent: '#eab308' },
  { id: 'forest', name: 'Forêt', primary: '#059669', secondary: '#10b981', accent: '#34d399' },
  { id: 'royal', name: 'Royal', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
  { id: 'dark', name: 'Sombre', primary: '#3b82f6', secondary: '#8b5cf6', accent: '#f472b6' },
]

export function getTheme(id: string): Theme {
  return themes.find((t) => t.id === id) || themes[0]
}

export function saveTheme(id: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fidali_theme', id)
  }
}

export function loadTheme(): string {
  if (typeof window === 'undefined') return 'default'
  return localStorage.getItem('fidali_theme') || 'default'
}

export function applyTheme(_theme: Theme) {
  // Ne fait rien pour l'instant — évite de casser les couleurs Tailwind
  // On utilisera ça plus tard quand on aura un vrai système de thème
}
