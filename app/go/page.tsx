'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Garde tes images Unsplash
const IMG = {
  hero: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1400&q=90',
  cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&q=85',
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=85',
  resto: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=85',
}

export default function GoPage() {
  const router = useRouter()
  const [sy, setSy] = useState(0)
  const [vh, setVh] = useState(0)

  useEffect(() => {
    setVh(window.innerHeight)
    const handleScroll = () => setSy(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Phone position = sy / vh * 100%
  const phoneY = Math.min((sy / (vh * 8)) * 100, 90)

  return (
    <div className="bg-white text-gray-900 min-h-[500vh]">

      {/* BAR PROGRESS */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-px bg-gradient-to-r from-indigo-400 to-violet-400">
        <div className="h-full bg-gray-900 transition-all duration-300" style={{ width: `${Math.min((sy / (vh * 8)) * 100, 100)}%` }} />
      </div>

      {/* NAV */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${sy > vh * 0.2 ? 'bg-white/95 backdrop-blur-xl shadow-sm' : 'bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Fidali" className="w-9 h-9 rounded-xl object-contain" />
            <span className="font-bold text-lg">Fidali</span>
          </div>
          <button onClick={() => router.push('/login')} className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
            Se connecter
          </button>
        </div>
      </nav>

      {/* PHONE 3D FIXE À GAUCHE — DESCEND AU SCROLL */}
      <div className="fixed left-8 md:left-16 top-[20%] z-[99] w-[280px] pointer-events-none" style={{ 
        top: `${20 + phoneY}%`,
        transform: `translateY(${phoneY * 0.3}px) rotateX(${phoneY * 0.1}deg) rotateY(${phoneY * 0.05}deg)`
      }}>
        <div className="relative group" style={{ perspective: '1000px' }}>
          <div style={{ 
            transform: `rotateY(${phoneY * 0.02}deg) rotateX(${phoneY * 0.01}deg)`,
            transformStyle: 'preserve-3d'
          }}>
            {/* iPhone frame */}
            <div className="relative w-[280px] h-[580px] rounded-[48px] p-[12px]" 
              style={{ 
                background: 'linear-gradient(145deg, #1a1a1e, #2a2a2e)',
                boxShadow: `
                  0 60px 120px rgba(0,0,0,0.3),
                  0 25px 50px rgba(0,0,0,0.15),
                  inset 0 0 0 1.5px rgba(255,255,255,0.08)
                `
              }}>
              
              {/* Buttons */}
              <div className="absolute -left-[2px] top-[100px] w-[2px] h-[32px] bg-[#2a2a2e] rounded-l-[2px]" />
              <div className="absolute -left-[2px] top-[155px] w-[2px] h-[55px] bg-[#2a2a2e] rounded-l-[2px]" />
              <div className="absolute -left-[2px] top-[230px] w-[2px] h-[55px] bg-[#2a2a2e] rounded-l-[2px]" />
              <div className="absolute -right-[2px] top-[150px] w-[2px] h-[70px] bg-[#2a2a2e] rounded-r-[2px]" />

              {/* Screen */}
              <div className="w-full h-full bg-[#f8f9fa] rounded-[38px] overflow-hidden relative">
                {/* Dynamic Island */}
                <div className="absolute top-[12px] left-1/2 transform -translate-x-1/2 w-[100px] h-[32px] bg-[#000] rounded-full z-[10] shadow-lg" />
                
                {/* Status Bar */}
                <div className="absolute top-[16px] left-0 right-0 px-6 flex justify-between items-end">
                  <span className="text-[12px] font-semibold">10:23</span>
                  <div className="flex items-center gap-2">
                    <div className="w-[18px] h-[11px] flex items-end gap-[1px]">
                      {[[1,3],[1,4],[1,5],[1,6]].map(([w,h],i)=>
                        <div key={i} className="w-[2.5px] h-[calc(11px*"+h/5+")] bg-[#000] rounded-sm" />
                      )}
                    </div>
                    <div className="w-[22px] h-[10px] border-[1px] border-[#000] rounded-[3px] relative">
                      <div className="absolute inset-[2px] bg-[#000] rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-[60px] px-5 h-full overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">مرحبا</p>
                      <p className="text-lg font-bold">Ahmed</p>
                    </div>
                    <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg object-contain" />
                  </div>

                  {/* Loyalty Card */}
                  <div className="rounded-[20px] p-5 relative overflow-hidden mb-4" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/5 rounded-full blur-sm" />
                    
                    <div className="relative z-10 text-white">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] opacity-75">ولاء</p>
                          <p className="font-bold text-lg mt-1">Café du Coin</p>
                        </div>
                        <div className="bg-white/15 px-3 py-1 rounded-full backdrop-blur">
                          <span className="text-xs font-bold">6/10</span>
                        </div>
                      </div>

                      <div className="flex gap-1 my-4">
                        {Array.from({length:10}).map((_,i)=>(
                          <div key={i} className="flex-1 h-[6px] rounded-full transition-all duration-500" 
                            style={{
                              background: i<6 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
                              boxShadow: i<6 ? '0 0 8px rgba(255,255,255,0.3)' : 'none'
                            }} />
                        ))}
                      </div>

                      <div className="flex justify-between">
                        <p className="text-xs opacity-75">☕ قهوة مجانية</p>
                        <p className="text-[10px] opacity-50 font-mono">CAFE-2024</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      {v:'6',l:'نقاط',c:'#667eea'},
                      {v:'2',l:'مكافآت',c:'#10b981'},
                      {v:'60%',l:'تقدم',c:'#f59e0b'}
                    ].map((s,i)=>(
                      <div key={i} className="bg-white rounded-xl p-3 text-center shadow-sm">
                        <p className="text-sm font-bold" style={{color:s.c}}>{s.v}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{s.l}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl py-3 text-center mb-4">
                    <p className="text-white font-semibold text-sm">📷 مسح QR Code</p>
                  </div>

                  {/* Recent activity */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">الأخير</p>
                    {[
                      {t:'Café du Coin',d:'اليوم',p:'+1'},
                      {t:'Café du Coin',d:'أمس',p:'+1'}
                    ].map((a,i)=>(
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-orange-100 rounded-full flex center">☕</div>
                          <div>
                            <p className="text-xs font-medium">{a.t}</p>
                            <p className="text-[10px] text-gray-400">{a.d}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full">{a.p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[110px] h-[4px] bg-gray-300/50 rounded-full" />
              </div>

              {/* Reflection */}
              <div className="absolute -bottom-6 left-[10%] right-[10%] h-12 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================== SECTION 1 - HERO =========================== */}
      <section className="pt-32 pb-32 px-6 md:px-12 lg:px-24 relative min-h-screen flex items-center">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-500 font-medium mb-4">بطاقة ولاء رقمية</p>
            <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black leading-[0.9] tracking-tight mb-6">
              زبائنك
              <br />
              <span className="text-gray-200">يرجعولك
              </span>
            </h1>
            <p className="text-xl text-gray-400 font-light leading-relaxed max-w-lg mb-8">
              بطاقة الولاء الرقمية في تليفون الزبون — ما يقدرش ينساها أبداً.
            </p>
            <button onClick={() => router.push('/signup')} className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg">
              ابدأ مجاناً
              <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
          <div className="relative">
            <img src={IMG.hero} alt="Main avec téléphone" className="w-full max-w-md mx-auto rounded-3xl shadow-2xl" />
          </div>
        </div>
      </section>

      {/* =========================== SECTION 2 - COMMENT ÇA MARCHE =========================== */}
      <section className="py-32 px-6 md:px-12 lg:px-24 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-500 font-medium mb-4">كيفاش تخدم</p>
            <h2 className="text-4xl md:text-6xl font-black leading-tight">3 خطوات بسيطة</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                num: '01', title: 'أنشئ بطاقتك', desc: 'اسمك، لونك، مكافأتك. دقيقتين و جاهزة',
                img: IMG.cafe
              },
              {
                num: '02', title: 'الزبون يمسح QR', desc: 'QR على الكونتوار. ما يحتاجش يحمّل تطبيق',
                img: IMG.hero
              },
              {
                num: '03', title: 'يرجعولك', desc: 'البطاقة في تليفونه. يتابع و يرجع يشتري',
                img: IMG.resto
              }
            ].map((step, i) => (
              <div key={i} className="group text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <span className="text-2xl font-black">{step.num}</span>
                </div>
                <img src={step.img} alt="" className="w-48 h-32 object-cover rounded-2xl mx-auto mb-6 group-hover:scale-105 transition-transform" />
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-500 text-lg">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== SECTION 3 - POUR QUI =========================== */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-gray-50 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-500 font-medium mb-4">لكل التجارات</p>
            <h2 className="text-4xl md:text-6xl font-black leading-tight">كل تجارة</h2>
            <p className="text-xl text-gray-500 mt-4 max-w-2xl mx-auto">تخصّصنا لكل نوع تجارة — مقاهي، مطاعم، صالونات، بوتيكات...</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {img: IMG.cafe, name: 'مقاهي ☕'},
              {img: IMG.resto, name: 'مطاعم 🍕'},
              {img: IMG.salon, name: 'صالونات 💇'},
              {img: IMG.cafe, name: 'مخابز 🥖'},
              {img: IMG.shop, name: 'بوتيكات 👗'},
              {img: IMG.gym, name: 'رياضة 💪'},
              {img: IMG.resto, name: 'سوبرماركت 🛒'},
              {img: IMG.cafe, name: 'كرفانات 🌮'}
            ].map((cat, i) => (
              <div key={i} className="group bg-white rounded-3xl p-6 text-center hover:shadow-2xl hover:-translate-y-2 transition-all border hover:border-indigo-100">
                <img src={cat.img} alt="" className="w-20 h-20 object-cover rounded-2xl mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-lg">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== SECTION 4 - CHIFFRES =========================== */}
      <section className="py-32 px-6 md:px-12 lg:px-24 relative">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12 text-center">
          {[
            {num: '500+', label: 'تجار', sub: 'ينفعلون'},
            {num: '15K+', label: 'زبائن', sub: 'ولّاوا'},
            {num: '+45%', label: 'رجوع', sub: 'متوسط'},
            {num: '2دقيقة', label: 'إعداد', sub: 'بس'}
          ].map((stat, i) => (
            <div key={i} className="group">
              <div className="text-[4rem] md:text-[5rem] font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-4">
                {stat.num}
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{stat.label}</p>
              <p className="text-sm text-gray-400 font-medium">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================== SECTION 5 - TÉMOIGNAGES =========================== */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-gray-50 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-500 font-medium mb-4">شهادات</p>
            <h2 className="text-4xl md:text-6xl font-black leading-tight">واش قالو</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'كريم', commerce: 'Café Central',
                text: '40% من زبائني يرجعو أكثر. الـ QR بسيط بزاف و يخدم مزيان.',
                note: 5
              },
              {
                name: 'فاطمة', commerce: 'Salon Beauté',
                text: 'الزبونات فرحانين بالبطاقة الرقمية. ما عادش كروت ضايعة.',
                note: 5
              },
              {
                name: 'ياسين', commerce: 'Pizza Express',
                text: 'حطيتها في 2 دقائق. الـ CA زاد 30% بفضل المكافآت.',
                note: 5
              }
            ].map((tm, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-lg border hover:shadow-2xl transition-shadow">
                <div className="flex gap-1 mb-4">
                  {Array(tm.note).fill(0).map((_,j) => <span key={j} className="text-2xl">⭐</span>)}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-lg">"{tm.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                    <span className="text-xl font-bold text-indigo-600">{tm.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-bold">{tm.name}</p>
                    <p className="text-gray-400 text-sm">{tm.commerce}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== SECTION 6 - CTA =========================== */}
      <section className="py-32 px-6 md:px-12 lg:px-24 text-center relative min-h-screen flex items-center">
        <div className="max-w-3xl mx-auto">
          <img src="/logo.png" alt="Fidali" className="w-20 h-20 mx-auto mb-8 shadow-2xl rounded-2xl" />
          <h2 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            جاهز تحافظ
            <br />
            على زبائنك؟
          </h2>
          <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-lg mx-auto">
            أنشئ بطاقة الولاء الرقمية بـ 2 دقائق. مجاناً تماماً.
          </p>
          
          <button onClick={() => router.push('/signup')} className="group px-12 py-6 bg-gradient-to-r from-gray-900 to-black text-white font-bold rounded-3xl text-lg hover:from-gray-800 hover:to-gray-900 transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-2 mb-8">
            ابدأ مجاناً
            <span className="ml-3 inline-block group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <span>مجاني • 2 دقيقة • بلا تطبيق</span>
          </div>

          <p className="text-sm text-gray-400 mt-8">
            <button onClick={() => router.push('/login')} className="text-indigo-500 hover:text-indigo-600 font-semibold underline">
              عندك حساب؟ سجّل دخول
            </button>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 text-center border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src="/logo.png" alt="" className="w-6 h-6 rounded object-contain" />
          <span className="font-semibold">Fidali</span>
        </div>
        <p className="text-xs text-gray-400">© 2025 Fidali — بطاقة ولاء رقمية</p>
      </footer>

    </div>
  )
}
