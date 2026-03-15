'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('[Fidali] Page error:', error.message)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="text-center text-white max-w-md">
        <p className="text-6xl mb-6">⚠️</p>
        <h1 className="text-2xl font-black mb-3">Une erreur est survenue</h1>
        <p className="text-white/50 text-sm mb-8">
          Quelque chose s'est mal passé. Essayez de recharger la page.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-white/90 transition"
          >
            Réessayer
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
