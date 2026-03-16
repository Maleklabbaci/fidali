'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  try {
    const { loginMerchant, getMerchantProfile } = await import('@/database/supabase-client')
    const result = await loginMerchant(email, password)
    if (result.success) {
      const merchant = result.merchant
      if (rememberMe) {
        localStorage.setItem('merchant', JSON.stringify(merchant))
        localStorage.setItem('fidali_remember', 'true')
      } else {
        sessionStorage.setItem('merchant', JSON.stringify(merchant))
        localStorage.removeItem('fidali_remember')
        localStorage.removeItem('merchant')
      }
      try {
        const profile = await getMerchantProfile(merchant.id)
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
      } catch {
        router.push('/complete-profile')
      }
    } else {
      setError(result.error || 'Email ou mot de passe incorrect')
    }
  } catch {
    setError('Erreur de connexion au serveur')
  } finally {
    setLoading(false)
  }
}

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
        .input-line::placeholder { color: #9ca3af; }
        .input-line:focus { border-bottom-color: #9333ea; }
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
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .float { animation: float 6s ease-in-out infinite; }
      `}</style>

      {/* ── GAUCHE : Panel coloré ── */}
      <div className="hidden lg:flex lg:w-[45%] fidali-gradient relative flex-col justify-between p-14 overflow-hidden">
        {/* Cercles déco */}
        <div className="circle-deco" style={{ width: 500, height: 500, top: -100, right: -150 }} />
        <div className="circle-deco" style={{ width: 300, height: 300, bottom: 100, left: -100 }} />
        <div className="circle-deco" style={{ width: 200, height: 200, top: '40%', right: -50 }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo-white.png" alt="Fidali" className="w-10 h-10 object-contain" />
          <span className="text-white font-bold text-xl tracking-tight">Fidali</span>
        </div>

        {/* Texte central */}
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium mb-3 tracking-widest uppercase">Bienvenue</p>
          <h1 className="text-white font-bold leading-tight mb-6" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontFamily: "'DM Serif Display', serif" }}>
            Bonjour,<br />
            <span className="italic">Fidali!</span> 👋
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-xs">
            Gérez vos cartes de fidélité digitales et fidélisez vos clients automatiquement.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs">© 2025 Fidali. Tous droits réservés.</p>
        </div>
      </div>

      {/* ── DROITE : Formulaire ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12 bg-white">
        {/* Logo mobile */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <img src="/logo.png" alt="Fidali" className="w-8 h-8 rounded-xl object-contain" />
          <span className="font-bold text-gray-900">Fidali</span>
        </div>

        <div className="max-w-sm w-full mx-auto lg:mx-0">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bon retour !</h2>
            <p className="text-gray-400 text-sm">
              Pas encore de compte ?{' '}
              <button onClick={() => router.push('/signup')}
                className="text-purple-600 font-semibold hover:underline">
                Créer un compte gratuitement
              </button>
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com" required
                className="input-line" />
            </div>

            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mot de passe" required
                className="input-line pr-10" />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-0 top-2.5 text-gray-300 hover:text-gray-500 text-xs">
                {showPw ? 'Cacher' : 'Voir'}
              </button>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setRememberMe(v => !v)}
                  className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center cursor-pointer ${rememberMe ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                  {rememberMe && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                </div>
                <span className="text-sm text-gray-500">Rester connecté</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-gray-300 text-xs mt-8">© 2025 Fidali 💜</p>
        </div>
      </div>
    </div>
  )
}
