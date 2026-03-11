'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function GoPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [navHide, setNavHide] = useState(false)
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const lastY = useRef(0)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setStep(Number(e.target.getAttribute('data-i')))
        })
      },
      { rootMargin: '-40% 0px -40% 0px' }
    )
    refs.current.forEach((r) => r && obs.observe(r))

    const onScroll = () => {
      const y = window.scrollY
      setNavHide(y > 60 && y > lastY.current)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])

  const STEPS = [
    {
      bFR: 'Fidali', bAR: 'الحل',
      tFR: 'Vos clients reviennent. Naturellement.',
      tAR: 'زبائنك يرجعولك. بطبيعة الحال.',
      dFR: 'Une carte de fidélité digitale sur le téléphone de vos clients. Impossible à perdre, impossible à oublier.',
      dAR: 'بطاقة ولاء رقمية في هواتف زبائنك. مستحيل تضيع، مستحيل تتنسى.',
    },
    {
      bFR: 'Étape 1', bAR: 'الخطوة 1',
      tFR: 'Le client scanne votre QR code.',
      tAR: 'الزبون يمسح الكود تاعك.',
      dFR: "Pas d'application à télécharger. Il scanne avec son appareil photo, c'est tout.",
      dAR: 'بدون تحميل تطبيق. يمسح بكاميرا الهاتف و خلاص.',
    },
    {
      bFR: 'Étape 2', bAR: 'الخطوة 2',
      tFR: 'Vous validez, il gagne un point.',
      tAR: 'تأكد أنت، يربح نقطة.',
      dFR: 'Un clic de votre part. Le client voit ses points monter en direct.',
      dAR: 'ضغطة واحدة منك. الزبون يشوف نقاطه تزيد مباشرة.',
    },
    {
      bFR: 'Étape 3', bAR: 'الخطوة 3',
      tFR: 'La récompense se débloque.',
      tAR: 'المكافأة تفتح.',
      dFR: 'Carte remplie = récompense offerte. Il a une raison parfaite de revenir.',
      dAR: 'البطاقة تتعمر = مكافأة. عنده سبب مثالي يرجعلك.',
    },
    {
      bFR: 'Pour tous', bAR: 'للجميع',
      tFR: 'Votre commerce. Votre carte.',
      tAR: 'تجارتك. بطاقتك.',
      dFR: "Café, restaurant, salon, boulangerie — Fidali s'adapte à vous.",
      dAR: 'مقهى، مطعم، صالون، مخبزة — Fidali تتكيف معاك.',
    },
  ]

  const BUSINESSES = [
    { name: 'Café du Centre', emoji: '☕', reward: 'قهوة مجانية', color: '#1e293b', pts: 5, max: 8 },
    { name: 'Pizza Roma', emoji: '🍕', reward: 'بيتزا مجانية', color: '#991b1b', pts: 7, max: 10 },
    { name: 'Salon Belle', emoji: '💇', reward: 'بروشينغ مجاني', color: '#7e22ce', pts: 3, max: 6 },
    { name: 'Boulangerie Épi', emoji: '🥖', reward: 'خبزة مجانية', color: '#92400e', pts: 4, max: 5 },
  ]

  const phoneX = step % 2 === 0 ? '22vw' : '-22vw'
  const phoneRotate = [
    'rotateY(-12deg) rotateX(4deg)',
    'rotateY(6deg) rotateX(0deg)',
    'rotateY(-8deg) rotateX(3deg)',
    'rotateY(5deg) rotateX(8deg)',
    'rotateY(0deg) rotateX(2deg)',
  ][step]

  return (
    <div className="bg-white text-gray-900 antialiased">

      {/* ============ NAV — se cache au scroll ============ */}
      <nav className={`fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-transform duration-300 ${navHide ? '-translate-y-full' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Fidali" className="w-8 h-8 rounded-xl object-contain" />
            <span className="font-bold text-lg tracking-tight">Fidali</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/login')} className="text-sm text-gray-500 hover:text-black transition font-medium">Connexion</button>
            <button onClick={() => router.push('/signup')} className="text-sm bg-black text-white font-semibold px-5 py-2 rounded-xl hover:bg-gray-800 transition shadow-sm">Commencer</button>
          </div>
        </div>
      </nav>

      {/* ============ MAIN STICKY SCROLL ============ */}
      <section className="pt-14">
        <div className="max-w-7xl mx-auto px-6" style={{ display: 'grid' }}>

          {/* ---- PHONE LAYER (sticky) ---- */}
          <div className="hidden md:flex items-center justify-center sticky top-0 h-screen pointer-events-none z-10" style={{ gridArea: '1/1' }}>
            <div className="transition-all duration-[1200ms]" style={{
              transform: `translateX(${phoneX})`,
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}>

              {/* Grande carte flottante derrière (step 0) */}
              <div className={`absolute z-0 w-[320px] h-[200px] rounded-[24px] p-6 shadow-2xl transition-all duration-[1000ms] ${step === 0
                ? 'opacity-100 -translate-y-16 translate-x-12 rotate-[10deg] scale-100'
                : 'opacity-0 translate-y-0 translate-x-0 rotate-0 scale-75'
                }`} style={{
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
                }}>
                <div className="absolute inset-0 opacity-[0.06] rounded-[24px]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                <div className="relative z-10 text-white h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <img src="/logo.png" alt="" className="w-5 h-5 rounded opacity-70" />
                      <span className="text-[9px] text-white/40 uppercase tracking-[0.15em]">Fidélité</span>
                    </div>
                    <p className="font-bold text-lg">Café du Centre ☕</p>
                  </div>
                  <div className="flex gap-1.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex-1 h-2 rounded-full" style={{ background: i < 5 ? '#fbbf24' : 'rgba(255,255,255,0.15)' }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* 3D Phone */}
              <div style={{ perspective: '1500px' }} className="relative z-10">
                <div className="transition-all duration-[1200ms]" style={{
                  transform: phoneRotate,
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}>

                  {/* iPhone frame */}
                  <div className="w-[260px] h-[530px] rounded-[46px] p-[11px] relative" style={{
                    background: 'linear-gradient(145deg, #1d1d1f, #2d2d30)',
                    boxShadow: '0 50px 100px rgba(0,0,0,0.22), inset 0 0 0 1px rgba(255,255,255,0.08)',
                  }}>
                    <div className="absolute -left-[2px] top-[95px] w-[2px] h-[25px] bg-[#3a3a3a] rounded-l" />
                    <div className="absolute -left-[2px] top-[132px] w-[2px] h-[42px] bg-[#3a3a3a] rounded-l" />
                    <div className="absolute -left-[2px] top-[186px] w-[2px] h-[42px] bg-[#3a3a3a] rounded-l" />
                    <div className="absolute -right-[2px] top-[140px] w-[2px] h-[55px] bg-[#3a3a3a] rounded-r" />

                    <div className="w-full h-full bg-[#f5f5f7] rounded-[36px] overflow-hidden relative">
                      <div className="absolute top-[9px] left-1/2 -translate-x-1/2 w-[80px] h-[24px] bg-black rounded-full z-40" />
                      <div className="absolute top-[11px] inset-x-0 flex justify-between px-6 z-30">
                        <span className="text-[10px] font-semibold">9:41</span>
                        <div className="flex items-center gap-[1px]">{[3, 4, 6, 8].map((h, j) => <div key={j} className="w-[2px] bg-black rounded-sm" style={{ height: h }} />)}</div>
                      </div>

                      {/* ==== ÉCRAN 0 : Accueil ==== */}
                      <div className={`absolute inset-0 pt-[46px] px-3.5 transition-all duration-500 ${step === 0 ? 'opacity-100 z-20' : 'opacity-0 z-0 translate-y-3'}`}>
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-[9px] text-gray-400">مرحبا 👋</p>
                            <p className="text-[14px] font-bold">Mohamed</p>
                          </div>
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 text-[10px] font-bold">M</span>
                          </div>
                        </div>
                        <div className="rounded-[18px] p-4 bg-gray-900 text-white relative overflow-hidden">
                          <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/[0.03] rounded-full" />
                          <div className="relative z-10">
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-0.5">ولاء — Fidélité</p>
                            <p className="text-[13px] font-bold mb-4">Café du Centre ☕</p>
                            <div className="flex gap-1 mb-2.5">
                              {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex-1 h-[6px] rounded-full" style={{ background: i < 4 ? '#fff' : 'rgba(255,255,255,0.08)' }} />
                              ))}
                            </div>
                            <div className="flex justify-between text-[9px]">
                              <span className="text-gray-500">4 / 8 نقاط</span>
                              <span className="text-yellow-400">🎁 قهوة مجانية</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                          {[{ v: '4', l: 'نقاط', icon: '⭐', c: '#6366f1' }, { v: '1', l: 'مكافأة', icon: '🎁', c: '#10b981' }, { v: '50%', l: 'تقدم', icon: '📊', c: '#f59e0b' }].map((s, i) => (
                            <div key={i} className="bg-white rounded-xl p-2 text-center shadow-sm border border-gray-100">
                              <span className="text-[9px]">{s.icon}</span>
                              <p className="text-[12px] font-bold" style={{ color: s.c }}>{s.v}</p>
                              <p className="text-[7px] text-gray-400">{s.l}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2.5 bg-indigo-600 rounded-xl py-2.5 text-center shadow-sm">
                          <p className="text-white text-[10px] font-semibold">📷 امسح الكود — Scanner</p>
                        </div>
                      </div>

                      {/* ==== ÉCRAN 1 : Scanner ==== */}
                      <div className={`absolute inset-0 transition-all duration-500 ${step === 1 ? 'opacity-100 z-20' : 'opacity-0 z-0'}`}>
                        <div className="w-full h-full bg-black relative">
                          <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&q=60" alt="" className="w-full h-full object-cover opacity-30" />
                          <div className="absolute inset-0 flex items-center justify-center p-12">
                            <div className="w-full aspect-square relative">
                              <div className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-white rounded-tl" />
                              <div className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-white rounded-tr" />
                              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-white rounded-bl" />
                              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-white rounded-br" />
                              <div className="absolute top-1/2 left-1 right-1 h-[2px] bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)] animate-pulse rounded-full" />
                            </div>
                          </div>
                          <div className="absolute bottom-14 inset-x-0 text-center">
                            <p className="text-white text-[12px] font-medium mb-0.5">امسح الـ QR Code</p>
                            <p className="text-white/40 text-[10px]">Scannez le QR Code</p>
                          </div>
                          <div className="absolute top-14 left-4">
                            <div className="w-7 h-7 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✕</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ==== ÉCRAN 2 : Point ajouté ==== */}
                      <div className={`absolute inset-0 pt-[46px] px-3.5 transition-all duration-500 ${step === 2 ? 'opacity-100 z-20' : 'opacity-0 z-0 translate-y-3'}`}>
                        <div className="text-center mt-6 mb-4">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-100">
                            <span className="text-3xl">🎉</span>
                          </div>
                          <p className="text-lg font-extrabold mb-0.5">+1 نقطة!</p>
                          <p className="text-[11px] text-gray-400">Point ajouté avec succès</p>
                        </div>
                        <div className="rounded-[18px] p-4 bg-gray-900 text-white">
                          <p className="text-[13px] font-bold mb-3">Café du Centre ☕</p>
                          <div className="flex gap-1 mb-2.5">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div key={i} className="flex-1 h-[6px] rounded-full transition-all duration-700" style={{
                                background: i < 5 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.08)',
                                boxShadow: i === 4 ? '0 0 8px rgba(34,197,94,0.4)' : 'none',
                              }} />
                            ))}
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-emerald-400 font-bold">5 / 8 ✓</span>
                            <span className="text-yellow-400">🎁 باقي 3</span>
                          </div>
                        </div>
                        <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                          <p className="text-emerald-700 text-[11px] font-semibold">تقدم ممتاز! 🚀</p>
                          <p className="text-emerald-600/60 text-[9px] mt-0.5">Encore 3 visites</p>
                        </div>
                      </div>

                      {/* ==== ÉCRAN 3 : Récompense ==== */}
                      <div className={`absolute inset-0 pt-[46px] px-3.5 transition-all duration-500 ${step === 3 ? 'opacity-100 z-20' : 'opacity-0 z-0 translate-y-3'}`}>
                        <div className="text-center mt-4 mb-4">
                          <div className="relative w-20 h-20 mx-auto mb-3">
                            <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping" />
                            <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-yellow-200">
                              <span className="text-4xl">🏆</span>
                            </div>
                          </div>
                          <p className="text-xl font-black mb-0.5">مبروك! 🎊</p>
                          <p className="text-[11px] text-gray-400">Félicitations !</p>
                        </div>
                        <div className="rounded-[18px] bg-gradient-to-br from-yellow-400 to-orange-500 p-4 text-center shadow-lg">
                          <p className="text-white/70 text-[9px] uppercase tracking-widest mb-0.5">مكافأة</p>
                          <p className="text-white text-lg font-black mb-1">☕ قهوة مجانية</p>
                          <p className="text-white/60 text-[10px]">Café offert — Montrez au comptoir</p>
                          <div className="mt-3 bg-white/20 backdrop-blur rounded-lg py-1.5 px-3 inline-block">
                            <p className="text-white text-[10px] font-mono font-bold tracking-wider">CAFE-2024-XK9</p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <div className="flex-1 bg-white rounded-xl p-2.5 text-center shadow-sm border border-gray-100">
                            <span className="text-sm">📸</span>
                            <p className="text-[8px] text-gray-500 mt-0.5">مشاركة</p>
                          </div>
                          <div className="flex-1 bg-white rounded-xl p-2.5 text-center shadow-sm border border-gray-100">
                            <span className="text-sm">📋</span>
                            <p className="text-[8px] text-gray-500 mt-0.5">نسخ</p>
                          </div>
                        </div>
                      </div>

                      {/* ==== ÉCRAN 4 : Multi-commerces ==== */}
                      <div className={`absolute inset-0 pt-[46px] px-3.5 transition-all duration-500 ${step === 4 ? 'opacity-100 z-20' : 'opacity-0 z-0 translate-y-3'}`}>
                        <div className="mb-3">
                          <p className="text-[9px] text-gray-400">اكتشف</p>
                          <p className="text-[14px] font-bold">بطاقاتي — Mes cartes</p>
                        </div>
                        <div className="space-y-2">
                          {BUSINESSES.map((b, i) => (
                            <div key={i} className="rounded-[14px] p-3 text-white relative overflow-hidden" style={{ background: b.color }}>
                              <div className="absolute -top-3 -right-3 w-12 h-12 bg-white/5 rounded-full" />
                              <div className="relative z-10">
                                <div className="flex justify-between items-center mb-2">
                                  <p className="font-bold text-[11px]">{b.emoji} {b.name}</p>
                                  <span className="text-[9px] bg-white/15 px-2 py-0.5 rounded-full font-bold">{b.pts}/{b.max}</span>
                                </div>
                                <div className="flex gap-[3px]">
                                  {Array.from({ length: b.max }).map((_, j) => (
                                    <div key={j} className="flex-1 h-[4px] rounded-full" style={{ background: j < b.pts ? '#fbbf24' : 'rgba(255,255,255,0.1)' }} />
                                  ))}
                                </div>
                                <p className="text-[8px] text-white/40 mt-1.5">🎁 {b.reward}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Home indicator */}
                      <div className="absolute bottom-[4px] left-1/2 -translate-x-1/2 w-[80px] h-[3px] bg-black/15 rounded-full z-50" />
                    </div>
                  </div>

                  <div className="absolute -bottom-4 left-[15%] right-[15%] h-8 bg-black/5 rounded-full blur-2xl" />
                </div>
              </div>

              {/* Floating: +1 point (step 2) */}
              <div className={`absolute z-30 -right-4 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 p-2.5 transition-all duration-700 ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center"><span className="text-sm">✅</span></div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600">+1 نقطة!</p>
                    <p className="text-[8px] text-gray-400">Point validé</p>
                  </div>
                </div>
              </div>

              {/* Floating: reward (step 3) */}
              <div className={`absolute z-30 -left-8 bottom-24 bg-white rounded-2xl shadow-xl border border-gray-100 p-2.5 transition-all duration-700 ${step === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-yellow-100 rounded-full flex items-center justify-center"><span className="text-sm">🏆</span></div>
                  <div>
                    <p className="text-[10px] font-bold text-yellow-600">مبروك!</p>
                    <p className="text-[8px] text-gray-400">Récompense !</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ---- TEXT LAYER (scrolling) ---- */}
          <div className="relative z-0" style={{ gridArea: '1/1' }}>
            {STEPS.map((s, i) => (
              <div
                key={i}
                data-i={i}
                ref={el => { refs.current[i] = el }}
                className={`min-h-screen flex items-center py-16 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`w-full md:w-[42%] pointer-events-auto transition-opacity duration-500 ${step === i ? 'opacity-100' : 'opacity-10'}`}>
                  <div className="flex items-center gap-2 mb-5">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-full uppercase tracking-wide">{s.bFR}</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-full" dir="rtl">{s.bAR}</span>
                  </div>

                  <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold tracking-tight leading-[1.1] mb-2">{s.tFR}</h2>
                  <h3 className="text-[clamp(1.2rem,2vw,1.8rem)] font-bold text-gray-300 leading-[1.2] mb-5" dir="rtl">{s.tAR}</h3>

                  <p className="text-[15px] text-gray-500 leading-relaxed mb-2 max-w-md">{s.dFR}</p>
                  <p className="text-[14px] text-gray-400 leading-relaxed max-w-md" dir="rtl">{s.dAR}</p>

                  {i === 0 && (
                    <div className="mt-8">
                      <button onClick={() => router.push('/signup')} className="group px-8 py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-[14px]">
                        Créer ma carte — أنشئ بطاقتي
                        <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                      <p className="mt-3 text-xs text-gray-400">✓ Gratuit (مجاني) · ✓ 2 min · ✓ Sans engagement</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: '500+', ar: 'تاجر', fr: 'Commerçants' },
            { v: '15K+', ar: 'زبون', fr: 'Clients' },
            { v: '+40%', ar: 'نسبة رجوع', fr: 'Taux de retour' },
            { v: '2 min', ar: 'للبداية', fr: 'Pour démarrer' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight">{s.v}</p>
              <p className="text-sm text-white/50 font-medium mt-1">{s.ar}</p>
              <p className="text-xs text-white/25">{s.fr}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-500 font-semibold mb-2">شهادات — Témoignages</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-extrabold tracking-tight">واش قالو عنّا</h2>
            <p className="text-gray-400 mt-1 text-sm">Ce qu&apos;ils disent de nous.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'كريم ب.', role: 'Café Central, الجزائر', ar: '40% من زبائني ولاو يرجعو أكثر. بسيط بزاف.', fr: '40% de mes clients reviennent plus souvent.', color: 'from-indigo-500 to-violet-500' },
              { name: 'سارة م.', role: 'Salon Belle, وهران', ar: 'الزبونات يحبو يشوفو التقدم تاعهم. ما كانش كروت ورق.', fr: 'Mes clientes adorent suivre leur progression.', color: 'from-pink-500 to-rose-500' },
              { name: 'يوسف أ.', role: 'Pizza Roma, قسنطينة', ar: 'حطيتها في 3 دقائق. +25% دخل.', fr: 'Setup en 3 min. CA +25%.', color: 'from-amber-500 to-orange-500' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, j) => <span key={j} className="text-sm">⭐</span>)}</div>
                <p className="text-[13px] text-gray-700 leading-[1.8] mb-1" dir="rtl">&ldquo;{t.ar}&rdquo;</p>
                <p className="text-[12px] text-gray-400 italic mb-4">&ldquo;{t.fr}&rdquo;</p>
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

      {/* ============ CTA FINAL ============ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <img src="/logo.png" alt="Fidali" className="w-14 h-14 rounded-2xl mx-auto mb-6 shadow-lg object-contain" />
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tight leading-[1.1] mb-2">
            مستعد تحافظ على زبائنك؟
          </h2>
          <p className="text-lg text-gray-400 font-light mb-3">Prêt à fidéliser vos clients ?</p>
          <p className="text-gray-400 text-sm mb-8">
            أنشئ بطاقتك الرقمية الآن. مجاناً — Créez votre carte digitale. Gratuitement.
          </p>
          <button onClick={() => router.push('/signup')} className="group px-10 py-5 bg-black hover:bg-gray-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-[15px]">
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

      {/* ============ FOOTER ============ */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="w-6 h-6 rounded-lg object-contain" />
            <span className="text-sm font-semibold text-gray-400">Fidali</span>
          </div>
          <p className="text-[11px] text-gray-300">© 2025 Fidali — برنامج ولاء رقمي</p>
          <button onClick={() => router.push('/login')} className="text-xs text-gray-400 hover:text-gray-600 transition">Connexion →</button>
        </div>
      </footer>
    </div>
  )
}
