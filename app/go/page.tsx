'use client'

import { useRouter } from 'next/navigation'

const IMG = {
  hero: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=85',
  cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
  resto: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  shop: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
  gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  happy: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&q=80',
  team: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
}

export default function GoPage() {
  const router = useRouter()

  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* =================== NAV =================== */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white text-sm font-black">F</span>
            </div>
            <span className="font-bold text-[17px] tracking-tight">Fidali</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/login')} className="text-[14px] text-gray-500 hover:text-gray-900 transition font-medium px-4 py-2">
              Connexion
            </button>
            <button onClick={() => router.push('/signup')} className="text-[14px] bg-gray-900 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm">
              Commencer
            </button>
          </div>
        </div>
      </nav>

      {/* =================== HERO =================== */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left — Text */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] text-indigo-600 font-semibold">بطاقة ولاء رقمية — Fidélité digitale</span>
            </div>

            <h1 className="text-[clamp(2.5rem,5.5vw,4.2rem)] font-extrabold leading-[1.05] tracking-[-0.03em] mb-3">
              زبائنك يرجعولك.
              <br />
              <span className="text-gray-300">بطبيعة الحال.</span>
            </h1>
            <h2 className="text-[clamp(1.2rem,2.5vw,1.6rem)] font-bold text-gray-400 leading-snug mb-6">
              Vos clients reviennent. Naturellement.
            </h2>

            <p className="text-[16px] text-gray-500 leading-relaxed max-w-lg mb-4" dir="rtl">
              بطاقة ولاء رقمية في تليفون الزبون — ما يقدرش ينساها. يرجعلك مرة و مرة.
            </p>
            <p className="text-[15px] text-gray-400 leading-relaxed max-w-lg mb-8">
              Une carte de fidélité digitale sur le téléphone de vos clients. Impossible à oublier. Ils reviennent.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <button onClick={() => router.push('/signup')} className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98] text-[15px]">
                ابدأ مجاناً — Commencer gratuitement
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <div className="flex items-center gap-6 text-[13px] text-gray-400">
              <span className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> مجاني — Gratuit</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> دقيقتين — 2 min</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> بلا تطبيق — Sans app</span>
            </div>
          </div>

          {/* Right — Phone + Card */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">

              {/* Grande carte fidélité en arrière */}
              <div className="absolute -top-6 -left-12 w-[320px] h-[200px] rounded-3xl p-6 z-0 rotate-[-6deg] shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81, #4338ca)' }}>
                <div className="absolute inset-0 opacity-10 rounded-3xl" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/5 rounded-full" />
                <div className="relative z-10 text-white h-full flex flex-col justify-between">
                  <div>
                    <p className="text-[9px] text-white/30 uppercase tracking-[0.25em]">برنامج الولاء — Programme fidélité</p>
                    <p className="font-bold text-[18px] mt-1">Café du Port ☕</p>
                  </div>
                  <div className="flex gap-[5px]">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex-1 h-[8px] rounded-full" style={{
                        background: i < 5 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'rgba(255,255,255,0.08)',
                        boxShadow: i < 5 ? '0 0 6px rgba(251,191,36,0.2)' : 'none',
                      }} />
                    ))}
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-[11px] text-white/40">🎁 قهوة مجانية — Café offert</p>
                    <p className="text-[9px] text-white/20 font-mono">5/8</p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="relative z-10 ml-8">
                <div className="w-[280px] h-[570px] rounded-[48px] p-[12px] relative" style={{
                  background: 'linear-gradient(145deg, #1a1a1e, #2a2a2e)',
                  boxShadow: '0 50px 100px rgba(0,0,0,0.25), 0 20px 40px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.06)',
                }}>
                  <div className="absolute -left-[2px] top-[100px] w-[2px] h-[28px] bg-[#333] rounded-l" />
                  <div className="absolute -left-[2px] top-[150px] w-[2px] h-[48px] bg-[#333] rounded-l" />
                  <div className="absolute -left-[2px] top-[210px] w-[2px] h-[48px] bg-[#333] rounded-l" />
                  <div className="absolute -right-[2px] top-[145px] w-[2px] h-[60px] bg-[#333] rounded-r" />

                  <div className="w-full h-full bg-[#f5f5f7] rounded-[38px] overflow-hidden relative">
                    <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-black rounded-full z-30" />

                    <div className="absolute top-[12px] inset-x-0 flex justify-between px-7 z-20">
                      <span className="text-[11px] font-semibold">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="flex items-end gap-[1.5px]">{[3,5,7,9].map((h,i) => <div key={i} className="w-[2.5px] bg-black rounded-sm" style={{height:h}} />)}</div>
                        <div className="w-[18px] h-[9px] border-[1.2px] border-black rounded-[2px] ml-1 relative">
                          <div className="absolute inset-[1.5px] right-[2.5px] bg-black rounded-[0.5px]" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-[52px] px-4 h-full overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[9px] text-gray-400">مرحبا 👋</p>
                          <p className="text-[14px] font-bold">Mohamed</p>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">M</span>
                        </div>
                      </div>

                      <div className="rounded-[16px] p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                        <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/[0.03] rounded-full" />
                        <div className="relative z-10">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[7px] text-white/25 uppercase tracking-wider">ولاء</p>
                              <p className="text-white font-bold text-[12px]">Café du Port ☕</p>
                            </div>
                            <div className="bg-white/10 px-2 py-0.5 rounded-full">
                              <span className="text-[9px] text-white font-bold">5/8</span>
                            </div>
                          </div>
                          <div className="flex gap-[3px] my-3">
                            {Array.from({length:8}).map((_,i)=>(
                              <div key={i} className="flex-1 h-[5px] rounded-full" style={{
                                background: i<5 ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : 'rgba(255,255,255,0.06)'
                              }} />
                            ))}
                          </div>
                          <p className="text-[8px] text-white/30">🎁 قهوة مجانية عند 8 نقاط</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                        {[{v:'5',l:'نقاط',icon:'⭐',c:'#6366f1'},{v:'2',l:'مكافآت',icon:'🎁',c:'#10b981'},{v:'62%',l:'تقدم',icon:'📊',c:'#f59e0b'}].map((s,i)=>(
                          <div key={i} className="bg-white rounded-xl p-2 text-center shadow-sm border border-gray-100">
                            <span className="text-[10px]">{s.icon}</span>
                            <p className="text-[12px] font-bold" style={{color:s.c}}>{s.v}</p>
                            <p className="text-[7px] text-gray-400">{s.l}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2.5 bg-black rounded-xl py-2.5 text-center">
                        <p className="text-white text-[10px] font-semibold">📷 امسح QR Code</p>
                      </div>

                      <div className="mt-3">
                        <p className="text-[7px] text-gray-400 font-medium mb-1.5">النشاط الأخير</p>
                        {[{t:'Café du Port',d:'اليوم',p:'+1'},{t:'Café du Port',d:'أمس',p:'+1'},{t:'Café du Port',d:'منذ 3 أيام',p:'+1'}].map((a,i)=>(
                          <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 bg-orange-50 rounded-full flex items-center justify-center"><span className="text-[7px]">☕</span></div>
                              <div>
                                <p className="text-[9px] font-medium">{a.t}</p>
                                <p className="text-[7px] text-gray-400">{a.d}</p>
                              </div>
                            </div>
                            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{a.p}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-[90px] h-[4px] bg-black/15 rounded-full" />
                  </div>
                </div>

                {/* Phone shadow */}
                <div className="absolute -bottom-4 left-[15%] right-[15%] h-8 bg-black/5 rounded-full blur-2xl" />
              </div>

              {/* Floating elements */}
              <div className="absolute -right-4 top-16 bg-white rounded-2xl shadow-xl p-3 border border-gray-100 animate-[float_3s_ease-in-out_infinite] z-20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">🎉</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-emerald-600">+1 نقطة!</p>
                    <p className="text-[9px] text-gray-400">Point ajouté</p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-16 bottom-32 bg-white rounded-2xl shadow-xl p-3 border border-gray-100 animate-[float_4s_ease-in-out_infinite_1s] z-20">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <div>
                    <p className="text-[11px] font-bold">مكافأة</p>
                    <p className="text-[9px] text-gray-400">Récompense</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================== TRUSTED BY =================== */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[12px] text-gray-400 font-medium mb-6">+500 تاجر يثقون فينا — Plus de 500 commerçants nous font confiance</p>
          <div className="flex items-center justify-center gap-10 flex-wrap opacity-30">
            {['☕ Café Central', '🍕 Pizza Roma', '💇 Salon Belle', '🥖 Boulangerie Épi', '👗 Mode Chic', '💪 Gym Pro'].map((n, i) => (
              <span key={i} className="text-[14px] font-semibold text-gray-900 whitespace-nowrap">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* =================== FEATURES =================== */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-500 font-semibold mb-3">المزايا — Avantages</p>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tight leading-[1.1] mb-3">
              كل ما تحتاجه لتكبّر تجارتك
            </h2>
            <p className="text-[18px] text-gray-400 font-light">
              Tout ce qu&apos;il faut pour développer votre commerce.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📱', color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-50',
                t_ar: 'بطاقة رقمية', t_fr: 'Carte digitale',
                d_ar: 'في تليفون الزبون — ما ينساهاش',
                d_fr: 'Sur le téléphone du client — impossible à oublier',
              },
              {
                icon: '⚡', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50',
                t_ar: 'إعداد في دقيقتين', t_fr: 'Setup en 2 minutes',
                d_ar: 'بلا تطبيق، بلا تعقيد',
                d_fr: 'Sans application, sans complication',
              },
              {
                icon: '📊', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50',
                t_ar: 'إحصائيات مباشرة', t_fr: 'Stats en temps réel',
                d_ar: 'شوف كل شيء — زبائنك، نقاطهم، مكافآتهم',
                d_fr: 'Voyez tout — vos clients, leurs points, leurs récompenses',
              },
              {
                icon: '🎨', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50',
                t_ar: 'تخصيص كامل', t_fr: 'Personnalisation totale',
                d_ar: 'ألوان، لوڨو، مكافآت — كل شيء باسمك',
                d_fr: 'Couleurs, logo, récompenses — tout à votre image',
              },
              {
                icon: '🔔', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50',
                t_ar: 'إشعارات ذكية', t_fr: 'Notifications intelligentes',
                d_ar: 'ذكّر زبائنك بالعروض و المكافآت',
                d_fr: 'Rappelez vos clients des offres et récompenses',
              },
              {
                icon: '🔒', color: 'from-gray-600 to-gray-800', bg: 'bg-gray-100',
                t_ar: 'آمن و موثوق', t_fr: 'Sécurisé et fiable',
                d_ar: 'بياناتك و بيانات زبائنك محمية',
                d_fr: 'Vos données et celles de vos clients protégées',
              },
            ].map((f, i) => (
              <div key={i} className="group bg-white rounded-3xl p-7 border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{f.icon}</span>
                </div>
                <h3 className="font-bold text-[16px] mb-1">{f.t_ar}</h3>
                <p className="text-[14px] text-gray-400 font-medium mb-2">{f.t_fr}</p>
                <p className="text-[13px] text-gray-500 leading-relaxed" dir="rtl">{f.d_ar}</p>
                <p className="text-[13px] text-gray-400 leading-relaxed mt-1">{f.d_fr}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== HOW IT WORKS =================== */}
      <section className="py-20 md:py-28 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-500 font-semibold mb-3">كيفاش تخدم — Comment ça marche</p>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tight leading-[1.1]">
              بسيطة كالسلام
            </h2>
            <p className="text-[18px] text-gray-400 font-light mt-3">Simple comme bonjour.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: '01', img: IMG.cafe,
                t_ar: 'أنشئ بطاقتك', t_fr: 'Créez votre carte',
                d_ar: 'اسم، ألوان، مكافأة. دقيقتين و يكون جاهز.',
                d_fr: 'Nom, couleurs, récompense. 2 minutes et c\'est prêt.',
              },
              {
                n: '02', img: IMG.happy,
                t_ar: 'الزبون يمسح الـ QR', t_fr: 'Le client scanne le QR',
                d_ar: 'QR code على الكونتوار. بلا ما يحمّل تطبيق.',
                d_fr: 'QR code sur le comptoir. Pas d\'app à télécharger.',
              },
              {
                n: '03', img: IMG.team,
                t_ar: 'يرجعولك', t_fr: 'Ils reviennent',
                d_ar: 'البطاقة في تليفونهم. يتابعو تقدمهم و يرجعولك.',
                d_fr: 'La carte est dans leur phone. Ils suivent leur progrès.',
              },
            ].map((s, i) => (
              <div key={i} className="group">
                <div className="relative rounded-3xl overflow-hidden mb-5 aspect-[4/3]">
                  <img src={s.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center">
                    <span className="text-[14px] font-black text-indigo-600">{s.n}</span>
                  </div>
                </div>
                <h3 className="font-bold text-[18px] mb-1">{s.t_ar}</h3>
                <p className="text-[15px] text-gray-400 font-medium mb-2">{s.t_fr}</p>
                <p className="text-[14px] text-gray-500 leading-relaxed" dir="rtl">{s.d_ar}</p>
                <p className="text-[13px] text-gray-400 leading-relaxed mt-1">{s.d_fr}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== SECTORS — PHOTOS =================== */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-500 font-semibold mb-3">لكل تجارة — Pour tous</p>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tight leading-[1.1] mb-3">
              تجارتك، معززة.
            </h2>
            <p className="text-[18px] text-gray-400 font-light">Votre commerce, boosté.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { img: IMG.cafe, ar: 'مقاهي', fr: 'Cafés', emoji: '☕' },
              { img: IMG.resto, ar: 'مطاعم', fr: 'Restaurants', emoji: '🍕' },
              { img: IMG.salon, ar: 'صالونات', fr: 'Salons', emoji: '💇' },
              { img: IMG.bakery, ar: 'مخابز', fr: 'Boulangeries', emoji: '🥖' },
              { img: IMG.shop, ar: 'بوتيكات', fr: 'Boutiques', emoji: '👗' },
              { img: IMG.gym, ar: 'رياضة', fr: 'Fitness', emoji: '💪' },
            ].map((s, i) => (
              <div key={i} className="group relative rounded-3xl overflow-hidden aspect-[4/3] cursor-pointer">
                <img src={s.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-2xl mb-1 block">{s.emoji}</span>
                  <p className="text-white font-bold text-[18px]">{s.ar}</p>
                  <p className="text-white/60 text-[13px]">{s.fr}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== STATS =================== */}
      <section className="py-20 md:py-28 px-6 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-400 font-semibold mb-3">بالأرقام — En chiffres</p>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tight leading-[1.1]">
              أرقام تتكلم وحدها
            </h2>
            <p className="text-[18px] text-white/40 font-light mt-3">Des chiffres qui parlent d&apos;eux-mêmes.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { v: '500+', ar: 'تاجر', fr: 'Commerçants' },
              { v: '15K+', ar: 'زبون', fr: 'Clients fidélisés' },
              { v: '+40%', ar: 'نسبة الرجوع', fr: 'Taux de retour' },
              { v: '2 دقائق', ar: 'للبداية', fr: 'Pour démarrer' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-[clamp(2.5rem,5vw,4rem)] font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{s.v}</p>
                <p className="text-[14px] font-semibold text-white/60 mt-1">{s.ar}</p>
                <p className="text-[12px] text-white/30">{s.fr}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== TESTIMONIALS =================== */}
      <section className="py-20 md:py-28 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-500 font-semibold mb-3">شهادات — Témoignages</p>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tight leading-[1.1] mb-3">
              واش قالو عنّا
            </h2>
            <p className="text-[18px] text-gray-400 font-light">Ce qu&apos;ils disent de nous.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'كريم ب.', role: 'Café Central, الجزائر',
                ar: '40% من زبائني ولاو يرجعو أكثر. الـ QR code بسيط بزاف.',
                fr: '40% de mes clients reviennent plus souvent. Le QR code est d\'une simplicité redoutable.',
                color: 'from-indigo-500 to-violet-500',
              },
              {
                name: 'سارة م.', role: 'Salon Belle, وهران',
                ar: 'الزبونات تاعي يحبو يشوفو التقدم تاعهم. خلاص ما كانش كروت ورق ضايعة.',
                fr: 'Mes clientes adorent suivre leur progression. Plus de cartes papier perdues !',
                color: 'from-pink-500 to-rose-500',
              },
              {
                name: 'يوسف أ.', role: 'Pizza Roma, قسنطينة',
                ar: 'حطيتها في 3 دقائق. الزبائن يطلبو أكثر باش ياخذو البيتزا المجانية. +25% دخل.',
                fr: 'Setup en 3 min. Mes clients commandent plus pour la pizza gratuite. CA +25%.',
                color: 'from-amber-500 to-orange-500',
              },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => <span key={j} className="text-[14px]">⭐</span>)}
                </div>
                <p className="text-[14px] text-gray-700 leading-[1.8] mb-2" dir="rtl">&ldquo;{t.ar}&rdquo;</p>
                <p className="text-[13px] text-gray-400 leading-[1.7] mb-5 italic">&ldquo;{t.fr}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${t.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-[12px] font-bold">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold">{t.name}</p>
                    <p className="text-[12px] text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== PRICING SIMPLE =================== */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-500 font-semibold mb-3">الأسعار — Tarifs</p>
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tight leading-[1.1] mb-3">
            ابدأ مجاناً
          </h2>
          <p className="text-[18px] text-gray-400 font-light mb-12">Commencez gratuitement.</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 text-left">
              <p className="text-[12px] text-gray-400 font-semibold uppercase tracking-wider mb-2">مجاني — Gratuit</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black">0</span>
                <span className="text-xl text-gray-400">DA</span>
                <span className="text-gray-400 text-sm">/شهر</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'بطاقة واحدة — 1 carte',
                  'زبائن غير محدودين — Clients illimités',
                  'QR Code — كود QR',
                  'إحصائيات أساسية — Stats basiques',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[14px] text-gray-600">
                    <span className="text-emerald-500 font-bold">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => router.push('/signup')} className="w-full py-3.5 rounded-xl border-2 border-gray-200 text-gray-900 font-semibold hover:bg-gray-50 transition text-[14px]">
                ابدأ مجاناً — Commencer
              </button>
            </div>

            {/* Pro */}
            <div className="bg-gray-900 rounded-3xl p-8 text-left relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">الأفضل — Populaire</div>
              <p className="text-[12px] text-white/40 font-semibold uppercase tracking-wider mb-2">Pro</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black text-white">2900</span>
                <span className="text-xl text-white/40">DA</span>
                <span className="text-white/40 text-sm">/شهر</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'بطاقات غير محدودة — Cartes illimitées',
                  'زبائن غير محدودين — Clients illimités',
                  'إحصائيات متقدمة — Stats avancées',
                  'إشعارات — Notifications',
                  'دعم أولوي — Support prioritaire',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[14px] text-white/70">
                    <span className="text-emerald-400 font-bold">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => router.push('/signup')} className="w-full py-3.5 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition text-[14px]">
                ابدأ الآن — Commencer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =================== CTA FINAL =================== */}
      <section className="py-24 md:py-32 px-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-white tracking-tight leading-[1.08] mb-4">
            مستعد تحافظ على زبائنك؟
          </h2>
          <p className="text-[clamp(1.2rem,2.5vw,1.5rem)] text-white/60 font-light mb-4">
            Prêt à fidéliser vos clients ?
          </p>
          <p className="text-white/40 text-[16px] mb-10 leading-relaxed">
            أنشئ بطاقتك الرقمية الآن. مجاناً.
            <br />Créez votre carte digitale maintenant. Gratuitement.
          </p>

          <button
            onClick={() => router.push('/signup')}
            className="group px-10 py-5 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-2xl transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-1 active:scale-[0.98] text-[16px]"
          >
            ابدأ الآن — Commencer maintenant
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <div className="flex items-center justify-center gap-6 mt-6 text-[13px] text-white/50">
            <span>✓ مجاني</span>
            <span>✓ دقيقتين</span>
            <span>✓ بلا تطبيق</span>
          </div>
        </div>
      </section>

      {/* =================== FOOTER =================== */}
      <footer className="py-10 px-6 bg-gray-950 text-white/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-white text-[10px] font-black">F</span>
            </div>
            <span className="text-[14px] font-semibold text-white/60">Fidali</span>
          </div>
          <p className="text-[12px]">© 2025 Fidali — برنامج ولاء رقمي — Programme de fidélité digital</p>
          <button onClick={() => router.push('/login')} className="text-[13px] text-white/40 hover:text-white transition">
            Connexion →
          </button>
        </div>
      </footer>

      {/* Float animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) }
          50% { transform: translateY(-10px) }
        }
      `}</style>
    </div>
  )
}
