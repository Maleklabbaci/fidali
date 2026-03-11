'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const PHOTOS = [
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
]

export default function GoPage() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  const [maxScroll, setMaxScroll] = useState(1)
  const [windowH, setWindowH] = useState(800)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleResize = () => {
      setWindowH(window.innerHeight)
      setMaxScroll(document.body.scrollHeight - window.innerHeight)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const progress = maxScroll > 0 ? scrollY / maxScroll : 0
  const section = (start: number, end: number) => {
    if (progress < start) return 0
    if (progress > end) return 1
    return (progress - start) / (end - start)
  }

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

  // Sections de scroll
  const s1 = section(0, 0.12)      // Phone apparaît
  const s2 = section(0.10, 0.22)   // Main gauche arrive
  const s3 = section(0.20, 0.32)   // Main droite arrive, texte 1
  const s4 = section(0.30, 0.42)   // Phone tourne, texte 2
  const s5 = section(0.40, 0.55)   // Photos grid
  const s6 = section(0.53, 0.65)   // Stats
  const s7 = section(0.63, 0.75)   // Texte 3 + phone revient
  const s8 = section(0.73, 0.85)   // Témoignages
  const s9 = section(0.83, 0.95)   // CTA final

  // Points de la carte démo
  const demoPoints = Math.min(Math.floor(s3 * 8), 8)

  return (
    <div className="bg-[#fafafa] text-gray-900 overflow-x-hidden" style={{ minHeight: '800vh' }}>

      {/* Nav minimaliste */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 100 ? 'bg-white/80 backdrop-blur-xl shadow-sm' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Fidali" className="w-8 h-8 rounded-lg object-contain" />
            <span className={`font-bold text-lg transition-colors duration-500 ${scrollY > 100 ? 'text-gray-900' : 'text-gray-900'}`}>Fidali</span>
          </div>
          <button
            onClick={() => router.push('/login')}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-500 ${scrollY > 100 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Connexion
          </button>
        </div>
      </nav>

      {/* Barre de progression */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-gray-200">
        <div className="h-full bg-indigo-500 transition-all duration-100" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* ================================================ */}
      {/* SECTION 1 — HERO : Phone flottant avec carte     */}
      {/* ================================================ */}
      <div className="fixed inset-0 z-10 pointer-events-none" style={{ opacity: progress < 0.85 ? 1 : lerp(1, 0, section(0.85, 0.95)) }}>
        
        {/* Background texts flottants */}
        <div className="absolute inset-0 overflow-hidden select-none">
          <p className="absolute text-[15vw] font-black text-gray-100 leading-none tracking-tighter"
            style={{ top: '5%', left: '-5%', transform: `translateX(${scrollY * 0.05}px)`, opacity: 0.5 }}>
            FIDÉLITÉ
          </p>
          <p className="absolute text-[12vw] font-black text-gray-100 leading-none tracking-tighter"
            style={{ top: '25%', right: '-10%', transform: `translateX(${-scrollY * 0.03}px)`, opacity: 0.4 }}>
            DIGITAL
          </p>
          <p className="absolute text-[18vw] font-black text-gray-100 leading-none tracking-tighter"
            style={{ top: '55%', left: '-8%', transform: `translateX(${scrollY * 0.04}px)`, opacity: 0.3 }}>
            REWARDS
          </p>
          <p className="absolute text-[10vw] font-black text-gray-100 leading-none tracking-tighter"
            style={{ top: '80%', right: '-3%', transform: `translateX(${-scrollY * 0.06}px)`, opacity: 0.35 }}>
            CLIENTS
          </p>
        </div>

        {/* PHONE MOCKUP */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1200px' }}>
          <div
            className="relative transition-none"
            style={{
              transform: `
                rotateY(${lerp(0, -15, s2) + lerp(0, 15, s4) + lerp(0, -5, s7)}deg) 
                rotateX(${lerp(5, -5, s3) + lerp(0, 5, s7)}deg) 
                translateX(${lerp(0, -150, s4) + lerp(0, 200, s5) + lerp(0, -50, s7)}px) 
                translateY(${lerp(30, -20, s1) + lerp(0, 30, s5) + lerp(0, -30, s7)}px) 
                scale(${lerp(0.8, 1, s1) * lerp(1, 0.7, s5) * lerp(1, 1.1, s7)})
              `,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Phone body */}
            <div className="w-[280px] h-[580px] bg-gray-900 rounded-[44px] p-[12px] shadow-2xl relative"
              style={{ boxShadow: '0 50px 100px rgba(0,0,0,0.15), 0 20px 40px rgba(0,0,0,0.1)' }}>
              
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-gray-900 rounded-b-2xl z-20" />
              
              {/* Screen */}
              <div className="w-full h-full bg-white rounded-[34px] overflow-hidden relative">
                
                {/* Status bar */}
                <div className="h-12 bg-gradient-to-b from-gray-50 to-white flex items-end justify-between px-6 pb-1">
                  <span className="text-[10px] font-semibold text-gray-400">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2 border border-gray-400 rounded-sm relative">
                      <div className="absolute inset-[1px] right-[2px] bg-emerald-400 rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* App content — La carte */}
                <div className="px-4 pt-4">
                  <div className="text-center mb-4">
                    <p className="text-[10px] text-gray-400">Ma carte fidélité</p>
                  </div>

                  {/* Loyalty card inside phone */}
                  <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', minHeight: '180px' }}>
                    <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/[0.05] rounded-full" />
                    
                    <div className="relative z-10 text-white">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <img src="/logo-white.png" alt="" className="w-3.5 h-3.5 object-contain opacity-50" />
                            <p className="text-[8px] text-white/40 uppercase tracking-widest">Fidélité</p>
                          </div>
                          <h3 className="font-bold text-sm">Café du Port</h3>
                        </div>
                        <div className="bg-white/15 px-2 py-0.5 rounded-full">
                          <span className="text-[10px] font-bold">{demoPoints}/8</span>
                        </div>
                      </div>

                      <div className="flex gap-[4px] mb-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="flex-1 h-[7px] rounded-full transition-all duration-700"
                            style={{
                              background: i < demoPoints ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)',
                              boxShadow: i < demoPoints ? '0 0 8px rgba(255,255,255,0.2)' : 'none',
                              transitionDelay: `${i * 100}ms`,
                            }}
                          />
                        ))}
                      </div>

                      <p className="text-[10px] text-white/50">🎁 Café offert</p>
                    </div>

                    {/* Reward animation */}
                    {demoPoints >= 8 && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-2xl z-20 animate-fadeIn">
                        <div className="text-center">
                          <p className="text-3xl animate-bounce">🎉</p>
                          <p className="text-white font-bold text-xs mt-1">Récompense !</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick stats in phone */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                      <p className="text-sm font-bold text-indigo-600">{demoPoints}</p>
                      <p className="text-[8px] text-gray-400">Points</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                      <p className="text-sm font-bold text-emerald-600">2</p>
                      <p className="text-[8px] text-gray-400">Récomp.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                      <p className="text-sm font-bold text-amber-600">{Math.round(demoPoints / 8 * 100)}%</p>
                      <p className="text-[8px] text-gray-400">Progress</p>
                    </div>
                  </div>

                  {/* Scan button in phone */}
                  <div className="mt-4 bg-indigo-600 rounded-xl py-2.5 text-center">
                    <p className="text-white text-[11px] font-semibold">📱 Scanner le QR Code</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone shadow */}
            <div className="absolute -bottom-8 left-[10%] right-[10%] h-12 bg-black/10 rounded-full blur-2xl" />
          </div>

          {/* MAIN GAUCHE 🫲 */}
          <div
            className="absolute transition-none select-none"
            style={{
              left: `${lerp(-30, 5, s2)}%`,
              top: '40%',
              transform: `rotate(${lerp(-30, -10, s2)}deg) scale(${lerp(0.5, 1, s2)})`,
              opacity: lerp(0, 1, s2) * lerp(1, 0, s5),
              fontSize: '120px',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))',
            }}
          >
            🫲
          </div>

          {/* MAIN DROITE 🫱 */}
          <div
            className="absolute transition-none select-none"
            style={{
              right: `${lerp(-30, 5, s3)}%`,
              top: '35%',
              transform: `rotate(${lerp(30, 10, s3)}deg) scale(${lerp(0.5, 1, s3)})`,
              opacity: lerp(0, 1, s3) * lerp(1, 0, s5),
              fontSize: '120px',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))',
            }}
          >
            🫱
          </div>
        </div>

        {/* TEXTES ANIMÉS QUI APPARAISSENT */}
        
        {/* Texte 1 */}
        <div className="absolute left-[8%] top-[15%] max-w-[300px] transition-none"
          style={{ opacity: lerp(0, 1, s2) * lerp(1, 0, s4), transform: `translateY(${lerp(40, 0, s2)}px)` }}>
          <p className="text-sm font-medium text-indigo-500 mb-2 tracking-widest uppercase">La fin du papier</p>
          <h2 className="text-3xl font-extrabold leading-tight text-gray-900">
            Vos clients méritent mieux qu&apos;une carte en carton.
          </h2>
        </div>

        {/* Texte 2 */}
        <div className="absolute right-[8%] top-[20%] max-w-[280px] text-right transition-none"
          style={{ opacity: lerp(0, 1, s3) * lerp(1, 0, s5), transform: `translateY(${lerp(40, 0, s3)}px)` }}>
          <p className="text-sm font-medium text-violet-500 mb-2 tracking-widest uppercase">Simple et rapide</p>
          <h2 className="text-3xl font-extrabold leading-tight text-gray-900">
            Un scan. Un point. C&apos;est tout.
          </h2>
        </div>

        {/* Texte 3 — après les mains */}
        <div className="absolute left-[8%] bottom-[25%] max-w-[320px] transition-none"
          style={{ opacity: lerp(0, 1, s4) * lerp(1, 0, s5), transform: `translateY(${lerp(40, 0, s4)}px)` }}>
          <p className="text-sm font-medium text-emerald-500 mb-2 tracking-widest uppercase">Résultat</p>
          <h2 className="text-3xl font-extrabold leading-tight text-gray-900">
            +40% de clients qui reviennent.
          </h2>
          <p className="text-gray-400 mt-3 text-sm leading-relaxed">
            Pas de promesse vide. Nos commerçants le constatent chaque jour.
          </p>
        </div>

        {/* Texte 4 — Stats */}
        <div className="absolute right-[8%] bottom-[20%] max-w-[250px] text-right transition-none"
          style={{ opacity: lerp(0, 1, s4) * lerp(1, 0, s5), transform: `translateY(${lerp(40, 0, s4)}px)` }}>
          <div className="space-y-4">
            <div>
              <p className="text-4xl font-black text-indigo-600">500+</p>
              <p className="text-xs text-gray-400">commerçants actifs</p>
            </div>
            <div>
              <p className="text-4xl font-black text-violet-600">15K</p>
              <p className="text-xs text-gray-400">clients fidélisés</p>
            </div>
            <div>
              <p className="text-4xl font-black text-emerald-600">98%</p>
              <p className="text-xs text-gray-400">satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================ */}
      {/* SECTION PHOTOS — Grid qui apparaît              */}
      {/* ================================================ */}
      <div className="fixed inset-0 z-5 pointer-events-none" style={{ opacity: clamp(lerp(0, 1, s5) * lerp(1, 0, s7), 0, 1) }}>
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-2 p-2">
          {PHOTOS.map((src, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl"
              style={{
                transform: `scale(${lerp(0.8, 1, s5)}) translateY(${lerp(50 + i * 20, 0, s5)}px)`,
                opacity: lerp(0, 1, s5),
                transitionDelay: `${i * 50}ms`,
              }}>
              <img src={src} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ))}
        </div>

        {/* Texte par dessus les photos */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6" style={{ opacity: lerp(0, 1, section(0.45, 0.52)), transform: `translateY(${lerp(30, 0, section(0.45, 0.52))}px)` }}>
            <p className="text-white/60 text-sm uppercase tracking-[0.3em] mb-4">Pour tous les commerces</p>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-none mb-6">
              Cafés. Restos.<br />Salons. Boutiques.
            </h2>
            <p className="text-white/50 text-lg max-w-lg mx-auto">
              Quel que soit votre commerce, Fidali s&apos;adapte à vous.
            </p>
          </div>
        </div>
      </div>

      {/* ================================================ */}
      {/* SECTION TÉMOIGNAGES — Après les photos           */}
      {/* ================================================ */}
      <div className="fixed inset-0 z-5 pointer-events-none flex items-center justify-center px-6"
        style={{ opacity: clamp(lerp(0, 1, s8) * lerp(1, 0, s9), 0, 1) }}>
        <div className="max-w-4xl w-full">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-gray-400 mb-8"
            style={{ opacity: lerp(0, 1, s8), transform: `translateY(${lerp(20, 0, s8)}px)` }}>
            Ils nous font confiance
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Karim B.', biz: 'Café Central', text: 'Mes clients adorent. +40% de retours en 1 mois.', delay: 0 },
              { name: 'Sarah M.', biz: 'Salon Belle', text: 'Fini les cartes papier. Simple et efficace.', delay: 0.03 },
              { name: 'Youcef A.', biz: 'Pizza Roma', text: 'Mon CA a augmenté de 25%. Incroyable.', delay: 0.06 },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100"
                style={{
                  opacity: lerp(0, 1, section(0.75 + t.delay, 0.82 + t.delay)),
                  transform: `translateY(${lerp(40, 0, section(0.75 + t.delay, 0.82 + t.delay))}px)`,
                }}>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.biz}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================ */}
      {/* SECTION FINALE — CTA unique                      */}
      {/* ================================================ */}
      <div className="fixed inset-0 z-5 pointer-events-none flex items-center justify-center px-6"
        style={{ opacity: lerp(0, 1, s9) }}>
        <div className="text-center max-w-2xl pointer-events-auto"
          style={{ transform: `translateY(${lerp(60, 0, s9)}px) scale(${lerp(0.9, 1, s9)})` }}>
          
          <div className="mb-8" style={{ opacity: lerp(0, 1, section(0.88, 0.93)) }}>
            <img src="/logo.png" alt="Fidali" className="w-16 h-16 rounded-2xl object-contain mx-auto mb-6 shadow-xl" />
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] mb-6"
            style={{ opacity: lerp(0, 1, section(0.87, 0.92)) }}>
            Prêt à ne plus
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              perdre de clients ?
            </span>
          </h2>

          <p className="text-lg text-gray-400 mb-10 max-w-md mx-auto"
            style={{ opacity: lerp(0, 1, section(0.89, 0.94)) }}>
            Créez votre carte de fidélité digitale en 2 minutes.
            <strong className="text-gray-700"> Gratuit. Sans engagement.</strong>
          </p>

          <div className="space-y-4" style={{ opacity: lerp(0, 1, section(0.91, 0.96)) }}>
            <button
              onClick={() => router.push('/signup')}
              className="px-12 py-5 bg-gray-900 hover:bg-gray-800 text-white text-lg font-bold rounded-2xl transition-all shadow-2xl shadow-gray-900/20 hover:shadow-gray-900/30 hover:-translate-y-1 active:scale-[0.98]"
            >
              Commencer maintenant
            </button>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <span>✅ Gratuit</span>
              <span>✅ 2 minutes</span>
              <span>✅ Sans app</span>
            </div>

            <button onClick={() => router.push('/login')} className="text-sm text-gray-400 hover:text-gray-600 transition mt-4 block mx-auto">
              J&apos;ai déjà un compte →
            </button>
          </div>
        </div>
      </div>

      {/* Spacer — C'est le scroll qui anime tout */}
      <div className="relative z-0" style={{ height: '800vh' }} />

      {/* Footer fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 z-5 pointer-events-none">
        <div className="flex items-center justify-center py-4" style={{ opacity: lerp(0, 1, section(0.95, 1)) }}>
          <p className="text-xs text-gray-300">© 2025 Fidali · Fidélité digitale 🇩🇿</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  )
}
