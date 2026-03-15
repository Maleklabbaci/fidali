'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const sectors = [
  'Restaurant / Café', 'Boulangerie / Pâtisserie', 'Salon de coiffure',
  'Boutique vêtements', 'Pharmacie', 'Supermarché', 'Salle de sport',
  'Spa / Hammam', 'Lavage auto', 'Épicerie', 'Autre',
]

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [form, setForm] = useState({ name: '', business: '', sector: '', phone: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const switchMode = (m: 'login' | 'signup') => {
    setError('')
    setMode(m)
  }

  const validatePhone = (phone: string) => {
    const clean = phone.replace(/\s/g, '')
    return /^(0[5-7]\d{8}|\+213[5-7]\d{8})$/.test(clean)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { loginMerchant, getMerchantProfile } = await import('@/database/supabase-client')
      const result = await loginMerchant(form.email, form.password)
      if (result.success) {
        const merchant = result.merchant
        sessionStorage.setItem('merchant', JSON.stringify(merchant))
        try {
          const profile = await getMerchantProfile(merchant.id)
          if (!profile) router.push('/complete-profile')
          else if (profile.status === 'pending') router.push('/dashboard/pending')
          else if (profile.status === 'approved' || profile.status === 'active') router.push('/dashboard')
          else if (profile.status === 'rejected') router.push('/dashboard/pending?rejected=1')
          else router.push('/dashboard')
        } catch { router.push('/complete-profile') }
      } else setError(result.error || 'Email ou mot de passe incorrect')
    } catch { setError('Erreur de connexion au serveur') }
    finally { setLoading(false) }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    if (!validatePhone(form.phone)) {
      setError('Numéro invalide. Format : 05xx xx xx xx')
      setLoading(false); return
    }
    try {
      const { signupMerchant } = await import('@/database/supabase-client')
      const result = await signupMerchant(form)
      if (result.success) router.push('/complete-profile')
      else setError(result.error || "Erreur lors de l'inscription")
    } catch { setError('Erreur de connexion au serveur') }
    finally { setLoading(false) }
  }

  const isLogin = mode === 'login'

  return (
    <div className="min-h-screen flex overflow-hidden bg-white relative" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');

        .input-line {
          background: transparent;
          border: none;
          border-bottom: 1.5px solid #c4c4c4;
          border-radius: 0;
          padding: 11px 0;
          width: 100%;
          font-size: 14px;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.25s;
          font-family: 'DM Sans', sans-serif;
        }
        .input-line::placeholder { color: #9ca3af; }
        .input-line:focus { border-bottom-color: #9333ea; }
        select.input-line { cursor: pointer; }

        .btn-primary {
          background: #111;
          color: white;
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 15px;
          border: none;
          cursor: pointer;
          letter-spacing: -0.01em;
          transition: opacity 0.2s, transform 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-primary:hover { opacity: 0.88; }
        .btn-primary:active { transform: scale(0.985); }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Le container principal utilise CSS Grid pour le swap ── */
        .auth-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          width: 100%;
        }

        /* Panneau coloré */
        .panel-color {
          background: linear-gradient(135deg, #9333ea 0%, #c026d3 55%, #db2777 100%);
          padding: 3.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          /* La transition de order ne fonctionne pas en CSS pur,
             on utilise transform pour glisser */
          transition: transform 0.75s cubic-bezier(0.76, 0, 0.24, 1);
        }

        /* Quand signup : le panel coloré va à droite */
        .panel-color.is-right {
          order: 2;
        }
        .panel-color.is-left {
          order: 1;
        }

        /* Panneau formulaire */
        .panel-form {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 5rem;
          background: white;
          overflow-y: auto;
          transition: transform 0.75s cubic-bezier(0.76, 0, 0.24, 1);
        }
        .panel-form.is-right { order: 2; }
        .panel-form.is-left  { order: 1; }

        /* Cercles décoratifs */
        .deco-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.18);
          pointer-events: none;
        }

        /* Slide animation via keyframes */
        @keyframes slideFromLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideFromRight {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-from-left  { animation: slideFromLeft  0.5s cubic-bezier(0.33,1,0.68,1) both; }
        .animate-from-right { animation: slideFromRight 0.5s cubic-bezier(0.33,1,0.68,1) both; }

        @media (max-width: 1024px) {
          .auth-grid { grid-template-columns: 1fr; }
          .panel-color { display: none; }
          .panel-form { padding: 2.5rem 2rem; }
        }
      `}</style>

      <div className="auth-grid">

        {/* ── PANNEAU FORMULAIRE ── */}
        <div className={`panel-form ${isLogin ? 'is-left' : 'is-right'}`}>

          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logo.png" alt="Fidali" className="w-9 h-9 rounded-xl object-contain" />
            <span style={{ fontWeight: 800, color: '#111', fontSize: 18 }}>Fidali</span>
          </div>

          <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}
               className={isLogin ? 'animate-from-left' : 'animate-from-right'}
               key={mode}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111', marginBottom: 8, letterSpacing: '-0.03em' }}>
                {isLogin ? 'Bon retour !' : 'Créer un compte'}
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280' }}>
                {isLogin ? 'Pas encore de compte ? ' : 'Déjà inscrit ? '}
                <button onClick={() => switchMode(isLogin ? 'signup' : 'login')}
                  style={{ color: '#9333ea', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 }}>
                  {isLogin ? 'Créer un compte, c\'est gratuit' : 'Se connecter'}
                </button>
              </p>
            </div>

            {/* Erreur */}
            {error && (
              <div style={{ marginBottom: 20, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#ef4444' }}>
                {error}
              </div>
            )}

            {/* ── FORMULAIRE LOGIN ── */}
            {isLogin && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <input type="email" value={form.email}
                  onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  placeholder="votre@email.com" required className="input-line" />
                <input type="password" value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  placeholder="Mot de passe" required className="input-line" />
                <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
            )}

            {/* ── FORMULAIRE SIGNUP ── */}
            {!isLogin && (
              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <input type="text" value={form.name}
                  onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  placeholder="Votre nom complet" required className="input-line" />
                <input type="text" value={form.business}
                  onChange={e => setForm(f => ({...f, business: e.target.value}))}
                  placeholder="Nom du commerce" required className="input-line" />
                <select value={form.sector}
                  onChange={e => setForm(f => ({...f, sector: e.target.value}))}
                  required className="input-line">
                  <option value="">Secteur d'activité</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="tel" value={form.phone}
                  onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                  placeholder="05xx xx xx xx" required className="input-line" />
                <input type="email" value={form.email}
                  onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  placeholder="Email professionnel" required className="input-line" />
                <input type="password" value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  placeholder="Mot de passe (8 caractères min.)" required minLength={8} className="input-line" />
                <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4 }}>
                  {loading ? 'Création...' : 'Créer mon compte gratuitement →'}
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: 12, marginTop: 32 }}>© 2025 Fidali 💜</p>
          </div>
        </div>

        {/* ── PANNEAU COLORÉ ── */}
        <div className={`panel-color ${isLogin ? 'is-right' : 'is-left'}`}>
          {/* Cercles déco */}
          <div className="deco-circle" style={{ width: 520, height: 520, top: -120, right: -160 }} />
          <div className="deco-circle" style={{ width: 320, height: 320, bottom: 80, left: -120 }} />
          <div className="deco-circle" style={{ width: 180, height: 180, top: '45%', right: -40 }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo-white.png" alt="Fidali" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <span style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>Fidali</span>
          </div>

          {/* Texte central */}
          <div style={{ position: 'relative', zIndex: 1 }}
               className={isLogin ? 'animate-from-right' : 'animate-from-left'}
               key={`panel-${mode}`}>
            {isLogin ? (
              <>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
                  Bienvenue
                </p>
                <h1 style={{ color: 'white', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2.4rem, 3.5vw, 3.2rem)' }}>
                  Bonjour,<br /><em>Fidali!</em> 👋
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15, lineHeight: 1.65, maxWidth: 280 }}>
                  Gérez vos cartes de fidélité digitales et fidélisez vos clients automatiquement.
                </p>
              </>
            ) : (
              <>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
                  Rejoignez-nous
                </p>
                <h1 style={{ color: 'white', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2.4rem, 3.5vw, 3.2rem)' }}>
                  Lancez votre<br /><em>programme</em><br />fidélité 🚀
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15, lineHeight: 1.65, maxWidth: 280, marginBottom: 28 }}>
                  Rejoignez +150 commerçants algériens qui fidélisent leurs clients avec Fidali.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['✅ Gratuit pour démarrer', '⚡ Prêt en 3 minutes', '📱 Sans application mobile'].map(t => (
                    <p key={t} style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14 }}>{t}</p>
                  ))}
                </div>
              </>
            )}
          </div>

          <p style={{ position: 'relative', zIndex: 1, color: 'rgba(255,255,255,0.28)', fontSize: 12 }}>
            © 2025 Fidali. Tous droits réservés.
          </p>
        </div>

      </div>
    </div>
  )
}
