'use client'

import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-6">
      <div className="text-center text-white max-w-md">
        <p className="text-8xl font-black text-white/10 mb-2">404</p>
        <p className="text-5xl mb-6">🔍</p>
        <h1 className="text-2xl font-black mb-3">Page introuvable</h1>
        <p className="text-white/50 text-sm mb-8">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-white/90 transition"
          >
            Accueil
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition"
          >
            Dashboard
          </button>
        </div>
        <p className="text-white/20 text-xs mt-8">Fidali 💙</p>
      </div>
    </div>
  )
}
