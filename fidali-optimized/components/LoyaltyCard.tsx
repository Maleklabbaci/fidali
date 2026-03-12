'use client'

import { extractEmoji, stripEmoji } from '@/lib/store'
import type { CardRenderProps } from '@/types'

const sizeMap = {
  sm: { card: 'w-[200px] h-[122px] rounded-[14px] p-3.5', logo: 'w-7 h-7 rounded-lg text-sm', brand: 'text-xs', pts: 'text-xl', label: 'text-[10px] tracking-wider', holder: 'text-[10px]', tag: 'text-[10px] px-1.5 py-0.5' },
  md: { card: 'w-[320px] h-[195px] rounded-[20px] p-6', logo: 'w-[42px] h-[42px] rounded-xl text-xl', brand: 'text-lg', pts: 'text-4xl', label: 'text-[11px] tracking-widest', holder: 'text-xs', tag: 'text-[11px] px-2.5 py-1' },
  lg: { card: 'w-[340px] h-[210px] rounded-[22px] p-7', logo: 'w-12 h-12 rounded-xl text-2xl', brand: 'text-xl', pts: 'text-5xl', label: 'text-xs tracking-widest', holder: 'text-sm', tag: 'text-xs px-3 py-1' },
}

export function LoyaltyCard({ businessName, color1, color2, points = 0, maxPoints = 500, holderName, reward, size = 'md' }: CardRenderProps) {
  const s = sizeMap[size]
  const emoji = extractEmoji(businessName)
  const cleanName = stripEmoji(businessName)
  const progress = Math.min((points / maxPoints) * 100, 100)
  const rewardLabel = reward?.split('=')[0] || reward || ''

  return (
    <div
      className={`${s.card} relative flex flex-col justify-between overflow-hidden cursor-pointer shadow-2xl transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.02] group`}
      style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-transparent pointer-events-none z-[1]" />
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-[1]" style={{
        backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.8) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '60px 60px, 40px 40px',
      }} />
      <div className="absolute w-[180px] h-[180px] bg-white/[0.07] rounded-full -bottom-[50px] -right-[30px] z-[1]" />
      <div className="absolute w-[100px] h-[100px] bg-white/[0.05] rounded-full -top-5 -left-5 z-[1]" />

      {/* Top */}
      <div className="flex justify-between items-start relative z-[2]">
        <div className="flex items-center gap-2.5">
          <div className={`${s.logo} bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/25 flex-shrink-0`}>
            {emoji}
          </div>
          <span className={`font-display ${s.brand} text-white drop-shadow-md`}>{cleanName}</span>
        </div>
        <div className="w-9 h-[26px] bg-gradient-to-br from-white/35 to-white/15 rounded-md border border-white/30" />
      </div>

      {/* Middle */}
      <div className="relative z-[2]">
        <div className={`font-display ${s.pts} text-white leading-none drop-shadow-lg`}>
          {points.toLocaleString()}
        </div>
        <div className={`${s.label} text-white/70 font-bold uppercase mt-0.5`}>
          points fidélité
        </div>
      </div>

      {/* Bottom */}
      <div className="flex justify-between items-end relative z-[2]">
        <div>
          <div className={`${s.holder} text-white/75 font-bold`}>TITULAIRE</div>
          <div className={`${s.holder} text-white font-extrabold`}>{holderName || 'Votre nom'}</div>
        </div>
        {reward && (
          <div className={`${s.tag} bg-white/20 backdrop-blur-sm rounded-lg font-bold text-white border border-white/20`}>
            🎁 {rewardLabel}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15 z-[2]">
        <div
          className="h-full bg-white/60 rounded-tr transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
