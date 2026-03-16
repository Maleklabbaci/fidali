'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'

function PendingContent() {
  const router = useRouter()
  const [status, setStatus] = useState<'pending' | 'rejected' | 'loading'>('loading')
  const [merchant, setMerchant] = useState<any>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }

    const m = JSON.parse(stored)
    setMerchant(m)

    const checkStatus = async () => {
      try {
        const { getMerchantProfile } = await import('@/database/supabase-client')
        const profile = await getMerchantProfile(m.id)

        if (!profile) {
          setStatus('rejected')
          return
        }

        if (profile.status === 'active' || profile.status === 'approved') {
          router.push('/dashboard')
          return
        }

        if (profile.status === 'rejected') {
          setStatus('rejected')
          return
        }

        if (profile.status === 'suspended') {
          router.push('/dashboard/suspended')
          return
        }

        setStatus('pending')
      } catch {
        setStatus('pending')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 10000)
    return () => clearInterval(interval)
  }, [router])

  const handleRejectionAcknowledged = async () => {
    setLoggingOut(true)
    try {
      if (merchant) {
        await fetch('/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-id': 'system' },
          body: JSON.stringify({ action: 'cleanup_merchant', merchantId: merchant.id }),
        })
      }

      const { logout } = await import('@/database/supabase-client')
      await logout()
    } catch (e) {
      console.error('Cleanup error:', e)
    }

    localStorage.removeItem('merchant')
    sessionStorage.removeItem('merchant')
    localStorage.removeItem('fidali_remember')
    router.push('/login')
  }

  // ── LOADING ──
  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f14 0%, #1a1025 100%)',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: 'rgba(255,255,255,0.6)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── REJETÉ ──
  if (status === 'rejected') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #0f0f14 0%, #1a1025 100%)',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');`}</style>

        <div style={{
          maxWidth: 480, width: '100%', textAlign: 'center',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: 24, padding: '48px 32px',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: 36,
          }}>
            😔
          </div>

          <h1 style={{
            color: 'white', fontSize: 26, fontWeight: 800, marginBottom: 12,
            fontFamily: "'DM Serif Display', serif",
          }}>
            Demande refusée
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, marginBottom: 12,
          }}>
            Nous sommes désolés, votre demande d{"'"}inscription sur
            <span style={{ color: 'rgba(147,51,234,0.8)', fontWeight: 600 }}> Fidali </span>
            n{"'"}a pas été approuvée.
          </p>

          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 14, padding: '16px 20px', marginBottom: 28,
          }}>
            <p style={{ color: 'rgba(239,68,68,0.7)', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
              ⚠️ Motif du refus
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 }}>
              Votre profil ne correspond pas aux critères requis pour le moment.
              Cette décision a été prise pour des raisons internes à la plateforme.
            </p>
          </div>

          <p style={{
            color: 'rgba(255,255,255,0.3)', fontSize: 12, lineHeight: 1.6, marginBottom: 32,
          }}>
            Votre compte sera supprimé automatiquement.
            Vous pouvez vous réinscrire ultérieurement avec le même email
            si vous remplissez les conditions.
          </p>

          <button
            onClick={handleRejectionAcknowledged}
            disabled={loggingOut}
            style={{
              width: '100%', padding: '14px 24px', borderRadius: 12,
              border: 'none', cursor: loggingOut ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: 15,
              background: loggingOut ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.15)',
              color: loggingOut ? 'rgba(255,255,255,0.3)' : '#f87171',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s',
            }}
          >
            {loggingOut ? 'Déconnexion en cours...' : 'Compris, me déconnecter'}
          </button>

          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 20 }}>
            Des questions ? Contactez-nous à <span style={{ color: 'rgba(147,51,234,0.5)' }}>support@fidali.app</span>
          </p>
        </div>
      </div>
    )
  }

  // ── EN ATTENTE ──
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0f0f14 0%, #1a1025 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      <div style={{
        maxWidth: 480, width: '100%', textAlign: 'center',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24, padding: '48px 32px',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(245,158,11,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 36,
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          ⏳
        </div>

        <h1 style={{
          color: 'white', fontSize: 26, fontWeight: 800, marginBottom: 12,
          fontFamily: "'DM Serif Display', serif",
        }}>
          En attente de validation
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, marginBottom: 32,
        }}>
          Votre demande d{"'"}inscription sur
          <span style={{ color: 'rgba(147,51,234,0.8)', fontWeight: 600 }}> Fidali </span>
          a bien été reçue ! Notre équipe examine votre dossier.
        </p>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          textAlign: 'left', marginBottom: 32,
        }}>
          {[
            { icon: '✅', text: 'Inscription complétée', done: true },
            { icon: '✅', text: 'Profil soumis', done: true },
            { icon: '⏳', text: "Validation par l'équipe Fidali", done: false },
            { icon: '⬜', text: 'Accès au dashboard', done: false },
          ].map((step, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 12,
              background: step.done ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${step.done ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)'}`,
            }}>
              <span style={{ fontSize: 18 }}>{step.icon}</span>
              <span style={{
                fontSize: 13, fontWeight: 500,
                color: step.done ? 'rgba(16,185,129,0.7)' : 'rgba(255,255,255,0.3)',
              }}>
                {step.text}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(147,51,234,0.08)',
          border: '1px solid rgba(147,51,234,0.15)',
          borderRadius: 14, padding: '14px 18px', marginBottom: 24,
        }}>
          <p style={{ color: 'rgba(147,51,234,0.6)', fontSize: 12 }}>
            🔄 Cette page se met à jour automatiquement toutes les 10 secondes
          </p>
        </div>

        <button
          onClick={async () => {
            const { logout } = await import('@/database/supabase-client')
            await logout()
            localStorage.removeItem('merchant')
            sessionStorage.removeItem('merchant')
            router.push('/login')
          }}
          style={{
            background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)',
            border: 'none', padding: '12px 24px', borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Se déconnecter
        </button>

        <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 20 }}>
          © 2025 Fidali 💜
        </p>
      </div>
    </div>
  )
}

// ✅ Wrapper avec Suspense pour éviter l'erreur Next.js
export default function PendingPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f14 0%, #1a1025 100%)',
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: 'rgba(255,255,255,0.6)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    }>
      <PendingContent />
    </Suspense>
  )
}
