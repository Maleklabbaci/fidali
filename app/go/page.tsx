'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function GoPage() {
  const router = useRouter()
  const [sy, setSy] = useState(0)
  const [wh, setWh] = useState(800)

  useEffect(() => {
    setWh(window.innerHeight)
    const onScroll = () => setSy(window.scrollY)
    const onResize = () => setWh(window.innerHeight)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // Animation helpers
  const progress = (start: number, end: number) => {
    const s = start * wh, e = end * wh
    if (sy < s) return 0
    if (sy > e) return 1
    return (sy - s) / (e - s)
  }
  const fadeIn = (start: number, dur = 0.6) => Math.min(progress(start, start + dur), 1)
  const fadeOut = (start: number, dur = 0.6) => Math.max(1 - progress(start, start + dur), 0)
  const between = (inS: number, outS: number) => Math.min(fadeIn(inS), fadeOut(outS))
  const lerp = (start: number, from: number, to: number, dur = 0.8) => {
    const t = Math.min(progress(start, start + dur), 1)
    return from + (to - from) * t
  }

  // Points animation pour la carte
  const pts = Math.min(Math.floor(progress(2, 4.5) * 8), 8)

  return (
    <div className="bg-white text-gray-900 selection:bg-gray-900 selection:text-white">

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-gray-100">
        <div
          className="h-full bg-gray-900 transition-[width] duration-100"
          style={{ width: `${Math.min((sy / (wh * 13)) * 100, 100)}%` }}
        />
      </div>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        sy > 100 ? 'bg-white/80 backdrop-blur-2xl shadow-[0_1px_0_rgba(0,0,0,0.04)]' : ''
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-bold">F</span>
            </div>
            <span className="font-semibold text-[15px] tracking-tight">Fidali</span>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="text-[13px] text-gray-400 hover:text-gray-900 transition-colors font-medium"
          >
            Se connecter
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════ */}
      {/* SCENE 1 — Hero avec typographie massive    */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative h-[400vh]">
        <div className="sticky top-0 h-screen overflow-hidden">

          {/* Fond subtil animé */}
          <div className="absolute inset-0" style={{ opacity: between(-0.2, 3.5) }}>
            <div className="absolute inset-0 bg-[#fafafa]" />
            <div
              className="absolute top-1/2 left-1/2 w-[800px] h-[800px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)',
                transform: `translate(-50%, -50%) scale(${1 + sy * 0.0002})`,
              }}
            />
          </div>

          {/* Texte hero */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: between(-0.3, 1.2),
              transform: `translateY(${lerp(-0.3, 20, -30)}px)`,
            }}
          >
            <div className="text-center px-6 max-w-4xl">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 mb-8"
                style={{ opacity: fadeIn(-0.1) }}
              >
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Fidélité digitale pour commerces
                </span>
              </div>

              <h1
                className="text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em]"
                style={{ opacity: fadeIn(0) }}
              >
                Vos clients
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-600 to-gray-400">
                  reviennent.
                </span>
              </h1>

              <p
                className="text-lg md:text-xl text-gray-400 mt-6 font-light max-w-lg mx-auto leading-relaxed"
                style={{ opacity: fadeIn(0.2) }}
              >
                La carte de fidélité digitale que vos clients
                <br className="hidden md:block" />
                ont toujours sur eux.
              </p>

              <div className="mt-10 flex items-center justify-center gap-3 text-gray-300" style={{ opacity: fadeIn(0.4) }}>
                <span className="text-xs">Scrollez pour découvrir</span>
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════ */}
          {/* iPhone avec carte fidélité              */}
          {/* ════════════════════════════════════════ */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: between(1, 3.5),
              transform: `translateY(${lerp(1, 120, 0)}px) scale(${0.85 + fadeIn(1) * 0.15})`,
            }}
          >
            <div style={{ perspective: '1500px' }}>
              <div style={{
                transform: `rotateY(${lerp(1.8, 0, -5)}deg) rotateX(${lerp(2.2, 0, 2)}deg)`,
                transformStyle: 'preserve-3d',
              }}>
                {/* iPhone body */}
                <div
                  className="relative w-[280px] sm:w-[300px] h-[580px] sm:h-[620px] rounded-[48px] p-3"
                  style={{
                    background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a, #111)',
                    boxShadow: `
                      0 50px 100px -20px rgba(0,0,0,0.25),
                      0 30px 60px -10px rgba(0,0,0,0.15),
                      inset 0 1px 0 rgba(255,255,255,0.06),
                      inset 0 -1px 0 rgba(0,0,0,0.3)
                    `,
                  }}
                >
                  {/* Side buttons */}
                  <div className="absolute -left-[2.5px] top-[100px] w-[2.5px] h-[28px] bg-[#333] rounded-l-sm" />
                  <div className="absolute -left-[2.5px] top-[145px] w-[2.5px] h-[50px] bg-[#333] rounded-l-sm" />
                  <div className="absolute -left-[2.5px] top-[210px] w-[2.5px] h-[50px] bg-[#333] rounded-l-sm" />
                  <div className="absolute -right-[2.5px] top-[145px] w-[2.5px] h-[65px] bg-[#333] rounded-r-sm" />

                  {/* Screen */}
                  <div className="w-full h-full bg-[#fafafa] rounded-[38px] overflow-hidden relative">

                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[90px] h-[26px] bg-black rounded-full z-30">
                      <div className="absolute right-[18px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-[#1a1a2e] ring-1 ring-[#2a2a3a]" />
                    </div>

                    {/* Status bar */}
                    <div className="h-[52px] flex items-end justify-between px-7 pb-0.5 relative z-20">
                      <span className="text-[11px] font-semibold text-gray-900">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="flex items-end gap-[2px]">
                          {[4, 6, 8, 10].map((h, i) => (
                            <div key={i} className="w-[3px] rounded-sm bg-gray-900" style={{ height: `${h}px` }} />
                          ))}
                        </div>
                        <svg className="w-[14px] h-[10px] ml-1" viewBox="0 0 24 12" fill="currentColor">
                          <rect x="0" y="0.5" width="20" height="11" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
                          <rect x="2" y="2.5" width="14" height="7" rx="0.5" fill="currentColor" />
                          <rect x="21" y="3.5" width="2" height="5" rx="1" fill="currentColor" />
                        </svg>
                      </div>
                    </div>

                    {/* App content */}
                    <div className="px-4 pt-2">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[9px] text-gray-400 font-medium">Bonjour</p>
                          <p className="text-[14px] font-bold text-gray-900 -mt-0.5">Mohamed</p>
                        </div>
                        <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
                          <span className="text-white text-[9px] font-bold">F</span>
                        </div>
                      </div>

                      {/* Carte fidélité */}
                      <div
                        className="rounded-[18px] p-4 relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                          minHeight: '170px',
                        }}
                      >
                        {/* Decorative elements */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/[0.03]" />
                        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/[0.02]" />
                        <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-indigo-500/10 blur-xl" />

                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <p className="text-[7px] text-white/30 uppercase tracking-[0.25em] font-medium">
                                Carte fidélité
                              </p>
                              <h3 className="font-bold text-[14px] text-white mt-0.5">Café du Port</h3>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/5">
                              <span className="text-[10px] font-bold text-white">{pts}/8</span>
                            </div>
                          </div>

                          {/* Points dots */}
                          <div className="flex gap-[5px] my-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div
                                key={i}
                                className="flex-1 h-[7px] rounded-full transition-all duration-500"
                                style={{
                                  background: i < pts
                                    ? 'linear-gradient(90deg, #818cf8, #a78bfa)'
                                    : 'rgba(255,255,255,0.08)',
                                  boxShadow: i < pts ? '0 0 8px rgba(129,140,248,0.3)' : 'none',
                                  transitionDelay: `${i * 80}ms`,
                                }}
                              />
                            ))}
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[12px]">☕</span>
                              <p className="text-[10px] text-white/40">Café offert</p>
                            </div>
                            <p className="text-[8px] text-white/20 font-mono tracking-wider">CAFE-2024</p>
                          </div>
                        </div>

                        {/* Reward overlay */}
                        {pts >= 8 && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-[18px] z-20">
                            <div className="text-center">
                              <div className="text-3xl mb-1">🎉</div>
                              <p className="text-white font-bold text-[13px]">Récompense débloquée !</p>
                              <p className="text-white/40 text-[10px] mt-0.5">Montrez à votre barista</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Stats row */}
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {[
                          { v: pts, l: 'Points', color: '#6366f1' },
                          { v: 2, l: 'Récomp.', color: '#10b981' },
                          { v: `${Math.round(pts / 8 * 100)}%`, l: 'Progrès', color: '#f59e0b' },
                        ].map((s, i) => (
                          <div key={i} className="bg-white rounded-xl p-2.5 text-center shadow-sm border border-gray-100/80">
                            <p className="text-[14px] font-bold" style={{ color: s.color }}>{s.v}</p>
                            <p className="text-[8px] text-gray-400 mt-0.5 font-medium">{s.l}</p>
                          </div>
                        ))}
                      </div>

                      {/* Scan button */}
                      <div className="mt-3 bg-gray-900 rounded-xl py-2.5 text-center active:scale-[0.98] transition-transform cursor-pointer">
                        <p className="text-white text-[11px] font-semibold tracking-wide">Scanner le QR Code</p>
                      </div>

                      {/* Recent activity */}
                      <div className="mt-3">
                        <p className="text-[8px] text-gray-400 uppercase tracking-wider font-medium mb-2">Récent</p>
                        {[
                          { t: 'Cappuccino', d: 'Aujourd\'hui', p: '+1 pt' },
                          { t: 'Espresso', d: 'Hier', p: '+1 pt' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-[10px]">☕</span>
                              </div>
                              <div>
                                <p className="text-[10px] font-medium text-gray-900">{item.t}</p>
                                <p className="text-[8px] text-gray-400">{item.d}</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-semibold text-indigo-500">{item.p}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Home indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-gray-900/20 rounded-full" />
                  </div>
                </div>

                {/* Phone shadow */}
                <div className="absolute -bottom-6 left-[10%] right-[10%] h-12 rounded-[50%] bg-black/8 blur-2xl" />
              </div>
            </div>
          </div>

          {/* Side texts */}
          <div
            className="absolute left-[5%] top-1/2 -translate-y-1/2 max-w-[260px] hidden lg:block"
            style={{
              opacity: between(1.8, 3.2),
              transform: `translateX(${lerp(1.8, -40, 0)}px)`,
            }}
          >
            <div className="w-8 h-[2px] bg-red-400 mb-4" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-red-400 font-semibold mb-3">Le problème</p>
            <h3 className="text-xl font-bold leading-snug mb-3">
              67% de vos clients ne reviennent jamais.
            </h3>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Pas parce qu&apos;ils n&apos;ont pas aimé.
              <br />Parce qu&apos;ils oublient.
            </p>
          </div>

          <div
            className="absolute right-[5%] top-1/2 -translate-y-1/2 max-w-[240px] text-right hidden lg:block"
            style={{
              opacity: between(2.3, 3.4),
              transform: `translateX(${lerp(2.3, 40, 0)}px)`,
            }}
          >
            <div className="w-8 h-[2px] bg-emerald-400 mb-4 ml-auto" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 font-semibold mb-3">La solution</p>
            <h3 className="text-xl font-bold leading-snug mb-3">
              Une carte digitale sur leur téléphone.
            </h3>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Toujours avec eux.
              <br />Ils reviennent naturellement.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SCENE 2 — Comment ça marche                */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative h-[300vh]">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center px-6">

          {/* Background gradient subtil */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, rgba(99,102,241,${0.03 * fadeIn(4)}) 0%, transparent 70%)`,
            }}
          />

          <div className="max-w-3xl w-full" style={{ opacity: between(4, 6.5) }}>
            <div className="text-center mb-14" style={{ transform: `translateY(${lerp(4, 40, 0)}px)` }}>
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-medium mb-4">
                Comment ça marche
              </p>
              <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.05] tracking-tight">
                Un scan. Un point.
                <br />
                <span className="text-gray-300">C&apos;est tout.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-10">
              {[
                {
                  num: '01',
                  title: 'Le client scanne',
                  desc: 'Il ouvre l\'appareil photo de son téléphone et scanne votre QR code. Pas d\'app à télécharger.',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75H16.5v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75H16.5v-.75z" />
                    </svg>
                  ),
                },
                {
                  num: '02',
                  title: 'Vous validez',
                  desc: 'Un clic sur votre dashboard. Le point est ajouté instantanément sur sa carte.',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  num: '03',
                  title: 'Il revient',
                  desc: 'Carte complète = récompense. Il est motivé à revenir. Votre chiffre d\'affaires monte.',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  ),
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="text-center md:text-left"
                  style={{
                    opacity: fadeIn(4.8 + i * 0.3),
                    transform: `translateY(${lerp(4.8 + i * 0.3, 40, 0)}px)`,
                  }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-2xl mb-4 text-gray-900 border border-gray-100">
                    {step.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                    <span className="text-[10px] font-bold text-gray-300">{step.num}</span>
                    <h3 className="font-bold text-base">{step.title}</h3>
                  </div>
                  <p className="text-[13px] text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SCENE 3 — Secteurs avec cards visuelles    */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative h-[250vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-[#090909] flex items-center justify-center px-6">
          <div className="max-w-5xl w-full" style={{ opacity: between(6.5, 9) }}>

            <div className="text-center mb-12" style={{
              opacity: fadeIn(6.8),
              transform: `translateY(${lerp(6.8, 30, 0)}px)`,
            }}>
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-medium mb-4">
                Pour tous les commerces
              </p>
              <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-white leading-[1.05] tracking-tight">
                Cafés. Restos. Salons.
                <br />
                <span className="text-gray-600">Boutiques. Et plus.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { emoji: '☕', name: 'Cafés', desc: 'Café offert au 8e passage', bg: 'from-amber-900/40 to-amber-950/60' },
                { emoji: '🍕', name: 'Restaurants', desc: 'Dessert offert', bg: 'from-red-900/40 to-red-950/60' },
                { emoji: '💇', name: 'Salons', desc: 'Soin gratuit', bg: 'from-pink-900/40 to-pink-950/60' },
                { emoji: '🛍️', name: 'Boutiques', desc: '-20% au 5e achat', bg: 'from-blue-900/40 to-blue-950/60' },
                { emoji: '🍰', name: 'Boulangeries', desc: 'Pâtisserie offerte', bg: 'from-yellow-900/40 to-yellow-950/60' },
                { emoji: '💪', name: 'Salles de sport', desc: 'Séance offerte', bg: 'from-green-900/40 to-green-950/60' },
                { emoji: '🧴', name: 'Spas', desc: 'Massage offert', bg: 'from-purple-900/40 to-purple-950/60' },
                { emoji: '🚗', name: 'Lavages auto', desc: 'Lavage offert', bg: 'from-cyan-900/40 to-cyan-950/60' },
              ].map((sector, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${sector.bg} rounded-2xl p-4 border border-white/[0.04] hover:border-white/10 transition-all group cursor-default`}
                  style={{
                    opacity: fadeIn(7 + i * 0.1),
                    transform: `translateY(${lerp(7 + i * 0.1, 30, 0)}px) scale(${0.9 + fadeIn(7 + i * 0.1) * 0.1})`,
                  }}
                >
                  <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{sector.emoji}</span>
                  <p className="text-white font-semibold text-[13px]">{sector.name}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">{sector.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SCENE 4 — Chiffres                         */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative h-[200vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-white flex items-center justify-center px-6">
          <div className="max-w-4xl w-full" style={{ opacity: between(9, 10.5) }}>

            <p
              className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-medium text-center mb-14"
              style={{ opacity: fadeIn(9.2) }}
            >
              En chiffres
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
              {[
                { value: '500+', label: 'Commerçants', sub: 'nous font confiance' },
                { value: '15K+', label: 'Clients', sub: 'fidélisés ce mois' },
                { value: '+40%', label: 'De retours', sub: 'en moyenne' },
                { value: '2 min', label: 'Pour démarrer', sub: 'c\'est tout' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="text-center"
                  style={{
                    opacity: fadeIn(9.3 + i * 0.15),
                    transform: `translateY(${lerp(9.3 + i * 0.15, 35, 0)}px)`,
                  }}
                >
                  <p className="text-[clamp(2.2rem,5vw,3.8rem)] font-black tracking-tight leading-none">
                    {stat.value}
                  </p>
                  <p className="text-sm font-semibold mt-2 text-gray-900">{stat.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Trust bar */}
            <div
              className="mt-16 flex items-center justify-center gap-6 flex-wrap"
              style={{ opacity: fadeIn(9.8) }}
            >
              {['Sans app à télécharger', 'Compatible tous téléphones', 'Dashboard en temps réel', 'Support 7j/7'].map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-[12px] text-gray-500 font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SCENE 5 — Témoignages                      */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative h-[200vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-[#fafafa] flex items-center justify-center px-6">
          <div className="max-w-5xl w-full" style={{ opacity: between(10.5, 12) }}>

            <div className="text-center mb-10" style={{ opacity: fadeIn(10.6) }}>
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-medium mb-4">
                Témoignages
              </p>
              <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold tracking-tight">
                Ils l&apos;utilisent déjà.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  name: 'Karim B.',
                  role: 'Café Central, Alger',
                  text: 'En 1 mois, 40% de mes clients reviennent plus souvent. Le QR code est d\'une simplicité redoutable.',
                  initials: 'KB',
                  gradient: 'from-blue-500 to-indigo-600',
                },
                {
                  name: 'Sarah M.',
                  role: 'Salon Belle, Oran',
                  text: 'Mes clientes adorent voir leur progression. Fini les cartes papier perdues. C\'est mon outil préféré.',
                  initials: 'SM',
                  gradient: 'from-pink-500 to-rose-600',
                },
                {
                  name: 'Youcef A.',
                  role: 'Pizza Roma, Constantine',
                  text: 'Setup en 3 minutes. Mes clients commandent plus pour avoir la pizza gratuite. CA en hausse de 25%.',
                  initials: 'YA',
                  gradient: 'from-amber-500 to-orange-600',
                },
              ].map((t, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow"
                  style={{
                    opacity: fadeIn(10.8 + i * 0.2),
                    transform: `translateY(${lerp(10.8 + i * 0.2, 35, 0)}px)`,
                  }}
                >
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg key={j} className="w-[13px] h-[13px] text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-[13px] text-gray-600 leading-[1.75] mb-5">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <div className={`w-9 h-9 bg-gradient-to-br ${t.gradient} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-[10px] font-bold">{t.initials}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold">{t.name}</p>
                      <p className="text-[10px] text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SCENE 6 — CTA final                        */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative h-[200vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-white flex items-center justify-center px-6">
          <div
            className="text-center max-w-xl"
            style={{
              opacity: fadeIn(12),
              transform: `translateY(${lerp(12, 50, 0)}px) scale(${0.96 + fadeIn(12) * 0.04})`,
            }}
          >
            {/* Logo */}
            <div
              className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-8"
              style={{
                opacity: fadeIn(12.1),
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              }}
            >
              <span className="text-white text-lg font-bold">F</span>
            </div>

            <h2
              className="text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.08] tracking-tight mb-5"
              style={{ opacity: fadeIn(12.2) }}
            >
              Prêt à ne plus
              <br />perdre de clients ?
            </h2>

            <p
              className="text-gray-400 text-lg mb-10 font-light leading-relaxed"
              style={{ opacity: fadeIn(12.4) }}
            >
              Créez votre carte de fidélité digitale.
              <br />
              <span className="text-gray-900 font-medium">Gratuit. 2 minutes. Sans engagement.</span>
            </p>

            <div style={{ opacity: fadeIn(12.6) }}>
              <button
                onClick={() => router.push('/signup')}
                className="group px-10 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-2xl transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:scale-[0.98] text-[15px]"
              >
                Commencer maintenant
                <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </div>

            <div
              className="flex items-center justify-center gap-6 mt-8 text-[11px] text-gray-400"
              style={{ opacity: fadeIn(12.8) }}
            >
              {['Gratuit', '2 minutes', 'Sans application'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>

            <button
              onClick={() => router.push('/login')}
              className="mt-6 text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
              style={{ opacity: fadeIn(13) }}
            >
              Déjà inscrit ? Connectez-vous
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-gray-100 bg-white">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 bg-gray-900 rounded-md flex items-center justify-center">
            <span className="text-white text-[7px] font-bold">F</span>
          </div>
          <span className="text-sm font-medium text-gray-400">Fidali</span>
        </div>
        <p className="text-[11px] text-gray-300">© 2025 Fidali — Fidélité digitale pour commerces</p>
      </footer>
    </div>
  )
}
