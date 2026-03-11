'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const STATS = [
  { value: '500+', label: 'Commerçants', icon: '🏪' },
  { value: '15K+', label: 'Clients fidèles', icon: '👥' },
  { value: '98%', label: 'Satisfaction', icon: '⭐' },
  { value: '2x', label: 'Plus de retours', icon: '📈' },
]

const FEATURES = [
  { icon: '💳', title: 'Cartes digitales', desc: 'Fini le papier. Vos clients gardent leur carte sur leur téléphone.' },
  { icon: '📱', title: 'QR Code simple', desc: 'Un scan = un point. Pas d\'app à télécharger pour vos clients.' },
  { icon: '📊', title: 'Dashboard en temps réel', desc: 'Suivez vos clients, points et récompenses en direct.' },
  { icon: '🎁', title: 'Récompenses auto', desc: 'Quand le client atteint le max, la récompense se déclenche.' },
  { icon: '🔔', title: 'Notifications', desc: 'Le client est prévenu quand il est proche de la récompense.' },
  { icon: '🎨', title: '100% personnalisable', desc: 'Couleurs, logo, récompense — tout à votre image.' },
]

const STEPS = [
  { num: '01', title: 'Inscrivez-vous', desc: 'Créez votre compte en 30 secondes', icon: '✍️' },
  { num: '02', title: 'Créez votre carte', desc: 'Personnalisez couleurs et récompense', icon: '🎨' },
  { num: '03', title: 'Partagez le QR', desc: 'Imprimez-le ou partagez le lien', icon: '📱' },
  { num: '04', title: 'Fidélisez !', desc: 'Vos clients reviennent automatiquement', icon: '🚀' },
]

const TESTIMONIALS = [
  { name: 'Karim B.', business: 'Café Central', text: 'Mes clients adorent. J\'ai vu +40% de retours en 1 mois.', rating: 5, avatar: 'K' },
  { name: 'Sarah M.', business: 'Salon Belle', text: 'Simple, efficace. Plus besoin de cartes papier qui se perdent.', rating: 5, avatar: 'S' },
  { name: 'Youcef A.', business: 'Pizza Roma', text: 'Le dashboard est top. Je vois tout en temps réel.', rating: 5, avatar: 'Y' },
]

const PLANS = [
  { name: 'Starter', price: 'Gratuit', period: '', features: ['1 carte de fidélité', '50 clients max', 'QR Code', 'Dashboard basique'], color: 'from-slate-500 to-slate-600', popular: false },
  { name: 'Pro', price: '4 500', period: 'DA/mois', features: ['5 cartes de fidélité', 'Clients illimités', 'Statistiques avancées', 'Support prioritaire', 'Export PDF'], color: 'from-indigo-500 to-violet-500', popular: true },
  { name: 'Premium', price: '9 000', period: 'DA/mois', features: ['Cartes illimitées', 'Clients illimités', 'API access', 'Support 24/7', 'Multi-établissements', 'Personnalisation totale'], color: 'from-amber-500 to-orange-500', popular: false },
]

// Carte démo interactive
function DemoCard() {
  const [points, setPoints] = useState(0)
  const [tapping, setTapping] = useState(false)
  const [rewarded, setRewarded] = useState(false)
  const [ripple, setRipple] = useState(false)
  const maxPoints = 8

  const handleTap = () => {
    if (rewarded) {
      setPoints(0)
      setRewarded(false)
      return
    }
    setTapping(true)
    setRipple(true)
    setTimeout(() => setTapping(false), 200)
    setTimeout(() => setRipple(false), 600)

    const newPoints = points + 1
    if (newPoints >= maxPoints) {
      setPoints(maxPoints)
      setTimeout(() => setRewarded(true), 500)
    } else {
      setPoints(newPoints)
    }
  }

  return (
    <div className="relative">
      <div
        onClick={handleTap}
        className={`relative w-full max-w-[400px] mx-auto rounded-[24px] overflow-hidden shadow-2xl cursor-pointer transition-transform duration-200 ${tapping ? 'scale-[0.97]' : 'scale-100 hover:scale-[1.02]'}`}
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', aspectRatio: '1.6/1' }}
      >
        {/* Ripple */}
        {ripple && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 rounded-full animate-ping" />
          </div>
        )}

        {/* Pattern */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/[0.04] rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/[0.04] rounded-full" />

        <div className="relative z-10 p-7 h-full flex flex-col justify-between text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center text-lg backdrop-blur-sm">☕</div>
              <div>
                <h3 className="text-lg font-bold">Café du Port</h3>
                <div className="flex items-center gap-1.5">
                  <img src="/logo-white.png" alt="" className="w-4 h-4 object-contain opacity-50" />
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Carte de fidélité</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-sm font-bold">{points}/{maxPoints}</span>
            </div>
          </div>

          <div>
            <div className="flex gap-[6px] mb-3">
              {Array.from({ length: maxPoints }).map((_, i) => (
                <div key={i} className="flex-1 h-[10px] rounded-full transition-all duration-500"
                  style={{
                    background: i < points ? 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.7))' : 'rgba(255,255,255,0.1)',
                    boxShadow: i < points ? '0 0 12px rgba(255,255,255,0.2)' : 'none',
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">🎁 Café offert</p>
              <p className="text-[10px] text-white/30 font-mono">CAFE-2024</p>
            </div>
          </div>
        </div>

        {/* Reward overlay */}
        {rewarded && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-[24px]">
            <div className="text-center animate-bounce">
              <p className="text-5xl mb-2">🎉</p>
              <p className="text-white font-bold text-xl">Café offert !</p>
              <p className="text-white/60 text-sm mt-1">Cliquez pour recommencer</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center mt-5">
        <p className="text-indigo-300 text-sm font-medium animate-pulse">
          {rewarded ? '🎁 Cliquez pour recommencer' : `👆 Tapez la carte pour ajouter un point (${points}/${maxPoints})`}
        </p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set([...prev, entry.target.id]))
        }
      })
    }, { threshold: 0.2 })

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const isVisible = (id: string) => visibleSections.has(id)

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-x-hidden">

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-white/5 py-3' : 'py-5'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Fidali" className="w-9 h-9 rounded-xl object-contain" />
            <span className="text-lg font-bold">Fidali</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#demo" className="text-sm text-gray-400 hover:text-white transition">Démo</a>
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition">Fonctionnalités</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">Tarifs</a>
            <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition">Avis</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/login')} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">
              Connexion
            </button>
            <button onClick={() => router.push('/signup')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-500/20">
              Commencer gratuitement
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-indigo-300">Utilisé par +500 commerçants en Algérie</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6">
              Vos clients reviennent.
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Automatiquement.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Créez votre carte de fidélité digitale en 2 minutes. Vos clients scannent un QR code, gagnent des points et reviennent plus souvent.
              <strong className="text-white"> Sans application à télécharger.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button onClick={() => router.push('/signup')} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition shadow-xl shadow-indigo-500/25 text-lg w-full sm:w-auto">
                Commencer gratuitement →
              </button>
              <a href="#demo" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-2xl transition text-lg w-full sm:w-auto text-center">
                Voir la démo ↓
              </a>
            </div>

            <p className="text-xs text-gray-600">✅ Gratuit · ✅ Sans carte bancaire · ✅ En 2 minutes</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 text-center hover:bg-white/10 transition">
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-2xl md:text-3xl font-extrabold mt-2">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" data-animate className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />

        <div className={`max-w-6xl mx-auto relative z-10 transition-all duration-1000 ${isVisible('demo') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Démo interactive</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3 mb-4">Essayez maintenant</h2>
            <p className="text-gray-400 max-w-lg mx-auto">Tapez sur la carte pour simuler les visites de vos clients. Atteignez 8 points pour débloquer la récompense !</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <DemoCard />

            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Comment ça marche ?</h3>
              {STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-indigo-500/20 transition">
                    {step.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{step.num}</span>
                      <h4 className="font-bold">{step.title}</h4>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}

              <button onClick={() => router.push('/signup')} className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-500/20">
                Créer ma carte maintenant →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" data-animate className="py-24 px-6">
        <div className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Fonctionnalités</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3 mb-4">Tout ce qu&apos;il vous faut</h2>
            <p className="text-gray-400 max-w-lg mx-auto">Un outil complet pour fidéliser vos clients sans effort.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF - Before/After */}
      <section data-animate id="proof" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />

        <div className={`max-w-6xl mx-auto relative z-10 transition-all duration-1000 ${isVisible('proof') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Résultats</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3 mb-4">Avant vs Après Fidali</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Before */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">😞</span>
                <h3 className="text-lg font-bold text-red-400">Sans Fidali</h3>
              </div>
              <div className="space-y-4">
                {[
                  'Cartes papier perdues',
                  'Clients qui ne reviennent pas',
                  'Aucune donnée sur vos clients',
                  'Pas de programme fidélité',
                  'Perte de chiffre d\'affaires',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-red-400">✗</span>
                    <p className="text-sm text-gray-400">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* After */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🚀</span>
                <h3 className="text-lg font-bold text-emerald-400">Avec Fidali</h3>
              </div>
              <div className="space-y-4">
                {[
                  'Cartes digitales sur téléphone',
                  '+40% de clients qui reviennent',
                  'Dashboard avec toutes les stats',
                  'Programme fidélité automatique',
                  'Chiffre d\'affaires en hausse',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-emerald-400">✓</span>
                    <p className="text-sm text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" data-animate className="py-24 px-6">
        <div className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Témoignages</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3 mb-4">Ils utilisent Fidali</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" data-animate className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />

        <div className={`max-w-6xl mx-auto relative z-10 transition-all duration-1000 ${isVisible('pricing') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Tarifs</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3 mb-4">Simple et transparent</h2>
            <p className="text-gray-400">Commencez gratuitement, upgradez quand vous voulez.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => (
              <div key={i} className={`rounded-2xl p-6 transition-all hover:-translate-y-1 ${plan.popular ? 'bg-indigo-500/10 border-2 border-indigo-500/30 ring-1 ring-indigo-500/20 scale-105' : 'bg-white/5 border border-white/5'}`}>
                {plan.popular && (
                  <div className="text-center mb-4">
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-wider">Le plus populaire</span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    {plan.period && <span className="text-sm text-gray-500">{plan.period}</span>}
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-400">{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push('/signup')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                >
                  {plan.price === 'Gratuit' ? 'Commencer gratuitement' : 'Choisir ce plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Prêt à fidéliser vos clients ?
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Rejoignez +500 commerçants qui utilisent Fidali pour faire revenir leurs clients automatiquement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => router.push('/signup')} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition shadow-xl shadow-indigo-500/25 text-lg">
                Créer mon compte gratuitement
              </button>
              <button onClick={() => router.push('/login')} className="px-8 py-4 text-gray-400 hover:text-white transition text-lg">
                J&apos;ai déjà un compte →
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-6">Pas de carte bancaire requise · Annulez quand vous voulez</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Fidali" className="w-8 h-8 rounded-lg object-contain" />
              <span className="font-bold">Fidali</span>
              <span className="text-xs text-gray-600">· Cartes de fidélité digitales</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="/" className="hover:text-white transition">Accueil</a>
              <a href="#features" className="hover:text-white transition">Fonctionnalités</a>
              <a href="#pricing" className="hover:text-white transition">Tarifs</a>
              <a href="/login" className="hover:text-white transition">Connexion</a>
            </div>
            <p className="text-xs text-gray-600">© 2024 Fidali. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
