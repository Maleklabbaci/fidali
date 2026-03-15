'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function PendingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rejected = searchParams.get('rejected')
  const [merchant, setMerchant] = useState<any>(null)
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    setMerchant(JSON.parse(stored))

    // Animation des points
    const dotsInterval = setInterval(() => {
      setDots(d => d.length >= 3 ? '.' : d + '.')
    }, 600)

    // Vérifier le statut toutes les 10s
    const interval = setInterval(async () => {
      try {
        const m = JSON.parse(stored)
        const { getMerchantProfile } = await import('@/database/supabase-client')
        const profile = await getMerchantProfile(m.id)
        if (profile?.status === 'active' || profile?.status === 'approved') router.push('/dashboard')
      } catch {}
    }, 10000)

    return () => { clearInterval(interval); clearInterval(dotsInterval) }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('merchant')
    localStorage.removeItem('fidali_remember')
    sessionStorage.removeItem('merchant')
    router.push('/')
  }

  // ── PAGE REJETÉ ──
  if (rejected) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, #1a0a0a, #2d0f0f)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>❌</div>
        <h1 style={{ color: 'white', fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Demande refusée</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
          Votre demande d'inscription a été refusée par notre équipe.<br/>
          Si vous pensez que c'est une erreur, contactez-nous.
        </p>
        <a href="mailto:contact@fidali.app" style={{ display: 'block', padding: '14px', borderRadius: 12, background: 'white', color: '#1a0a0a', fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 12 }}>
          📧 Contacter le support
        </a>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
          Se déconnecter
        </button>
      </div>
    </div>
  )

  // ── PAGE EN ATTENTE ──
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, #0f0f14 0%, #1a1025 100%)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 500 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48, justifyContent: 'center' }}>
          <img src="/logo.png" alt="Fidali" style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'contain' }} />
          <span style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>Fidali</span>
        </div>

        {/* Card principale */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '40px 32px', textAlign: 'center', marginBottom: 12 }}>

          {/* Spinner animé */}
          <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 28px' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(147,51,234,0.3)', animation: 'pulse-ring 2s ease-out infinite' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(147,51,234,0.2)', animation: 'pulse-ring 2s ease-out infinite', animationDelay: '0.5s' }} />
            <div style={{ position: 'relative', zIndex: 1, width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(147,51,234,0.2), rgba(219,39,119,0.2))', border: '1px solid rgba(147,51,234,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spin-slow" style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#9333ea', borderRightColor: '#db2777' }} />
            </div>
          </div>

          {merchant && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 8 }}>
              Bonjour, <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{merchant.name || merchant.business_name}</span>
            </p>
          )}

          <h1 style={{ color: 'white', fontSize: 26, fontWeight: 800, marginBottom: 12, fontFamily: "'DM Serif Display', serif" }}>
            Configuration en cours{dots}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.75, marginBottom: 32 }}>
            Notre équipe configure votre espace et vérifie vos informations.
            Cela peut prendre quelques minutes à quelques heures.
          </p>

          {/* Étapes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, textAlign: 'left' }}>
            {[
              { icon: '✅', label: 'Inscription complétée',         done: true },
              { icon: '⚙️', label: 'Configuration du compte',        done: false, active: true },
              { icon: '🔍', label: 'Vérification par notre équipe', done: false },
              { icon: '🚀', label: 'Accès au dashboard',            done: false },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: s.active ? 'rgba(147,51,234,0.1)' : 'rgba(255,255,255,0.03)', border: s.active ? '1px solid rgba(147,51,234,0.25)' : '1px solid transparent' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
                <span style={{ fontSize: 13, fontWeight: s.active ? 600 : 400, color: s.done ? 'rgba(255,255,255,0.7)' : s.active ? '#c084fc' : 'rgba(255,255,255,0.3)' }}>
                  {s.label}
                </span>
                {s.active && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#c084fc', fontWeight: 600 }}>EN COURS</span>}
                {s.done && <span style={{ marginLeft: 'auto', fontSize: 16 }}>✓</span>}
              </div>
            ))}
          </div>

          <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, lineHeight: 1.6 }}>
              🔔 Cette page se met à jour automatiquement.<br/>
              Vous serez redirigé dès que votre compte est prêt.
            </p>
          </div>
        </div>

        <button onClick={handleLogout} style={{ width: '100%', padding: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
          Se déconnecter
        </button>

      </div>
    </div>
  )
}

export default function PendingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f14' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(147,51,234,0.3)', borderTopColor: '#9333ea', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <PendingContent />
    </Suspense>
  )
}
