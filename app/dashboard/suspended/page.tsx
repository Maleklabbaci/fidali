'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SuspendedPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    setMerchant(JSON.parse(stored))
    const interval = setInterval(async () => {
      try {
        const m = JSON.parse(stored)
        const { getMerchantProfile } = await import('@/database/supabase-client')
        const profile = await getMerchantProfile(m.id)
        if (profile?.status === 'active' || profile?.status === 'approved') router.push('/dashboard')
      } catch {}
    }, 15000)
    return () => clearInterval(interval)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('merchant')
    localStorage.removeItem('fidali_remember')
    sessionStorage.removeItem('merchant')
    router.push('/')
  }

  const handleSend = async () => {
    if (!message.trim() || !merchant) return
    setSending(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      await supabase.from('messages').insert({
        merchant_id: merchant.id,
        subject: 'Reclamation — Compte suspendu',
        content: message.trim(),
        status: 'unread',
      })
      setSent(true)
      setShowForm(false)
    } catch {}
    finally { setSending(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, #0f0f14 0%, #1a1025 100%)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <div style={{ width: '100%', maxWidth: 480 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, justifyContent: 'center' }}>
          <img src="/logo.png" alt="Fidali" style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'contain' }} />
          <span style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>Fidali</span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, marginBottom: 12 }}>

          <div style={{ width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 30 }}>
            🔒
          </div>

          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
            Compte suspendu
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, textAlign: 'center', marginBottom: 24 }}>
            Votre compte a été temporairement suspendu.<br/>
            Notre équipe va vérifier la situation et vous recontactera rapidement.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {[
              { icon: '🔍', title: 'Vérification en cours', desc: 'Notre équipe examine votre compte' },
              { icon: '📬', title: 'Réponse sous 24-48h', desc: 'Vous serez notifié par email' },
              { icon: '✅', title: 'Réactivation', desc: "Votre accès sera rétabli après vérification" },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
                <div>
                  <p style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{s.title}</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {!sent ? (
            !showForm ? (
              <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.3)', color: '#c084fc', fontFamily: "'DM Sans', sans-serif" }}>
                📩 Envoyer une réclamation
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                  placeholder="Décrivez votre situation en détail..."
                  style={{ width: '100%', borderRadius: 12, padding: 12, fontSize: 14, resize: 'none', outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: "'DM Sans', sans-serif" }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 14, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>
                    Annuler
                  </button>
                  <button onClick={handleSend} disabled={sending || !message.trim()} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #9333ea, #db2777)', border: 'none', color: 'white', opacity: (sending || !message.trim()) ? 0.5 : 1, fontFamily: "'DM Sans', sans-serif" }}>
                    {sending ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div style={{ padding: 14, borderRadius: 12, textAlign: 'center', fontSize: 14, fontWeight: 600, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
              ✅ Réclamation envoyée — on vous répond bientôt
            </div>
          )}
        </div>

        <button onClick={handleLogout} style={{ width: '100%', padding: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
