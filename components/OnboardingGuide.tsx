'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    number: '01',
    icon: '💳',
    title: 'Créez votre carte de fidélité',
    desc: 'Choisissez un design, définissez votre récompense et le nombre de points.',
    cta: 'Créer ma carte →',
  },
  {
    number: '02',
    icon: '📱',
    title: 'Partagez le QR code',
    desc: 'Imprimez-le et posez-le sur votre caisse. Vos clients scannent et rejoignent.',
    cta: 'Voir mon QR code →',
  },
  {
    number: '03',
    icon: '✅',
    title: 'Validez votre première visite',
    desc: 'Quand un client arrive, validez sa présence depuis le dashboard.',
    cta: 'Voir les validations →',
  },
]

export default function OnboardingGuide({
  cards,
  clients,
  totalPoints,
  onCreateCard,
  onShowQR,
  onGoValidations,
  merchantName,
}: {
  cards: any[]
  clients: any[]
  totalPoints: number
  onCreateCard: () => void
  onShowQR: () => void
  onGoValidations: () => void
  merchantName?: string
}) {
  const hasCard = cards.length > 0
  const hasClient = clients.length > 0
  const hasValidated = totalPoints > 0

  const completed = [hasCard, hasClient, hasValidated]
  const allDone = completed.every(Boolean)
  const completedCount = completed.filter(Boolean).length

  const actions = [onCreateCard, onShowQR, onGoValidations]

  // Si tout est fait, on cache le guide
  if (allDone) return null

  return (
    <div className="rounded-3xl overflow-hidden border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      {/* Header */}
      <div className="px-6 pt-7 pb-5 border-b border-indigo-100/60">
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Guide de démarrage
          </div>
          <span className="text-xs font-semibold text-slate-400">{completedCount}/3 étapes</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-700"
            style={{ width: `${(completedCount / 3) * 100}%` }}
          />
        </div>
        <p className="text-sm text-slate-500 mt-3">
          {merchantName ? `Bonjour ${merchantName.split(' ')[0]} 👋 —` : '👋'} 
          {completedCount === 0 && ' Commençons par créer votre carte.'}
          {completedCount === 1 && ' Super ! Partagez maintenant votre QR code.'}
          {completedCount === 2 && ' Excellent ! Plus qu'une étape pour finir.'}
        </p>
      </div>

      {/* Steps */}
      <div className="p-5 space-y-3">
        {STEPS.map((step, i) => {
          const done = completed[i]
          const isNext = !done && completed.slice(0, i).every(Boolean)
          const isLocked = !done && !isNext

          return (
            <div
              key={i}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                done
                  ? 'bg-green-50 border-green-200'
                  : isNext
                  ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-200'
                  : 'bg-white/50 border-slate-100 opacity-50'
              }`}
            >
              {/* Check or number */}
              <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                style={{
                  borderColor: done ? '#22c55e' : isNext ? 'rgba(255,255,255,0.4)' : '#e2e8f0',
                  background: done ? '#dcfce7' : isNext ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}
              >
                {done ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span className={`text-lg`}>{step.icon}</span>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold mb-0.5 ${done ? 'text-green-700 line-through decoration-green-400' : isNext ? 'text-white' : 'text-slate-500'}`}>
                  {step.title}
                </p>
                <p className={`text-xs leading-relaxed ${done ? 'text-green-500' : isNext ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {done ? 'Terminé ✓' : step.desc}
                </p>
              </div>

              {/* CTA */}
              {isNext && (
                <button
                  onClick={actions[i]}
                  className="shrink-0 px-3 py-2 bg-white text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-50 transition whitespace-nowrap shadow-sm"
                >
                  {step.cta}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="px-6 pb-5 text-center">
        <p className="text-xs text-slate-400">💡 La plupart des commerçants finissent en moins de 5 minutes</p>
      </div>
    </div>
  )
}
