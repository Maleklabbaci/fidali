'use client'

// ⚠️ Page de test — désactivée en production
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TestPage() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers le dashboard en production
    if (process.env.NODE_ENV === 'production') {
      router.replace('/dashboard')
    }
  }, [router])

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  // Afficher seulement en développement local
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-2">🔧 Page de test</h1>
        <p className="text-gray-500 text-sm mb-6">Disponible uniquement en développement local.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          ⚠️ Cette page est automatiquement désactivée en production.
        </div>
      </div>
    </div>
  )
}
