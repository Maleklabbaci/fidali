'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function GoPage() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            setActiveStep(index)
          }
        })
      },
      { rootMargin: '-40% 0px -40% 0px' }
    )
    stepRefs.current.forEach((ref) => { if (ref) observer.observe(ref) })
    return () => observer.disconnect()
  }, [])

  const STEPS = [
    {
      badgeFR: 'La solution', badgeAR: 'الحل',
      titleFR: 'Vos clients reviennent. Naturellement.',
      titleAR: 'زبائنك يرجعولك. بطبيعة الحال.',
      descFR: "Une carte de fidélité digitale directement sur le téléphone de vos clients. Impossible à perdre, impossible à oublier.",
      descAR: "بطاقة ولاء رقمية في هواتف زبائنك مباشرة. مستحيل تضيع، مستحيل تتنسى.",
    },
    {
      badgeFR: 'Étape 1', badgeAR: 'الخطوة 1',
      titleFR: 'Un simple scan au comptoir.',
      titleAR: 'مسحة بسيطة عند الدفع.',
      descFR: "Pas d'application à télécharger. Votre client scanne le QR code avec son appareil photo, c'est tout.",
      descAR: "بدون تحميل أي تطبيق. الزبون يمسح الكود بكاميرا الهاتف، وهذا كل شيء.",
    },
    {
      badgeFR: 'Étape 2', badgeAR: 'الخطوة 2',
      titleFR: 'Les points s\'ajoutent tout seuls.',
      titleAR: 'النقاط تنضاف وحدها.',
      descFR: "Vous validez en un clic. Le client voit sa jauge de fidélité monter en temps réel sur son écran.",
      descAR: "أنت تأكد بضغطة واحدة. الزبون يشوف تقدمه و نقاطه تزيد في الشاشة.",
    },
    {
      badgeFR: 'Étape 3', badgeAR: 'الخطوة 3',
      titleFR: 'La récompense qui fait revenir.',
      titleAR: 'المكافأة لي تخليه يرجع.',
      descFR: "Une fois la carte remplie, la récompense se débloque. Le client a une raison parfaite de revenir.",
      descAR: "كي تتعمر البطاقة، تفتح المكافأة. الزبون عنده سبب مثالي باش يرجع.",
    },
    {
      badgeFR: 'Pour tous', badgeAR: 'للجميع',
      titleFR: 'Cafés. Restos. Salons. Boutiques.',
      titleAR: 'مقاهي. مطاعم. صالونات. بوتيكات.',
      descFR: "Fidali s'adapte à tous les commerces. Personnalisez votre carte avec vos couleurs, votre logo, votre récompense.",
      descAR: "Fidali تتكيف مع كل أنواع التجارة. خصص بطاقتك بألوانك، لوغوك، و مكافأتك.",
    },
  ]

  // Exemples de commerces pour l'étape 4
  const BUSINESSES = [
    { name: 'Café du Centre', emoji: '☕', reward: 'Café offert', color: '#1e293b', pts: 5, max: 8 },
    { name: 'Pizza Roma', emoji: '🍕', reward: 'Pizza gratuite', color: '#991b1b', pts: 7, max: 10 },
    { name: 'Salon Belle', emoji: '💇', reward: 'Brushing offert', color: '#7e22ce', pts: 3, max: 6 },
    { name: 'Boulangerie Épi', emoji: '🥖', reward: 'Baguette offerte', color: '#92400e', pts: 4, max: 5 },
  ]

  return (
    <div className="bg-white text-gray-900 antialiased">

      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Fidali" className="w-8 h-8 rounded-xl object-contain" />
            <span className="font-bold text-lg tracking-tight">Fidali</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/login')} className="text-sm text-gray-500 hover:text-gray-900 font-medium transition">
              Connexion
            </button>
            <button onClick={() => router.push('/signup')} className="text-sm bg-black hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm">
              Commencer
            </button>
          </div>
        </div>
      </nav>

      {/* ================= STICKY SCROLL ================= */}
      <section className="relative w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start pt-16">

        {/* --- LEFT: SCROLLING TEXT --- */}
        <div className="w-full md:w-1/2 pt-10 md:pt-24 pb-32 flex flex-col gap-[35vh]">
          {STEPS.map((step, i) => (
            <div
              key={i}
              data-index={i}
              ref={el => { stepRefs.current[i] = el }}
              className={`min-h-[70vh] flex flex-col justify-center transition-opacity duration-700 ${activeStep === i ? 'opacity-100' : 'opacity-20'}`}
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-full uppercase tracking-wider">{step.badgeFR}</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-full" dir="rtl">{step.badgeAR}</span>
              </div>

              <h2 className="text-[clamp(1.8rem,3.5vw,3rem)] font-extrabold tracking-tight leading-[1.1] mb-3">
                {step.titleFR}
              </h2>
              <h3 className="text-[clamp(1.3rem,2.5vw,2rem)] font-bold text-gray-300 leading-[1.2] mb-6" dir="rtl">
                {step.titleAR}
              </h3>

              <p className="text-[16px] text-gray-500 leading-relaxed mb-2 max-w-lg">{step.descFR}</p>
              <p className="text-[15px] text-gray-400 leading-relaxed max-w-lg" dir="rtl">{step.descAR}</p>

              {i === 0 && (
                <div className="mt-10">
                  <button onClick={() => router.push('/signup')} className="group px-8 py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Créer ma carte — أنشئ بطاقتي
                    <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <p className="mt-4 text-xs text-gray-400">✓ Gratuit (مجاني) · ✓ 2 min · ✓ Sans engagement</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- RIGHT: STICKY PHONE --- */}
        <div className="hidden md:flex w-full md:w-1/2 sticky top-0 h-screen items-center justify-center">
          <div className="relative" style={{ perspective: '1500px' }}>

            {/* Grande carte flottante derrière (visible étape 0 uniquement) */}
            <div className={`absolute z-0 w-[360px] h-[220px] rounded-[28px] p-7 shadow-2xl transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              activeStep === 0
                ? 'opacity-100 translate-x-16 -translate-y-20 rotate-[10deg] scale-100'
                : 'opacity-0 translate-x-0 translate-y-0 rotate-0 scale-75'
            }`} style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)' }}>
              <div className="absolute inset-0 rounded-[28px] opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '18px 18px' }} />
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/[0.04] rounded-full" />
              <div className="relative z-10 text-white h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <img src="/logo.png" alt="" className="w-6 h-6 rounded opacity-70" />
                    <span className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Programme fidélité</span>
                  </div>
                  <p className="font-bold text-xl">Café du Centre ☕</p>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex-1 h-2.5 rounded-full" style={{ background: i < 5 ? '#fbbf24' : 'rgba(255,255,255,0.15)' }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Le téléphone */}
            <div className="relative z-10 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]" style={{
              transform:
                activeStep === 0 ? 'rotateY(-15deg) rotateX(6deg) scale(0.92)' :
                activeStep === 1 ? 'rotateY(0deg) rotateX(0deg) scale(1)' :
                activeStep === 2 ? 'rotateY(8deg) rotateX(4deg) scale(1.04)' :
                activeStep === 3 ? 'rotateY(-5deg) rotateX(12deg) scale(1.08) translateY(-15px)' :
                'rotateY(0deg) rotateX(0deg) scale(1)',
            }}>

              {/* iPhone Frame */}
              <div className="w-[290px] h-[600px] rounded-[50px] p-[12px] relative" style={{
                background: 'linear-gradient(145deg, #1d1d1f, #2d2d2f)',
                boxShadow: '0 50px 100px rgba(0,0,0,0.25), 0 25px 60px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.08)',
              }}>
                {/* Side buttons */}
                <div className="absolute -left-[2px] top-[105px] w-[2px] h-[28px] bg-[#3a3a3a] rounded-l" />
                <div className="absolute -left-[2px] top-[150px] w-[2px] h-[48px] bg-[#3a3a3a] rounded-l" />
                <div className="absolute -left-[2px] top-[210px] w-[2px] h-[48px] bg-[#3a3a3a] rounded-l" />
                <div className="absolute -right-[2px] top-[155px] w-[2px] h-[65px] bg-[#3a3a3a] rounded-r" />

                {/* Screen */}
                <div className="w-full h-full bg-[#f5f5f7] rounded-[40px] overflow-hidden relative">
                  {/* Dynamic Island */}
                  <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[92px] h-[28px] bg-black rounded-full z-40" />
                  {/* Status Bar */}
                  <div className="absolute top-[14px] inset-x-0 flex justify-between px-7 z-30">
                    <span className="text-[11px] font-semibold">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="flex items-end gap-[1.5px]">{[3,5,7,9].map((h,j) => <div key={j} className="w-[2.5px] bg-black rounded-sm" style={{ height: h }} />)}</div>
                      <div className="w-[17px] h-[9px] border-[1.2px] border-black rounded-[2px] ml-1 relative">
                        <div className="absolute inset-[1.5px] right-[2.5px] bg-black rounded-[0.5px]" />
                      </div>
                    </div>
                  </div>

                  {/* === SCREEN CONTENT === */}

                  {/* ÉCRAN 0 : Accueil Carte */}
                  <div className={`absolute inset-0 pt-[55px] px-4 transition-all duration-500 ${activeStep === 0 ? 'opacity-100 z-20' : 'opacity-0 z-0 translate-y-4'}`}>
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <p className="text-[10px] text-gray-400">مرحبا 👋</p>
                        <p className="text-[16px] font-bold">Mohamed</p>
                      </div>
                      <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 text-xs font-bold">M</span>
                      </div>
                    </div>

                    <div className="rounded-[20px] p-5 bg-gray-900 text-white relative overflow-hidden">
                      <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/[0.03] rounded-full" />
                      <div className="relative z-10">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5">ولاء — Fidélité</p>
                        <p className="text-[15px] font-bold mb-5">Café du Centre ☕</p>
                        <div className="flex gap-1.5 mb-3">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex-1 h-[7px] rounded-full" style={{ background: i < 4 ? '#fff' : 'rgba(255,255,255,0.08)' }} />
                          ))}
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-gray-500">4 / 8 نقاط</span>
                          <span className="text-yellow-400">🎁 قهوة مجانية</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[
                        { v: '4', l: 'نقاط', icon: '⭐', c: '#6366f1' },
                        { v: '1', l: 'مكافأة', icon: '🎁', c: '#10b981' },
                        { v: '50%', l: 'تقدم', icon: '📊', c: '#f59e0b' },
                      ].map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl p-2.5 text-center shadow-sm border border-gray-100">
                          <span className="text-[10px]">{s.icon}</span>
                          <p className="text-[13px] font-bold" style={{ color: s.c }}>{s.v}</p>
                          <p className="text-[8px] text-gray-400">{s.l}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 bg-indigo-600 rounded-2xl py-3 text-center shadow-md">
                      <p className="text-white text-[11px] font-semibold">📷 امسح الكود — Scanner</p>
                    </div>
                  </div>

                  {/* ÉCRAN 1 : Scanner QR */}
                  <div className={`absolute inset-0 transition-all duration-500 ${activeStep === 1 ? 'opacity-100 z-20' : 'opacity-0 z-0'}`}>
                    <div className="w-full h-full bg-black relative">
                      <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=70" alt="" className="w-full h-full object-cover opacity-40" />
                      <div className="absolute inset-0 flex items-center justify-center p-10">
                        <div className="w-full aspect-square relative">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white rounded-br-lg" />
                          <div className="absolute top-1/2 left-2 right-2 h-[2px] bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)] animate-pulse rounded-full" />
                        </div>
                      </div>
                      <div className="absolute bottom-16 inset-x-0 text-center">
                        <p className="text-white text-sm font-medium mb-1">امسح الـ QR Code</p>
                        <p className="text-white/50 text-xs">Scannez le QR Code au comptoir</p>
                      </div>
                      <div className="absolute top-16 left-5">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✕</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ÉCRAN 2 : Point ajouté ! */}
                  <div className={`absolute inset-0 pt-[55px] px-4 transition-all duration-500 ${activeStep === 2 ? 'opacity-100 z-20' : 'opacity-0 z-0 translate-y-4'}`}>
                    <div className="text-center mt-8 mb-6">
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
                        <span className="text-4xl">🎉</span>
                      </div>
                      <p className="text-xl font-extrabold mb-1">+1 نقطة!</p>
                      <p className="text-sm text-gray-400">Point ajouté avec succès</p>
                    </div>

                    <div className="rounded-[20px] p-5 bg-gray-900 text-white relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-[15px] font-bold mb-4">Café du Centre ☕</p>
                        <div className="flex gap-1.5 mb-3">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex-1 h-[7px] rounded-full transition-all duration-700" style={{
                              background: i < 5 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.08)',
                              boxShadow: i === 4 ? '0 0 10px rgba(34,197,94,0.4)' : 'none',
                              transitionDelay: i === 4 ? '300ms' : '0ms',
                            }} />
                          ))}
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-emerald-400 font-bold">5 / 8 نقاط ✓</span>
                          <span className="text-yellow-400">🎁 باقي 3</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                      <p className="text-emerald-700 text-sm font-semibold">تقدم ممتاز! 🚀</p>
                      <p className="text-emerald-600/60 text-xs mt-1">Encore 3 visites pour la récompense</p>
                    </div>

                    <div className="mt-4 bg-black rounded-2xl py-3 text-center">
                      <p className="text-white text-[12px] font-semibold">رجوع — Retour</p>
                    </div>
                  </div>

                  {/* ÉCRAN 3 : Récompense débloquée ! */}
                  <div className={`absolute inset-0 pt-[55px] px-4 transition-all duration-500 ${activeStep === 3 ? 'opacity-100 z-20' : 'opacity-0 z-0 translate-y-4'}`}>
                    <div className="text-center mt-6 mb-6">
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping" />
                        <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-yellow-200">
                          <span className="text-5xl">🏆</span>
                        </div>
                      </div>
                      <p className="text-2xl font-black mb-1">مبروك! 🎊</p>
                      <p className="text-sm text-gray-400 font-medium">Félicitations !</p>
                    </div>

                    <div className="rounded-[20px] bg-gradient-to-br from-yellow-400 to-orange-500 p-5 text-center shadow-lg">
                      <p className="text-white/70 text-xs uppercase tracking-widest mb-1">مكافأة — Récompense</p>
                      <p className="text-white text-xl font-black mb-2">☕ قهوة مجانية</p>
                      <p className="text-white/60 text-xs">Café offert • Montrez au comptoir</p>
                      <div className="mt-4 bg-white/20 backdrop-blur rounded-xl py-2 px-4 inline-block">
                        <p className="text-white text-xs font-mono font-bold tracking-wider">CAFE-2024-XK9</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <div className="flex-1 bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
                        <span className="text-lg">📸</span>
                        <p className="text-[9px] text-gray-500 mt-1">مشاركة</p>
                      </div>
                      <div className="flex-1 bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
                        <span className="text-lg">📋</span>
                        <p className="text-[9px] text-gray-500 mt-1">نسخ الكود</p>
                      </div>
                    </div>
                  </div>

                  {/* ÉCRAN 4 : Exemples commerces */}
                  <div className={`absolute inset-0 pt-[55px] px-4 transition-all duration-500 ${activeStep === 4 ? 'opacity-100 z-20' : 'opacity-0 z-0 translate-y-4'}`}>
                    <div className="mb-4">
                      <p className="text-[10px] text-gray-400">اكتشف — Découvrir</p>
                      <p className="text-[16px] font-bold">Mes cartes fidélité</p>
                    </div>

                    <div className="space-y-2.5">
                      {BUSINESSES.map((b, i) => (
                        <div key={i} className="rounded-2xl p-4 text-white relative overflow-hidden" style={{ background: b.color }}>
                          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/5 rounded-full" />
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                              <p className="font-bold text-sm">{b.emoji} {b.name}</p>
                              <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-bold">{b.pts}/{b.max}</span>
                            </div>
                            <div className="flex gap-1">
                              {Array.from({ length: b.max }).map((_, j) => (
                                <div key={j} className="flex-1 h-[5px] rounded-full" style={{ background: j < b.pts ? '#fbbf24' : 'rgba(255,255,255,0.12)' }} />
                              ))}
                            </div>
                            <p className="text-[9px] text-white/40 mt-2">🎁 {b.reward}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-black/15 rounded-full z-50" />
                </div>
              </div>

              {/* Phone shadow */}
              <div className="absolute -bottom-5 left-[12%] right-[12%] h-10 bg-black/[0.06] rounded-full blur-2xl" />
            </div>

            {/* Floating notifications */}
            <div className={`absolute z-20 -right-8 top-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 transition-all duration-700 ${
              activeStep === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center"><span>✅</span></div>
                <div>
                  <p className="text-[11px] font-bold text-emerald-600">+1 نقطة!</p>
                  <p className="text-[9px] text-gray-400">Point validé</p>
                </div>
              </div>
            </div>

            <div className={`absolute z-20 -left-12 bottom-36 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 transition-all duration-700 ${
              activeStep === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"><span>🏆</span></div>
                <div>
                  <p className="text-[11px] font-bold text-yellow-600">مبروك!</p>
                  <p className="text-[9px] text-gray-400">Récompense !</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS BAR ================= */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { v: '500+', ar: 'تاجر', fr: 'Commerçants' },
              { v: '15K+', ar: 'زبون', fr: 'Clients' },
              { v: '+40%', ar: 'نسبة رجوع', fr: 'Taux de retour' },
              { v: '2 min', ar: 'للبداية', fr: 'Pour démarrer' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight">{s.v}</p>
                <p className="text-sm text-white/50 font-medium">{s.ar}</p>
                <p className="text-xs text-white/25">{s.fr}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-500 font-semibold mb-3">شهادات — Témoignages</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-extrabold tracking-tight">واش قالو عنّا</h2>
            <p className="text-gray-400 mt-2">Ce qu&apos;ils disent de nous.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'كريم ب.', role: 'Café Central, الجزائر', ar: '40% من زبائني ولاو يرجعو أكثر. بسيط بزاف.', fr: '40% de mes clients reviennent plus souvent.', color: 'from-indigo-500 to-violet-500' },
              { name: 'سارة م.', role: 'Salon Belle, وهران', ar: 'الزبونات يحبو يشوفو التقدم تاعهم. خلاص ما كانش كروت ورق.', fr: 'Mes clientes adorent suivre leur progression.', color: 'from-pink-500 to-rose-500' },
              { name: 'يوسف أ.', role: 'Pizza Roma, قسنطينة', ar: 'حطيتها في 3 دقائق. +25% دخل.', fr: 'Setup en 3 min. CA +25%.', color: 'from-amber-500 to-orange-500' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, j) => <span key={j} className="text-sm">⭐</span>)}</div>
                <p className="text-sm text-gray-700 leading-[1.8] mb-1" dir="rtl">&ldquo;{t.ar}&rdquo;</p>
                <p className="text-xs text-gray-400 italic mb-4">&ldquo;{t.fr}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 bg-gradient-to-br ${t.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-[11px] text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <img src="/logo.png" alt="Fidali" className="w-14 h-14 rounded-2xl mx-auto mb-6 shadow-lg object-contain" />
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tight leading-[1.1] mb-2">
            مستعد تحافظ على زبائنك؟
          </h2>
          <p className="text-xl text-gray-400 font-light mb-3">Prêt à fidéliser vos clients ?</p>
          <p className="text-gray-400 text-sm mb-8">
            أنشئ بطاقتك الرقمية الآن. مجاناً. — Créez votre carte digitale. Gratuitement.
          </p>
          <button onClick={() => router.push('/signup')} className="group px-10 py-5 bg-black hover:bg-gray-800 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-[16px]">
            ابدأ الآن — Commencer
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <div className="flex items-center justify-center gap-5 mt-5 text-xs text-gray-400">
            <span>✓ مجاني — Gratuit</span>
            <span>✓ دقيقتين — 2 min</span>
            <span>✓ بلا تطبيق — Sans app</span>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="w-6 h-6 rounded-lg object-contain" />
            <span className="text-sm font-semibold text-gray-400">Fidali</span>
          </div>
          <p className="text-[11px] text-gray-300">© 2025 Fidali — برنامج ولاء رقمي</p>
          <button onClick={() => router.push('/login')} className="text-xs text-gray-400 hover:text-gray-600 transition">
            Connexion →
          </button>
        </div>
      </footer>
    </div>
  )
}
