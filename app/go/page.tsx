'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0)
  const { ref, inView } = useInView()
  useEffect(() => {
    if (!inView) return
    let i = 0
    const step = to / 60
    const t = setInterval(() => { i += step; if (i >= to) { setN(to); clearInterval(t) } else setN(Math.floor(i)) }, 16)
    return () => clearInterval(t)
  }, [inView, to])
  return <span ref={ref}>{n.toLocaleString('fr-DZ')}{suffix}</span>
}

export default function GoPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [scanAnim, setScanAnim] = useState(false)
  const s1 = useInView(); const s2 = useInView(); const s3 = useInView()
  const s4 = useInView(); const s5 = useInView(); const s6 = useInView()

  useEffect(() => {
    window.addEventListener('scroll', () => setScrolled(window.scrollY > 20), { passive: true })
    const t = setTimeout(() => setScanAnim(true), 1200)
    return () => clearTimeout(t)
  }, [])

  const v = (ref: any) => ref.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
  const tr = 'transition-all duration-700 ease-out'

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .ar { direction: rtl; font-family: 'Plus Jakarta Sans', sans-serif; }
        html { scroll-behavior: smooth; }
        @keyframes scanline { 0%,100%{top:10%} 50%{top:80%} }
        @keyframes ping2 { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.5);opacity:0} }
        @keyframes floatY { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .scanline { animation: scanline 2s ease-in-out infinite; }
        .float { animation: floatY 5s ease-in-out infinite; }
        .ticker { animation: ticker 30s linear infinite; }
        .card-hover { transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease; }
        .card-hover:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 30px 60px rgba(79,70,229,0.18); }
      `}</style>

      {/* ══════════════════ NAVBAR ══════════════════ */}
      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm' : ''}`}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Fidali" className="w-9 h-9 rounded-2xl object-contain shadow-sm" />
            <span className="text-xl font-black tracking-tight">Fidali</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#probleme" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">Le problème</a>
            <a href="#comment" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">Comment ça marche</a>
            <a href="#temoignages" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">Témoignages</a>
            <a href="#tarifs" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">Tarifs</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/login')} className="hidden sm:block text-sm font-semibold text-gray-500 hover:text-gray-900 px-4 py-2 transition">
              Connexion
            </button>
            <button onClick={() => router.push('/signup')} className="text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5">
              Commencer gratuit →
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* BG photo */}
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1800&q=85&fit=crop" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(110deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.72) 50%, rgba(0,0,0,0.35) 100%)' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-32 w-full">
          <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-center">

            {/* LEFT */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur border border-white/20 text-white/80 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                🇩🇿 مصنوع خصيصاً للتجار الجزائريين
              </div>

              {/* Headline */}
              <h1 className="text-[clamp(2.4rem,6vw,4.2rem)] font-black text-white leading-[1.05] tracking-tight mb-5">
                <span className="block ar text-right text-[clamp(2rem,5vw,3.5rem)] mb-3" style={{ color: 'white' }}>
                  زبائنك يرجعو كل مرة.
                </span>
                <span className="block">
                  Fidélisez vos clients{' '}
                  <span style={{ background: 'linear-gradient(135deg, #a5b4fc, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    automatiquement.
                  </span>
                </span>
              </h1>

              <p className="text-[1.1rem] text-white/60 leading-relaxed max-w-xl mb-3">
                Un QR code sur votre caisse. Vos clients scannent, collectent des points, et reviennent chercher leur récompense.
              </p>
              <p className="text-base text-white/40 mb-10 ar text-right">
                QR code على الكاش. زبائنك يمسحو، يجمعو نقاط، ويرجعو.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <button onClick={() => router.push('/signup')} className="group flex items-center justify-center gap-2.5 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all text-base shadow-2xl shadow-indigo-900/50 hover:shadow-indigo-600/40 hover:-translate-y-0.5">
                  ابدأ مجاناً — Commencer gratuitement
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </button>
                <a href="#comment" className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-2xl transition text-base backdrop-blur">
                  Voir comment ça marche
                </a>
              </div>

              {/* Trust pills */}
              <div className="flex flex-wrap gap-3">
                {[
                  ['✅', 'Gratuit pour démarrer', 'مجاني للبدء'],
                  ['⚡', 'Prêt en 3 minutes', 'جاهز في 3 دقائق'],
                  ['📱', 'Sans application', 'بدون تطبيق'],
                  ['🔒', 'Sécurisé', 'آمن 100%'],
                ].map(([icon, fr, ar], i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur border border-white/15 px-3 py-1.5 rounded-xl">
                    <span className="text-sm">{icon}</span>
                    <span className="text-white/70 text-xs font-semibold">{fr}</span>
                    <span className="text-white/30 text-xs">·</span>
                    <span className="text-white/40 text-xs ar">{ar}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — floating cards */}
            <div className="hidden lg:block float">
              <div className="space-y-4 relative">
                {[
                  { color1: '#1e3a8a', color2: '#4f46e5', name: '☕ Café El Baraka', pts: 7, max: 10, reward: '10ème café offert' },
                  { color1: '#7c2d12', color2: '#c2410c', name: '🥖 Boulangerie Alger', pts: 4, max: 6, reward: 'Baguette offerte' },
                  { color1: '#134e4a', color2: '#0f766e', name: '💇 Salon Beauté', pts: 9, max: 12, reward: 'Soin offert' },
                ].map((card, i) => (
                  <div key={i} className="rounded-2xl p-5 shadow-2xl relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${card.color1}, ${card.color2})` }}>
                    <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '18px 18px' }} />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-white/40 text-[9px] uppercase tracking-widest">Carte de fidélité</p>
                          <p className="text-white font-black text-base">{card.name}</p>
                        </div>
                        <span className="bg-white/20 px-2.5 py-1 rounded-lg text-white font-bold text-sm">{card.pts}/{card.max}</span>
                      </div>
                      <div className="flex gap-1.5 mb-3">
                        {Array.from({ length: card.max }).map((_, j) => (
                          <div key={j} className="flex-1 h-2.5 rounded-full transition-all"
                            style={{ background: j < card.pts ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)' }} />
                        ))}
                      </div>
                      <p className="text-white/60 text-xs">🎁 {card.reward}</p>
                    </div>
                  </div>
                ))}

                {/* Live notification */}
                <div className="bg-white rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 border border-gray-100">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">Ahmed B. — نقطة جديدة ✓</p>
                    <p className="text-[10px] text-gray-400">QR scanné à l'instant · 8/10 points</p>
                  </div>
                  <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll arrow */}
        <a href="#probleme" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/30 hover:text-white/60 transition animate-bounce">
          <span className="text-xs font-medium tracking-wider uppercase">Découvrir</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
        </a>
      </section>

      {/* ══════════════════ TICKER ══════════════════ */}
      <div className="bg-indigo-600 py-3.5 overflow-hidden border-y border-indigo-500">
        <div className="ticker flex gap-16 whitespace-nowrap">
          {[...Array(4)].flatMap(() => [
            '☕ Cafés', '🍕 Restaurants', '💇 Salons', '🥖 Boulangeries',
            '💊 Pharmacies', '👕 Boutiques', '🏋️ Salles de sport', '🚗 Lavage auto',
            '🧖 Spas', '📚 Librairies', '🌸 Fleuristes', '👔 Pressing',
          ]).map((s, i) => (
            <span key={i} className="text-white/70 text-sm font-semibold shrink-0">{s} <span className="text-white/30 ml-12">✦</span></span>
          ))}
        </div>
      </div>

      {/* ══════════════════ PROBLÈME ══════════════════ */}
      <section id="probleme" className="py-24 px-5 md:px-8 bg-gray-950 text-white overflow-hidden">
        <div ref={s1.ref} className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 ${tr} ${v(s1)}`}>
            <div className="inline-block bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-black px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              Le problème 🇩🇿
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Les cartes papier,{' '}
              <span className="text-red-400">ça ne marche plus.</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto ar" dir="rtl">
              بطاقات الورق تضيع، تتبلل، وتُنسى. ووقتك ثمين.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-16">
            {[
              { icon: '🗑️', title: 'Perdues ou abîmées', titleAr: 'ضائعة أو تالفة', desc: '68% des cartes papier sont perdues avant d\'être complétées. Résultat : zéro fidélisation.' },
              { icon: '😤', title: 'Aucun suivi possible', titleAr: 'لا تتبع ممكن', desc: 'Vous ne savez pas qui sont vos vrais clients fidèles, combien ils viennent, ni quand.' },
              { icon: '💸', title: 'De l\'argent perdu', titleAr: 'خسارة مباشرة', desc: 'Un client qui part chez le concurrent vaut 5x plus cher qu\'un nouveau client à acquérir.' },
            ].map((p, i) => (
              <div key={i} className={`${tr} ${v(s1)} bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition`} style={{ transitionDelay: `${i*100}ms` }}>
                <span className="text-3xl block mb-4">{p.icon}</span>
                <h3 className="font-black text-white text-lg mb-1">{p.title}</h3>
                <p className="text-white/40 text-xs ar mb-2">{p.titleAr}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Before / After */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-red-950/50 border border-red-500/20 rounded-2xl p-6">
              <p className="text-red-400 font-black text-sm uppercase tracking-wider mb-4">❌ Avant Fidali</p>
              {['Bouts de carton partout', 'Clients qui oublient', 'Aucune donnée sur vos clients', 'Impossible de les recontacter', 'Vous perdez des clients sans le savoir'].map((t, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-red-500/10 last:border-0">
                  <span className="text-red-500 text-sm">✗</span>
                  <span className="text-gray-400 text-sm">{t}</span>
                </div>
              ))}
            </div>
            <div className="bg-emerald-950/50 border border-emerald-500/20 rounded-2xl p-6">
              <p className="text-emerald-400 font-black text-sm uppercase tracking-wider mb-4">✅ Avec Fidali</p>
              {['Tout digital, rien à perdre', 'Clients notifiés automatiquement', 'Dashboard avec toutes les stats', 'Clients fidèles identifiés', 'Vous voyez tout en temps réel'].map((t, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-emerald-500/10 last:border-0">
                  <span className="text-emerald-400 text-sm">✓</span>
                  <span className="text-gray-300 text-sm font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ PHOTOS COMMERCES ══════════════════ */}
      <section className="py-24 px-5 md:px-8">
        <div ref={s2.ref} className="max-w-6xl mx-auto">
          <div className={`text-center mb-14 ${tr} ${v(s2)}`}>
            <p className="text-indigo-600 font-black text-sm uppercase tracking-widest mb-3">يعمل في كل مكان · Pour tous les commerces</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Quel que soit votre commerce,<br/>
              <span className="text-indigo-600">Fidali s'adapte.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&q=80&fit=crop', label: 'Café', labelAr: 'قهوة', color: '#c2410c' },
              { img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80&fit=crop', label: 'Restaurant', labelAr: 'مطعم', color: '#7c3aed' },
              { img: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&q=80&fit=crop', label: 'Boutique', labelAr: 'بوتيك', color: '#0f766e' },
              { img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500&q=80&fit=crop', label: 'Salon', labelAr: 'صالون', color: '#be185d' },
            ].map((c, i) => (
              <div key={i} className={`card-hover relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer ${tr}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <img src={c.img} alt={c.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-black text-lg">{c.label}</p>
                  <p className="text-white/50 text-xs ar">{c.labelAr}</p>
                </div>
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ COMMENT ÇA MARCHE ══════════════════ */}
      <section id="comment" className="py-24 px-5 md:px-8 bg-gray-50">
        <div ref={s3.ref} className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 ${tr} ${v(s3)}`}>
            <div className="inline-block bg-indigo-100 text-indigo-700 text-xs font-black px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              كيف يعمل · Comment ça marche
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Opérationnel en <span className="text-indigo-600">3 minutes chrono.</span>
            </h2>
            <p className="text-gray-400 mt-3 text-lg ar">جاهز في 3 دقائق بالضبط.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Steps */}
            <div className="space-y-4">
              {[
                { n: '01', icon: '✍️', fr: 'Créez votre compte', ar: 'أنشئ حسابك', desc: 'Inscription gratuite en 30 secondes. Votre email, votre business, c\'est parti.', descAr: 'تسجيل مجاني في 30 ثانية.' },
                { n: '02', icon: '🎨', fr: 'Personnalisez votre carte', ar: 'خصص بطاقتك', desc: 'Choisissez vos couleurs, votre récompense et le nombre de visites nécessaires.', descAr: 'اختر ألوانك ومكافأتك.' },
                { n: '03', icon: '🖨️', fr: 'Imprimez et affichez', ar: 'اطبع واعرض', desc: 'On vous génère un QR code. Imprimez-le ou affichez-le depuis votre téléphone.', descAr: 'نولد QR code. اطبعه أو اعرضه من هاتفك.' },
                { n: '04', icon: '📲', fr: 'Vos clients scannent', ar: 'زبائنك يمسحون', desc: 'Ils scannent avec leur téléphone — sans app — et accumulent des points automatiquement.', descAr: 'يمسحون بهاتفهم بدون تطبيق ويكسبون نقاطاً.' },
                { n: '05', icon: '🎁', fr: 'Ils reviennent chercher leur récompense', ar: 'يرجعون للمكافأة', desc: 'Récompense atteinte = ils reviennent. Le cycle de fidélité est enclenché.', descAr: 'وصلوا للمكافأة = يرجعون. دورة الولاء بدأت.' },
              ].map((s, i) => (
                <div key={i} className={`flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${tr}`}
                  style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="shrink-0 w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-xl">{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{s.n}</span>
                      <span className="text-sm font-black text-gray-900">{s.fr}</span>
                      <span className="text-xs text-gray-400 ar">· {s.ar}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Phone mockup */}
            <div className={`flex justify-center ${tr} ${v(s3)}`}>
              <div className="relative">
                <div className="absolute -inset-10 bg-indigo-400/10 rounded-full blur-3xl" />
                {/* Phone */}
                <div className="relative w-[280px] rounded-[2.8rem] p-3 shadow-2xl" style={{ background: 'linear-gradient(145deg, #1d1d1f, #2a2a2c)', boxShadow: '0 40px 80px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
                  {/* Notch */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20" />
                  <div className="bg-gray-100 rounded-[2.2rem] overflow-hidden" style={{ height: 560 }}>
                    {/* Status bar */}
                    <div className="bg-white px-5 pt-10 pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <img src="/logo.png" alt="" className="w-5 h-5 object-contain" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400">Fidali</p>
                            <p className="text-xs font-black text-gray-900">Café El Baraka</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">7/10</div>
                      </div>

                      {/* Card preview */}
                      <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #1e3a8a, #4f46e5)' }}>
                        <p className="text-white/40 text-[8px] uppercase tracking-wider mb-1">Carte de fidélité</p>
                        <p className="text-white font-black text-sm mb-3">☕ Café El Baraka</p>
                        <div className="flex gap-1 mb-2">
                          {Array.from({length: 10}).map((_, j) => (
                            <div key={j} className="flex-1 h-2 rounded-full" style={{ background: j < 7 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)' }} />
                          ))}
                        </div>
                        <p className="text-white/50 text-[9px]">🎁 10ème café offert</p>
                      </div>

                      {/* QR Zone */}
                      <div className="bg-gray-50 rounded-2xl p-4 relative overflow-hidden" style={{ height: 220 }}>
                        <p className="text-xs font-black text-gray-700 text-center mb-3">Scannez pour rejoindre</p>
                        {/* QR code visual */}
                        <div className="mx-auto w-28 h-28 relative">
                          <div className="w-full h-full rounded-xl border-2 border-indigo-200 relative overflow-hidden bg-white flex items-center justify-center">
                            {/* Fake QR pattern */}
                            <div className="grid grid-cols-7 gap-0.5 p-1.5 w-full h-full">
                              {Array.from({length: 49}).map((_, j) => (
                                <div key={j} className="rounded-[1px]" style={{ background: [0,1,2,7,8,9,14,3,6,10,13,4,5,11,12,21,22,28,29,35,42,43,44,45,46,47,48,36,37,38].includes(j) ? '#1e293b' : 'transparent' }} />
                              ))}
                            </div>
                            {/* Scan line */}
                            <div className={`absolute left-0 right-0 h-0.5 bg-indigo-500/70 scanline`} style={{ top: '30%' }} />
                          </div>
                          {/* Corner marks */}
                          {[['top-0 left-0 border-t-2 border-l-2 rounded-tl'], ['top-0 right-0 border-t-2 border-r-2 rounded-tr'], ['bottom-0 left-0 border-b-2 border-l-2 rounded-bl'], ['bottom-0 right-0 border-b-2 border-r-2 rounded-br']].map(([cls], j) => (
                            <div key={j} className={`absolute w-4 h-4 border-indigo-500 ${cls} -m-1`} />
                          ))}
                        </div>
                        {scanAnim && (
                          <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                            <div className="bg-emerald-500 text-white text-xs font-black px-4 py-2 rounded-full flex items-center gap-2">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                              Scan réussi !
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ STATS ══════════════════ */}
      <section className="py-20 px-5 md:px-8 bg-indigo-600">
        <div ref={s4.ref} className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { val: 150, suf: '+', fr: 'Commerçants', ar: 'تاجر' },
              { val: 3200, suf: '+', fr: 'Clients fidèles', ar: 'زبون مخلص' },
              { val: 12500, suf: '+', fr: 'Visites validées', ar: 'زيارة مؤكدة' },
              { val: 98, suf: '%', fr: 'Satisfaction', ar: 'رضا' },
            ].map((s, i) => (
              <div key={i} className={`text-center ${tr} ${v(s4)}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-4xl md:text-5xl font-black text-white mb-1">
                  {s4.inView ? <Counter to={s.val} suffix={s.suf} /> : '0'}
                </div>
                <p className="text-indigo-200 font-semibold text-sm">{s.fr}</p>
                <p className="text-indigo-300/60 text-xs ar">{s.ar}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ TÉMOIGNAGES ══════════════════ */}
      <section id="temoignages" className="py-24 px-5 md:px-8">
        <div ref={s5.ref} className="max-w-6xl mx-auto">
          <div className={`text-center mb-14 ${tr} ${v(s5)}`}>
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-black px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              آراء التجار · Témoignages réels
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Ils ont essayé.
              <span className="text-gray-400"> Ils ne reviennent plus en arrière.</span>
            </h2>
            <p className="text-gray-400 mt-2 ar text-xl">جربوها. ما رجعوش للورق.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
                name: 'Karim Boualam', nameAr: 'كريم بوعلام',
                role: 'Café El Yasmine · Alger', roleAr: 'قهوة الياسمين · الجزائر',
                ar: '"وضعت الـ QR code على الكاش. في أول أسبوع عندي 23 زبون جديد سجلو. ما توقعتش هكذا!"',
                fr: '"J\'ai posé le QR code sur la caisse. En une semaine, 23 nouveaux clients inscrits. Incroyable."',
                color: '#4f46e5', result: '+34% de clients récurrents',
              },
              {
                img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
                name: 'Amina Rahal', nameAr: 'أمينة رحال',
                role: 'Salon Bella · Oran', roleAr: 'صالون بيلا · وهران',
                ar: '"زبائني ديما كانو ينسو البطاقة. دروك كل شيء في التيليفون. ما عاد فيه مشكلة."',
                fr: '"Mes clientes oubliaient toujours la carte. Maintenant tout est sur leur téléphone. Fini les excuses."',
                color: '#ec4899', result: '0 carte perdue depuis 6 mois',
              },
              {
                img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
                name: 'Youcef Masoud', nameAr: 'يوسف مسعود',
                role: 'Boulangerie Le Blé · Constantine', roleAr: 'مخبزة القمح · قسنطينة',
                ar: '"الـ dashboard يبين لي كل شيء. شكون زبائني الأوفياء، وقتاش يجيو. هذا اللي كنت محتاجو."',
                fr: '"Le dashboard me montre tout. Qui sont mes fidèles, quand ils viennent. Exactement ce qu\'il me fallait."',
                color: '#0f766e', result: '127 clients fidèles en 1 mois',
              },
            ].map((t, i) => (
              <div key={i} className={`card-hover bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm ${tr}`}
                style={{ transitionDelay: `${i * 100}ms` }}>
                {/* Top accent */}
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${t.color}, ${t.color}88)` }} />
                <div className="p-6">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">{'★★★★★'.split('').map((s, j) => <span key={j} className="text-amber-400 text-base">{s}</span>)}</div>
                  {/* Arabic */}
                  <p className="text-gray-800 text-sm leading-relaxed font-semibold mb-3 ar" dir="rtl">{t.ar}</p>
                  {/* French */}
                  <p className="text-gray-400 text-xs leading-relaxed italic mb-5 border-l-2 border-gray-100 pl-3">{t.fr}</p>
                  {/* Result badge */}
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl mb-5">
                    📈 {t.result}
                  </div>
                  {/* Person */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <div className="relative">
                      <img src={t.img} alt={t.name} className="w-12 h-12 rounded-2xl object-cover" onError={(e: any) => { e.target.style.display='none' }} />
                      <div className="absolute inset-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black" style={{ background: t.color }}>{t.name[0]}</div>
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">{t.name}</p>
                      <p className="text-[10px] text-gray-400 ar">{t.nameAr}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ PRICING ══════════════════ */}
      <section id="tarifs" className="py-24 px-5 md:px-8 bg-gray-50">
        <div ref={s6.ref} className="max-w-5xl mx-auto">
          <div className={`text-center mb-14 ${tr} ${v(s6)}`}>
            <div className="inline-block bg-indigo-100 text-indigo-700 text-xs font-black px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">الأسعار · Tarifs</div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Commencez <span className="text-indigo-600">gratuitement.</span><br/>
              <span className="text-gray-400 font-normal text-2xl">ابدأ مجاناً. طور وقت ما تجهز.</span>
            </h2>
            <p className="text-gray-400 mt-3">Pas d'engagement · بدون التزام</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                plan: 'Starter', planAr: 'مبتدئ',
                price: 'Gratuit', priceAr: 'مجاني',
                period: '', desc: 'Pour démarrer', descAr: 'للبداية',
                features: [['1 carte de fidélité','1 بطاقة'],['50 clients','50 زبون'],['QR Code','QR Code'],['Dashboard basique','لوحة تحكم']],
                cta: 'Commencer gratuitement', ctaAr: 'ابدأ مجاناً',
                hl: false,
              },
              {
                plan: 'Pro', planAr: 'محترف',
                price: '2 500 DA', priceAr: '2,500 دج',
                period: '/ mois · شهر', desc: 'Pour les actifs', descAr: 'للتجار النشطين',
                features: [['5 cartes de fidélité','5 بطاقات'],['500 clients','500 زبون'],['Stats avancées','إحصاءات متقدمة'],['Personnalisation complète','تخصيص كامل'],['Support prioritaire','دعم أولوي']],
                cta: 'Choisir Pro', ctaAr: 'اختر Pro',
                hl: true, badge: '⭐ Le plus populaire',
              },
              {
                plan: 'Premium', planAr: 'بريميوم',
                price: '5 000 DA', priceAr: '5,000 دج',
                period: '/ mois · شهر', desc: 'Pour grandir', descAr: 'للنمو',
                features: [['Cartes illimitées','بطاقات غير محدودة'],['Clients illimités','زبائن غير محدودين'],['API & Intégrations','API'],['Multi-branches','فروع متعددة'],['Support dédié','دعم خاص']],
                cta: 'Choisir Premium', ctaAr: 'اختر Premium',
                hl: false,
              },
            ].map((t, i) => (
              <div key={i} className={`relative ${tr}`} style={{ transitionDelay: `${i * 100}ms` }}>
                {t.hl && <div className="absolute -inset-[2px] rounded-[26px] bg-gradient-to-b from-indigo-500 to-violet-500 -z-10 opacity-80" />}
                <div className={`rounded-3xl p-7 h-full flex flex-col ${t.hl ? 'bg-gray-900 text-white' : 'bg-white border border-gray-100'}`}>
                  {t.badge && <div className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full self-start mb-4">{t.badge}</div>}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-xl font-black ${t.hl ? 'text-white' : 'text-gray-900'}`}>{t.plan}</h3>
                      <span className={`text-sm ar ${t.hl ? 'text-gray-400' : 'text-gray-400'}`}>· {t.planAr}</span>
                    </div>
                    <p className={`text-sm ${t.hl ? 'text-gray-400' : 'text-gray-400'}`}>{t.desc} · {t.descAr}</p>
                  </div>
                  <div className="mb-6">
                    <span className={`text-3xl font-black ${t.hl ? 'text-white' : 'text-gray-900'}`}>{t.price}</span>
                    {t.period && <span className={`text-xs ml-2 ${t.hl ? 'text-gray-400' : 'text-gray-400'}`}>{t.period}</span>}
                    {t.priceAr && <p className={`text-xs mt-0.5 ar ${t.hl ? 'text-gray-500' : 'text-gray-300'}`}>{t.priceAr}</p>}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {t.features.map(([fr, ar], j) => (
                      <li key={j} className={`flex items-start gap-2.5 text-sm ${t.hl ? 'text-gray-300' : 'text-gray-600'}`}>
                        <svg className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        <span>{fr} <span className={`text-xs ar ${t.hl ? 'text-gray-500' : 'text-gray-400'}`}>· {ar}</span></span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => router.push('/signup')}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all hover:-translate-y-0.5 ${t.hl ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-900/40' : 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20'}`}>
                    {t.cta} · {t.ctaAr}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ simple */}
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            {[
              ['Puis-je changer de plan ?', 'هل يمكنني تغيير الباقة؟', 'Oui, à tout moment depuis votre dashboard.'],
              ['Comment se fait le paiement ?', 'كيف يتم الدفع؟', 'Virement bancaire ou CCP. 100% algérien.'],
              ['Mes données sont-elles sécurisées ?', 'هل بياناتي آمنة؟', 'Hébergement sécurisé, données en Algérie.'],
              ['Y a-t-il un engagement ?', 'هل هناك التزام؟', 'Aucun. Annulez quand vous voulez.'],
            ].map(([fr, ar, rep], i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100">
                <p className="font-black text-gray-900 text-sm mb-0.5">{fr}</p>
                <p className="text-xs text-gray-400 ar mb-2">{ar}</p>
                <p className="text-sm text-gray-500">{rep}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA FINAL ══════════════════ */}
      <section className="relative py-28 px-5 md:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1800&q=80&fit=crop" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(30,27,75,0.97), rgba(49,46,129,0.92))' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-5xl mb-6">🚀</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            Prêt à fidéliser<br/>vos clients ?
          </h2>
          <p className="text-2xl text-white/60 mb-3 ar">مستعد تخلي زبائنك يرجعو؟</p>
          <p className="text-white/40 mb-10 text-lg">Inscription gratuite · بدون بطاقة بنكية · Prêt en 3 minutes</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button onClick={() => router.push('/signup')} className="group flex items-center justify-center gap-2 px-10 py-5 bg-white text-indigo-900 font-black rounded-2xl hover:bg-indigo-50 transition-all text-lg shadow-2xl hover:-translate-y-1">
              ابدأ مجاناً — Commencer gratuitement
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {['#6366f1','#ec4899','#14b8a6','#f59e0b','#ef4444'].map((c, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-indigo-800 flex items-center justify-center text-white text-xs font-black" style={{ background: c }}>
                  {['K','A','Y','M','S'][i]}
                </div>
              ))}
            </div>
            <p className="text-white/50 text-sm">
              Rejoignez <span className="text-white font-bold">+150 commerçants</span> qui font confiance à Fidali
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="bg-gray-950 text-white py-14 px-5 md:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Fidali" className="w-9 h-9 rounded-xl object-contain" />
              <span className="font-black text-xl">Fidali</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">Programme de fidélité digital pour les commerçants algériens.</p>
            <p className="text-gray-600 text-xs mt-2 ar">برنامج ولاء رقمي للتجار الجزائريين.</p>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xl">🇩🇿</span>
              <span className="text-xs text-gray-500 font-medium">Made in Algeria</span>
            </div>
          </div>
          {[
            { title: 'Produit · المنتج', links: [['#comment','Comment ça marche'],['#tarifs','Tarifs · الأسعار'],['#temoignages','Témoignages']] },
            { title: 'Accès · الدخول', links: [['/signup','Créer un compte · إنشاء حساب'],['/login','Se connecter · دخول']] },
            { title: 'Contact', links: [['mailto:contact@fidali.dz','contact@fidali.dz'],['tel:0555000000','0555 00 00 00']] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-black text-sm text-gray-200 mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(([href, label], j) => (
                  <li key={j}><a href={href} className="text-sm text-gray-500 hover:text-white transition">{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© 2025 Fidali — Tous droits réservés · جميع الحقوق محفوظة</p>
          <p className="text-xs text-gray-700">Conçu et développé en Algérie 🇩🇿</p>
        </div>
      </footer>
    </div>
  )
}
