'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, inView }
}

function AnimNum({ target, suffix }: { target: number; suffix: string }) {
  const [val, setVal] = useState(0)
  const { ref, inView } = useInView()
  useEffect(() => {
    if (!inView) return
    let s = 0; const step = target / 50
    const t = setInterval(() => { s += step; if (s >= target) { setVal(target); clearInterval(t) } else setVal(Math.floor(s)) }, 20)
    return () => clearInterval(t)
  }, [inView, target])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

// Mini loyalty card component
function MiniCard({ color1, color2, name, points, max, reward }: any) {
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden shadow-2xl" style={{ background: `linear-gradient(135deg, ${color1}, ${color2})`, minWidth: 220 }}>
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/5 rounded-full" />
      <div className="relative z-10">
        <p className="text-white/40 text-[9px] uppercase tracking-wider mb-0.5">Carte de fidélité</p>
        <p className="text-white font-bold text-sm mb-3">{name}</p>
        <div className="flex gap-1 mb-2">
          {Array.from({ length: max }).map((_, i) => (
            <div key={i} className="flex-1 h-2 rounded-full" style={{ background: i < points ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-white/60 text-[10px]">{reward}</p>
          <p className="text-white font-bold text-xs">{points}/{max}</p>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const statsRef = useInView()
  const featuresRef = useInView()
  const howRef = useInView()
  const testimonialRef = useInView()
  const pricingRef = useInView()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % 3), 4000)
    return () => clearInterval(t)
  }, [])

  const testimonials = [
    { name: 'كريم بوعلام', nameF: 'Karim B.', role: 'مقهى الياسمين · الجزائر', roleF: 'Café El Yasmine · Alger', text: 'زبائني يرجعو أكثر من قبل. النظام بسيط ومريح.', textF: 'Mes clients reviennent deux fois plus souvent. Simple et efficace.', avatar: 'K', color: '#6366f1', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    { name: 'أمينة رحال', nameF: 'Amina R.', role: 'صالون بيلا · وهران', roleF: 'Salon Bella · Oran', text: 'ودعت بطاقات الورق! كل شيء رقمي وزبائني راضيين.', textF: 'Fini les cartes papier perdues ! Mes clientes adorent suivre leurs points.', avatar: 'A', color: '#ec4899', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    { name: 'يوسف مسعود', nameF: 'Youcef M.', role: 'مخبزة الذهب · قسنطينة', roleF: 'Boulangerie Le Blé d\'Or · Constantine', text: 'Dashboard واضح، أتحكم في كل شيء من تيليفوني.', textF: 'Le dashboard est parfait. Je valide les visites en 2 secondes depuis mon téléphone.', avatar: 'Y', color: '#14b8a6', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Outfit', sans-serif; }
        .ar { font-family: 'Outfit', sans-serif; direction: rtl; text-align: right; }
        .grad { background: linear-gradient(135deg, #4f46e5, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .fade-up { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .fade-up.visible { opacity: 1; transform: none; }
        .d1 { transition-delay: 0.1s } .d2 { transition-delay: 0.2s } .d3 { transition-delay: 0.3s }
        .d4 { transition-delay: 0.4s } .d5 { transition-delay: 0.5s } .d6 { transition-delay: 0.6s }
        html { scroll-behavior: smooth; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .float { animation: float 4s ease-in-out infinite; }
        .ticker { animation: ticker 25s linear infinite; }
      `}</style>

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Fidali" className="w-9 h-9 rounded-xl object-contain" />
            <span className="text-lg font-black text-gray-900">Fidali</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">كيف يعمل / Comment ça marche</a>
            <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">الأسعار / Tarifs</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/login')} className="text-sm font-medium text-gray-500 hover:text-gray-900 px-4 py-2 transition">دخول / Connexion</button>
            <button onClick={() => router.push('/signup')} className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-200">
              ابدأ مجانًا / Commencer
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background photo */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&q=80&fit=crop"
            alt="café"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(15,15,35,0.92) 0%, rgba(15,15,35,0.75) 55%, rgba(15,15,35,0.2) 100%)' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-24 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                🇩🇿 مصنوع للتجار الجزائريين · Fait pour l'Algérie
              </div>

              {/* Arabic headline */}
              <div className="ar mb-3">
                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  اجعل زبائنك
                  <br />
                  <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    يرجعون دائماً
                  </span>
                </h1>
              </div>

              {/* French headline */}
              <h2 className="text-2xl md:text-3xl font-black text-white/70 mb-6 leading-tight">
                Fidélisez vos clients,{' '}
                <span className="text-white">simplement.</span>
              </h2>

              <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg">
                استبدل بطاقات الورق ببرنامج ولاء رقمي. زبائنك يمسحون QR code ويكسبون نقاط تلقائياً.
                <br/>
                <span className="text-white/40 text-base">Remplacez les cartes papier. Un QR code, et c'est parti.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <button onClick={() => router.push('/signup')} className="group flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition shadow-2xl shadow-indigo-900/50 text-base">
                  ابدأ مجانًا — Commencer gratuit
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: '✅', text: 'مجاني للبدء / Gratuit' },
                  { icon: '⚡', text: '3 دقائق / 3 minutes' },
                  { icon: '📱', text: 'بدون تطبيق / Sans app' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-2 rounded-xl">
                    <span>{b.icon}</span>
                    <span className="text-white/70 text-xs font-semibold">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating cards */}
            <div className="hidden lg:flex flex-col items-center gap-5 float">
              <MiniCard color1="#1e3a8a" color2="#4f46e5" name="☕ Café El Baraka" points={7} max={10} reward="10ème café offert" />
              <MiniCard color1="#7c2d12" color2="#ea580c" name="🥖 Boulangerie Alger" points={4} max={6} reward="Baguette offerte" />
              <MiniCard color1="#134e4a" color2="#0d9488" name="💇 Salon Beauté" points={9} max={12} reward="Soin offert" />

              {/* Scan indicator */}
              <div className="bg-white rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 border border-gray-100">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Ahmed B. — +1 نقطة</p>
                  <p className="text-[10px] text-gray-400">QR scanné il y a 2 min</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <span className="text-xs font-medium">Découvrir</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
        </div>
      </section>

      {/* SECTORS TICKER */}
      <div className="bg-indigo-600 py-4 overflow-hidden">
        <div className="ticker flex gap-12 whitespace-nowrap">
          {[...Array(3)].flatMap(() => [
            { e: '☕', l: 'Cafés / قهوة' }, { e: '🍕', l: 'Restaurants / مطاعم' },
            { e: '💇', l: 'Salons / صالونات' }, { e: '🥖', l: 'Boulangeries / مخابز' },
            { e: '💊', l: 'Pharmacies / صيدليات' }, { e: '👕', l: 'Boutiques / بوتيكات' },
            { e: '🏋️', l: 'Sport / رياضة' }, { e: '🚗', l: 'Lavage auto / غسيل سيارات' },
          ]).map((s, i) => (
            <div key={i} className="flex items-center gap-2.5 text-white/70 shrink-0">
              <span className="text-lg">{s.e}</span>
              <span className="text-sm font-semibold">{s.l}</span>
              <span className="text-white/30 ml-6">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section className="py-20 px-5 md:px-8 bg-gray-50">
        <div ref={statsRef.ref} className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-8 md:gap-16">
            {[
              { val: 150, suf: '+', fr: 'Commerçants actifs', ar: 'تاجر نشط' },
              { val: 3000, suf: '+', fr: 'Clients fidélisés', ar: 'زبون مخلص' },
              { val: 98, suf: '%', fr: 'Satisfaction', ar: 'رضا' },
            ].map((s, i) => (
              <div key={i} className={`text-center fade-up d${i+1} ${statsRef.inView ? 'visible' : ''}`}>
                <div className="text-4xl md:text-5xl font-black text-indigo-600 mb-1">
                  {statsRef.inView ? <AnimNum target={s.val} suffix={s.suf} /> : '0'}
                </div>
                <p className="text-sm font-bold text-gray-900">{s.fr}</p>
                <p className="text-xs text-gray-400 ar">{s.ar}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF PHOTOS */}
      <section className="py-24 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-2">يعمل في كل مكان · Fonctionne partout</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              لكل نوع من التجارة
              <br />
              <span className="text-gray-400 font-normal text-2xl">Pour tous les commerces</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                photo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80&fit=crop',
                emoji: '☕', label: 'Café / قهوة',
                stat: '+34% de visites récurrentes',
                statAr: 'زيادة في الزيارات المتكررة',
              },
              {
                photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80&fit=crop',
                emoji: '🍕', label: 'Restaurant / مطعم',
                stat: '127 clients fidèles en 1 mois',
                statAr: 'زبون مخلص في شهر واحد',
              },
              {
                photo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80&fit=crop',
                emoji: '💇', label: 'Salon / صالون',
                stat: 'Récompense réclamée × 18',
                statAr: 'مكافأة تم المطالبة بها',
              },
            ].map((c, i) => (
              <div key={i} className="group relative rounded-3xl overflow-hidden aspect-[4/5] cursor-pointer">
                <img src={c.photo} alt={c.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-white font-bold">{c.label}</span>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
                    <p className="text-white text-xs font-semibold">📈 {c.stat}</p>
                    <p className="text-white/60 text-[10px] ar mt-0.5">{c.statAr}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-5 md:px-8 bg-gray-50">
        <div ref={howRef.ref} className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 fade-up ${howRef.inView ? 'visible' : ''}`}>
            <p className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-2">كيف يعمل · Comment ça marche</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              جاهز في 3 دقائق
              <br />
              <span className="text-gray-400 font-normal text-2xl">Opérationnel en 3 minutes</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Steps */}
            <div className="space-y-5">
              {[
                {
                  n: '01', icon: '✍️',
                  fr: 'Créez votre compte gratuit',
                  ar: 'أنشئ حسابك المجاني',
                  desc: 'Inscription en 30 secondes. Pas de carte bancaire.',
                  descAr: 'تسجيل في 30 ثانية. بدون بطاقة بنكية.',
                },
                {
                  n: '02', icon: '🎨',
                  fr: 'Personnalisez votre carte',
                  ar: 'خصص بطاقتك',
                  desc: 'Choisissez vos couleurs et définissez votre récompense.',
                  descAr: 'اختر ألوانك وحدد مكافأتك.',
                },
                {
                  n: '03', icon: '📲',
                  fr: 'Affichez le QR code',
                  ar: 'اعرض QR Code',
                  desc: 'Imprimez-le et posez-le sur votre caisse. C\'est tout.',
                  descAr: 'اطبعه وضعه على الكاش. هذا كل شيء.',
                },
                {
                  n: '04', icon: '🎯',
                  fr: 'Vos clients fidélisent',
                  ar: 'زبائنك يتعلقون بمحلك',
                  desc: 'Ils scannent, gagnent des points et reviennent.',
                  descAr: 'يمسحون، يكسبون نقاطاً ويعودون.',
                },
              ].map((s, i) => (
                <div key={i} className={`flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all fade-up d${i+1} ${howRef.inView ? 'visible' : ''}`}>
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">{s.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-indigo-500">{s.n}</span>
                      <h3 className="text-sm font-black text-gray-900">{s.fr}</h3>
                      <span className="text-xs text-gray-400 ar">/ {s.ar}</span>
                    </div>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                    <p className="text-[10px] text-gray-400 ar mt-0.5">{s.descAr}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Phone mockup with QR */}
            <div className={`fade-up d3 ${howRef.inView ? 'visible' : ''} flex justify-center`}>
              <div className="relative">
                {/* Glow */}
                <div className="absolute -inset-8 bg-indigo-400/15 rounded-full blur-3xl" />
                {/* Phone frame */}
                <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl w-72">
                  <div className="bg-black rounded-[2.5rem] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80&fit=crop"
                      alt="scan QR"
                      className="w-full aspect-[9/16] object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {/* QR scan overlay */}
                      <div className="relative">
                        <div className="w-32 h-32 border-2 border-white/80 rounded-2xl relative">
                          <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg -translate-x-0.5 -translate-y-0.5" />
                          <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg translate-x-0.5 -translate-y-0.5" />
                          <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg -translate-x-0.5 translate-y-0.5" />
                          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-indigo-400 rounded-br-lg translate-x-0.5 translate-y-0.5" />
                          <div className="absolute inset-0 bg-indigo-400/10 animate-pulse rounded-xl" />
                        </div>
                        <div className="mt-3 bg-emerald-500 text-white text-xs font-bold py-1.5 px-4 rounded-full text-center">
                          ✓ Scan réussi !
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-5 md:px-8">
        <div ref={testimonialRef.ref} className="max-w-5xl mx-auto">
          <div className={`text-center mb-14 fade-up ${testimonialRef.inView ? 'visible' : ''}`}>
            <p className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-2">آراء التجار · Témoignages</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              ماذا يقولون عنا
              <br />
              <span className="text-gray-400 font-normal text-2xl">Ce qu'ils en disent</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className={`fade-up d${i+1} ${testimonialRef.inView ? 'visible' : ''} bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all`}>
                {/* Stars */}
                <div className="flex gap-0.5 text-amber-400 mb-4">{'★★★★★'.split('').map((s,j)=><span key={j} className="text-sm">{s}</span>)}</div>
                {/* Arabic quote */}
                <p className="text-gray-700 text-sm leading-relaxed mb-2 ar font-medium">"{t.text}"</p>
                {/* French quote */}
                <p className="text-gray-400 text-xs leading-relaxed mb-5 italic">"{t.textF}"</p>
                {/* Person */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <img src={t.img} alt={t.nameF} className="w-11 h-11 rounded-full object-cover" onError={(e: any) => { e.target.style.display='none' }} />
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm -ml-11 relative z-10" style={{ background: t.color }}>{t.avatar}</div>
                  <div className="ml-2">
                    <p className="text-sm font-black text-gray-900">{t.nameF} <span className="font-normal text-gray-400 ar text-xs">/ {t.name}</span></p>
                    <p className="text-xs text-gray-400">{t.roleF}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-5 md:px-8 bg-gray-50">
        <div ref={pricingRef.ref} className="max-w-5xl mx-auto">
          <div className={`text-center mb-14 fade-up ${pricingRef.inView ? 'visible' : ''}`}>
            <p className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-2">الأسعار · Tarifs</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              ابدأ مجانًا
              <br />
              <span className="text-gray-400 font-normal text-2xl">Commencez gratuitement</span>
            </h2>
            <p className="text-gray-400 mt-3">بدون التزام. طور عندما تكون مستعداً. / Pas d'engagement.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { plan: 'Starter', planAr: 'مبتدئ', price: 'مجاني / Gratuit', priceVal: '', period: '', desc: 'Pour démarrer', descAr: 'للبداية', features: [['1 carte', '1 بطاقة'], ['50 clients', '50 زبون'], ['QR Code', 'QR Code'], ['Dashboard', 'لوحة تحكم']], cta: 'Commencer / ابدأ', hl: false },
              { plan: 'Pro', planAr: 'محترف', price: '2 500 DA', priceVal: '2 500', period: '/ mois · / شهر', desc: 'Pour les actifs', descAr: 'للتجار النشطين', features: [['5 cartes', '5 بطاقات'], ['500 clients', '500 زبون'], ['Stats avancées', 'إحصاءات'], ['Personnalisation', 'تخصيص'], ['Support prioritaire', 'دعم أولوية']], cta: 'Choisir Pro / اختر Pro', hl: true, badge: '⭐ Le plus populaire' },
              { plan: 'Premium', planAr: 'بريميوم', price: '5 000 DA', priceVal: '5 000', period: '/ mois · / شهر', desc: 'Pour grandir', descAr: 'للنمو', features: [['Cartes illimitées', 'بطاقات غير محدودة'], ['Clients illimités', 'زبائن غير محدودين'], ['API access', 'API'], ['Multi-branches', 'فروع متعددة'], ['Support dédié', 'دعم خاص']], cta: 'Choisir Premium / اختر Premium', hl: false },
            ].map((t, i) => (
              <div key={i} className={`fade-up d${i+1} ${pricingRef.inView ? 'visible' : ''} relative rounded-3xl overflow-hidden`}>
                {t.hl && <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-indigo-400 to-violet-400 -z-10" />}
                <div className={`p-6 h-full flex flex-col rounded-3xl ${t.hl ? 'bg-gray-900 text-white' : 'bg-white border border-gray-100'}`}>
                  {t.badge && <div className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full self-start mb-3">{t.badge}</div>}
                  <div className="mb-4">
                    <h3 className={`text-lg font-black ${t.hl ? 'text-white' : 'text-gray-900'}`}>{t.plan} <span className={`text-sm font-normal ar ${t.hl ? 'text-gray-400' : 'text-gray-400'}`}>/ {t.planAr}</span></h3>
                    <p className={`text-sm ${t.hl ? 'text-gray-400' : 'text-gray-400'}`}>{t.desc} · {t.descAr}</p>
                  </div>
                  <div className="mb-5">
                    <span className={`text-3xl font-black ${t.hl ? 'text-white' : 'text-gray-900'}`}>{t.price}</span>
                    {t.period && <span className={`text-xs ml-1 ${t.hl ? 'text-gray-400' : 'text-gray-400'}`}>{t.period}</span>}
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {t.features.map((f, j) => (
                      <li key={j} className={`flex items-center gap-2 text-sm ${t.hl ? 'text-gray-300' : 'text-gray-600'}`}>
                        <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        {f[0]} <span className="text-xs text-gray-400 ar">/ {f[1]}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => router.push('/signup')} className={`w-full py-3 rounded-2xl font-bold text-sm transition ${t.hl ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                    {t.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-5 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80&fit=crop" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-indigo-900/90 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-4xl mb-5">🚀</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            هل أنت مستعد لاكتساب ولاء زبائنك؟
          </h2>
          <p className="text-white/60 text-xl mb-2">Prêt à fidéliser vos clients ?</p>
          <p className="text-white/40 mb-10">تسجيل مجاني. بدون بطاقة بنكية. · Inscription gratuite. Aucune carte requise.</p>
          <button onClick={() => router.push('/signup')} className="group inline-flex items-center gap-2 px-10 py-4 bg-white text-indigo-900 font-black rounded-2xl hover:bg-indigo-50 transition text-lg shadow-2xl">
            ابدأ مجانًا الآن — Commencer gratuitement
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-white py-12 px-5 md:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="Fidali" className="w-8 h-8 rounded-xl object-contain" />
              <span className="font-black text-gray-900 text-lg">Fidali</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">برنامج ولاء رقمي للتجار الجزائريين.</p>
            <p className="text-xs text-gray-300 mt-1">Programme de fidélité digital pour l'Algérie.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-sm">المنتج / Produit</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#how" className="hover:text-gray-900 transition">كيف يعمل / Fonctionnement</a></li>
              <li><a href="#pricing" className="hover:text-gray-900 transition">الأسعار / Tarifs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-sm">الدخول / Accès</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/signup" className="hover:text-gray-900 transition">إنشاء حساب / Créer un compte</a></li>
              <li><a href="/login" className="hover:text-gray-900 transition">دخول / Se connecter</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-sm">التواصل / Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>contact@fidali.dz</li>
              <li>0555 00 00 00</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-6 text-center">
          <p className="text-xs text-gray-300">© 2025 Fidali — جميع الحقوق محفوظة · Tous droits réservés</p>
        </div>
      </footer>
    </div>
  )
}
