'use client'

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
  onUpgrade,
  plan,
}: {
  cards: any[]
  clients: any[]
  totalPoints: number
  onCreateCard: () => void
  onShowQR: () => void
  onGoValidations: () => void
  merchantName?: string
  onUpgrade?: () => void
  plan?: string
}) {
  const hasCard = cards.length > 0
  const hasClient = clients.length > 0
  const hasValidated = totalPoints > 0

  const completed = [hasCard, hasClient, hasValidated]
  const allDone = completed.every(Boolean)
  const completedCount = completed.filter(Boolean).length
  const actions = [onCreateCard, onShowQR, onGoValidations]

  if (allDone) return null

  const firstName = merchantName?.split(' ')[0] || ''

  return (
    <div className="rounded-2xl overflow-hidden border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50">

      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-indigo-100/60">
        <div className="flex items-center justify-between mb-2.5">
          <div className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Guide de démarrage
          </div>
          <span className="text-[11px] font-semibold text-slate-400">{completedCount}/3 étapes</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-700"
            style={{ width: `${(completedCount / 3) * 100}%` }}
          />
        </div>

        <p className="text-[13px] text-slate-600 mt-2.5 leading-snug">
          {firstName ? `Bonjour ${firstName} 👋 — ` : '👋 '}
          {completedCount === 0 && 'Commençons par créer votre carte.'}
          {completedCount === 1 && 'Super ! Partagez maintenant votre QR code.'}
          {completedCount === 2 && "Excellent ! Plus qu'une étape pour finir."}
        </p>
      </div>

      {/* Steps */}
      <div className="p-3 space-y-2">
        {STEPS.map((step, i) => {
          const done = completed[i]
          const isNext = !done && completed.slice(0, i).every(Boolean)
          const isLocked = !done && !isNext

          return (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-200 ${
                done
                  ? 'bg-green-50 border-green-200'
                  : isNext
                  ? 'bg-indigo-600 border-indigo-500 shadow-md shadow-indigo-200'
                  : 'bg-white/50 border-slate-100 opacity-40'
              }`}
            >
              {/* Top row: icon + title */}
              <div className="flex items-center gap-3 p-3 pb-2">
                {/* Icon circle */}
                <div
                  className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2"
                  style={{
                    borderColor: done ? '#22c55e' : isNext ? 'rgba(255,255,255,0.35)' : '#e2e8f0',
                    background: done ? '#dcfce7' : isNext ? 'rgba(255,255,255,0.15)' : 'transparent',
                  }}
                >
                  {done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span className="text-base">{step.icon}</span>
                  )}
                </div>

                {/* Title */}
                <p className={`text-[13px] font-bold leading-tight flex-1 ${
                  done ? 'text-green-700 line-through decoration-green-400' 
                  : isNext ? 'text-white' 
                  : 'text-slate-500'
                }`}>
                  {step.title}
                </p>
              </div>

              {/* Description + CTA — full width, no compression */}
              {!done && (
                <div className="px-3 pb-3 pl-[52px]">
                  <p className={`text-xs leading-relaxed mb-2.5 ${isNext ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {step.desc}
                  </p>
                  {isNext && (
                    <button
                      onClick={actions[i]}
                      className="w-full py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-50 transition shadow-sm"
                    >
                      {step.cta}
                    </button>
                  )}
                </div>
              )}
              {done && (
                <div className="px-3 pb-2.5 pl-[52px]">
                  <p className="text-[11px] text-green-500 font-medium">Terminé ✓</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Upgrade banner — only if starter plan */}
      {plan === 'starter' && onUpgrade && (
        <div
          className="mx-3 mb-3 rounded-xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
          }}
          onClick={onUpgrade}
        >
          <span className="text-2xl shrink-0">⚡</span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-[13px] leading-tight">Passer au plan Pro</p>
            <p className="text-indigo-200 text-[11px] mt-0.5">Plus de clients, cartes illimitées</p>
          </div>
          <span className="text-white/70 text-lg shrink-0">›</span>
        </div>
      )}

      <div className="px-4 pb-4 text-center">
        <p className="text-[11px] text-slate-400">💡 La plupart des commerçants finissent en moins de 5 minutes</p>
      </div>
    </div>
  )
}
