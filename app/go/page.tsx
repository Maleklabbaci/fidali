'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Photos Unsplash gratuites
const PHOTOS = {
  hero: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
  cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
  boulangerie: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
  phone: 'https://images.unsplash.com/photo-1556742077-0a6b6a4a4ac4?w=600&q=80',
  team: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80',
  happy: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=600&q=80',
  shop: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
  qr: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=600&q=80',
  graph: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  client: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80',
}

function DemoCard() {
  const [points, setPoints] = useState(0)
  const [tapping, setTapping] = useState(false)
  const [rewarded, setRewarded] = useState(false)
  const max = 8

  const tap = () => {
    if (rewarded) { setPoints(0); setRewarded(false); return }
    setTapping(true)
    setTimeout(() => setTapping(false), 150)
    const n = points + 1
    if (n >= max) { setPoints(max); setTimeout(() => setRewarded(true), 400) }
    else setPoints(n)
  }

  return (
    <div onClick={tap} className={`relative w-full max-w-[380px] mx-auto rounded-[24px] overflow-hidden shadow-2xl cursor-pointer transition-transform duration-200 ${tapping ? 'scale-[0.97]' : 'hover:scale-[1.02]'}`}
      style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', aspectRatio: '1.6/1' }}>
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/[0.04] rounded-full" />
      <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur-sm">☕</div>
            <div>
              <h3 className="font-bold">Café du Port</h3>
              <div className="flex items-center gap-1.5">
                <img src="/logo-white.png" alt="" className="w-3.5 h-3.5 object-contain opacity-50" />
                <p className="text-[9px] text-white/40 uppercase tracking-wider">Fidélité</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 px-2.5 py-1 rounded-full text-xs font-bold">{points}/{max}</div>
        </div>
        <div>
          <div className="flex gap-[5px] mb-2">
            {Array.from({ length: max }).map((_, i) => (
              <div key={i} className="flex-1 h-[9px] rounded-full transition-all duration-500"
                style={{ background: i < points ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)', boxShadow: i < points ? '0 0 10px rgba(255,255,255,0.2)' : 'none', transitionDelay: `${i * 50}ms` }} />
            ))}
          </div>
          <p className="text-xs text-white/50">🎁 Café offert</p>
        </div>
      </div>
      {rewarded && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-[24px]">
          <div className="text-center animate-bounce">
            <p className="text-5xl mb-2">🎉</p>
            <p className="text-white font-bold text-xl">Café offert !</p>
            <p className="text-white/50 text-xs mt-1">Cliquez pour recommencer</p>
          </div>
        </div>
      )}
    </div>
  )
}

function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started) return
    let current = 0
    const step = Math.ceil(end / 40)
    const timer = setInterval(() => {
      current += step
      if (current >= end) { setCount(end); clearInterval(timer) }
      else setCount(current)
    }, 30)
    return () => clearInterval(timer)
  }, [started, end])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStarted(true)
    }, { threshold: 0.5 })
    const el = document.getElementById(`counter-${end}`)
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [end])

  return <span id={`counter-${end}`}>{count.toLocaleString()}{suffix}</span>
}

export default function GoPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const CTA = ({ text = 'Commencer gratuitement', big = false }) => (
    <button onClick={() => router.push('/signup')} className={`${big ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-sm'} bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98]`}>
      {text}
    </button>
  )

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-x-hidden">

      {/* ============ NAV ============ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a1a]/95 backdrop-blur-xl border-b border-white/5 py-3' : 'py-5'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Fidali" className="w-9 h-9 rounded-xl object-contain" />
            <span className="text-lg font-bold">Fidali</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#why" className="hover:text-white transition">Pourquoi</a>
            <a href="#demo" className="hover:text-white transition">Démo</a>
            <a href="#sectors" className="hover:text-white transition">Secteurs</a>
            <a href="#pricing" className="hover:text-white transition">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/login')} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition hidden sm:block">Connexion</button>
            <button onClick={() => router.push('/signup')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition">
              Essai gratuit
            </button>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative pt-28 pb-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[85vh]">
            {/* Texte */}
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-emerald-300">🇩🇿 +500 commerçants en Algérie</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] mb-6">
                Arrêtez de perdre
                <br />des clients.
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Fidélisez-les.
                </span>
              </h1>

              <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-lg">
                Vos clients viennent une fois et ne reviennent jamais ?
                <strong className="text-white"> Fidali crée une carte de fidélité digitale </strong>
                qui les fait revenir <strong className="text-white">encore et encore</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <CTA text="Créer ma carte gratuitement →" big />
                <a href="#demo" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 font-semibold rounded-2xl transition text-center text-lg">
                  Voir la démo
                </a>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">✅ Gratuit</span>
                <span className="flex items-center gap-1.5">✅ 2 minutes</span>
                <span className="flex items-center gap-1.5">✅ Sans app</span>
              </div>
            </div>

            {/* Image + Social proof */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10">
                <img src={PHOTOS.hero} alt="Commerce" className="w-full h-[450px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-lg">✓</div>
                      <div>
                        <p className="text-sm font-bold text-white">+247 clients fidélisés ce mois</p>
                        <p className="text-xs text-white/50">Chez Café Central, Alger</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-3 shadow-xl animate-float hidden lg:block">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <p className="text-xs font-bold">Récompense débloquée !</p>
                    <p className="text-[10px] text-gray-400">Il y a 2 min</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-3 shadow-xl animate-float-delayed hidden lg:block">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-xs font-bold">5/5 — &ldquo;Super service&rdquo;</p>
                    <p className="text-[10px] text-gray-400">Sarah M.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logos clients */}
        <div className="border-t border-white/5 mt-16 py-8">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-xs text-gray-600 mb-6 uppercase tracking-widest">Ils nous font confiance</p>
            <div className="flex items-center justify-center gap-12 flex-wrap opacity-30">
              {['Café Central', 'Pizza Roma', 'Salon Belle', 'Boulangerie Épi', 'Resto Le Phare', 'Gym Atlas'].map((n, i) => (
                <span key={i} className="text-sm font-bold tracking-wider">{n}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROBLÈME ============ */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/[0.03] to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Le problème</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-3">
              Vous perdez <span className="text-red-400">67%</span> de vos clients
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
              Un client satisfait qui ne revient pas, c&apos;est du chiffre d&apos;affaires perdu. Chaque jour.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: '💸', stat: '67%', title: 'Ne reviennent jamais', desc: 'Des clients satisfaits qui oublient simplement votre commerce.' },
              { icon: '📉', stat: '5x', title: 'Plus cher', desc: 'Acquérir un nouveau client coûte 5x plus cher que fidéliser.' },
              { icon: '🗑️', stat: '80%', title: 'Cartes perdues', desc: 'Des cartes de fidélité papier finissent à la poubelle.' },
            ].map((p, i) => (
              <div key={i} className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 text-center hover:bg-red-500/10 transition">
                <span className="text-3xl">{p.icon}</span>
                <p className="text-4xl font-extrabold text-red-400 mt-3">{p.stat}</p>
                <h3 className="font-bold mt-2 text-lg">{p.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold mb-4">La solution ?</p>
            <p className="text-lg text-gray-400 mb-6">Un programme de fidélité <strong className="text-white">digital, simple et gratuit</strong>.</p>
            <CTA text="Essayer Fidali gratuitement →" big />
          </div>
        </div>
      </section>

      {/* ============ POURQUOI FIDALI ============ */}
      <section id="why" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Pourquoi Fidali</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-3">10 raisons de choisir Fidali</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '📱', title: 'Pas d\'app à télécharger', desc: 'Vos clients scannent un QR code. C\'est tout. Pas d\'app, pas de friction.', img: PHOTOS.phone },
              { icon: '⚡', title: 'Prêt en 2 minutes', desc: 'Inscrivez-vous, créez votre carte, imprimez le QR. C\'est parti.', img: PHOTOS.qr },
              { icon: '💰', title: 'Gratuit pour commencer', desc: 'Le plan Starter est 100% gratuit. Pas de carte bancaire.', img: null },
              { icon: '📊', title: 'Dashboard en temps réel', desc: 'Voyez qui vient, combien de points, les récompenses. En direct.', img: PHOTOS.graph },
              { icon: '🎨', title: '100% personnalisable', desc: 'Vos couleurs, votre logo, votre récompense. Tout à votre image.', img: null },
              { icon: '🔔', title: 'Le client est notifié', desc: 'Quand il approche de la récompense, il est prévenu. Il revient.', img: null },
              { icon: '⭐', title: 'Avis clients intégrés', desc: 'Recevez les avis de vos clients directement sur la plateforme.', img: null },
              { icon: '🔒', title: 'Anti-fraude', desc: 'Impossible de tricher. Chaque visite est validée par le commerçant.', img: null },
              { icon: '📈', title: '+40% de retours', desc: 'Nos commerçants voient en moyenne 40% de clients en plus revenir.', img: PHOTOS.happy },
              { icon: '🇩🇿', title: 'Fait pour l\'Algérie', desc: 'Paiement CCP/BaridiMob. Support en français et arabe. 100% local.', img: null },
            ].map((r, i) => (
              <div key={i} className={`group bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 ${r.img ? 'flex' : ''}`}>
                {r.img && (
                  <div className="w-[140px] flex-shrink-0 hidden md:block">
                    <img src={r.img} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{r.icon}</div>
                    <h3 className="font-bold text-lg">{r.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <CTA text="Créer ma carte maintenant →" big />
          </div>
        </div>
      </section>

      {/* ============ AVANT / APRÈS ============ */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.03] to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Transformation</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-3">Avant vs Après</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl overflow-hidden">
              <div className="relative h-48">
                <img src={PHOTOS.shop} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-red-900/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-3xl font-extrabold text-red-300">😞 AVANT</p>
                </div>
              </div>
              <div className="bg-red-500/5 border border-red-500/10 border-t-0 rounded-b-2xl p-6 space-y-3">
                {['Cartes papier qui se perdent', 'Aucune donnée sur vos clients', 'Clients qui ne reviennent pas', 'Impossible de mesurer la fidélité', 'Pas de programme de récompenses'].map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-red-400 text-lg">✗</span>
                    <p className="text-sm text-gray-400">{t}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden">
              <div className="relative h-48">
                <img src={PHOTOS.happy} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-emerald-900/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-3xl font-extrabold text-emerald-300">🚀 APRÈS</p>
                </div>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/10 border-t-0 rounded-b-2xl p-6 space-y-3">
                {['Carte digitale sur le téléphone', 'Dashboard avec toutes les stats', '+40% de clients qui reviennent', 'Suivi en temps réel', 'Récompenses automatiques'].map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-emerald-400 text-lg">✓</span>
                    <p className="text-sm text-gray-300">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ANIMÉS ============ */}
      <section className="py-20 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { end: 500, suffix: '+', label: 'Commerçants actifs', icon: '🏪' },
            { end: 15000, suffix: '+', label: 'Clients fidélisés', icon: '👥' },
            { end: 50000, suffix: '+', label: 'Points distribués', icon: '⭐' },
            { end: 98, suffix: '%', label: 'Satisfaction', icon: '❤️' },
          ].map((s, i) => (
            <div key={i}>
              <span className="text-3xl">{s.icon}</span>
              <p className="text-3xl md:text-4xl font-extrabold mt-2 bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                <Counter end={s.end} suffix={s.suffix} />
              </p>
              <p className="text-xs text-gray-500 mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ DÉMO ============ */}
      <section id="demo" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.03] to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Démo interactive</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-3 mb-6">Testez vous-même</h2>
              <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                Cliquez sur la carte pour simuler les visites. Atteignez 8 points pour débloquer la récompense.
                <strong className="text-white"> C&apos;est exactement ça que vos clients verront.</strong>
              </p>

              <div className="space-y-5 mb-8">
                {[
                  { num: '01', title: 'Le client scanne le QR code', desc: 'Affiché dans votre commerce ou partagé en ligne', icon: '📱' },
                  { num: '02', title: 'Vous validez la visite', desc: 'Un clic sur votre téléphone, c\'est tout', icon: '✅' },
                  { num: '03', title: 'Il gagne des points', desc: 'La barre se remplit automatiquement', icon: '⭐' },
                  { num: '04', title: 'Il revient pour la récompense', desc: 'Et recommence le cycle. Fidélisé !', icon: '🎁' },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-11 h-11 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-indigo-500/20 transition">{s.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{s.num}</span>
                        <h4 className="font-bold">{s.title}</h4>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <CTA text="Créer ma carte →" big />
            </div>

            <div>
              <DemoCard />
              <p className="text-center text-indigo-300 text-sm font-medium mt-4 animate-pulse">👆 Cliquez sur la carte</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTEURS ============ */}
      <section id="sectors" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Pour tous les commerces</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-3">Quel que soit votre secteur</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: PHOTOS.cafe, title: 'Cafés & Restaurants', example: '10e café offert', icon: '☕' },
              { img: PHOTOS.salon, title: 'Salons de beauté', example: '5e coupe gratuite', icon: '💇' },
              { img: PHOTOS.boulangerie, title: 'Boulangeries', example: '8e baguette offerte', icon: '🥖' },
              { img: PHOTOS.restaurant, title: 'Commerces', example: '-20% au bout de 10 achats', icon: '🛍️' },
            ].map((s, i) => (
              <div key={i} className="group rounded-2xl overflow-hidden bg-white/5 border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1">
                <div className="relative h-40 overflow-hidden">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-2xl">{s.icon}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-500">Ex: &ldquo;{s.example}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-500 mb-4">Et bien plus : pharmacies, gyms, lavages auto, épiceries...</p>
            <CTA text="Adapter à mon commerce →" />
          </div>
        </div>
      </section>

      {/* ============ TÉMOIGNAGES ============ */}
      <section id="testimonials" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Témoignages</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-3">Ils adorent Fidali</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Karim B.', biz: 'Café Central, Alger', text: 'En 1 mois, j\'ai vu 40% de mes clients revenir plus souvent. Le QR code est tellement simple que même les clients âgés l\'utilisent.', rating: 5, img: PHOTOS.cafe },
              { name: 'Sarah M.', biz: 'Salon Belle, Oran', text: 'Fini les cartes papier perdues ! Mes clientes adorent voir leur progression sur le téléphone. Et moi j\'adore le dashboard.', rating: 5, img: PHOTOS.salon },
              { name: 'Youcef A.', biz: 'Pizza Roma, Constantine', text: 'Le setup a pris 3 minutes. Maintenant mes clients commandent plus souvent pour atteindre la pizza gratuite. Mon CA a augmenté de 25%.', rating: 5, img: PHOTOS.restaurant },
            ].map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition group">
                <div className="h-32 overflow-hidden">
                  <img src={t.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <svg key={j} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.biz}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.03] to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Tarifs</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-3">Simple. Transparent.</h2>
            <p className="text-gray-400 mt-4 text-lg">Commencez gratuit. Upgradez quand vous grandissez.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: 'Gratuit', period: '', features: ['1 carte de fidélité', '50 clients max', 'QR Code', 'Dashboard basique'], popular: false, cta: 'Commencer gratuitement' },
              { name: 'Pro', price: '4 500', period: 'DA/mois', features: ['5 cartes', 'Clients illimités', 'Stats avancées', 'Support prioritaire', 'Export PDF', 'Avis clients'], popular: true, cta: 'Essayer Pro' },
              { name: 'Premium', price: '9 000', period: 'DA/mois', features: ['Cartes illimitées', 'Clients illimités', 'API access', 'Support 24/7', 'Multi-établissements', 'Personnalisation totale', 'Formation incluse'], popular: false, cta: 'Contacter l\'équipe' },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-7 transition-all hover:-translate-y-1 ${plan.popular ? 'bg-indigo-500/10 border-2 border-indigo-500/30 scale-105 shadow-xl shadow-indigo-500/10' : 'bg-white/5 border border-white/5'}`}>
                {plan.popular && (
                  <div className="text-center mb-4">
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-wider">⭐ Le + populaire</span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-3">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    {plan.period && <span className="text-sm text-gray-500">{plan.period}</span>}
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm text-gray-400">{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => router.push('/signup')} className={`w-full py-3.5 rounded-xl font-bold text-sm transition ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-600 mt-8">💳 Paiement CCP, BaridiMob ou cash · Annulation à tout moment</p>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3">Questions fréquentes</h2>
          </div>

          <div className="space-y-3">
            {[
              { q: 'Est-ce que mes clients doivent télécharger une application ?', a: 'Non ! Vos clients scannent simplement un QR code avec l\'appareil photo de leur téléphone. Aucune application à installer.' },
              { q: 'Combien de temps pour configurer ?', a: 'Moins de 2 minutes. Vous créez votre compte, personnalisez votre carte, et c\'est prêt. Vous pouvez imprimer le QR code immédiatement.' },
              { q: 'C\'est vraiment gratuit ?', a: 'Oui ! Le plan Starter est 100% gratuit, sans limite de temps. Vous pouvez upgrader vers Pro ou Premium quand vous le souhaitez.' },
              { q: 'Comment le client gagne des points ?', a: 'Il scanne votre QR code à chaque visite. Vous validez sur votre téléphone, et il gagne automatiquement ses points.' },
              { q: 'Est-ce que je peux personnaliser ma carte ?', a: 'Absolument ! Vous choisissez les couleurs, le nombre de points, la récompense, le message de bienvenue. Tout est personnalisable.' },
              { q: 'Comment je paie si je veux upgrader ?', a: 'Nous acceptons CCP, BaridiMob et cash. Le paiement est simple et 100% local.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-6 py-5 flex items-center justify-between text-left">
                  <span className="font-semibold text-sm pr-4">{faq.q}</span>
                  <svg className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <img src={PHOTOS.team} alt="" className="w-full h-[400px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/95 to-violet-900/90" />
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center max-w-xl">
                <p className="text-5xl mb-4">🚀</p>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                  Prêt à fidéliser vos clients ?
                </h2>
                <p className="text-lg text-white/70 mb-8">
                  Rejoignez +500 commerçants algériens qui utilisent Fidali.
                  <strong className="text-white"> C&apos;est gratuit et ça prend 2 minutes.</strong>
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button onClick={() => router.push('/signup')} className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-2xl hover:bg-gray-100 transition shadow-xl text-lg">
                    Créer mon compte gratuitement
                  </button>
                  <button onClick={() => router.push('/login')} className="px-6 py-4 text-white/70 hover:text-white transition text-lg">
                    J&apos;ai déjà un compte →
                  </button>
                </div>
                <p className="text-xs text-white/30 mt-6">✅ Gratuit · ✅ Sans carte bancaire · ✅ 2 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Fidali" className="w-8 h-8 rounded-lg object-contain" />
            <span className="font-bold">Fidali</span>
            <span className="text-xs text-gray-600">· Fidélité digitale 🇩🇿</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="/" className="hover:text-white transition">Accueil</a>
            <a href="#why" className="hover:text-white transition">Pourquoi</a>
            <a href="#pricing" className="hover:text-white transition">Tarifs</a>
            <a href="/login" className="hover:text-white transition">Connexion</a>
          </div>
          <p className="text-xs text-gray-600">© 2024 Fidali</p>
        </div>
      </footer>

      {/* ============ FLOATING CTA MOBILE ============ */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 p-4 bg-[#0a0a1a]/95 backdrop-blur-xl border-t border-white/5 md:hidden transition-transform duration-300 ${scrolled ? 'translate-y-0' : 'translate-y-full'}`}>
        <button onClick={() => router.push('/signup')} className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 text-sm">
          Commencer gratuitement →
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 3s ease-in-out infinite 1.5s; }
      `}</style>

    </div>
  )
}
