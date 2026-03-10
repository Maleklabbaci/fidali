'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'

// ========== 3D CARD COMPONENT ==========
function Card3D() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [glare, setGlare] = useState({ x: 50, y: 50 })

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -15
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 15
    const moveX = ((e.clientX - centerX) / (rect.width / 2)) * 10
    const moveY = ((e.clientY - centerY) / (rect.height / 2)) * 10
    const glareX = ((e.clientX - rect.left) / rect.width) * 100
    const glareY = ((e.clientY - rect.top) / rect.height) * 100

    setRotation({ x: rotateX, y: rotateY })
    setPosition({ x: moveX, y: moveY })
    setGlare({ x: glareX, y: glareY })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return (
    <div className="perspective-[1500px] w-full flex justify-center" style={{ perspective: '1500px' }}>
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setRotation({ x: 0, y: 0 }); setPosition({ x: 0, y: 0 }) }}
        className="relative w-[380px] h-[240px] rounded-3xl cursor-pointer transition-all duration-200 ease-out"
        style={{
          transform: `
            rotateX(${rotation.x}deg) 
            rotateY(${rotation.y}deg) 
            translateX(${position.x}px) 
            translateY(${position.y}px)
            scale(${isHovered ? 1.05 : 1})
          `,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Card Background */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-2xl overflow-hidden">
          {/* Glare effect */}
          <div
            className="absolute inset-0 opacity-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
              opacity: isHovered ? 0.4 : 0,
            }}
          />

          {/* Holographic pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(${rotation.y * 2}deg, 
                  transparent 0%, 
                  rgba(255,255,255,0.1) 25%, 
                  rgba(255,255,255,0.3) 50%, 
                  rgba(255,255,255,0.1) 75%, 
                  transparent 100%
                )
              `,
            }}
          />

          {/* Card content */}
          <div className="relative z-10 p-7 h-full flex flex-col justify-between text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl" style={{ transform: 'translateZ(30px)' }}>☕</span>
                  <h3 className="text-xl font-extrabold tracking-wide">Café El Baraka</h3>
                </div>
                <p className="text-sm text-white/70">Carte de fidélité digitale</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold">
                ⭐ VIP
              </div>
            </div>

            {/* Points progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Points de fidélité</span>
                <span className="font-bold">7/10</span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-3 rounded-full transition-all duration-500"
                    style={{
                      background: i < 7
                        ? `linear-gradient(135deg, #fff ${100 - i * 10}%, rgba(255,255,255,0.7))`
                        : 'rgba(255,255,255,0.15)',
                      boxShadow: i < 7 ? '0 0 8px rgba(255,255,255,0.3)' : 'none',
                      transitionDelay: `${i * 50}ms`,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-3">
                <p className="text-sm text-white/80">🎁 10ème café offert !</p>
                <p className="text-xs text-white/50">N° 4821</p>
              </div>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* 3D Shadow */}
        <div
          className="absolute -bottom-4 left-[10%] right-[10%] h-8 rounded-full blur-2xl transition-all duration-200"
          style={{
            background: 'rgba(99, 102, 241, 0.4)',
            transform: `translateX(${position.x * 0.5}px) scaleX(${isHovered ? 0.9 : 0.8})`,
            opacity: isHovered ? 0.6 : 0.3,
          }}
        />
      </div>
    </div>
  )
}

// ========== FLOATING PARTICLES ==========
function FloatingParticles() {
  const particles = [
    { emoji: '⭐', size: 'text-2xl', left: '10%', delay: '0s', duration: '6s' },
    { emoji: '💳', size: 'text-3xl', left: '20%', delay: '1s', duration: '8s' },
    { emoji: '🎁', size: 'text-2xl', left: '35%', delay: '2s', duration: '7s' },
    { emoji: '✨', size: 'text-xl', left: '50%', delay: '0.5s', duration: '5s' },
    { emoji: '🏪', size: 'text-2xl', left: '65%', delay: '3s', duration: '9s' },
    { emoji: '📱', size: 'text-xl', left: '75%', delay: '1.5s', duration: '6s' },
    { emoji: '🎯', size: 'text-2xl', left: '85%', delay: '2.5s', duration: '7s' },
    { emoji: '💎', size: 'text-xl', left: '90%', delay: '0.8s', duration: '8s' },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className={`absolute ${p.size} opacity-20 animate-float`}
          style={{
            left: p.left,
            animation: `float ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  )
}

// ========== MOUSE FOLLOWER ==========
function MouseFollower() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }
    const handleLeave = () => setVisible(false)

    window.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <>
      {/* Outer glow */}
      <div
        className="fixed pointer-events-none z-50 mix-blend-screen transition-opacity duration-300"
        style={{
          left: pos.x - 150,
          top: pos.y - 150,
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          opacity: visible ? 1 : 0,
        }}
      />
      {/* Inner dot */}
      <div
        className="fixed pointer-events-none z-50 rounded-full transition-all duration-150 ease-out"
        style={{
          left: pos.x - 6,
          top: pos.y - 6,
          width: 12,
          height: 12,
          background: 'rgba(99, 102, 241, 0.5)',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
          opacity: visible ? 1 : 0,
        }}
      />
    </>
  )
}

// ========== ANIMATED COUNTER ==========
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [started, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ========== FEATURES ==========
const FEATURES = [
  { icon: '🎨', title: 'Carte personnalisée', desc: 'Couleurs, logo, récompense — votre carte à votre image.', color: 'from-pink-500 to-rose-500' },
  { icon: '📲', title: 'QR Code intelligent', desc: 'Scannez, rejoignez, collectez. Simple comme bonjour.', color: 'from-blue-500 to-cyan-500' },
  { icon: '⚡', title: 'Temps réel', desc: 'Validations instantanées, notifications en direct.', color: 'from-amber-500 to-orange-500' },
  { icon: '📊', title: 'Analytics', desc: 'Suivez vos performances avec des stats détaillées.', color: 'from-green-500 to-emerald-500' },
  { icon: '🎁', title: 'Récompenses auto', desc: 'Points max atteints = récompense débloquée automatiquement.', color: 'from-purple-500 to-violet-500' },
  { icon: '🔒', title: 'Anti-fraude', desc: 'Validation par le commerçant uniquement. 100% sécurisé.', color: 'from-slate-600 to-gray-700' },
]

const TESTIMONIALS = [
  { name: 'Karim B.', biz: 'Café El Yasmine', text: 'Mes clients reviennent 3x plus souvent. Fidali a tout changé !', avatar: '☕' },
  { name: 'Amina R.', biz: 'Salon Bella', text: 'Interface magnifique. Je gère tout depuis mon téléphone.', avatar: '💇‍♀️' },
  { name: 'Youcef M.', biz: 'Boulangerie Le Blé d\'Or', text: 'Fini les cartes papier perdues. C\'est le futur !', avatar: '🥖' },
]

// ========== MAIN PAGE ==========
export default function Home() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => { setIsVisible(true) }, [])

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden cursor-none md:cursor-none">
      <MouseFollower />

      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 w-full z-40 bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Fidali</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition cursor-none">Fonctionnalités</a>
            <a href="#how" className="text-sm text-gray-400 hover:text-white transition cursor-none">Comment ça marche</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition cursor-none">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/login')} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition cursor-none">
              Connexion
            </button>
            <button onClick={() => router.push('/signup')} className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-500 hover:to-purple-500 transition shadow-lg shadow-purple-600/25 cursor-none">
              Commencer gratuit
            </button>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-24 px-6 min-h-screen flex flex-col items-center justify-center">
        <FloatingParticles />

        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px]" />

        <div className={`relative z-10 max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-blue-300 px-5 py-2.5 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Plateforme #1 de fidélité en Algérie
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[0.9]">
              <span className="block text-white">La fidélité</span>
              <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                réinventée.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Carte de fidélité <span className="text-white font-semibold">100% digitale</span>. 
              Créez, partagez, fidélisez — en quelques clics. 
              Vos clients n&apos;ont besoin que de leur téléphone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <button
                onClick={() => router.push('/signup')}
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg transition-all hover:shadow-2xl hover:shadow-purple-600/30 hover:-translate-y-1 overflow-hidden cursor-none"
              >
                <span className="relative z-10">Créer ma carte — C&apos;est gratuit →</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition" />
              </button>
              <button
                onClick={() => router.push('/join')}
                className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition backdrop-blur-sm cursor-none"
              >
                📱 Je suis client
              </button>
            </div>
          </div>

          {/* 3D Card */}
          <Card3D />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-white/40 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/30 to-transparent" />
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8 relative z-10">
          {[
            { label: 'Commerçants actifs', value: 150, suffix: '+' },
            { label: 'Cartes créées', value: 500, suffix: '+' },
            { label: 'Clients fidélisés', value: 3000, suffix: '+' },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-gray-500 group-hover:text-gray-300 transition">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Tout ce qu&apos;il faut pour
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                fidéliser vos clients
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/10 hover:border-white/10 hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">
              Simple comme <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">1, 2, 3, 4</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: '01', icon: '✍️', title: 'Inscrivez-vous', desc: 'Compte gratuit en 30 secondes' },
              { n: '02', icon: '🎨', title: 'Créez votre carte', desc: 'Couleurs, points, récompense' },
              { n: '03', icon: '📱', title: 'Partagez le QR', desc: 'Affichez-le dans votre commerce' },
              { n: '04', icon: '🎉', title: 'Fidélisez !', desc: 'Points à chaque visite' },
            ].map((s, i) => (
              <div key={i} className="relative text-center group">
                {i < 3 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-purple-500/50 to-transparent" />}
                <div className="w-16 h-16 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:bg-white/20 group-hover:scale-110 transition-all relative z-10">
                  {s.icon}
                </div>
                <div className="text-xs font-bold text-purple-400 mb-2">{s.n}</div>
                <h3 className="text-lg font-bold mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">Tarifs <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">transparents</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { plan: 'Starter', price: '0', period: 'Gratuit', features: ['1 carte', '50 clients', 'QR Code', 'Stats basiques'], hl: false },
              { plan: 'Pro', price: '4 500', period: 'DA/mois', features: ['5 cartes', 'Clients illimités', 'Stats avancées', 'Support prioritaire', 'Personnalisation+'], hl: true, badge: '⭐ Populaire' },
              { plan: 'Premium', price: '9 000', period: 'DA/mois', features: ['Cartes illimitées', 'Tout illimité', 'API', 'Support dédié', 'Multi-branches'], hl: false },
            ].map((t, i) => (
              <div
                key={i}
                className={`relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                  t.hl
                    ? 'bg-gradient-to-br from-blue-600 to-purple-700 shadow-2xl shadow-purple-600/20 scale-105 border border-purple-500/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                {t.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full">
                    {t.badge}
                  </div>
                )}
                <h3 className="text-lg font-bold mb-4">{t.plan}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-extrabold">{t.price}</span>
                  <span className="text-sm ml-2 text-gray-400">{t.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {t.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/signup')}
                  className={`w-full py-3 rounded-xl font-bold transition cursor-none ${
                    t.hl ? 'bg-white text-purple-700 hover:bg-gray-100' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Choisir {t.plan}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-16">
            Ils <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">adorent</span> Fidali
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/10 transition">
                <div className="flex gap-1 text-amber-400 mb-4">{'★★★★★'}</div>
                <p className="text-gray-300 mb-6 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl">{t.avatar}</div>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.biz}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Prêt à commencer ?</h2>
              <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">Inscription gratuite. Pas de carte bancaire.</p>
              <button
                onClick={() => router.push('/signup')}
                className="px-12 py-5 bg-white text-purple-700 rounded-2xl font-extrabold text-lg hover:bg-gray-100 transition shadow-xl cursor-none"
              >
                Créer ma carte maintenant 🚀
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎯</span>
                <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Fidali</span>
              </div>
              <p className="text-gray-500 text-sm">La fidélité digitale #1 en Algérie 🇩🇿</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-300">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-white transition">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-300">Accès</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/signup" className="hover:text-white transition">Créer un compte</a></li>
                <li><a href="/login" className="hover:text-white transition">Connexion</a></li>
                <li><a href="/join" className="hover:text-white transition">Client</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-300">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>📧 contact@fidali.dz</li>
                <li>📱 0555 00 00 00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-sm text-gray-600">
            © 2025 Fidali — Tous droits réservés
          </div>
        </div>
      </footer>

      {/* ===== ANIMATIONS CSS ===== */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        
        html { scroll-behavior: smooth; }
        
        ::selection {
          background: rgba(99, 102, 241, 0.3);
          color: white;
        }
      `}</style>
    </div>
  )
}
