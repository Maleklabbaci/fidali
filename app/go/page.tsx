'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function AnimNum({ target, suffix }: { target: number; suffix: string }) {
  const [val, setVal] = useState(0)
  const { ref, inView } = useInView()
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / 60
    const t = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(t) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(t)
  }, [inView, target])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

const SECTORS = [
  { emoji: '☕', label: 'Café' },
  { emoji: '🍕', label: 'Restaurant' },
  { emoji: '💇', label: 'Salon' },
  { emoji: '🥖', label: 'Boulangerie' },
  { emoji: '💊', label: 'Pharmacie' },
  { emoji: '👕', label: 'Boutique' },
  { emoji: '🏋️', label: 'Sport' },
  { emoji: '🚗', label: 'Lavage auto' },
]

function LoyaltyCardDemo() {
  const [points, setPoints] = useState(0)
  const max = 10
  useEffect(() => {
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        setPoints(p => { if (p >= 7) { clearInterval(iv); return p } return p + 1 })
      }, 280)
      return () => clearInterval(iv)
    }, 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Glow */}
      <div className="absolute -inset-4 bg-indigo-500/20 rounded-[40px] blur-2xl" />
      {/* Card */}
      <div className="relative rounded-3xl p-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a, #4f46e5)' }}>
        {/* Pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">Carte de fidélité</p>
              <h3 className="text-white font-bold text-xl mt-0.5">☕ Café El Baraka</h3>
            </div>
            <div className="bg-white/15 px-3 py-1.5 rounded-full">
              <span className="text-white font-bold text-sm">{points}/{max}</span>
            </div>
          </div>

          <div className="flex gap-1.5 mb-5">
            {Array.from({ length: max }).map((_, i) => (
              <div key={i} className="flex-1 h-3 rounded-full transition-all duration-500"
                style={{
                  background: i < points ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.12)',
                  boxShadow: i < points ? '0 0 6px rgba(255,255,255,0.3)' : 'none',
                  transform: i === points - 1 ? 'scaleY(1.2)' : 'none',
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Récompense</p>
              <p className="text-white font-semibold text-sm">🎁 10ème café offert</p>
            </div>
            {points >= max && (
              <div className="bg-amber-400 text-amber-900 px-3 py-1.5 rounded-full text-xs font-bold animate-bounce">
                🎉 Réclamez !
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-3 -right-3 bg-white rounded-2xl px-3 py-2 shadow-xl border border-gray-100 flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-xs font-bold text-gray-700">Client scanné ✓</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const featuresRef = useInView()
  const statsRef = useInView()
  const howRef = useInView()
  const testimonialsRef = useInView()
  const pricingRef = useInView()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        .grad-text { background: linear-gradient(135deg, #818cf8, #c084fc, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .grad-border { background: linear-gradient(135deg, #6366f1, #a855f7); padding: 1px; border-radius: 16px; }
        .glow-card { box-shadow: 0 0 0 1px rgba(99,102,241,0.2), 0 20px 60px rgba(99,102,241,0.1); }
        .fade-up { opacity: 0; transform: translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .fade-up-delay-1 { transition-delay: 0.1s; }
        .fade-up-delay-2 { transition-delay: 0.2s; }
        .fade-up-delay-3 { transition-delay: 0.3s; }
        .fade-up-delay-4 { transition-delay: 0.4s; }
        .fade-up-delay-5 { transition-delay: 0.5s; }
        .noise { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ===== NAVBAR ===== */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5' : ''}`}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Fidali" className="w-8 h-8 rounded-xl object-contain" />
            <span className="text-lg font-bold text-white">Fidali</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[['#features','Fonctionnalités'],['#how','Comment ça marche'],['#pricing','Tarifs']].map(([href, label]) => (
              <a key={href} href={href} className="text-sm text-white/50 hover:text-white transition font-medium">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/login')} className="text-sm font-medium text-white/60 hover:text-white px-4 py-2 transition">Connexion</button>
            <button onClick={() => router.push('/signup')} className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl transition shadow-lg shadow-indigo-900/40">
              Commencer gratuit
            </button>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center pt-16 pb-24 px-5 md:px-8 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 noise opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                Fait pour les commerçants algériens 🇩🇿
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black leading-[1.08] tracking-tight mb-6">
                Vos clients reviennent.
                <br />
                <span className="grad-text">Toujours.</span>
              </h1>

              <p className="text-lg text-white/50 leading-relaxed mb-10 max-w-lg">
                Remplacez les cartes papier perdues par un programme de fidélité digital. Vos clients scannent, gagnent des points, et reviennent.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <button
                  onClick={() => router.push('/signup')}
                  className="group flex items-center justify-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition shadow-xl shadow-indigo-900/40 text-[15px]"
                >
                  Créer mon programme
                  <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </button>
                <button
                  onClick={() => router.push('/join')}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-2xl transition text-[15px]"
                >
                  Je suis client
                </button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['K','A','Y','M','S'].map((l,i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#09090b] flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b'][i] }}>
                      {l}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-white/40">
                  <span className="text-white font-semibold">+150 commerçants</span> nous font déjà confiance
                </p>
              </div>
            </div>

            {/* Right: Card Demo */}
            <div className="hidden lg:flex justify-center">
              <LoyaltyCardDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTORS TICKER ===== */}
      <div className="border-y border-white/5 bg-white/[0.02] py-5 overflow-hidden">
        <div className="flex gap-10 animate-[scroll_20s_linear_infinite] whitespace-nowrap">
          {[...SECTORS, ...SECTORS, ...SECTORS].map((s, i) => (
            <div key={i} className="flex items-center gap-2.5 text-white/30 shrink-0">
              <span className="text-xl">{s.emoji}</span>
              <span className="text-sm font-medium">{s.label}</span>
              <span className="text-white/10 ml-4">·</span>
            </div>
          ))}
        </div>
        <style>{`@keyframes scroll { from { transform: translateX(0) } to { transform: translateX(-33.33%) } }`}</style>
      </div>

      {/* ===== STATS ===== */}
      <section className="py-20 px-5 md:px-8">
        <div ref={statsRef.ref} className="max-w-4xl mx-auto grid grid-cols-3 gap-8 md:gap-16">
          {[
            { value: 150, suffix: '+', label: 'Commerçants actifs' },
            { value: 3000, suffix: '+', label: 'Clients fidélisés' },
            { value: 98, suffix: '%', label: 'Satisfaction' },
          ].map((s, i) => (
            <div key={i} className={`text-center fade-up ${statsRef.inView ? 'visible' : ''} fade-up-delay-${i+1}`}>
              <div className="text-3xl md:text-5xl font-black grad-text mb-1">
                {statsRef.inView ? <AnimNum target={s.value} suffix={s.suffix} /> : '0'}
              </div>
              <p className="text-sm text-white/40 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-5 md:px-8">
        <div ref={featuresRef.ref} className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 fade-up ${featuresRef.inView ? 'visible' : ''}`}>
            <div className="inline-block bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Fonctionnalités</div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Tout ce qu'il vous faut.<br/><span className="text-white/30">Rien de superflu.</span></h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🎨', title: 'Carte personnalisable', desc: 'Vos couleurs, votre récompense, vos règles. Prête en 2 minutes.', tag: 'Design' },
              { icon: '📱', title: 'QR Code universel', desc: 'Un simple scan depuis le téléphone du client. Aucune app requise.', tag: 'Mobile' },
              { icon: '✅', title: 'Validation sécurisée', desc: 'Chaque visite validée par vous. Zéro fraude possible.', tag: 'Sécurité' },
              { icon: '📊', title: 'Dashboard en temps réel', desc: 'Clients, points, récompenses — tout sous contrôle depuis votre téléphone.', tag: 'Analytics' },
              { icon: '🔔', title: 'Alertes instantanées', desc: 'Notification dès qu\'un client scanne votre QR code.', tag: 'Live' },
              { icon: '🎁', title: 'Récompenses automatiques', desc: 'Points max atteints = récompense débloquée. Automatique.', tag: 'Auto' },
            ].map((f, i) => (
              <div key={i} className={`fade-up ${featuresRef.inView ? 'visible' : ''} fade-up-delay-${i % 3 + 1}`}>
                <div className="glow-card bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-xl">{f.icon}</div>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{f.tag}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="py-24 px-5 md:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent pointer-events-none" />
        <div ref={howRef.ref} className="max-w-5xl mx-auto relative">
          <div className={`text-center mb-16 fade-up ${howRef.inView ? 'visible' : ''}`}>
            <div className="inline-block bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Comment ça marche</div>
            <h2 className="text-3xl md:text-4xl font-black text-white">Opérationnel en <span className="grad-text">3 minutes</span></h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: '01', title: 'Inscription', desc: 'Créez votre compte gratuitement en 30 secondes.', icon: '✍️' },
              { n: '02', title: 'Configurez', desc: 'Personnalisez votre carte de fidélité à vos couleurs.', icon: '⚙️' },
              { n: '03', title: 'Affichez', desc: 'Imprimez le QR code et posez-le sur votre caisse.', icon: '📲' },
              { n: '04', title: 'Fidélisez', desc: 'Vos clients scannent et accumulent des points automatiquement.', icon: '🎯' },
            ].map((s, i) => (
              <div key={i} className={`relative fade-up ${howRef.inView ? 'visible' : ''} fade-up-delay-${i+1}`}>
                {i < 3 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/10 to-transparent" />}
                <div className="glow-card bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-500/15 border border-indigo-500/25 rounded-xl flex items-center justify-center text-lg">{s.icon}</div>
                    <span className="text-xs font-black text-indigo-400">{s.n}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{s.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 px-5 md:px-8">
        <div ref={testimonialsRef.ref} className="max-w-5xl mx-auto">
          <div className={`text-center mb-14 fade-up ${testimonialsRef.inView ? 'visible' : ''}`}>
            <div className="inline-block bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Témoignages</div>
            <h2 className="text-3xl md:text-4xl font-black text-white">Ce qu'ils en disent</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Karim B.', role: 'Café El Yasmine · Alger', text: 'Mes clients reviennent deux fois plus souvent depuis que j\'ai mis le QR code sur la caisse. Simple et efficace.', avatar: 'K', color: '#6366f1' },
              { name: 'Amina R.', role: 'Salon Bella · Oran', text: 'Fini les cartes papier perdues ! Tout est digital, mes clientes adorent suivre leurs points sur le téléphone.', avatar: 'A', color: '#ec4899' },
              { name: 'Youcef M.', role: 'Boulangerie Le Blé d\'Or · Constantine', text: 'Le dashboard est parfait. Je valide les visites en 2 secondes depuis mon téléphone, c\'est exactement ce qu\'il me fallait.', avatar: 'Y', color: '#14b8a6' },
            ].map((t, i) => (
              <div key={i} className={`fade-up ${testimonialsRef.inView ? 'visible' : ''} fade-up-delay-${i+1}`}>
                <div className="glow-card bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 h-full flex flex-col">
                  <div className="flex gap-0.5 text-amber-400 mb-4">{[...Array(5)].map((_,j) => <span key={j} className="text-sm">★</span>)}</div>
                  <p className="text-white/60 leading-relaxed text-sm flex-1 mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: t.color }}>{t.avatar}</div>
                    <div>
                      <p className="text-sm font-bold text-white">{t.name}</p>
                      <p className="text-xs text-white/30">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 px-5 md:px-8">
        <div ref={pricingRef.ref} className="max-w-5xl mx-auto">
          <div className={`text-center mb-14 fade-up ${pricingRef.inView ? 'visible' : ''}`}>
            <div className="inline-block bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Tarifs</div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Commencez <span className="grad-text">gratuitement</span></h2>
            <p className="text-white/40 text-lg">Pas d'engagement. Évoluez quand vous êtes prêt.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                plan: 'Starter', price: 'Gratuit', period: '', desc: 'Pour démarrer',
                features: ['1 carte de fidélité', 'Jusqu\'à 50 clients', 'QR Code', 'Dashboard de base'],
                cta: 'Commencer gratuitement', highlight: false,
              },
              {
                plan: 'Pro', price: '2 500', period: 'DA / mois', desc: 'Pour les actifs',
                features: ['5 cartes de fidélité', 'Jusqu\'à 500 clients', 'Stats avancées', 'Personnalisation complète', 'Support prioritaire'],
                cta: 'Choisir Pro', highlight: true, badge: 'Le plus populaire',
              },
              {
                plan: 'Premium', price: '5 000', period: 'DA / mois', desc: 'Pour grandir',
                features: ['Cartes illimitées', 'Clients illimités', 'API access', 'Multi-branches', 'Support dédié'],
                cta: 'Choisir Premium', highlight: false,
              },
            ].map((t, i) => (
              <div key={i} className={`fade-up ${pricingRef.inView ? 'visible' : ''} fade-up-delay-${i+1} relative`}>
                {t.highlight && (
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-500/50 to-violet-500/50 -z-10" />
                )}
                <div className={`rounded-2xl p-6 h-full flex flex-col ${t.highlight ? 'bg-[#0f0f1a] border border-indigo-500/40' : 'bg-white/[0.03] border border-white/[0.07]'}`}>
                  {t.badge && (
                    <div className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full self-start mb-4">{t.badge}</div>
                  )}
                  <h3 className="text-lg font-black text-white">{t.plan}</h3>
                  <p className="text-white/30 text-sm mb-4">{t.desc}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-black text-white">{t.price}</span>
                    {t.period && <span className="text-white/30 text-sm ml-2">{t.period}</span>}
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {t.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-white/60">
                        <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => router.push('/signup')}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition ${t.highlight ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                  >
                    {t.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-24 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl p-10 md:p-16 text-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b)' }}>
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="relative z-10">
              <p className="text-4xl mb-5">🚀</p>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Prêt à fidéliser vos clients ?</h2>
              <p className="text-indigo-200/60 mb-8 text-lg">Inscription gratuite. Aucune carte bancaire requise.</p>
              <button
                onClick={() => router.push('/signup')}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-900 font-black rounded-2xl hover:bg-indigo-50 transition text-[15px] shadow-2xl"
              >
                Créer mon programme gratuitement
                <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-12 px-5 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Fidali" className="w-7 h-7 rounded-lg object-contain" />
            <span className="font-bold text-white">Fidali</span>
            <span className="text-white/20 text-sm ml-2">— Programme de fidélité digital pour l'Algérie</span>
          </div>
          <div className="flex items-center gap-6">
            {[['#features','Fonctionnalités'],['#pricing','Tarifs'],['#how','Comment ça marche']].map(([href, label]) => (
              <a key={href} href={href} className="text-sm text-white/30 hover:text-white transition">{label}</a>
            ))}
          </div>
          <p className="text-xs text-white/20">© 2025 Fidali · Tous droits réservés</p>
        </div>
      </footer>
    </div>
  )
}
