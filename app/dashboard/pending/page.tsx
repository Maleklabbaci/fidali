'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function PendingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rejected = searchParams.get('rejected')

  useEffect(() => {
    // Vérifier toutes les 10 secondes si le statut a changé
    const interval = setInterval(async () => {
      try {
        const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
        if (!stored) { router.push('/login'); return }
        const m = JSON.parse(stored)
        const { getMerchantProfile } = await import('@/database/supabase-client')
        const profile = await getMerchantProfile(m.id)
        if (profile?.status === 'active') {
          router.push('/dashboard')
        }
      } catch {}
    }, 10000)
    return () => clearInterval(interval)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('merchant')
    localStorage.removeItem('fidali_remember')
    sessionStorage.removeItem('merchant')
    router.push('/')
  }

  if (rejected) return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-rose-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">❌</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-3">Demande refusée</h1>
        <p className="text-white/60 mb-2">Votre demande d'inscription a été refusée par notre équipe.</p>
        <p className="text-white/40 text-sm mb-8">Si vous pensez que c'est une erreur, contactez-nous.</p>
        <a href="mailto:support@fidali.dz"
          className="block w-full py-3 bg-white text-red-900 rounded-2xl font-bold mb-3 hover:bg-white/90 transition">
          Contacter le support
        </a>
        <button onClick={handleLogout} className="w-full py-3 text-white/50 text-sm hover:text-white transition">
          Se déconnecter
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-10 h-10 border-4 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
        </div>
        <h1 className="text-2xl font-black text-white mb-3">Compte en cours de validation</h1>
        <p className="text-white/60 mb-2">Notre équipe examine votre demande.</p>
        <p className="text-white/40 text-sm mb-8">Vous recevrez une confirmation sous 24-48h. Cette page se met à jour automatiquement.</p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-3">
          {[
            { icon: '✅', text: 'Inscription complétée' },
            { icon: '⏳', text: 'Vérification en cours...' },
            { icon: '🔒', text: 'Accès au dashboard' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg">{s.icon}</span>
              <p className={`text-sm font-medium ${i === 1 ? 'text-amber-400' : i === 2 ? 'text-white/30' : 'text-white/70'}`}>{s.text}</p>
            </div>
          ))}
        </div>
        <button onClick={handleLogout} className="w-full py-3 text-white/40 text-sm hover:text-white transition">
          Se déconnecter
        </button>
      </div>
    </div>
  )
}

export default function PendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <PendingContent />
    </Suspense>
  )
}
