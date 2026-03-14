'use client'

import { useState } from 'react'

const STEPS = [
  {
    number: '01',
    icon: '💳',
    title: 'Créez votre carte de fidélité',
    desc: 'Choisissez un design, définissez votre récompense et le nombre de points nécessaires.',
    action: 'Créer ma carte',
    isPrimary: true,
  },
  {
    number: '02',
    icon: '📱',
    title: 'Partagez le QR code',
    desc: 'Imprimez-le et posez-le sur votre caisse. Vos clients scannent et rejoignent le programme.',
    action: null,
    isPrimary: false,
  },
  {
    number: '03',
    icon: '🎁',
    title: 'Validez les visites',
    desc: 'À chaque visite, validez la présence depuis votre dashboard. Le client gagne ses points automatiquement.',
    action: null,
    isPrimary: false,
  },
]

export default function OnboardingGuide({
  onCreateCard,
  merchantName,
}: {
  onCreateCard: () => void
  merchantName?: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="rounded-3xl overflow-hidden border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 text-center border-b border-indigo-100/60">
        <div className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Bienvenue sur Fidali
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          {merchantName ? `Bonjour ${merchantName.split(' ')[0]} ! 👋` : 'Bonjour ! 👋'}
        </h2>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          Votre programme de fidélité est prêt en 3 étapes simples
        </p>
      </div>

      {/* Steps */}
      <div className="p-5 space-y-3">
        {STEPS.map((step, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 ${
              i === 0
                ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-200'
                : hovered === i
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-white/60 border-slate-100'
            }`}
          >
            {/* Number + icon */}
            <div className="shrink-0 flex flex-col items-center gap-1">
              <span className={`text-[10px] font-bold ${i === 0 ? 'text-indigo-200' : 'text-slate-300'}`}>
                {step.number}
              </span>
              <span className="text-2xl">{step.icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold mb-0.5 ${i === 0 ? 'text-white' : 'text-slate-800'}`}>
                {step.title}
              </p>
              <p className={`text-xs leading-relaxed ${i === 0 ? 'text-indigo-200' : 'text-slate-400'}`}>
                {step.desc}
              </p>
            </div>

            {/* Action or check */}
            <div className="shrink-0 flex items-center self-center">
              {step.isPrimary ? (
                <button
                  onClick={onCreateCard}
                  className="px-4 py-2 bg-white text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-50 transition whitespace-nowrap shadow-sm"
                >
                  {step.action} →
                </button>
              ) : (
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                  hovered === i ? 'border-slate-300' : 'border-slate-200'
                }`}>
                  <span className="text-slate-200 text-xs font-bold">{i + 1}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer tip */}
      <div className="px-6 pb-6 text-center">
        <p className="text-xs text-slate-400">
          💡 La plupart des commerçants créent leur première carte en moins de 2 minutes
        </p>
      </div>
    </div>
  )
}
