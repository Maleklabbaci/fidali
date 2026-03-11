'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function GoPage() {
  const router = useRouter()
  const [sy, setSy] = useState(0)
  const [wh, setWh] = useState(800)
  const [mx, setMx] = useState(0)
  const [my, setMy] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
    setWh(window.innerHeight)
    const onScroll = () => setSy(window.scrollY)
    const onResize = () => setWh(window.innerHeight)
    const onMouse = (e: MouseEvent) => {
      setMx((e.clientX / window.innerWidth - 0.5) * 2)
      setMy((e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouse)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  const p = (s: number, e: number) => {
    const a = s * wh, b = e * wh
    if (sy < a) return 0
    if (sy > b) return 1
    return (sy - a) / (b - a)
  }
  const fi = (s: number, d = 0.5) => Math.min(p(s, s + d), 1)
  const fo = (s: number, d = 0.5) => Math.max(1 - p(s, s + d), 0)
  const fb = (i: number, o: number) => Math.min(fi(i), fo(o))
  const lr = (s: number, a: number, b: number, d = 0.7) => a + (b - a) * Math.min(p(s, s + d), 1)

  const pts = Math.min(Math.floor(p(2, 4.5) * 8), 8)

  if (!ready) return <div className="h-screen bg-black" />

  return (
    <div className="bg-black text-white overflow-x-hidden">

      {/* ═══ Grain texture overlay ═══ */}
      <div className="fixed inset-0 z-[90] pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px' }} />

      {/* ═══ Progress ═══ */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-[1px]">
        <div className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 transition-[width] duration-100"
          style={{ width: `${Math.min((sy / (wh * 14)) * 100, 100)}%` }} />
      </div>

      {/* ═══ Nav ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${sy > 80 ? 'bg-black/60 backdrop-blur-2xl border-b border-white/[0.04]' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Fidali" className="w-8 h-8 rounded-xl object-contain" />
            <span className="font-bold text-[15px] tracking-tight">Fidali</span>
          </div>
          <button onClick={() => router.push('/login')}
            className="text-[13px] text-white/40 hover:text-white transition-colors font-medium">
            Se connecter
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════ */}
      {/* SCENE 1 — Hero 3D immersif                     */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative h-[500vh]">
        <div className="sticky top-0 h-screen overflow-hidden">

          {/* Animated background */}
          <div className="absolute inset-0">
            {/* Gradient orbs */}
            <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
              style={{
                background: 'radial-gradient(circle, #7c3aed, transparent)',
                top: `${30 + my * 5}%`, left: `${20 + mx * 5}%`,
                transform: `translate(-50%, -50%) scale(${1 + sy * 0.0001})`,
              }} />
            <div className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-15"
              style={{
                background: 'radial-gradient(circle, #ec4899, transparent)',
                top: `${60 + my * 3}%`, right: `${10 - mx * 3}%`,
                transform: `translate(50%, -50%) scale(${1.2 + sy * 0.00015})`,
              }} />
            <div className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-10"
              style={{
                background: 'radial-gradient(circle, #3b82f6, transparent)',
                bottom: `${20 - my * 4}%`, left: `${50 + mx * 4}%`,
                transform: `translate(-50%, 50%)`,
              }} />

            {/* Grid lines */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                transform: `perspective(500px) rotateX(${60 - sy * 0.01}deg)`,
                transformOrigin: 'center top',
              }} />
          </div>

          {/* ─── Hero text ─── */}
          <div className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: fb(-0.3, 1.5),
              transform: `translateY(${lr(-0.3, 0, -80)}px) scale(${1 - p(0, 2) * 0.1})`,
            }}>
            <div className="text-center px-6 max-w-5xl relative z-10">

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-8"
                style={{ opacity: fi(-0.1) }}>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[11px] font-medium text-white/50 uppercase tracking-[0.2em]">
                  500+ commerçants actifs
                </span>
              </div>

              <h1 className="text-[clamp(3rem,8vw,7rem)] font-black leading-[0.9] tracking-[-0.04em]"
                style={{
                  opacity: fi(0),
                  transform: `translateY(${lr(0, 30, 0)}px)`,
                }}>
                <span className="block">Fidélisez.</span>
                <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
                  Automatiquement.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/30 mt-8 font-light max-w-lg mx-auto leading-relaxed"
                style={{ opacity: fi(0.3), transform: `translateY(${lr(0.3, 20, 0)}px)` }}>
                La carte de fidélité digitale que vos clients ont toujours dans leur poche.
                <span className="text-white/60 font-medium"> Sans app. Sans papier.</span>
              </p>

              <div className="mt-8 text-white/15 animate-bounce" style={{ opacity: fi(0.5) }}>
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>

          {/* ─── iPhone 3D ─── */}
          <div className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: fb(1.2, 4.2),
              transform: `
                translateY(${lr(1.2, 150, 0)}px)
                scale(${0.7 + fi(1.2) * 0.3})
              `,
            }}>
            <div style={{ perspective: '1800px' }}>
              <div style={{
                transform: `
                  rotateY(${mx * 6 + lr(2, 0, -5)}deg)
                  rotateX(${-my * 4 + lr(2.5, 0, 3)}deg)
                  translateZ(${lr(1.5, -50, 0)}px)
                `,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.1s ease-out',
              }}>

                {/* Phone body */}
                <div className="relative w-[280px] sm:w-[300px] h-[570px] sm:h-[610px] rounded-[48px] p-[10px]"
                  style={{
                    background: 'linear-gradient(145deg, #3a3a3a 0%, #1a1a1a 30%, #0a0a0a 100%)',
                    boxShadow: `
                      0 0 0 1px rgba(255,255,255,0.08),
                      0 60px 120px -20px rgba(0,0,0,0.7),
                      0 30px 60px -10px rgba(0,0,0,0.5),
                      ${mx * 20}px ${my * 20}px 60px rgba(124,58,237,0.08),
                      ${-mx * 15}px ${-my * 15}px 40px rgba(236,72,153,0.05)
                    `,
                  }}>

                  {/* Buttons */}
                  <div className="absolute -left-[2px] top-[95px] w-[2px] h-[26px] bg-[#2a2a2a] rounded-l" />
                  <div className="absolute -left-[2px] top-[138px] w-[2px] h-[46px] bg-[#2a2a2a] rounded-l" />
                  <div className="absolute -left-[2px] top-[198px] w-[2px] h-[46px] bg-[#2a2a2a] rounded-l" />
                  <div className="absolute -right-[2px] top-[140px] w-[2px] h-[60px] bg-[#2a2a2a] rounded-r" />

                  {/* Screen */}
                  <div className="w-full h-full rounded-[40px] overflow-hidden relative"
                    style={{ background: 'linear-gradient(180deg, #f5f5f7 0%, #eee 100%)' }}>

                    {/* Dynamic Island */}
                    <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[85px] h-[24px] bg-black rounded-full z-30 flex items-center justify-end pr-[14px]">
                      <div className="w-[7px] h-[7px] rounded-full bg-[#1a1a2e] ring-[0.5px] ring-[#333]" />
                    </div>

                    {/* Status bar */}
                    <div className="h-[48px] flex items-end justify-between px-6 pb-0 relative z-20">
                      <span className="text-[10px] font-bold text-gray-900">9:41</span>
                      <div className="flex items-center gap-[3px]">
                        <div className="flex items-end gap-[1.5px]">
                          {[3.5, 5, 7, 9].map((h, i) => (
                            <div key={i} className="w-[2.5px] rounded-[0.5px] bg-gray-900" style={{ height: `${h}px` }} />
                          ))}
                        </div>
                        <span className="text-[8px] font-bold text-gray-900 ml-0.5">5G</span>
                        <div className="w-[18px] h-[8px] border border-gray-900 rounded-[2px] ml-0.5 relative">
                          <div className="absolute inset-[1px] right-[3px] bg-gray-900 rounded-[0.5px]" />
                          <div className="absolute right-[-2.5px] top-[1.5px] w-[1px] h-[4px] bg-gray-900 rounded-r" />
                        </div>
                      </div>
                    </div>

                    {/* App */}
                    <div className="px-4 pt-1.5">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[8px] text-gray-400 font-medium">Bonjour 👋</p>
                          <p className="text-[13px] font-bold text-gray-900 -mt-0.5">Mohamed</p>
                        </div>
                        <img src="/logo.png" alt="Fidali" className="w-7 h-7 rounded-[10px] object-contain shadow-sm" />
                      </div>

                      {/* Card */}
                      <div className="rounded-[16px] p-4 relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
                          boxShadow: '0 8px 32px rgba(79,70,229,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
                        }}>

                        {/* Card decorations */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-violet-400/10 blur-xl" />
                        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-fuchsia-400/10 blur-xl" />
                        <div className="absolute top-0 right-0 w-full h-full opacity-[0.04]"
                          style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                            backgroundSize: '16px 16px',
                          }} />

                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-1.5">
                            <div>
                              <div className="flex items-center gap-1 mb-0.5">
                                <img src="/logo.png" alt="" className="w-3 h-3 rounded object-contain opacity-50" />
                                <p className="text-[6px] text-white/25 uppercase tracking-[0.25em] font-bold">Fidélité</p>
                              </div>
                              <h3 className="font-bold text-[13px] text-white">Café du Port</h3>
                            </div>
                            <div className="bg-white/10 backdrop-blur px-2 py-0.5 rounded-full">
                              <span className="text-[10px] font-extrabold text-white">{pts}/8</span>
                            </div>
                          </div>

                          {/* Points progress */}
                          <div className="flex gap-[3px] my-3">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div key={i} className="flex-1 h-[6px] rounded-full transition-all duration-600"
                                style={{
                                  background: i < pts
                                    ? 'linear-gradient(90deg, #a78bfa, #c084fc)'
                                    : 'rgba(255,255,255,0.06)',
                                  boxShadow: i < pts ? '0 0 12px rgba(167,139,250,0.4)' : 'none',
                                  transitionDelay: `${i * 70}ms`,
                                }} />
                            ))}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[9px] text-white/35">☕ Café gratuit</p>
                            <p className="text-[7px] text-white/15 font-mono">CAFE-2024</p>
                          </div>
                        </div>

                        {pts >= 8 && (
                          <div className="absolute inset-0 bg-violet-950/80 backdrop-blur-md flex items-center justify-center rounded-[16px] z-20"
                            style={{ animation: 'fadeIn 0.5s ease' }}>
                            <div className="text-center">
                              <div className="text-2xl mb-1">🎉</div>
                              <p className="text-white font-extrabold text-[12px]">Récompense !</p>
                              <p className="text-white/30 text-[8px] mt-0.5">Montrez à votre barista</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                        {[
                          { v: pts, l: 'Points', c: '#818cf8' },
                          { v: 2, l: 'Récomp.', c: '#34d399' },
                          { v: `${Math.round(pts / 8 * 100)}%`, l: 'Progrès', c: '#fbbf24' },
                        ].map((s, i) => (
                          <div key={i} className="bg-white rounded-xl p-2 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-gray-100">
                            <p className="text-[13px] font-extrabold" style={{ color: s.c }}>{s.v}</p>
                            <p className="text-[7px] text-gray-400 mt-0.5 font-semibold uppercase tracking-wider">{s.l}</p>
                          </div>
                        ))}
                      </div>

                      {/* Scan button */}
                      <div className="mt-2.5 bg-gray-900 rounded-xl py-2.5 text-center cursor-pointer hover:bg-gray-800 transition">
                        <p className="text-white text-[10px] font-bold tracking-wide">📷 Scanner le QR Code</p>
                      </div>

                      {/* Recent */}
                      <div className="mt-2.5">
                        <p className="text-[7px] text-gray-400 uppercase tracking-wider font-bold mb-1.5">Activité</p>
                        {[
                          { t: 'Cappuccino', d: "Aujourd'hui", ico: '☕' },
                          { t: 'Espresso', d: 'Hier', ico: '☕' },
                          { t: 'Croissant', d: 'Lundi', ico: '🥐' },
                        ].map((a, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 bg-gray-50 rounded-md flex items-center justify-center text-[8px]">{a.ico}</div>
                              <div>
                                <p className="text-[9px] font-semibold text-gray-900">{a.t}</p>
                                <p className="text-[7px] text-gray-400">{a.d}</p>
                              </div>
                            </div>
                            <span className="text-[8px] font-bold text-violet-500">+1</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Home indicator */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[90px] h-[3px] bg-gray-900/15 rounded-full" />
                  </div>
                </div>

                {/* Reflections */}
                <div className="absolute -bottom-8 left-[5%] right-[5%] h-20 rounded-[50%] blur-3xl"
                  style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.08), rgba(236,72,153,0.06), rgba(124,58,237,0.08))' }} />
              </div>
            </div>
          </div>

          {/* ─── Side text left ─── */}
          <div className="absolute left-[4%] top-1/2 -translate-y-1/2 max-w-[250px] hidden xl:block"
            style={{
              opacity: fb(2, 3.8),
              transform: `translateX(${lr(2, -60, 0)}px)`,
            }}>
            <div className="w-8 h-[2px] bg-red-400/60 mb-4 rounded-full" />
            <p className="text-[9px] uppercase tracking-[0.3em] text-red-400/80 font-bold mb-2">Le problème</p>
            <h3 className="text-lg font-bold leading-snug mb-2 text-white/90">
              67% ne reviennent jamais.
            </h3>
            <p className="text-[12px] text-white/30 leading-relaxed">
              Pas parce qu&apos;ils n&apos;ont pas aimé. Parce qu&apos;ils vous oublient.
            </p>
          </div>

          {/* ─── Side text right ─── */}
          <div className="absolute right-[4%] top-1/2 -translate-y-1/2 max-w-[230px] text-right hidden xl:block"
            style={{
              opacity: fb(2.5, 4),
              transform: `translateX(${lr(2.5, 60, 0)}px)`,
            }}>
            <div className="w-8 h-[2px] bg-emerald-400/60 mb-4 rounded-full ml-auto" />
            <p className="text-[9px] uppercase tracking-[0.3em] text-emerald-400/80 font-bold mb-2">La solution</p>
            <h3 className="text-lg font-bold leading-snug mb-2 text-white/90">
              Une carte dans leur poche.
            </h3>
            <p className="text-[12px] text-white/30 leading-relaxed">
              Toujours là. Toujours visible. Ils reviennent.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SCENE 2 — Comment ça marche                    */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative h-[300vh]">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center px-6">

          <div className="absolute inset-0">
            <div className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ background: 'radial-gradient(circle, #6366f1, transparent)', transform: `translate(-50%, -50%) scale(${fi(5) * 1.5})` }} />
          </div>

          <div className="max-w-4xl w-full relative z-10" style={{ opacity: fb(5, 7.5) }}>

            <div className="text-center mb-16" style={{ transform: `translateY(${lr(5, 50, 0)}px)` }}>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold mb-5">
                3 étapes
              </p>
              <h2 className="text-[clamp(2rem,5vw,4rem)] font-black leading-[0.95] tracking-tight">
                Simple comme
                <br />
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">bonjour.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  num: '01',
                  icon: '📱',
                  title: 'Scan',
                  desc: 'Le client scanne votre QR code avec son appareil photo. Rien à télécharger.',
                  gradient: 'from-violet-500/20 to-violet-500/5',
                  border: 'border-violet-500/10',
                },
                {
                  num: '02',
                  icon: '✅',
                  title: 'Valider',
                  desc: 'Vous confirmez le passage en un clic. Le point s\'ajoute automatiquement.',
                  gradient: 'from-fuchsia-500/20 to-fuchsia-500/5',
                  border: 'border-fuchsia-500/10',
                },
                {
                  num: '03',
                  icon: '🎁',
                  title: 'Récompenser',
                  desc: 'Carte complète = récompense. Il revient. Votre CA monte.',
                  gradient: 'from-amber-500/20 to-amber-500/5',
                  border: 'border-amber-500/10',
                },
              ].map((step, i) => (
                <div key={i}
                  className={`bg-gradient-to-b ${step.gradient} rounded-3xl p-6 border ${step.border} backdrop-blur-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500`}
                  style={{
                    opacity: fi(5.5 + i * 0.3),
                    transform: `translateY(${lr(5.5 + i * 0.3, 50, 0)}px)`,
                  }}>

                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.02] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />

                  <span className="text-[10px] font-black text-white/15">{step.num}</span>
                  <div className="text-3xl mt-3 mb-3">{step.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-[13px] text-white/35 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SCENE 3 — Secteurs                             */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative h-[250vh]">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center px-6">
          <div className="max-w-5xl w-full" style={{ opacity: fb(7.5, 9.5) }}>

            <div className="text-center mb-12" style={{ transform: `translateY(${lr(7.5, 40, 0)}px)` }}>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/25 font-bold mb-4">
                Pour tous les commerces
              </p>
              <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black leading-[1] tracking-tight">
                Quel que soit
                <br />
                <span className="text-white/20">votre métier.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { e: '☕', n: 'Cafés', d: '8e café offert', g: 'from-amber-900/30 to-amber-950/50' },
                { e: '🍕', n: 'Restaurants', d: 'Dessert offert', g: 'from-red-900/30 to-red-950/50' },
                { e: '💇‍♀️', n: 'Salons', d: 'Soin gratuit', g: 'from-pink-900/30 to-pink-950/50' },
                { e: '🛍️', n: 'Boutiques', d: '-20% au 5e achat', g: 'from-indigo-900/30 to-indigo-950/50' },
                { e: '🥖', n: 'Boulangeries', d: 'Pâtisserie offerte', g: 'from-yellow-900/30 to-yellow-950/50' },
                { e: '💪', n: 'Sport', d: 'Séance offerte', g: 'from-emerald-900/30 to-emerald-950/50' },
                { e: '🧖‍♀️', n: 'Spas', d: 'Massage offert', g: 'from-purple-900/30 to-purple-950/50' },
                { e: '🚗', n: 'Lavage auto', d: 'Lavage gratuit', g: 'from-cyan-900/30 to-cyan-950/50' },
              ].map((s, i) => (
                <div key={i}
                  className={`bg-gradient-to-br ${s.g} rounded-2xl p-4 border border-white/[0.03] hover:border-white/10 transition-all duration-500 cursor-default group`}
                  style={{
                    opacity: fi(7.8 + i * 0.08),
                    transform: `translateY(${lr(7.8 + i * 0.08, 30, 0)}px) scale(${0.92 + fi(7.8 + i * 0.08) * 0.08})`,
                  }}>
                  <span className="text-2xl block mb-2 group-hover:scale-125 transition-transform duration-300">{s.e}</span>
                  <p className="text-white font-bold text-[13px]">{s.n}</p>
                  <p className="text-white/20 text-[10px] mt-0.5">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SCENE 4 — Chiffres                             */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative h-[200vh]">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center px-6">

          <div className="absolute inset-0">
            <div className="absolute w-[800px] h-[400px] rounded-full blur-[200px] opacity-[0.06] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ background: 'linear-gradient(90deg, #7c3aed, #ec4899)' }} />
          </div>

          <div className="max-w-4xl w-full relative z-10" style={{ opacity: fb(9.5, 11) }}>

            <p className="text-[10px] uppercase tracking-[0.4em] text-white/25 font-bold text-center mb-16"
              style={{ opacity: fi(9.6) }}>
              En chiffres
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { v: '500+', l: 'Commerçants', s: 'nous font confiance' },
                { v: '15K+', l: 'Clients fidélisés', s: 'ce mois-ci' },
                { v: '+40%', l: 'De retours', s: 'en moyenne' },
                { v: '2 min', l: 'Pour commencer', s: 'chrono en main' },
              ].map((stat, i) => (
                <div key={i} className="text-center"
                  style={{
                    opacity: fi(9.8 + i * 0.15),
                    transform: `translateY(${lr(9.8 + i * 0.15, 40, 0)}px)`,
                  }}>
                  <p className="text-[clamp(2.5rem,6vw,4rem)] font-black tracking-tight leading-none bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                    {stat.v}
                  </p>
                  <p className="text-sm font-bold mt-2 text-white/70">{stat.l}</p>
                  <p className="text-[11px] text-white/25 mt-0.5">{stat.s}</p>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-14 flex items-center justify-center gap-5 flex-wrap"
              style={{ opacity: fi(10.3) }}>
              {['Sans app', 'Tous téléphones', 'Dashboard live', 'Support 7j/7'].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                  <span className="text-[11px] text-white/40 font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SCENE 5 — Témoignages                          */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative h-[200vh]">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center px-6">
          <div className="max-w-5xl w-full" style={{ opacity: fb(11, 12.5) }}>

            <div className="text-center mb-10" style={{ opacity: fi(11.1) }}>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/25 font-bold mb-4">Témoignages</p>
              <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-black tracking-tight">
                Ils l&apos;utilisent. <span className="text-white/20">Ils adorent.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  name: 'Karim B.', role: 'Café Central, Alger', initials: 'KB',
                  text: 'En 1 mois, 40% de mes clients reviennent plus souvent. Le QR code est d\'une simplicité redoutable.',
                  gradient: 'from-violet-500 to-indigo-600',
                },
                {
                  name: 'Sarah M.', role: 'Salon Belle, Oran', initials: 'SM',
                  text: 'Mes clientes adorent voir leur progression. Fini les cartes papier perdues. Mon outil préféré.',
                  gradient: 'from-fuchsia-500 to-pink-600',
                },
                {
                  name: 'Youcef A.', role: 'Pizza Roma, Constantine', initials: 'YA',
                  text: 'Setup en 3 minutes. Mes clients commandent plus pour la pizza gratuite. CA en hausse de 25%.',
                  gradient: 'from-amber-500 to-orange-600',
                },
              ].map((t, i) => (
                <div key={i}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm hover:bg-white/[0.05] transition-all duration-500"
                  style={{
                    opacity: fi(11.3 + i * 0.2),
                    transform: `translateY(${lr(11.3 + i * 0.2, 40, 0)}px)`,
                  }}>

                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg key={j} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-[13px] text-white/40 leading-[1.8] mb-5">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
                    <div className={`w-9 h-9 bg-gradient-to-br ${t.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                      <span className="text-white text-[9px] font-black">{t.initials}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white/80">{t.name}</p>
                      <p className="text-[10px] text-white/25">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SCENE 6 — CTA final                            */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative h-[200vh]">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center px-6">

          {/* Background glow */}
          <div className="absolute inset-0">
            <div className="absolute w-[600px] h-[600px] rounded-full blur-[180px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000"
              style={{
                background: 'radial-gradient(circle, rgba(124,58,237,0.15), rgba(236,72,153,0.08), transparent)',
                opacity: fi(12.5),
              }} />
          </div>

          <div className="text-center max-w-xl relative z-10"
            style={{
              opacity: fi(12.5),
              transform: `translateY(${lr(12.5, 60, 0)}px) scale(${0.94 + fi(12.5) * 0.06})`,
            }}>

            <img src="/logo.png" alt="Fidali"
              className="w-16 h-16 rounded-2xl object-contain mx-auto mb-8"
              style={{
                opacity: fi(12.6),
                boxShadow: '0 12px 40px rgba(124,58,237,0.2), 0 0 0 1px rgba(255,255,255,0.05)',
              }} />

            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black leading-[1.05] tracking-tight mb-5"
              style={{ opacity: fi(12.7) }}>
              Prêt à ne plus
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                perdre de clients ?
              </span>
            </h2>

            <p className="text-white/30 text-lg mb-10 font-light leading-relaxed" style={{ opacity: fi(12.9) }}>
              Créez votre carte de fidélité digitale.
              <br />
              <span className="text-white/70 font-medium">Gratuit. 2 minutes. Sans engagement.</span>
            </p>

            <div style={{ opacity: fi(13.1) }}>
              <button onClick={() => router.push('/signup')}
                className="group relative px-10 py-4 font-bold rounded-2xl text-[15px] transition-all duration-500 hover:-translate-y-1 active:scale-[0.97] overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                  boxShadow: '0 12px 40px rgba(124,58,237,0.3), 0 4px 12px rgba(236,72,153,0.2)',
                }}>
                <span className="relative z-10 text-white">
                  Commencer maintenant
                  <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-5 mt-8" style={{ opacity: fi(13.3) }}>
              {['Gratuit', '2 minutes', 'Sans app'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[11px] text-white/30">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>

            <button onClick={() => router.push('/login')}
              className="mt-6 text-[12px] text-white/20 hover:text-white/50 transition-colors"
              style={{ opacity: fi(13.5) }}>
              Déjà inscrit ? Connectez-vous
            </button>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-10 text-center border-t border-white/[0.04]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src="/logo.png" alt="Fidali" className="w-5 h-5 rounded-lg object-contain opacity-40" />
          <span className="text-sm font-semibold text-white/25">Fidali</span>
        </div>
        <p className="text-[11px] text-white/15">© 2025 Fidali — Fidélité digitale pour commerces</p>
      </footer>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
