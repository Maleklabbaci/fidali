'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const sectors = [
  'Restaurant / Café', 'Boulangerie / Pâtisserie', 'Salon de coiffure',
  'Boutique vêtements', 'Pharmacie', 'Supermarché', 'Salle de sport',
  'Spa / Hammam', 'Lavage auto', 'Épicerie', 'Autre',
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'login' | 'signup'>('login') // commence sur login
  const [form, setForm] = useState({ name: '', business: '', sector: '', phone: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validatePhone = (phone: string) => {
    const clean = phone.replace(/\s/g, '')
    return /^(0[5-7]\d{8}|\+213[5-7]\d{8})$/.test(clean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (!validatePhone(form.phone)) {
      setError('Numéro invalide. Format : 05xx xx xx xx')
      setLoading(false)
      return
    }
    try {
      const { signupMerchant } = await import('@/database/supabase-client')
      const result = await signupMerchant(form)
      if (result.success) router.push('/complete-profile')
      else setError(result.error || "Erreur lors de l'inscription")
    } catch { setError('Erreur de connexion au serveur') }
    finally { setLoading(false) }
  }

  const isLogin = step === 'login'

  return (
    <div className="min-h-screen flex overflow-hidden bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .fidali-gradient { background: linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #db2777 100%); }
        .input-line {
          background: transparent;
          border: none;
          border-bottom: 1.5px solid #e5e7eb;
          border-radius: 0;
          padding: 10px 0;
          width: 100%;
          font-size: 14px;
          color: #111;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-line::placeholder { color: #d1d5db; }
        .input-line:focus { border-bottom-color: #9333ea; }
        select.input-line { cursor: pointer; }
        .btn-primary {
          background: #111;
          color: white;
          width: 100%;
          padding: 13px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }
        .btn-primary:hover { opacity: 0.85; }
        .btn-primary:active { transform: scale(0.99); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .circle-deco {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .panel-left {
          transition: all 0.7s cubic-bezier(0.77,0,0.175,1);
        }
        .panel-right {
          transition: all 0.7s cubic-bezier(0.77,0,0.175,1);
        }
      `}</style>

      {/* ── PANEL COLORÉ — gauche si login, droite si signup ── */}
      <div className={`hidden lg:flex fidali-gradient relative flex-col justify-between p-14 overflow-hidden panel-left ${isLogin ? 'lg:w-[45%] order-1' : 'lg:w-[45%] order-2'}`}>
        <div className="circle-deco" style={{ width: 500, height: 500, top: -100, right: -150 }} />
        <div className="circle-deco" style={{ width: 300, height: 300, bottom: 100, left: -100 }} />
        <div className="circle-deco" style={{ width: 200, height: 200, top: '40%', right: -50 }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo-white.png" alt="Fidali" className="w-10 h-10 object-contain" />
          <span className="text-white font-bold text-xl tracking-tight">Fidali</span>
        </div>

        {/* Texte */}
        <div className="relative z-10">
          {isLogin ? (
            <>
              <p className="text-white/60 text-sm font-medium mb-3 tracking-widest uppercase">Bienvenue</p>
              <h1 className="text-white font-bold leading-tight mb-6" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontFamily: "'DM Serif Display', serif" }}>
                Bonjour,<br /><span className="italic">Fidali!</span> 👋
              </h1>
              <p className="text-white/70 text-base leading-relaxed max-w-xs">
                Gérez vos cartes de fidélité digitales et fidélisez vos clients automatiquement.
              </p>
            </>
          ) : (
            <>
              <p className="text-white/60 text-sm font-medium mb-3 tracking-widest uppercase">Rejoignez-nous</p>
              <h1 className="text-white font-bold leading-tight mb-6" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontFamily: "'DM Serif Display', serif" }}>
                Lancez votre<br /><span className="italic">programme</span><br />fidélité 🚀
              </h1>
              <p className="text-white/70 text-base leading-relaxed max-w-xs">
                Rejoignez +150 commerçants algériens qui fidélisent leurs clients avec Fidali.
              </p>
              <div className="mt-8 space-y-3">
                {['✅ Gratuit pour démarrer', '⚡ Prêt en 3 minutes', '📱 Sans application mobile'].map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <p className="text-white/80 text-sm">{t}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <p className="relative z-10 text-white/30 text-xs">© 2025 Fidali. Tous droits réservés.</p>
      </div>

      {/* ── PANEL FORMULAIRE ── */}
      <div className={`flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12 bg-white overflow-y-auto panel-right ${isLogin ? 'order-2' : 'order-1'}`}>
        {/* Logo mobile */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <img src="/logo.png" alt="Fidali" className="w-8 h-8 rounded-xl object-contain" />
          <span className="font-bold text-gray-900">Fidali</span>
        </div>

        <div className="max-w-sm w-full mx-auto lg:mx-0">

          {/* ── LOGIN ── */}
          {isLogin && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Bon retour !</h2>
                <p className="text-gray-400 text-sm">
                  Pas encore de compte ?{' '}
                  <button onClick={() => { setStep('signup'); setError('') }}
                    className="text-purple-600 font-semibold hover:underline">
                    Créer un compte, c'est gratuit
                  </button>
                </p>
              </div>

              {error && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">{error}</div>}

              <form onSubmit={async (e) => {
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
                } catch { setError('Erreur de connexion') }
                finally { setLoading(false) }
              }} className="space-y-6">
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  placeholder="votre@email.com" required className="input-line" />
                <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  placeholder="Mot de passe" required className="input-line" />
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
            </>
          )}

          {/* ── SIGNUP ── */}
          {!isLogin && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h2>
                <p className="text-gray-400 text-sm">
                  Déjà inscrit ?{' '}
                  <button onClick={() => { setStep('login'); setError('') }}
                    className="text-purple-600 font-semibold hover:underline">
                    Se connecter
                  </button>
                </p>
              </div>

              {error && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-5">
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
                <button type="submit" disabled={loading} className="btn-primary mt-2">
                  {loading ? 'Création...' : 'Créer mon compte gratuitement →'}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-gray-300 text-xs mt-8">© 2025 Fidali 💜</p>
        </div>
      </div>
    </div>
  )
}
