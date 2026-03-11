'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'

// ========== 3D CARD ==========
function HeroCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rot, setRot] = useState({ x: 0, y: 0 })
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hover, setHover] = useState(false)
  const [glare, setGlare] = useState({ x: 50, y: 50 })
  const [points, setPoints] = useState(0)

  // Animation des points
  useEffect(() => {
    const timer = setInterval(() => {
      setPoints((p) => (p >= 7 ? 7 : p + 1))
    }, 800)
    return () => clearInterval(timer)
  }, [])

  const handleMove = useCallback((e: MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setRot({
      x: ((e.clientY - cy) / (rect.height / 2)) * -12,
      y: ((e.clientX - cx) / (rect.width / 2)) * 12,
    })
    setPos({
      x: ((e.clientX - cx) / (rect.width / 2)) * 8,
      y: ((e.clientY - cy) / (rect.height / 2)) * 8,
    })
    setGlare({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [handleMove])

  return (
    <div style={{ perspective: '1200px' }} className="w-full flex justify-center lg:justify-end">
      <div
        ref={cardRef}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => { setHover(false); setRot({ x: 0, y: 0 }); setPos({ x: 0, y: 0 }) }}
        className="relative cursor-pointer"
        style={{
          width: '420px',
          height: '260px',
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) translateX(${pos.x}px) translateY(${pos.y}px) scale(${hover ? 1.03 : 1})`,
          transformStyle: 'preserve-3d',
          transition: hover ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
        }}
      >
        {/* Card body */}
        <div className="absolute inset-0 rounded-[24px] overflow-hidden shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 40%, #1a4a72 100%)' }}
        >
          {/* Glare */}
          <div className="absolute inset-0 transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.25) 0%, transparent 55%)`,
              opacity: hover ? 0.6 : 0,
            }}
          />

          {/* Holographic stripe */}
          <div className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `linear-gradient(${rot.y * 3}deg, transparent 0%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 55%, transparent 100%)`,
            }}
          />

          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center text-base backdrop-blur-sm">
                    ☕
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-wide">Café El Baraka</h3>
                    <p className="text-[11px] text-white/50 font-medium tracking-wider uppercase">Carte de fidélité</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full">
                <span className="text-xs font-semibold text-white/90">{points}/10</span>
              </div>
            </div>

            <div>
              <div className="flex gap-[6px] mb-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-[10px] rounded-full transition-all duration-500"
                    style={{
                      background: i < points
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.7))'
                        : 'rgba(255,255,255,0.1)',
                      boxShadow: i < points ? '0 0 12px rgba(255,255,255,0.2)' : 'none',
                      transitionDelay: `${i * 60}ms`,
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/60 font-medium">10ème café offert</p>
                <p className="text-[11px] text-white/30 font-mono">N° 4821</p>
              </div>
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/[0.04] rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/[0.04] rounded-full" />
        </div>

        {/* Shadow */}
        <div className="absolute -bottom-6 left-[8%] right-[8%] h-10 rounded-full blur-2xl"
          style={{
            background: 'rgba(30, 58, 95, 0.35)',
            transform: `translateX(${pos.x * 0.4}px) scaleX(${hover ? 0.92 : 0.85})`,
            opacity: hover ? 0.5 : 0.3,
            transition: 'all 0.3s ease-out',
          }}
        />
      </div>
    </div>
  )
}

// ========== ANIMATED NUMBER ==========
function AnimNum({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true) }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let cur = 0
    const inc = target / 50
    const timer = setInterval(() => {
      cur += inc
      if (cur >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.floor(cur))
    }, 30)
    return () => clearInterval(timer)
  }, [started, target])

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

// ========== MAIN PAGE ==========
export default function Home() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => { setVisible(true) }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">

      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Fidali</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">Fonctionnalités</a>
            <a href="#how" className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">Fonctionnement</a>
            <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">Tarifs</a>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/login')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition px-4 py-2">
              Se connecter
            </button>
            <button onClick={() => router.push('/signup')} className="text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 px-5 py-2.5 rounded-xl transition">
              Commencer
            </button>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] opacity-60 -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-[100px] opacity-40 -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className={`grid lg:grid-cols-2 gap-16 items-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                Programme de fidélité digital
              </div>

              <h1 className="text-[3.5rem] lg:text-[4.2rem] font-extrabold leading-[1.05] tracking-tight text-gray-900 mb-6">
                Fidélisez vos
                <br />
                clients,{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  simplement.
                </span>
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl">
                Remplacez les cartes papier par une solution digitale élégante.
                Vos clients collectent des points en scannant un QR code.
                Vous suivez tout depuis votre tableau de bord.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={() => router.push('/signup')}
                  className="group px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold text-base hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20"
                >
                  Créer mon programme
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => router.push('/join')}
                  className="px-8 py-4 bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl font-semibold text-base hover:bg-gray-100 hover:border-gray-300 transition-all"
                >
                  Je suis client
                </button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500'].map((c, i) => (
                    <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                      {['K', 'A', 'Y', 'S'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500 text-sm">★★★★★</div>
                  <p className="text-xs text-gray-400 mt-0.5">Utilisé par <strong className="text-gray-600">150+</strong> commerçants</p>
                </div>
              </div>
            </div>

            {/* Right: 3D Card */}
            <div className="hidden lg:block">
              <HeroCard />
            </div>
          </div>
        </div>
      </section>

      {/* ===== LOGOS / TRUST ===== */}
      <section className="py-12 px-6 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-gray-400 uppercase tracking-widest font-medium mb-8">Adapté à tous les secteurs</p>
          <div className="flex justify-center items-center gap-12 flex-wrap">
            {[
              { emoji: '☕', label: 'Cafés' },
              { emoji: '🍕', label: 'Restaurants' },
              { emoji: '💇', label: 'Salons' },
              { emoji: '🥖', label: 'Boulangeries' },
              { emoji: '💊', label: 'Pharmacies' },
              { emoji: '👕', label: 'Boutiques' },
              { emoji: '🏋️', label: 'Sport' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition">
                <span className="text-xl opacity-60">{s.emoji}</span>
                <span className="text-sm font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-12">
          {[
            { value: 150, suffix: '+', label: 'Commerçants actifs', sub: 'à travers l\'Algérie' },
            { value: 3000, suffix: '+', label: 'Clients fidélisés', sub: 'et ça continue' },
            { value: 98, suffix: '%', label: 'Satisfaction', sub: 'de nos utilisateurs' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                <AnimNum target={s.value} suffix={s.suffix} />
              </div>
              <p className="text-sm font-medium text-gray-900">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-semibold text-blue-600 mb-3">FONCTIONNALITÉS</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Tout ce dont vous avez besoin pour fidéliser
            </h2>
            <p className="text-lg text-gray-500">
              Une plateforme complète, conçue pour les commerçants qui veulent passer au digital sans complexité.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🎨',
                title: 'Carte personnalisable',
                desc: 'Choisissez vos couleurs, votre récompense et vos règles de points. Votre carte, votre identité.',
                tag: 'Design',
              },
              {
                icon: '📱',
                title: 'QR Code intelligent',
                desc: 'Un simple scan suffit. Pas d\'application à installer. Fonctionne sur tous les téléphones.',
                tag: 'Mobile',
              },
              {
                icon: '✅',
                title: 'Validation sécurisée',
                desc: 'Chaque visite doit être confirmée par vous. Anti-fraude avec cooldown et limites quotidiennes.',
                tag: 'Sécurité',
              },
              {
                icon: '📊',
                title: 'Tableau de bord',
                desc: 'Suivez vos clients, points distribués et récompenses en temps réel depuis un dashboard clair.',
                tag: 'Analytics',
              },
              {
                icon: '🔔',
                title: 'Notifications live',
                desc: 'Recevez une alerte instantanée quand un client scanne votre QR code. Validez en un clic.',
                tag: 'Temps réel',
              },
              {
                icon: '🎁',
                title: 'Récompenses automatiques',
                desc: 'Quand un client atteint le maximum de points, la récompense se débloque automatiquement.',
                tag: 'Automation',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl p-7 border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 bg-gray-50 group-hover:bg-blue-50 rounded-xl flex items-center justify-center text-2xl transition-colors">
                    {f.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 px-2.5 py-1 rounded-full">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 mb-3">FONCTIONNEMENT</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Opérationnel en 3 minutes
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              De l&apos;inscription à votre premier client fidélisé
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { n: '01', title: 'Inscription', desc: 'Créez votre compte commerçant gratuitement.', icon: '✍️' },
              { n: '02', title: 'Configuration', desc: 'Personnalisez votre carte et vos règles.', icon: '⚙️' },
              { n: '03', title: 'Partage', desc: 'Affichez le QR code dans votre commerce.', icon: '📲' },
              { n: '04', title: 'Fidélisation', desc: 'Vos clients gagnent des points à chaque visite.', icon: '🎯' },
            ].map((s, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-10 left-[55%] w-[90%] h-px bg-gradient-to-r from-gray-200 to-transparent" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm">
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold text-blue-600 mb-1 block">{s.n}</span>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURE HIGHLIGHT ===== */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Dashboard mockup */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs text-gray-400 ml-2">dashboard.fidali.dz</span>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Clients', value: '127', color: 'bg-blue-50 text-blue-700' },
                  { label: 'Visites/j', value: '34', color: 'bg-green-50 text-green-700' },
                  { label: 'Récompenses', value: '18', color: 'bg-purple-50 text-purple-700' },
                ].map((k, i) => (
                  <div key={i} className={`${k.color} rounded-xl p-3 text-center`}>
                    <div className="text-xl font-extrabold">{k.value}</div>
                    <div className="text-[10px] font-medium opacity-70">{k.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Ahmed B.', pts: '8/10', pct: 80, time: '14:32' },
                  { name: 'Sarah M.', pts: '5/10', pct: 50, time: '13:15' },
                  { name: 'Youcef K.', pts: '10/10', pct: 100, time: '12:48' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-[10px] text-gray-400">{c.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${c.pct >= 100 ? 'bg-yellow-400' : 'bg-blue-500'}`} style={{ width: `${c.pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-600 w-10 text-right">{c.pts}</span>
                      {c.pct >= 100 && <span className="text-sm">🎁</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Text */}
            <div>
              <p className="text-sm font-semibold text-blue-600 mb-3">TABLEAU DE BORD</p>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                Tout sous contrôle, en temps réel
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Suivez chaque visite, chaque point distribué et chaque récompense depuis un dashboard intuitif. Recevez des notifications instantanées quand un client scanne votre QR code.
              </p>

              <div className="space-y-4">
                {[
                  { icon: '📊', title: 'Statistiques détaillées', desc: 'Visites, points, récompenses — tout en un coup d\'œil.' },
                  { icon: '🔔', title: 'Alertes en temps réel', desc: 'Notification instantanée à chaque scan client.' },
                  { icon: '🎁', title: 'Gestion des récompenses', desc: 'Un clic pour valider une visite ou offrir la récompense.' },
                ].map((f, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{f.title}</h4>
                      <p className="text-sm text-gray-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 mb-3">TARIFS</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Commencez gratuitement
            </h2>
            <p className="text-lg text-gray-500">
              Pas d&apos;engagement. Évoluez quand vous êtes prêt.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                plan: 'Starter',
                price: '0',
                period: 'Gratuit',
                desc: 'Pour découvrir',
                features: ['1 carte de fidélité', '50 clients', 'QR Code', 'Dashboard basique'],
                cta: 'Commencer',
                highlight: false,
              },
              {
                plan: 'Pro',
                price: '4 500',
                period: 'DA / mois',
                desc: 'Pour les commerces actifs',
                features: ['5 cartes de fidélité', 'Clients illimités', 'Statistiques avancées', 'Support prioritaire', 'Personnalisation complète'],
                cta: 'Choisir Pro',
                highlight: true,
                badge: 'Populaire',
              },
              {
                plan: 'Premium',
                price: '9 000',
                period: 'DA / mois',
                desc: 'Pour les entreprises',
                features: ['Cartes illimitées', 'Tout illimité', 'API & intégrations', 'Support dédié', 'Multi-points de vente'],
                cta: 'Nous contacter',
                highlight: false,
              },
            ].map((t, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  t.highlight
                    ? 'bg-gray-900 text-white shadow-2xl shadow-gray-900/20 scale-[1.02]'
                    : 'bg-white text-gray-900 border border-gray-200 hover:shadow-lg'
                }`}
              >
                {t.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    {t.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-1">{t.plan}</h3>
                  <p className={`text-sm ${t.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{t.desc}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">{t.price}</span>
                  <span className={`text-sm ml-2 ${t.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{t.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {t.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2.5 text-sm ${t.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                      <svg className={`w-4 h-4 shrink-0 ${t.highlight ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/signup')}
                  className={`w-full py-3 rounded-xl font-semibold transition ${
                    t.highlight
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {t.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 mb-3">TÉMOIGNAGES</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Ce qu&apos;ils en disent</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Karim B.', role: 'Café El Yasmine, Alger', text: 'Mes clients reviennent plus souvent. Le système de points les motive vraiment. Simple et efficace.', avatar: 'K' },
              { name: 'Amina R.', role: 'Salon Bella, Oran', text: 'J\'ai remplacé mes cartes papier. Plus de cartes perdues, tout est digital. Mes clientes adorent.', avatar: 'A' },
              { name: 'Youcef M.', role: 'Boulangerie Le Blé d\'Or', text: 'Le dashboard est très clair. Je vois en temps réel combien de clients reviennent. Excellent outil.', avatar: 'Y' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-sm">★</span>)}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Prêt à fidéliser vos clients ?
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            Inscription gratuite en 2 minutes. Aucune carte bancaire requise. Commencez aujourd&apos;hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/signup')}
              className="group px-10 py-4 bg-gray-900 text-white rounded-2xl font-semibold text-base hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/10"
            >
              Créer mon programme gratuit
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button
              onClick={() => router.push('/join')}
              className="px-10 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-semibold text-base hover:bg-gray-50 transition-all"
            >
              Rejoindre en tant que client
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-100 bg-gray-50 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">F</span>
                </div>
                <span className="text-lg font-bold text-gray-900">Fidali</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Programme de fidélité digital pour les commerçants en Algérie.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Produit</h4>
              <ul className="space-y-2.5">
                {['Fonctionnalités', 'Tarifs', 'FAQ'].map((l) => (
                  <li key={l}><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Accès</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Créer un compte', href: '/signup' },
                  { label: 'Se connecter', href: '/login' },
                  { label: 'Rejoindre', href: '/join' },
                ].map((l) => (
                  <li key={l.label}><a href={l.href} className="text-sm text-gray-500 hover:text-gray-900 transition">{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Contact</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li>contact@fidali.dz</li>
                <li>0555 00 00 00</li>
                <li>Alger, Algérie</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-xs text-gray-400">© 2025 Fidali — Tous droits réservés</p>
          </div>
        </div>
      </footer>

      {/* ===== Smooth scroll ===== */}
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        ::selection { background: rgba(59, 130, 246, 0.15); }
      `}</style>
    </div>
  )
}
