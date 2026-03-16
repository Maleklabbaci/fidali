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

  const switchMode = (m: 'login' | 'signup') => { setError(''); setMode(m) }

  const validatePhone = (p: string) => /^(0[5-7]\d{8}|\+213[5-7]\d{8})$/.test(p.replace(/\s/g, ''))

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault(); setLoading(true); setError('')
  try {
    const { loginMerchant, getMerchantProfile } = await import('@/database/supabase-client')
    const result = await loginMerchant(form.email, form.password)
    if (result.success) {
      sessionStorage.setItem('merchant', JSON.stringify(result.merchant))
      const profile = await getMerchantProfile(result.merchant.id).catch(() => null)
      if (!profile || profile.status === 'incomplete') {
        router.push('/complete-profile')
      } else if (profile.status === 'pending') {
        router.push('/dashboard/pending')
      } else if (profile.status === 'approved' || profile.status === 'active') {
        router.push('/dashboard')
      } else if (profile.status === 'rejected') {
        router.push('/dashboard/pending?rejected=1')
      } else {
        router.push('/complete-profile')
      }
    } else {
      setError(result.error || 'Email ou mot de passe incorrect')
    }
  } catch {
    setError('Erreur de connexion')
  } finally {
    setLoading(false)
  }
}

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    if (!validatePhone(form.phone)) { setError('Format : 05xx xx xx xx'); setLoading(false); return }
    try {
      const { signupMerchant } = await import('@/database/supabase-client')
      const result = await signupMerchant(form)
      if (result.success) router.push('/complete-profile')
      else setError(result.error || "Erreur lors de l'inscription")
    } catch { setError('Erreur de connexion') }
    finally { setLoading(false) }
  }

  const isLogin = mode === 'login'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; }

        .input-line {
          background: transparent; border: none;
          border-bottom: 1.5px solid #b0b0b0;
          padding: 11px 0; width: 100%; font-size: 14px;
          color: #1a1a1a; outline: none;
          transition: border-color 0.25s;
          font-family: 'DM Sans', sans-serif;
        }
        .input-line::placeholder { color: #9ca3af; }
        .input-line:focus { border-bottom-color: #9333ea; }

        .btn-auth {
          background: #111; color: white; width: 100%;
          padding: 14px; border-radius: 10px;
          font-weight: 700; font-size: 15px; border: none;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s;
        }
        .btn-auth:hover:not(:disabled) { opacity: 0.85; }
        .btn-auth:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Les deux panneaux formulaires sont côte à côte, fixes ── */
        .auth-root {
          display: flex;
          width: 100%;
          min-height: 100vh;
          position: relative;
        }

        .form-panel {
          width: 50%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 5rem;
          background: white;
          overflow-y: auto;
          position: relative;
          z-index: 1;
        }

        /* ── Le panel coloré est en POSITION ABSOLUE et glisse ── */
        .color-panel {
          position: absolute;
          top: 0; bottom: 0;
          width: 50%;
          z-index: 10;
          background: linear-gradient(135deg, #9333ea 0%, #c026d3 55%, #db2777 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3.5rem;
          overflow: hidden;
          /* Glisse de droite (50%) à gauche (0%) */
          transition: left 0.75s cubic-bezier(0.76, 0, 0.24, 1);
        }
        .color-panel.on-right { left: 50%; }
        .color-panel.on-left  { left: 0%; }

        .deco { position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,0.18); pointer-events: none; }

        /* Fade du contenu intérieur */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.4s cubic-bezier(0.33,1,0.68,1) 0.3s both; }

        @media (max-width: 1024px) {
          .color-panel { display: none !important; }
          .auth-root { display: block; min-height: 100vh; }
          .form-panel {
            width: 100% !important;
            padding: 2.5rem 2rem !important;
            min-height: 100vh;
          }
          /* Cacher le panel inactif sur mobile */
          .form-panel.hidden-mobile { display: none !important; }
        }
      `}</style>

      <div className="auth-root">

        {/* ── PANEL LOGIN (gauche, fixe) ── */}
        <div className={`form-panel${!isLogin ? ' hidden-mobile' : ''}`}>
          <div style={{ maxWidth: 340, width: '100%', margin: '0 auto' }}>
            <div style={{ marginBottom: 36 }}>
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
              <div style={{ marginBottom: 20, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#ef4444' }}>{error}</div>
            )}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                placeholder="votre@email.com" required className="input-line" />
              <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                placeholder="Mot de passe" required className="input-line" />
              <button type="submit" disabled={loading} className="btn-auth" style={{ marginTop: 8 }}>
                {loading && isLogin ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
            <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: 12, marginTop: 32 }}>© 2025 Fidali 💜</p>
          </div>
        </div>

        {/* ── PANEL SIGNUP (droite, fixe) ── */}
        <div className={`form-panel${isLogin ? ' hidden-mobile' : ''}`} style={{ borderLeft: '1px solid #f3f4f6' }}>
          <div style={{ maxWidth: 340, width: '100%', margin: '0 auto' }}>
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
              <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#ef4444' }}>{error}</div>
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
              <button type="submit" disabled={loading} className="btn-auth" style={{ marginTop: 4 }}>
                {loading && !isLogin ? 'Création...' : 'Créer mon compte gratuitement →'}
              </button>
            </form>
            <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: 12, marginTop: 24 }}>© 2025 Fidali 💜</p>
          </div>
        </div>

        {/* ── PANEL COLORÉ — glisse par-dessus ── */}
        <div className={`color-panel ${isLogin ? 'on-right' : 'on-left'}`}>
          {/* Cercles déco */}
          <div className="deco" style={{ width: 500, height: 500, top: -120, right: -160 }} />
          <div className="deco" style={{ width: 300, height: 300, bottom: 80, left: -120 }} />
          <div className="deco" style={{ width: 160, height: 160, top: '45%', right: -40 }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo-white.png" alt="Fidali" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <span style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>Fidali</span>
          </div>

          {/* Contenu qui change */}
          <div style={{ position: 'relative', zIndex: 1 }} className="fade-in" key={mode}>
            {isLogin ? (
              <>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>Bienvenue</p>
                <h1 style={{ color: 'white', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2.2rem, 3vw, 3.2rem)' }}>
                  Bonjour,<br /><em>Fidali!</em> 👋
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.65, maxWidth: 280 }}>
                  Gérez vos cartes de fidélité digitales et fidélisez vos clients automatiquement.
                </p>
              </>
            ) : (
              <>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>Rejoignez-nous</p>
                <h1 style={{ color: 'white', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2.2rem, 3vw, 3.2rem)' }}>
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

      </div>
    </div>
  )
}
