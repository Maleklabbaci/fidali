'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GoPage() {
  const router = useRouter()
  const [sy, setSy] = useState(0)
  const [vh, setVh] = useState(800)
  const [ok, setOk] = useState(false)
  const [imgOk, setImgOk] = useState(false)

  useEffect(() => {
    setOk(true)
    setVh(window.innerHeight)
    const a = () => setSy(window.scrollY)
    const b = () => setVh(window.innerHeight)
    window.addEventListener('scroll', a, { passive: true })
    window.addEventListener('resize', b)
    return () => { window.removeEventListener('scroll', a); window.removeEventListener('resize', b) }
  }, [])

  // --- Animation helpers (cubic ease) ---
  const ease = (t: number) => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2
  const raw = (a: number, b: number) => { const s=a*vh, e_=b*vh; return sy<=s?0:sy>=e_?1:(sy-s)/(e_-s) }
  const fi = (s: number, d=.5) => ease(Math.min(Math.max(raw(s, s+d), 0), 1))
  const fo = (s: number, d=.5) => 1 - ease(Math.min(Math.max(raw(s, s+d), 0), 1))
  const fb = (i: number, o: number, d=.5) => Math.min(fi(i, d), fo(o, d))
  const mv = (s: number, d: number, a: number, b: number) => a + (b-a) * ease(Math.min(Math.max(raw(s, s+d), 0), 1))

  const pts = Math.min(Math.floor(raw(2.5, 4.5) * 9), 8)

  if (!ok) return <div className="min-h-screen bg-white" />

  return (
    <div className="bg-white text-gray-900 antialiased" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Progress */}
      <div className="fixed top-0 left-0 right-0 z-[200] h-[2px]">
        <div className="h-full bg-black" style={{ width: `${Math.min(sy / (vh * 13) * 100, 100)}%`, transition: 'width 60ms' }} />
      </div>

      {/* Nav */}
      <nav className={`fixed top-[2px] inset-x-0 z-50 transition-all duration-500 ${sy > 80 ? 'bg-white/90 backdrop-blur-2xl shadow-[0_1px_0_rgba(0,0,0,0.06)]' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-[10px] flex items-center justify-center">
              <span className="text-white text-xs font-black">F</span>
            </div>
            <span className="font-semibold text-[15px] tracking-[-0.02em]">Fidali</span>
          </div>
          <button onClick={() => router.push('/login')} className="text-[13px] text-gray-400 hover:text-black transition font-medium">
            Connexion
          </button>
        </div>
      </nav>

      {/* ============================================= */}
      {/* SECTION 1 — HERO TEXTE                        */}
      {/* ============================================= */}
      <section className="relative h-[200vh]">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center px-6">
          {/* Gradient subtil */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.06), transparent 70%)',
          }} />

          <div className="text-center max-w-2xl relative z-10" style={{
            opacity: fb(-0.3, 1.2),
            transform: `translateY(${mv(0.3, 1, 0, -100)}px)`,
          }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 border border-gray-200/60 rounded-full mb-8 shadow-sm">
              <div className="w-[6px] h-[6px] rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
              <span className="text-[11px] text-gray-500 font-medium tracking-wide">Programme de fidélité digital</span>
            </div>

            <h1 className="text-[clamp(3rem,8vw,6rem)] font-extrabold leading-[0.88] tracking-[-0.045em] mb-6">
              Vos clients
              <br />
              <span className="text-gray-300">reviennent.</span>
            </h1>

            <p className="text-[18px] md:text-[20px] text-gray-400 font-light max-w-md mx-auto leading-relaxed">
              La carte de fidélité digitale que vos clients ne peuvent pas oublier.
            </p>

            <div className="mt-12 animate-[bounce_2s_infinite]">
              <svg className="w-5 h-5 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 2 — PHOTO MAIN AVEC TELEPHONE          */}
      {/* ============================================= */}
      <section className="relative h-[250vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Photo plein écran de la main */}
          <div className="absolute inset-0" style={{ opacity: fb(1.5, 3.5, 0.6) }}>
            {/* Image de main tenant le phone */}
            <img
              src="https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1600&q=90&auto=format"
              alt="Main tenant un smartphone"
              onLoad={() => setImgOk(true)}
              className="w-full h-full object-cover transition-opacity duration-1000"
              style={{
                opacity: imgOk ? 1 : 0,
                transform: `scale(${1.05 - raw(1.5, 3.5) * 0.05})`,
              }}
            />
            {/* Fallback si image ne charge pas */}
            {!imgOk && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-6xl">📱</div>
              </div>
            )}
            {/* Léger overlay gradient — la photo reste VISIBLE */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.4) 100%)',
            }} />
          </div>

          {/* Texte sur la photo */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10" style={{
            opacity: fb(2, 3.2),
            transform: `translateY(${mv(2, 0.5, 40, 0)}px)`,
          }}>
            <div className="max-w-xl">
              <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold text-white leading-[1.05] tracking-tight mb-3">
                Toujours dans leur poche.
                <br />
                <span className="text-white/50">Jamais oubliée.</span>
              </h2>
              <p className="text-white/50 text-[15px] font-light leading-relaxed">
                Une carte de fidélité digitale directement sur le téléphone de vos clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 3 — PHONE MOCKUP + CARTE               */}
      {/* ============================================= */}
      <section className="relative h-[350vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-white">
          {/* Gradient subtil */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-white" />

          {/* Le phone */}
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{
            opacity: fb(3.8, 7),
            transform: `
              translateY(${mv(3.8, 0.8, 140, 0)}px)
              scale(${0.88 + fi(3.8, 0.8) * 0.12})
            `,
          }}>
            <div style={{ perspective: '1200px' }}>
              <div style={{
                transform: `rotateY(${mv(5, 1, 0, -4)}deg)`,
                transformStyle: 'preserve-3d',
              }}>
                {/* iPhone 15 Pro frame */}
                <div className="relative w-[280px] h-[580px] rounded-[50px] p-3" style={{
                  background: 'linear-gradient(145deg, #2a2a2e, #1a1a1e)',
                  boxShadow: '0 60px 120px rgba(0,0,0,0.25), 0 20px 50px rgba(0,0,0,0.12), inset 0 0 0 1.5px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}>
                  {/* Side buttons */}
                  <div className="absolute -left-[2px] top-[105px] w-[2px] h-[28px] bg-[#3a3a3e] rounded-l" />
                  <div className="absolute -left-[2px] top-[155px] w-[2px] h-[48px] bg-[#3a3a3e] rounded-l" />
                  <div className="absolute -left-[2px] top-[216px] w-[2px] h-[48px] bg-[#3a3a3e] rounded-l" />
                  <div className="absolute -right-[2px] top-[148px] w-[2px] h-[65px] bg-[#3a3a3e] rounded-r" />

                  {/* Screen */}
                  <div className="w-full h-full bg-[#f5f5f7] rounded-[40px] overflow-hidden relative">
                    {/* Dynamic Island */}
                    <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[98px] h-[30px] bg-black rounded-full z-30 shadow-[0_0_0_1px_rgba(0,0,0,0.3)]" />

                    {/* Status bar */}
                    <div className="absolute top-[14px] inset-x-0 flex items-center justify-between px-7 z-20">
                      <span className="text-[11px] font-semibold text-gray-900">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="flex items-end gap-[1.5px]">
                          {[3, 5, 7, 9].map((h, i) => (
                            <div key={i} className="w-[2.5px] rounded-sm bg-black" style={{ height: h }} />
                          ))}
                        </div>
                        <div className="w-[18px] h-[9px] border-[1.2px] border-black rounded-[2.5px] relative ml-1">
                          <div className="absolute inset-[1.5px] right-[2.5px] bg-black rounded-[0.5px]" />
                          <div className="absolute -right-[2px] top-[2px] w-[1.5px] h-[4px] bg-black rounded-r-sm" />
                        </div>
                      </div>
                    </div>

                    {/* App content */}
                    <div className="pt-[55px] px-4">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[9px] text-gray-400">Bienvenue 👋</p>
                          <p className="text-[14px] font-bold tracking-tight">Mohamed</p>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border border-indigo-200/50">
                          <span className="text-[10px] font-bold text-indigo-600">M</span>
                        </div>
                      </div>

                      {/* Loyalty Card */}
                      <div className="rounded-[18px] p-[16px] relative overflow-hidden" style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                      }}>
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/[0.03]" />
                        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/[0.02]" />
                        <div className="absolute top-3 right-4 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/10 blur-[1px]" />

                        <div className="relative z-10">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[7px] text-white/25 uppercase tracking-[0.2em]">Programme fidélité</p>
                              <p className="text-white font-bold text-[13px] mt-0.5">Café du Port ☕</p>
                            </div>
                            <div className="bg-white/10 px-2.5 py-[3px] rounded-full border border-white/[0.06]">
                              <span className="text-[10px] text-white font-bold">{pts}/8</span>
                            </div>
                          </div>

                          <div className="flex gap-[4px] my-3.5">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div key={i} className="flex-1 h-[6px] rounded-full transition-all duration-700" style={{
                                background: i < pts ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'rgba(255,255,255,0.06)',
                                boxShadow: i < pts ? '0 0 8px rgba(251,191,36,0.15)' : 'none',
                                transitionDelay: `${i * 80}ms`,
                              }} />
                            ))}
                          </div>

                          <div className="flex justify-between items-center">
                            <p className="text-[9px] text-white/35">🎁 Café offert à 8 pts</p>
                            <p className="text-[7px] text-white/15 font-mono">CAFE-2024</p>
                          </div>
                        </div>

                        {pts >= 8 && (
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/95 to-orange-500/95 backdrop-blur-sm flex items-center justify-center rounded-[18px] z-20 animate-pulse">
                            <div className="text-center">
                              <p className="text-2xl mb-1">🎉</p>
                              <p className="text-white font-bold text-[13px]">Café offert !</p>
                              <p className="text-white/60 text-[9px] mt-0.5">Montrez au barista</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mini stats */}
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {[
                          { v: pts, l: 'Points', icon: '⭐', c: '#6366f1' },
                          { v: 2, l: 'Récomp.', icon: '🎁', c: '#10b981' },
                          { v: `${Math.round(pts / 8 * 100)}%`, l: 'Progrès', icon: '📊', c: '#f59e0b' },
                        ].map((s, i) => (
                          <div key={i} className="bg-white rounded-[14px] p-2.5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-gray-100/80">
                            <p className="text-[11px] mb-0.5">{s.icon}</p>
                            <p className="text-[13px] font-bold" style={{ color: s.c }}>{s.v}</p>
                            <p className="text-[7px] text-gray-400 mt-0.5">{s.l}</p>
                          </div>
                        ))}
                      </div>

                      {/* Scan button */}
                      <div className="mt-3 bg-black rounded-[14px] py-2.5 text-center shadow-sm">
                        <p className="text-white text-[11px] font-semibold">📷 Scanner le QR code</p>
                      </div>

                      {/* Activity */}
                      <div className="mt-3.5">
                        <p className="text-[8px] text-gray-400 font-medium uppercase tracking-wider mb-2">Récent</p>
                        {[
                          { t: 'Café du Port', d: "Aujourd'hui", p: '+1' },
                          { t: 'Café du Port', d: 'Hier', p: '+1' },
                        ].map((a, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100/80 last:border-0">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-orange-50 rounded-full flex items-center justify-center">
                                <span className="text-[8px]">☕</span>
                              </div>
                              <div>
                                <p className="text-[10px] font-medium text-gray-900">{a.t}</p>
                                <p className="text-[8px] text-gray-400">{a.d}</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{a.p}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Home indicator */}
                    <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-black/15 rounded-full" />
                  </div>
                </div>

                {/* Reflection */}
                <div className="absolute -bottom-6 left-[12%] right-[12%] h-12 bg-slate-500/[0.06] rounded-full blur-3xl" />
              </div>
            </div>
          </div>

          {/* Side annotations */}
          <div className="absolute left-[5%] top-1/2 -translate-y-1/2 max-w-[240px] hidden xl:block" style={{
            opacity: fb(5, 6.5),
            transform: `translateX(${mv(5, 0.5, -30, 0)}px)`,
          }}>
            <div className="w-8 h-[2px] bg-red-400 mb-4 rounded-full" />
            <h3 className="text-[20px] font-bold leading-[1.2] mb-2 tracking-tight">67% de vos clients disparaissent.</h3>
            <p className="text-[14px] text-gray-400 leading-relaxed">Pas parce qu&apos;ils n&apos;ont pas aimé. Ils vous oublient.</p>
          </div>

          <div className="absolute right-[5%] top-1/2 -translate-y-1/2 max-w-[240px] text-right hidden xl:block" style={{
            opacity: fb(5.5, 6.8),
            transform: `translateX(${mv(5.5, 0.5, 30, 0)}px)`,
          }}>
            <div className="w-8 h-[2px] bg-emerald-400 mb-4 ml-auto rounded-full" />
            <h3 className="text-[20px] font-bold leading-[1.2] mb-2 tracking-tight">Une carte digitale.</h3>
            <p className="text-[14px] text-gray-400 leading-relaxed">Sur leur téléphone. Ils reviennent naturellement.</p>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 4 — COMMENT ÇA MARCHE                  */}
      {/* ============================================= */}
      <section className="relative h-[200vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-white flex items-center">
          <div className="max-w-5xl mx-auto px-6 w-full" style={{ opacity: fb(7.2, 8.8) }}>
            <div className="text-center mb-16" style={{ opacity: fi(7.3), transform: `translateY(${mv(7.3, .4, 25, 0)}px)` }}>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 font-medium mb-4">Comment ça marche</p>
              <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.03em]">
                Simple comme <span className="text-gray-300">bonjour.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-10 md:gap-6">
              {[
                { n: '01', icon: '🏪', t: 'Créez votre carte', d: 'Nom, couleurs, récompense. 2 minutes et c\'est prêt.' },
                { n: '02', icon: '📱', t: 'Clients scannent', d: 'Un QR code sur votre comptoir. Pas d\'app à télécharger.' },
                { n: '03', icon: '🔄', t: 'Ils reviennent', d: 'La carte est dans leur phone. Ils suivent leur progrès.' },
              ].map((s, i) => (
                <div key={i} className="relative" style={{
                  opacity: fi(7.6 + i * .3),
                  transform: `translateY(${mv(7.6 + i * .3, .4, 35, 0)}px)`,
                }}>
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                    <span className="text-xl">{s.icon}</span>
                  </div>
                  <p className="text-[10px] font-mono text-gray-300 mb-2">{s.n}</p>
                  <h3 className="text-[17px] font-bold mb-2 tracking-tight">{s.t}</h3>
                  <p className="text-[14px] text-gray-400 leading-relaxed">{s.d}</p>
                  {i < 2 && <div className="hidden md:block absolute top-6 -right-3 text-gray-200 text-lg font-light">→</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 5 — POUR QUI                           */}
      {/* ============================================= */}
      <section className="relative h-[180vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-[#fafafa] flex items-center">
          <div className="max-w-5xl mx-auto px-6 w-full" style={{ opacity: fb(9, 10.3) }}>
            <div className="text-center mb-10" style={{ opacity: fi(9.1), transform: `translateY(${mv(9.1, .4, 20, 0)}px)` }}>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 font-medium mb-4">Pour tous</p>
              <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.03em]">
                Votre commerce, <span className="text-gray-300">boosté.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { e: '☕', n: 'Cafés', c: '#92400e' },
                { e: '🍕', n: 'Restaurants', c: '#dc2626' },
                { e: '💇', n: 'Salons', c: '#7c3aed' },
                { e: '🥖', n: 'Boulangeries', c: '#b45309' },
                { e: '👗', n: 'Boutiques', c: '#db2777' },
                { e: '💪', n: 'Fitness', c: '#059669' },
                { e: '🧴', n: 'Beauté', c: '#e11d48' },
                { e: '🏪', n: 'Épiceries', c: '#0284c7' },
              ].map((s, i) => (
                <div key={i}
                  className="bg-white rounded-2xl p-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  style={{ opacity: fi(9.3 + i * .08), transform: `translateY(${mv(9.3 + i * .08, .3, 20, 0)}px)` }}
                >
                  <span className="text-2xl">{s.e}</span>
                  <p className="text-[13px] font-semibold mt-2" style={{ color: s.c }}>{s.n}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 6 — CHIFFRES (fond noir)               */}
      {/* ============================================= */}
      <section className="relative h-[160vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-black flex items-center justify-center px-6">
          <div className="max-w-4xl w-full" style={{ opacity: fb(10.5, 11.8) }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { v: '500+', l: 'Commerçants', d: 'actifs' },
                { v: '15K', l: 'Clients', d: 'fidélisés' },
                { v: '+40%', l: 'Retour', d: 'en moyenne' },
                { v: '2min', l: 'Setup', d: 'pour démarrer' },
              ].map((s, i) => (
                <div key={i} className="text-center" style={{
                  opacity: fi(10.6 + i * .12),
                  transform: `translateY(${mv(10.6 + i * .12, .4, 25, 0)}px)`,
                }}>
                  <p className="text-[clamp(2.5rem,5vw,4rem)] font-black text-white tracking-tight leading-none">{s.v}</p>
                  <p className="text-[13px] font-medium text-white/50 mt-2">{s.l}</p>
                  <p className="text-[11px] text-white/25 mt-0.5">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 7 — TÉMOIGNAGES                        */}
      {/* ============================================= */}
      <section className="relative h-[160vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-white flex items-center justify-center px-6">
          <div className="max-w-4xl w-full" style={{ opacity: fb(12, 13) }}>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 font-medium text-center mb-8" style={{ opacity: fi(12.1) }}>
              Témoignages
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: 'Karim B.', role: 'Café Central, Alger', text: '40% de mes clients reviennent plus souvent. Le QR code est d\'une simplicité redoutable.' },
                { name: 'Sarah M.', role: 'Salon Belle, Oran', text: 'Mes clientes adorent suivre leur progression. Plus de cartes papier perdues !' },
                { name: 'Youcef A.', role: 'Pizza Roma, Constantine', text: 'Setup en 3 min. Mes clients commandent plus pour la pizza gratuite. CA +25%.' },
              ].map((t, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100" style={{
                  opacity: fi(12.2 + i * .15),
                  transform: `translateY(${mv(12.2 + i * .15, .4, 25, 0)}px)`,
                }}>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => <span key={j} className="text-[12px]">⭐</span>)}
                  </div>
                  <p className="text-[13px] text-gray-600 leading-[1.75] mb-5">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-500">{t.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold">{t.name}</p>
                      <p className="text-[11px] text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 8 — CTA FINAL                          */}
      {/* ============================================= */}
      <section className="min-h-screen flex items-center justify-center px-6 bg-white">
        <div className="text-center max-w-lg py-20" style={{
          opacity: fi(13.5, 0.4),
          transform: `translateY(${mv(13.5, .4, 30, 0)}px)`,
        }}>
          <div className="w-16 h-16 bg-black rounded-[18px] flex items-center justify-center mx-auto mb-8 shadow-xl">
            <span className="text-white text-2xl font-black">F</span>
          </div>

          <h2 className="text-[clamp(2rem,5vw,3.2rem)] font-bold tracking-[-0.03em] leading-[1.08] mb-4">
            Prêt à fidéliser
            <br />vos clients ?
          </h2>

          <p className="text-gray-400 text-[17px] font-light leading-relaxed mb-8">
            Créez votre carte de fidélité digitale.
            <br /><span className="text-gray-900 font-medium">Gratuit. 2 minutes. Sans engagement.</span>
          </p>

          <button
            onClick={() => router.push('/signup')}
            className="group px-10 py-4 bg-black hover:bg-gray-800 text-white rounded-2xl font-semibold text-[15px] transition-all shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Commencer maintenant
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <div className="flex items-center justify-center gap-6 mt-6 text-[12px] text-gray-400">
            <span className="flex items-center gap-1"><span className="text-emerald-500">✓</span> Gratuit</span>
            <span className="flex items-center gap-1"><span className="text-emerald-500">✓</span> 2 minutes</span>
            <span className="flex items-center gap-1"><span className="text-emerald-500">✓</span> Sans app</span>
          </div>

          <button onClick={() => router.push('/login')} className="mt-5 text-[13px] text-gray-400 hover:text-gray-600 transition">
            Déjà inscrit ? Connexion →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-gray-100">
        <p className="text-[11px] text-gray-300">© 2025 Fidali — Fidélité digitale</p>
      </footer>
    </div>
  )
}
