'use client'

import { useState, useRef, useEffect } from 'react'
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');

        * { box-sizing: border-box; }

        .input-line {
          background: transparent;
          border: none;
          border-bottom: 1.5px solid #b0b0b0;
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
          transition: opacity 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.85; }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

        .deco-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.18);
          pointer-events: none;
        }

        /* Le wrapper principal — 200% de large, contient les 2 panneaux côte à côte */
        .slider-track {
          display: flex;
          width: 200%;
          min-height: 100vh;
          transition: transform 0.72s cubic-bezier(0.76, 0, 0.24, 1);
        }
        .slider-track.to-signup {
          transform: translateX(-25%);
        }
        .slider-track.to-login {
          transform: translateX(0%);
        }

        /* Chaque "bloc" fait 50% du track = 25% de la largeur visible */
        .block {
          width: 25%;
          min-height: 100vh;
          flex-shrink: 0;
        }

        /* Contenu formulaire qui fade/slide à chaque switch */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up {
          animation: fadeUp 0.45s cubic-bezier(0.33, 1, 0.68, 1) both;
          animation-delay: 0.25s;
        }

        @media (max-width: 1024px) {
          .slider-track { width: 100%; flex-direction: column; transform: none !important; }
          .block { width: 100%; }
          .block-color { display: none !important; }
          .block-form { padding: 2.5rem 2rem !important; }
        }
      `}</style>

      {/*
        Structure :
        [FORM-login] [COLOR-login=signup] [FORM-signup] [COLOR-signup]
         25%          25%                  25%           25%
        
        Login  : translateX(0%)    → voit bloc 1 + 2
        Signup : translateX(-25%)  → voit bloc 2 + 3
        
        Le bloc 2 est le panel coloré PARTAGÉ qui glisse au milieu
      */}

      <div className={`slider-track ${isLogin ? 'to-login' : 'to-signup'}`}>

        {/* BLOC 1 — Formulaire LOGIN (visible à gauche en mode login) */}
        <div className="block block-form" style={{
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem 5rem',
          overflowY: 'auto',
        }}>
          <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}
               className={isLogin ? 'fade-up' : ''} key={`login-${isLogin}`}>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 34, fontWeight: 800, color: '#111', marginBottom: 10, letterSpacing: '-0.03em' }}>
                Bon retour !
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280' }}>
                Pas encore de compte ?{' '}
                <button onClick={() => switchMode('signup')}
                  style={{ color: '#9333ea', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 }}>
                  Créer un compte, c'est gratuit
                </button>
              </p>
            </div>
            {error && isLogin && (
              <div style={{ marginBottom: 20, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#ef4444' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                placeholder="votre@email.com" required className="input-line" />
              <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                placeholder="Mot de passe" required className="input-line" />
              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>
                {loading && isLogin ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
            <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: 12, marginTop: 32 }}>© 2025 Fidali 💜</p>
          </div>
        </div>

        {/* BLOC 2 — Panel coloré PARTAGÉ (à droite en login, à gauche en signup) */}
        <div className="block block-color" style={{
          background: 'linear-gradient(135deg, #9333ea 0%, #c026d3 55%, #db2777 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div className="deco-circle" style={{ width: 520, height: 520, top: -120, right: -160 }} />
          <div className="deco-circle" style={{ width: 320, height: 320, bottom: 80, left: -120 }} />
          <div className="deco-circle" style={{ width: 180, height: 180, top: '45%', right: -40 }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo-white.png" alt="Fidali" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <span style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>Fidali</span>
          </div>

          {/* Texte qui change selon le mode */}
          <div style={{ position: 'relative', zIndex: 1 }}
               className="fade-up" key={`color-${mode}`}>
            {isLogin ? (
              <>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>Bienvenue</p>
                <h1 style={{ color: 'white', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2.4rem, 3vw, 3.2rem)' }}>
                  Bonjour,<br /><em>Fidali!</em> 👋
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.65, maxWidth: 280 }}>
                  Gérez vos cartes de fidélité digitales et fidélisez vos clients automatiquement.
                </p>
              </>
            ) : (
              <>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>Rejoignez-nous</p>
                <h1 style={{ color: 'white', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2.4rem, 3vw, 3.2rem)' }}>
                  Lancez votre<br /><em>programme</em><br />fidélité 🚀
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.65, maxWidth: 280, marginBottom: 28 }}>
                  Rejoignez +150 commerçants algériens qui fidélisent leurs clients avec Fidali.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['✅ Gratuit pour démarrer', '⚡ Prêt en 3 minutes', '📱 Sans application mobile'].map(t => (
                    <p key={t} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{t}</p>
                  ))}
                </div>
              </>
            )}
          </div>

          <p style={{ position: 'relative', zIndex: 1, color: 'rgba(255,255,255,0.28)', fontSize: 12 }}>
            © 2025 Fidali. Tous droits réservés.
          </p>
        </div>

        {/* BLOC 3 — Formulaire SIGNUP (visible à droite en mode signup) */}
        <div className="block block-form" style={{
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem 5rem',
          overflowY: 'auto',
        }}>
          <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}
               className={!isLogin ? 'fade-up' : ''} key={`signup-${!isLogin}`}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 34, fontWeight: 800, color: '#111', marginBottom: 10, letterSpacing: '-0.03em' }}>
                Créer un compte
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280' }}>
                Déjà inscrit ?{' '}
                <button onClick={() => switchMode('login')}
                  style={{ color: '#9333ea', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 }}>
                  Se connecter
                </button>
              </p>
            </div>
            {error && !isLogin && (
              <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#ef4444' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="Votre nom complet" required className="input-line" />
              <input type="text" value={form.business} onChange={e => setForm(f => ({...f, business: e.target.value}))}
                placeholder="Nom du commerce" required className="input-line" />
              <select value={form.sector} onChange={e => setForm(f => ({...f, sector: e.target.value}))}
                required className="input-line">
                <option value="">Secteur d'activité</option>
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                placeholder="05xx xx xx xx" required className="input-line" />
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                placeholder="Email professionnel" required className="input-line" />
              <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                placeholder="Mot de passe (8 caractères min.)" required minLength={8} className="input-line" />
              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4 }}>
                {loading && !isLogin ? 'Création...' : 'Créer mon compte gratuitement →'}
              </button>
            </form>
            <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: 12, marginTop: 28 }}>© 2025 Fidali 💜</p>
          </div>
        </div>

        {/* BLOC 4 — vide (pour que le track fasse bien 200%) */}
        <div className="block" style={{ background: 'white' }} />

      </div>
    </div>
  )
}
