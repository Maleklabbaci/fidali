'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Photos réelles Unsplash
const IMG = {
  hands1: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&q=85',
  hands2: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=85',
  cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=85',
  shop: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=85',
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=85',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=85',
  resto: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=85',
  people: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=1200&q=85',
  barista: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&q=85',
  team: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=85',
  woman: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80',
  man: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  girl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
}

export default function GoPage() {
  const router = useRouter()
  const [sy, setSy] = useState(0)
  const [wh, setWh] = useState(800)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
    setWh(window.innerHeight)
    const onScroll = () => setSy(window.scrollY)
    const onResize = () => setWh(window.innerHeight)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize) }
  }, [])

  // Helpers
  const opacity = (start: number, end: number) => {
    const s = start * wh, e = end * wh
    if (sy < s) return 0
    if (sy > e) return 1
    return (sy - s) / (e - s)
  }
  const fadeIn = (start: number) => Math.min(opacity(start, start + 0.8), 1)
  const fadeOut = (start: number) => Math.max(1 - opacity(start, start + 0.8), 0)
  const fadeBetween = (inStart: number, outStart: number) => Math.min(fadeIn(inStart), fadeOut(outStart))
  const translate = (start: number, from: number, to: number) => {
    const t = opacity(start, start + 1)
    return from + (to - from) * t
  }

  // Points animation pour la carte
  const cardPoints = Math.min(Math.floor(opacity(1.5, 4) * 8), 8)

  return (
    <div className="bg-white text-gray-900">

      {/* Barre de progression */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-[2px]">
        <div className="h-full bg-gray-900 transition-all duration-75" style={{ width: `${Math.min((sy / (wh * 12)) * 100, 100)}%` }} />
      </div>

      {/* Nav minimal */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${sy > 200 ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.05)]' : ''}`}>
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Fidali" className="w-8 h-8 rounded-xl object-contain" />
            <span className="font-semibold text-[15px] tracking-tight">Fidali</span>
          </div>
          <button onClick={() => router.push('/login')} className="text-[13px] text-gray-500 hover:text-gray-900 transition font-medium">
            Se connecter
          </button>
        </div>
      </nav>

      {/* ============================================== */}
      {/* SCENE 1 — Main avec iPhone + carte fidélité   */}
      {/* ============================================== */}
      <section className="relative h-[400vh]">
        <div className="sticky top-0 h-screen overflow-hidden">

          {/* Background photo — mains tenant un iPhone */}
          <div className="absolute inset-0 transition-none" style={{ opacity: fadeBetween(0, 3) }}>
            <img src={IMG.hands1} alt="" className="w-full h-full object-cover" style={{ transform: `scale(${1 + sy * 0.0001})` }} />
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
          </div>

          {/* Texte d'intro qui apparaît */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: fadeBetween(-0.3, 1), transform: `translateY(${translate(-0.3, 30, 0)}px)` }}>
            <div className="text-center px-6 max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400 font-medium mb-6" style={{ opacity: fadeIn(-0.2) }}>
                Programme de fidélité digital
              </p>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] tracking-tight mb-6">
                Vos clients reviennent.
                <br />
                <span className="text-gray-300">Naturellement.</span>
              </h1>
              <p className="text-lg text-gray-400 font-light">Scrollez pour découvrir</p>
              <div className="mt-8 animate-bounce">
                <svg className="w-5 h-5 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>

          {/* iPhone avec carte qui apparaît au centre */}
          <div className="absolute inset-0 flex items-center justify-center" style={{
            opacity: fadeBetween(0.8, 3.5),
            transform: `translateY(${translate(0.8, 100, 0)}px) scale(${0.8 + fadeIn(0.8) * 0.2})`,
          }}>
            <div style={{ perspective: '1200px' }}>
              <div style={{
                transform: `rotateY(${translate(1.5, 0, -8)}deg) rotateX(${translate(2, 0, 3)}deg)`,
                transformStyle: 'preserve-3d',
              }}>
                {/* iPhone frame */}
                <div className="w-[300px] h-[620px] bg-[#1a1a1a] rounded-[50px] p-[14px] relative"
                  style={{ boxShadow: '0 60px 120px rgba(0,0,0,0.2), 0 20px 50px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.05)' }}>

                  {/* Boutons latéraux */}
                  <div className="absolute -left-[3px] top-[120px] w-[3px] h-[35px] bg-[#2a2a2a] rounded-l-sm" />
                  <div className="absolute -left-[3px] top-[170px] w-[3px] h-[55px] bg-[#2a2a2a] rounded-l-sm" />
                  <div className="absolute -left-[3px] top-[240px] w-[3px] h-[55px] bg-[#2a2a2a] rounded-l-sm" />
                  <div className="absolute -right-[3px] top-[160px] w-[3px] h-[75px] bg-[#2a2a2a] rounded-r-sm" />

                  {/* Dynamic Island */}
                  <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[100px] h-[30px] bg-black rounded-full z-30" />

                  {/* Écran */}
                  <div className="w-full h-full bg-[#f8f8f8] rounded-[38px] overflow-hidden">

                    {/* Status bar */}
                    <div className="h-[54px] flex items-end justify-between px-8 pb-1">
                      <span className="text-[12px] font-semibold text-gray-900">9:41</span>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-[15px] h-[10px]" viewBox="0 0 15 10"><rect x="0" y="3" width="3" height="7" rx="0.5" fill="#1a1a1a" /><rect x="4" y="2" width="3" height="8" rx="0.5" fill="#1a1a1a" /><rect x="8" y="1" width="3" height="9" rx="0.5" fill="#1a1a1a" /><rect x="12" y="0" width="3" height="10" rx="0.5" fill="#1a1a1a" /></svg>
                        <div className="w-[22px] h-[10px] border border-gray-900 rounded-[3px] relative">
                          <div className="absolute inset-[1.5px] right-[3px] bg-gray-900 rounded-[1px]" />
                          <div className="absolute right-[-3px] top-[2.5px] w-[1.5px] h-[5px] bg-gray-900 rounded-r-sm" />
                        </div>
                      </div>
                    </div>

                    {/* App UI */}
                    <div className="px-5 pt-3">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <p className="text-[10px] text-gray-400">Bienvenue</p>
                          <p className="text-[15px] font-semibold text-gray-900">Mohamed</p>
                        </div>
                        <img src="/logo.png" alt="" className="w-7 h-7 rounded-lg object-contain" />
                      </div>

                      {/* La carte fidélité */}
                      <div className="rounded-[20px] p-5 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', minHeight: '190px' }}>
                        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '18px 18px' }} />
                        <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/[0.06] rounded-full" />
                        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/[0.04] rounded-full" />

                        <div className="relative z-10 text-white">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <img src="/logo-white.png" alt="" className="w-3.5 h-3.5 object-contain opacity-60" />
                                <p className="text-[8px] text-white/40 uppercase tracking-[0.2em]">Fidélité</p>
                              </div>
                              <h3 className="font-bold text-[15px]">Café du Port</h3>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                              <span className="text-[11px] font-bold">{cardPoints}/8</span>
                            </div>
                          </div>

                          <div className="flex gap-[4px] my-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div key={i} className="flex-1 h-[8px] rounded-full transition-all duration-700"
                                style={{
                                  background: i < cardPoints ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)',
                                  boxShadow: i < cardPoints ? '0 0 10px rgba(255,255,255,0.15)' : 'none',
                                  transitionDelay: `${i * 100}ms`,
                                }} />
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-white/50">🎁 Café offert</p>
                            <p className="text-[9px] text-white/25 font-mono">CAFE-2024</p>
                          </div>
                        </div>

                        {cardPoints >= 8 && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-[20px] z-20">
                            <div className="text-center">
                              <p className="text-3xl mb-1">🎉</p>
                              <p className="text-white font-bold text-sm">Récompense !</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mini stats */}
                      <div className="mt-4 grid grid-cols-3 gap-2.5">
                        {[
                          { v: cardPoints, l: 'Points', c: '#4f46e5' },
                          { v: 2, l: 'Récomp.', c: '#059669' },
                          { v: `${Math.round(cardPoints / 8 * 100)}%`, l: 'Progrès', c: '#d97706' },
                        ].map((s, i) => (
                          <div key={i} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
                            <p className="text-[15px] font-bold" style={{ color: s.c }}>{s.v}</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">{s.l}</p>
                          </div>
                        ))}
                      </div>

                      {/* Bottom action */}
                      <div className="mt-4 bg-gray-900 rounded-2xl py-3 text-center">
                        <p className="text-white text-[12px] font-semibold">Scanner le QR Code</p>
                      </div>
                    </div>

                    {/* Home indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-gray-900 rounded-full opacity-20" />
                  </div>
                </div>

                {/* Phone reflection */}
                <div className="absolute -bottom-8 left-[8%] right-[8%] h-16 rounded-full blur-3xl bg-indigo-500/10" />
              </div>
            </div>
          </div>

          {/* Textes latéraux qui apparaissent avec le phone */}
          <div className="absolute left-[6%] top-1/2 -translate-y-1/2 max-w-[280px] hidden lg:block" style={{
            opacity: fadeBetween(1.5, 3),
            transform: `translateX(${translate(1.5, -50, 0)}px)`,
          }}>
            <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-500 font-medium mb-3">Le problème</p>
            <h3 className="text-2xl font-bold leading-snug mb-3">67% de vos clients ne reviennent jamais.</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Pas parce qu&apos;ils n&apos;ont pas aimé. Parce qu&apos;ils oublient.</p>
          </div>

          <div className="absolute right-[6%] top-1/2 -translate-y-1/2 max-w-[260px] text-right hidden lg:block" style={{
            opacity: fadeBetween(2, 3.2),
            transform: `translateX(${translate(2, 50, 0)}px)`,
          }}>
            <p className="text-[10px] uppercase tracking-[0.3em] text-violet-500 font-medium mb-3">La solution</p>
            <h3 className="text-2xl font-bold leading-snug mb-3">Une carte digitale sur leur téléphone.</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Ils ne peuvent plus l&apos;oublier. Ils reviennent.</p>
          </div>
        </div>
      </section>

      {/* ============================================== */}
      {/* SCENE 2 — Photo plein écran + texte            */}
      {/* ============================================== */}
      <section className="relative h-[300vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="absolute inset-0" style={{ opacity: fadeBetween(3.5, 6.5) }}>
            <img src={IMG.hands2} alt="" className="w-full h-full object-cover" style={{ transform: `scale(${1.1 - opacity(4, 6) * 0.1})` }} />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/40 to-white" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6" style={{
            opacity: fadeBetween(4, 6),
            transform: `translateY(${translate(4, 60, 0)}px)`,
          }}>
            <div className="text-center max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400 font-medium mb-6">Comment ça marche</p>
              <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight mb-8">
                Un scan.
                <br />Un point.
                <br /><span className="text-gray-300">C&apos;est tout.</span>
              </h2>
              <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-12">
                {[
                  { n: '01', t: 'Scanner', d: 'Le client scanne votre QR code' },
                  { n: '02', t: 'Valider', d: 'Vous confirmez en un clic' },
                  { n: '03', t: 'Fidéliser', d: 'Il revient pour la récompense' },
                ].map((s, i) => (
                  <div key={i} style={{ opacity: fadeIn(4.5 + i * 0.3), transform: `translateY(${translate(4.5 + i * 0.3, 30, 0)}px)` }}>
                    <p className="text-4xl font-black text-gray-200">{s.n}</p>
                    <p className="font-bold text-sm mt-2">{s.t}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================== */}
      {/* SCENE 3 — Grid photos + secteurs               */}
      {/* ============================================== */}
      <section className="relative h-[300vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-[#0a0a0a]">
          {/* Photos grid */}
          <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 gap-1" style={{ opacity: fadeBetween(6.5, 9) }}>
            {[IMG.cafe, IMG.salon, IMG.bakery, IMG.resto, IMG.shop, IMG.barista, IMG.people, IMG.team].map((src, i) => (
              <div key={i} className="relative overflow-hidden" style={{
                opacity: fadeIn(6.8 + i * 0.15),
                transform: `scale(${0.8 + fadeIn(6.8 + i * 0.15) * 0.2})`,
              }}>
                <img src={src} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30" />
              </div>
            ))}
          </div>

          {/* Texte par dessus */}
          <div className="absolute inset-0 flex items-center justify-center px-6 z-10" style={{
            opacity: fadeBetween(7.5, 9),
            transform: `translateY(${translate(7.5, 40, 0)}px)`,
          }}>
            <div className="text-center">
              <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-black text-white leading-[1.05] tracking-tight">
                Cafés. Restos.
                <br />Salons. Boutiques.
              </h2>
              <p className="text-white/40 text-lg mt-4 font-light">Fidali s&apos;adapte à tous les commerces.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================== */}
      {/* SCENE 4 — Chiffres                             */}
      {/* ============================================== */}
      <section className="relative h-[200vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-white flex items-center justify-center px-6">
          <div className="max-w-4xl w-full" style={{ opacity: fadeBetween(9, 10.5) }}>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 font-medium text-center mb-12" style={{ opacity: fadeIn(9.2) }}>En chiffres</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { v: '500+', l: 'Commerçants', d: 'nous font confiance' },
                { v: '15K+', l: 'Clients', d: 'fidélisés ce mois' },
                { v: '+40%', l: 'De retours', d: 'en moyenne' },
                { v: '2 min', l: 'Pour commencer', d: 'c\'est tout' },
              ].map((s, i) => (
                <div key={i} className="text-center" style={{
                  opacity: fadeIn(9.3 + i * 0.2),
                  transform: `translateY(${translate(9.3 + i * 0.2, 40, 0)}px)`,
                }}>
                  <p className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight">{s.v}</p>
                  <p className="text-sm font-semibold mt-1">{s.l}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================== */}
      {/* SCENE 5 — Témoignages                          */}
      {/* ============================================== */}
      <section className="relative h-[200vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-[#fafafa] flex items-center justify-center px-6">
          <div className="max-w-5xl w-full" style={{ opacity: fadeBetween(10.5, 12) }}>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 font-medium text-center mb-10" style={{ opacity: fadeIn(10.6) }}>
              Ce qu&apos;ils en disent
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Karim B.', role: 'Café Central, Alger', text: 'En 1 mois, 40% de mes clients reviennent plus souvent. Le QR code est d\'une simplicité redoutable.', img: IMG.man },
                { name: 'Sarah M.', role: 'Salon Belle, Oran', text: 'Mes clientes adorent voir leur progression. Fini les cartes papier perdues. Mon outil préféré.', img: IMG.woman },
                { name: 'Youcef A.', role: 'Pizza Roma, Constantine', text: 'Setup en 3 minutes. Mes clients commandent plus pour la pizza gratuite. CA en hausse de 25%.', img: IMG.girl },
              ].map((t, i) => (
                <div key={i} className="bg-white rounded-3xl p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100" style={{
                  opacity: fadeIn(10.8 + i * 0.2),
                  transform: `translateY(${translate(10.8 + i * 0.2, 40, 0)}px)`,
                }}>
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg key={j} className="w-[14px] h-[14px] text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[14px] text-gray-600 leading-[1.7] mb-6">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <img src={t.img} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-[11px] text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================== */}
      {/* SCENE 6 — CTA final (seul bouton de la page)   */}
      {/* ============================================== */}
      <section className="relative h-[200vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-white flex items-center justify-center px-6">
          <div className="text-center max-w-xl" style={{ opacity: fadeIn(12), transform: `translateY(${translate(12, 50, 0)}px) scale(${0.95 + fadeIn(12) * 0.05})` }}>

            <img src="/logo.png" alt="Fidali" className="w-14 h-14 rounded-2xl object-contain mx-auto mb-8 shadow-lg" style={{ opacity: fadeIn(12.2) }} />

            <h2 className="text-[clamp(2rem,5vw,3.2rem)] font-bold leading-[1.1] tracking-tight mb-5" style={{ opacity: fadeIn(12.3) }}>
              Prêt à ne plus
              <br />perdre de clients ?
            </h2>

            <p className="text-gray-400 text-lg mb-10 font-light leading-relaxed" style={{ opacity: fadeIn(12.5) }}>
              Créez votre carte de fidélité digitale.
              <br />
              <span className="text-gray-900 font-medium">Gratuit. 2 minutes. Sans engagement.</span>
            </p>

            <div style={{ opacity: fadeIn(12.7) }}>
              <button
                onClick={() => router.push('/signup')}
                className="group px-12 py-5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-2xl transition-all shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 active:scale-[0.98] text-[15px]"
              >
                Commencer maintenant
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 mt-8 text-[12px] text-gray-400" style={{ opacity: fadeIn(12.9) }}>
              <span>Gratuit</span>
              <span className="w-1 h-1 bg-gray-200 rounded-full" />
              <span>2 minutes</span>
              <span className="w-1 h-1 bg-gray-200 rounded-full" />
              <span>Sans application</span>
            </div>

            <button onClick={() => router.push('/login')} className="mt-6 text-[13px] text-gray-400 hover:text-gray-600 transition" style={{ opacity: fadeIn(13) }}>
              Déjà inscrit ? Connectez-vous
            </button>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-8 text-center border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src="/logo.png" alt="" className="w-5 h-5 rounded object-contain" />
          <span className="text-sm font-medium text-gray-400">Fidali</span>
        </div>
        <p className="text-[11px] text-gray-300">© 2025 Fidali — Fidélité digitale</p>
      </footer>

    </div>
  )
}
