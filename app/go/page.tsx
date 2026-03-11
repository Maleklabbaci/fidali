'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function GoPage() {
  const router = useRouter()
  const [navScrolled, setNavScrolled] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, e.target.id]))
          }
        })
      },
      { threshold: 0.15 }
    )
    sectionRefs.current.forEach((r) => r && obs.observe(r))
    return () => {
      window.removeEventListener('scroll', onScroll)
      obs.disconnect()
    }
  }, [])

  const anim = (id: string) =>
    visibleSections.has(id)
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-10'

  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden">
      {/* ═══════ NAV ═══════ */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          navScrolled
            ? 'bg-white/80 backdrop-blur-2xl shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Fidali"
              className="w-9 h-9 rounded-xl object-contain"
            />
            <span className="font-extrabold text-xl tracking-tight">
              Fidali
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/login')}
              className="hidden sm:block text-sm text-gray-500 hover:text-black transition font-medium"
            >
              Connexion
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="text-sm bg-black text-white font-bold px-6 py-2.5 rounded-full hover:bg-gray-800 transition shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
            >
              Commencer →
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur text-white text-xs font-bold rounded-full border border-white/20">
                🚀 برنامج ولاء رقمي
              </span>
              <span className="px-4 py-1.5 bg-indigo-500/20 backdrop-blur text-indigo-300 text-xs font-bold rounded-full border border-indigo-400/20">
                Nouveau
              </span>
            </div>

            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black text-white leading-[0.95] tracking-tight mb-4">
              Vos clients{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                reviennent
              </span>
              .
              <br />
              <span className="text-white/40">Naturellement.</span>
            </h1>

            <p
              className="text-xl text-white/50 mb-2 font-light max-w-lg"
              dir="rtl"
            >
              زبائنك يرجعولك. بطبيعة الحال.
            </p>

            <p className="text-lg text-white/60 leading-relaxed max-w-lg mb-10">
              Créez votre carte de fidélité digitale en 2 minutes. Vos clients
              la gardent sur leur téléphone — impossible à perdre.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push('/signup')}
                className="group px-8 py-4 bg-white text-black font-bold rounded-full text-base shadow-2xl shadow-white/20 hover:shadow-white/30 hover:-translate-y-1 transition-all"
              >
                Créer ma carte gratuitement
                <span className="inline-block ml-2 group-hover:translate-x-1.5 transition-transform">
                  →
                </span>
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition text-base">
                Voir la démo
              </button>
            </div>

            <div className="flex items-center gap-6 mt-8 text-sm text-white/40">
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Gratuit
              </span>
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Sans application
              </span>
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                2 minutes
              </span>
            </div>
          </div>
        </div>

        {/* Floating phone mockup on right (desktop) */}
        <div className="hidden lg:block absolute right-12 xl:right-24 top-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div
              className="w-[280px] h-[560px] rounded-[3rem] p-3 relative"
              style={{
                background: 'linear-gradient(145deg, #1d1d1f, #2d2d30)',
                boxShadow:
                  '0 50px 100px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)',
                transform: 'rotateY(-12deg) rotateX(3deg)',
              }}
            >
              <div className="w-full h-full bg-white rounded-[2.3rem] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&q=80"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="relative z-10 p-5 pt-12 h-full flex flex-col">
                  <div className="text-center mb-4">
                    <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">☕</span>
                    </div>
                    <p className="font-extrabold text-sm">Café du Centre</p>
                    <p className="text-[10px] text-gray-400">
                      بطاقة الولاء — Fidélité
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 mb-3">
                    <div className="flex gap-1.5 mb-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 h-2 rounded-full"
                          style={{
                            background:
                              i < 5
                                ? 'linear-gradient(90deg,#6366f1,#8b5cf6)'
                                : '#e5e7eb',
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="font-bold text-indigo-600">
                        5/8 نقاط
                      </span>
                      <span className="text-gray-400">🎁 قهوة مجانية</span>
                    </div>
                  </div>
                  <div className="bg-indigo-600 rounded-xl py-3 text-center mt-auto mb-8">
                    <p className="text-white text-xs font-bold">
                      📷 امسح الكود — Scanner
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow */}
            <div className="absolute -bottom-8 left-[10%] right-[10%] h-16 bg-indigo-500/20 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* ═══════ TRUSTED BY ═══════ */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold mb-6">
            +500 commerçants nous font confiance — يثقو فينا
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-40">
            {[
              'Café Central',
              'Pizza Roma',
              'Salon Belle',
              'Boulangerie Épi',
              'Resto El Bahia',
              'Snack Express',
            ].map((n, i) => (
              <span key={i} className="text-lg font-bold text-gray-600">
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section
        id="how"
        ref={(el) => {
          sectionRefs.current[0] = el
        }}
        className={`py-24 px-6 transition-all duration-1000 ${anim('how')}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
              Comment ça marche — كيفاش تخدم
            </span>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight mt-6 mb-3">
              3 étapes. C&apos;est tout.
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto" dir="rtl">
              ثلاث خطوات بسيطة و تبدأ تجمع زبائنك.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
                titleFR: 'Le client scanne votre QR',
                titleAR: 'الزبون يمسح الكود تاعك',
                descFR:
                  'Pas d\'app à télécharger. Juste l\'appareil photo.',
                descAR: 'بدون تحميل. غير بالكاميرا.',
                icon: '📱',
              },
              {
                step: '02',
                img: 'https://images.unsplash.com/photo-1556741533-411cf82e4e2d?w=600&q=80',
                titleFR: 'Vous validez, il gagne un point',
                titleAR: 'تأكد أنت، يربح نقطة',
                descFR: 'Un seul clic. Le client voit ses points monter.',
                descAR: 'ضغطة وحدة. يشوف نقاطه تزيد.',
                icon: '✅',
              },
              {
                step: '03',
                img: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&q=80',
                titleFR: 'La récompense se débloque',
                titleAR: 'المكافأة تفتح',
                descFR:
                  'Carte remplie = récompense. Raison parfaite de revenir.',
                descAR: 'البطاقة تتعمر = مكافأة. يرجعلك.',
                icon: '🎁',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={s.img}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white text-xs font-black border border-white/30">
                      {s.step}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 text-3xl">
                    {s.icon}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-extrabold mb-1">{s.titleFR}</h3>
                  <p
                    className="text-sm text-gray-400 font-medium mb-3"
                    dir="rtl"
                  >
                    {s.titleAR}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {s.descFR}
                  </p>
                  <p
                    className="text-xs text-gray-400 mt-1 leading-relaxed"
                    dir="rtl"
                  >
                    {s.descAR}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SHOWCASE SPLIT ═══════ */}
      <section
        id="showcase"
        ref={(el) => {
          sectionRefs.current[1] = el
        }}
        className={`transition-all duration-1000 ${anim('showcase')}`}
      >
        {/* Row 1 */}
        <div className="grid lg:grid-cols-2">
          <div className="relative h-[400px] lg:h-[600px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80"
              alt="Café"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          </div>
          <div className="flex items-center p-10 lg:p-20 bg-gray-950 text-white">
            <div>
              <span className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em]">
                Pour les cafés ☕
              </span>
              <h2 className="text-[clamp(1.8rem,3vw,3rem)] font-black mt-4 mb-4 leading-[1.1]">
                Chaque café les rapproche d&apos;une récompense.
              </h2>
              <p className="text-lg text-white/40 mb-3 leading-relaxed" dir="rtl">
                كل قهوة تقربهم من المكافأة.
              </p>
              <p className="text-white/50 leading-relaxed mb-8 max-w-md">
                Vos habitués accumulent des points à chaque visite. Au bout de
                8 cafés, le 9ème est offert. Simple et irrésistible.
              </p>
              <button
                onClick={() => router.push('/signup')}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition shadow-lg shadow-indigo-500/30"
              >
                Essayer pour mon café →
              </button>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid lg:grid-cols-2">
          <div className="flex items-center p-10 lg:p-20 bg-white order-2 lg:order-1">
            <div>
              <span className="text-rose-500 text-xs font-bold uppercase tracking-[0.2em]">
                Pour les restaurants 🍕
              </span>
              <h2 className="text-[clamp(1.8rem,3vw,3rem)] font-black mt-4 mb-4 leading-[1.1]">
                Transformez les curieux en habitués.
              </h2>
              <p className="text-lg text-gray-300 mb-3 leading-relaxed" dir="rtl">
                حوّل الزبائن الجداد لزبائن دائمين.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8 max-w-md">
                Un client satisfait revient. Un client fidélisé ramène ses amis.
                En moyenne, +40% de retour avec Fidali.
              </p>
              <button
                onClick={() => router.push('/signup')}
                className="px-8 py-3.5 bg-black hover:bg-gray-800 text-white font-bold rounded-full transition shadow-lg shadow-black/10"
              >
                Essayer pour mon resto →
              </button>
            </div>
          </div>
          <div className="relative h-[400px] lg:h-[600px] overflow-hidden order-1 lg:order-2">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80"
              alt="Restaurant"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid lg:grid-cols-2">
          <div className="relative h-[400px] lg:h-[600px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=80"
              alt="Salon"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          </div>
          <div className="flex items-center p-10 lg:p-20 bg-violet-950 text-white">
            <div>
              <span className="text-violet-400 text-xs font-bold uppercase tracking-[0.2em]">
                Pour les salons 💇
              </span>
              <h2 className="text-[clamp(1.8rem,3vw,3rem)] font-black mt-4 mb-4 leading-[1.1]">
                Elles reviennent, encore et encore.
              </h2>
              <p className="text-lg text-white/40 mb-3 leading-relaxed" dir="rtl">
                يرجعو عندك مرة و مرة.
              </p>
              <p className="text-white/50 leading-relaxed mb-8 max-w-md">
                Brushing, coupe, soin — chaque service rapproche vos clientes
                d&apos;un soin offert. Elles adorent voir leur progression.
              </p>
              <button
                onClick={() => router.push('/signup')}
                className="px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-full transition shadow-lg shadow-violet-500/30"
              >
                Essayer pour mon salon →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section
        id="stats"
        ref={(el) => {
          sectionRefs.current[2] = el
        }}
        className={`py-24 bg-black text-white relative overflow-hidden transition-all duration-1000 ${anim('stats')}`}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&q=60"
            alt=""
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight">
              Les chiffres parlent.
            </h2>
            <p className="text-white/30 text-lg mt-2" dir="rtl">
              الأرقام تتكلم.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                v: '500+',
                ar: 'تاجر',
                fr: 'Commerçants',
                icon: '🏪',
              },
              {
                v: '15K+',
                ar: 'زبون نشط',
                fr: 'Clients actifs',
                icon: '👥',
              },
              {
                v: '+40%',
                ar: 'نسبة الرجوع',
                fr: 'Taux de retour',
                icon: '📈',
              },
              {
                v: '2 min',
                ar: 'للتسجيل',
                fr: 'Pour commencer',
                icon: '⚡',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="text-center p-6 bg-white/5 backdrop-blur rounded-3xl border border-white/10"
              >
                <span className="text-3xl mb-3 block">{s.icon}</span>
                <p className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                  {s.v}
                </p>
                <p className="text-sm text-white/60 font-medium mt-1">
                  {s.fr}
                </p>
                <p className="text-xs text-white/30" dir="rtl">
                  {s.ar}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section
        id="reviews"
        ref={(el) => {
          sectionRefs.current[3] = el
        }}
        className={`py-24 px-6 bg-gray-50 transition-all duration-1000 ${anim('reviews')}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="px-4 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full">
              ⭐ Témoignages — شهادات
            </span>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-tight mt-6 mb-3">
              Ils ont choisi Fidali.
            </h2>
            <p className="text-gray-400 text-lg" dir="rtl">
              اختارو Fidali و ما ندموش.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'كريم بلقاسمي',
                role: 'Café Central, Alger',
                img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
                ar: '40% من زبائني ولاو يرجعو أكثر بفضل Fidali. الكارت الرقمية غيرت كلشي.',
                fr: '40% de mes clients reviennent plus souvent grâce à Fidali.',
                gradient: 'from-blue-500 to-indigo-600',
              },
              {
                name: 'سارة مرابط',
                role: 'Salon Belle, Oran',
                img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
                ar: 'زبوناتي يحبو يشوفو التقدم تاعهم. نسبة الرجوع تضاعفت.',
                fr: 'Mes clientes adorent voir leur progression. Le retour a doublé.',
                gradient: 'from-pink-500 to-rose-600',
              },
              {
                name: 'يوسف عمراني',
                role: 'Pizza Roma, Constantine',
                img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
                ar: 'حطيتها في 3 دقائق. الدخل زاد 25% في شهر.',
                fr: 'Setup en 3 min. Le CA a augmenté de 25% en un mois.',
                gradient: 'from-amber-500 to-orange-600',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.gradient}`}
                />
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className="text-yellow-400 text-lg">
                      ★
                    </span>
                  ))}
                </div>
                <p
                  className="text-sm text-gray-700 leading-[2] mb-2"
                  dir="rtl"
                >
                  &ldquo;{t.ar}&rdquo;
                </p>
                <p className="text-xs text-gray-400 italic mb-6">
                  &ldquo;{t.fr}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.img}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

 {/* ═══════ PRICING ═══════ */}
      <section
        id="pricing"
        ref={(el) => {
          sectionRefs.current[4] = el
        }}
        className={`py-24 px-6 bg-white transition-all duration-1000 ${anim('pricing')}`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">
              💎 Tarifs — الأسعار
            </span>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-tight mt-6 mb-3">
              Commencez gratuitement
            </h2>
            <p className="text-gray-400 text-lg">
              Pas d&apos;engagement. Évoluez quand vous êtes prêt.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Starter */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Starter
              </p>
              <p className="text-sm text-gray-500 mb-6">Pour découvrir</p>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-black">0</span>
                <span className="text-gray-400 text-base mb-1.5">DA</span>
                <span className="text-gray-300 text-sm mb-1.5">/mois</span>
              </div>
              <ul className="space-y-3.5 text-sm text-gray-600 mb-10">
                {[
                  '1 carte de fidélité',
                  'Jusqu\'à 50 clients',
                  'QR Code',
                  'Dashboard basique',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 text-[10px]">✓</span>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push('/signup')}
                className="w-full py-3.5 bg-white text-black font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition text-sm"
              >
                Commencer
              </button>
            </div>

            {/* Pro */}
            <div className="bg-black text-white rounded-3xl p-8 relative shadow-2xl shadow-black/20 md:scale-105 border-2 border-indigo-500/30 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-full shadow-lg shadow-indigo-500/30">
                ⭐ Populaire
              </div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
                Pro
              </p>
              <p className="text-sm text-white/50 mb-6">Commerces actifs</p>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-black">4 500</span>
                <span className="text-white/40 text-base mb-1.5">DA</span>
                <span className="text-white/25 text-sm mb-1.5">/mois</span>
              </div>
              <ul className="space-y-3.5 text-sm text-white/70 mb-10">
                {[
                  'Jusqu\'à 5 cartes',
                  'Clients illimités',
                  'Statistiques avancées',
                  'Support prioritaire',
                  'Personnalisation +',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-400 text-[10px]">✓</span>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push('/signup')}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition text-sm shadow-lg shadow-indigo-500/30"
              >
                Choisir Pro →
              </button>
            </div>

            {/* Premium */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Premium
              </p>
              <p className="text-sm text-gray-500 mb-6">Entreprises</p>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-black">9 000</span>
                <span className="text-gray-400 text-base mb-1.5">DA</span>
                <span className="text-gray-300 text-sm mb-1.5">/mois</span>
              </div>
              <ul className="space-y-3.5 text-sm text-gray-600 mb-10">
                {[
                  'Cartes illimitées',
                  'Tout illimité',
                  'API & Intégrations',
                  'Support dédié',
                  'Multi-branches',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 text-[10px]">✓</span>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3.5 bg-white text-black font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition text-sm">
                Contacter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=70"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
          <img
            src="/logo.png"
            alt="Fidali"
            className="w-16 h-16 rounded-2xl mx-auto mb-8 shadow-2xl object-contain"
          />
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-black tracking-tight leading-[1] mb-4">
            مستعد تحافظ
            <br />
            على زبائنك؟
          </h2>
          <p className="text-xl text-white/50 font-light mb-3">
            Prêt à fidéliser vos clients ?
          </p>
          <p className="text-white/40 text-base mb-10 max-w-lg mx-auto">
            Rejoignez les 500+ commerçants qui font déjà confiance à Fidali.
            Commencez gratuitement en 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/signup')}
              className="group px-10 py-5 bg-white text-black font-extrabold rounded-full text-lg shadow-2xl shadow-white/20 hover:shadow-white/30 hover:-translate-y-1 transition-all"
            >
              ابدأ الآن — Commencer
              <span className="inline-block ml-2 group-hover:translate-x-1.5 transition-transform">
                →
              </span>
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-10 py-5 bg-white/10 backdrop-blur text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition text-lg"
            >
              Se connecter
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-white/30">
            <span>✓ مجاني — Gratuit</span>
            <span>✓ دقيقتين — 2 min</span>
            <span>✓ بلا تطبيق — Sans app</span>
            <span>✓ بلا التزام — Sans engagement</span>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="bg-gray-950 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <img
                  src="/logo.png"
                  alt=""
                  className="w-10 h-10 rounded-xl object-contain"
                />
                <span className="font-extrabold text-xl">Fidali</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed max-w-sm mb-4">
                La solution de fidélité digitale pour les commerçants algériens.
                Simple, rapide et efficace.
              </p>
              <p className="text-white/30 text-sm" dir="rtl">
                الحل الرقمي لبرامج الولاء للتجار الجزائريين.
              </p>
            </div>
            <div>
              <p className="font-bold text-sm mb-4 text-white/60 uppercase tracking-wide">
                Liens
              </p>
              <ul className="space-y-2.5 text-sm text-white/40">
                <li>
                  <button
                    onClick={() => router.push('/signup')}
                    className="hover:text-white transition"
                  >
                    Créer un compte
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/login')}
                    className="hover:text-white transition"
                  >
                    Connexion
                  </button>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition">
                    Tarifs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-sm mb-4 text-white/60 uppercase tracking-wide">
                Contact
              </p>
              <ul className="space-y-2.5 text-sm text-white/40">
                <li>contact@fidali.dz</li>
                <li>+213 XX XX XX XX</li>
                <li>Alger, Algérie 🇩🇿</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/20">
              © 2025 Fidali — Tous droits réservés
            </p>
            <p className="text-xs text-white/20" dir="rtl">
              برنامج ولاء رقمي 🇩🇿
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
