'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    nameAr: 'محترف',
    monthlyPrice: 2500,
    color: 'blue',
    badge: null,
    features: [
      '5 cartes de fidélité',
      '500 clients maximum',
      'Stats avancées',
      'Personnalisation complète',
      'Support prioritaire',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    nameAr: 'بريميوم',
    monthlyPrice: 5000,
    color: 'violet',
    badge: '⭐ Recommandé',
    features: [
      'Cartes illimitées',
      'Clients illimités',
      'Multi-branches',
      'Accès API',
      'Support dédié',
      'Tout inclus',
    ],
  },
]

const METHODS = [
  { id: 'baridimob', label: 'Baridi Mob', labelAr: 'بريدي موب', icon: '📱', soon: false },
  { id: 'ccp', label: 'CCP', labelAr: 'حساب بريدي', icon: '🏦', soon: false },
  { id: 'virement', label: 'Virement DZ', labelAr: 'تحويل بنكي', icon: '🏛️', soon: false },
  { id: 'devise', label: 'Devise étrangère', labelAr: 'عملة أجنبية', icon: '💶', soon: false, foreign: true },
]

const SOON_METHODS = [
  { label: 'CIB', labelAr: 'بطاقة CIB', icon: '💳', desc: 'Carte bancaire algérienne' },
  { label: 'Edahabia', labelAr: 'الذهبية', icon: '🟡', desc: 'Carte Algérie Poste' },
]

export default function UpgradePage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [method, setMethod] = useState<string>('baridimob')
  const [step, setStep] = useState<'plans' | 'contact' | 'done'>('plans')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ contact_name: '', contact_phone: '', note: '' })

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)
    setForm({ contact_name: m.name || '', contact_phone: m.phone || '', note: '' })
  }, [router])

  const getPrice = (monthlyPrice: number) =>
    billing === 'annual' ? monthlyPrice * 10 : monthlyPrice

  const getSaving = (monthlyPrice: number) =>
    monthlyPrice * 12 - monthlyPrice * 10


  const handleSubmit = async () => {
    if (!selectedPlan || !merchant) return
    setLoading(true)
    try {
      const { requestUpgrade } = await import('@/database/supabase-client')

      const plan = PLANS.find(p => p.id === selectedPlan)!
      const amount = getPrice(plan.monthlyPrice)

      console.log('🚀 [Upgrade] Submitting payment request:', {
        merchantId: merchant.id,
        plan: selectedPlan,
        method,
        name: form.contact_name,
        phone: form.contact_phone,
        amount,
      })

      const result = await requestUpgrade(merchant.id, {
        plan: selectedPlan as any,
        paymentMethod: method,
        name: form.contact_name,
        phone: form.contact_phone,
        email: merchant.email,
        note: `[${billing === 'annual' ? 'Annuel' : 'Mensuel'}] ${form.note}`,
        amount,
      })

      if (!result.success) {
        console.error('❌ [Upgrade] Request failed:', result.error)
        alert(`❌ Erreur lors de l'envoi de la demande:\n\n${result.error}\n\nContacte-nous si le problème persiste.`)
        return
      }

      console.log('✅ [Upgrade] Request sent successfully')
      setStep('done')
    } catch (e: any) {
      console.error('💥 [Upgrade] Unexpected error:', e)
      alert(`❌ Erreur inattendue:\n\n${e.message}\n\nContacte-nous si le problème persiste.`)
    } finally {
      setLoading(false)
    }
  }

  const plan = PLANS.find(p => p.id === selectedPlan)
  const currentPlan = merchant?.plan || 'starter'

  if (!merchant) return null

  // ── DONE ──
  if (step === 'done') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="bg-white/[0.05] border border-white/10 rounded-3xl p-8 text-center backdrop-blur-sm">

          {/* Success icon */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative w-24 h-24 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-black text-white mb-2">Demande envoyée !</h2>
          <p className="text-white/50 text-sm mb-6">تم إرسال طلبك بنجاح</p>

          {/* What happens next */}
          <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-5 text-left space-y-4 mb-6">
            <p className="text-xs font-black text-white/40 uppercase tracking-wider">Ce qui se passe maintenant</p>

            {[
              { icon: '📞', title: 'On vous contacte', desc: 'Notre équipe va vous appeler ou vous écrire sur WhatsApp très prochainement.' },
              { icon: '✅', title: 'Vérification du paiement', desc: 'On confirme votre virement et on active votre plan.' },
              { icon: '🚀', title: 'Plan activé', desc: 'Vous recevrez une notification dès que votre plan ' + (selectedPlan || '') + ' est actif.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact info */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 mb-6">
            <p className="text-indigo-300 text-sm font-bold mb-2">📱 Gardez votre téléphone près de vous</p>
            <p className="text-indigo-300/60 text-xs">
              Nous allons vous contacter sur le <span className="font-bold text-indigo-300">{form.contact_phone}</span>.
              Assurez-vous d'être disponible.
            </p>
          </div>

          <div className="space-y-3">
            <button onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition text-sm">
              Retour au dashboard
            </button>

          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 opacity-30">
          <img src="/logo.png" alt="Fidali" className="w-5 h-5 rounded object-contain" />
          <span className="text-white text-sm font-bold">Fidali</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-4 flex items-center gap-4 sticky top-0 z-20">
        <button onClick={() => step === 'plans' ? router.push('/dashboard') : setStep('plans')}
          className="p-2 hover:bg-slate-100 rounded-xl transition">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-base font-black text-slate-800">Passer à la version supérieure</h1>
          <p className="text-xs text-slate-400">Plan actuel : <span className="font-semibold text-slate-600 capitalize">{currentPlan}</span></p>
        </div>
        <div className="flex gap-1">
          {['plans', 'contact'].map((s, i) => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${step === s ? 'w-8 bg-indigo-600' : i < ['plans','contact'].indexOf(step) ? 'w-4 bg-indigo-300' : 'w-4 bg-slate-200'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">

        {/* ── STEP 1: Plans ── */}
        {step === 'plans' && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-black text-slate-800">Choisissez votre plan</h2>
              <p className="text-slate-400 text-sm mt-1">اختر باقتك المناسبة</p>
            </div>

            {/* Billing toggle */}
            <div className="flex items-center bg-slate-100 rounded-2xl p-1 gap-1">
              <button onClick={() => setBilling('monthly')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-black transition ${billing === 'monthly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                Mensuel
              </button>
              <button onClick={() => setBilling('annual')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-black transition relative ${billing === 'annual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                Annuel
                <span className="absolute -top-2 -right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  -2 mois
                </span>
              </button>
            </div>

            {billing === 'annual' && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
                <span className="text-emerald-500 text-lg">🎉</span>
                <p className="text-emerald-700 text-sm font-semibold">
                  Paiement annuel = <strong>10 mois seulement</strong>, 2 mois offerts !
                </p>
              </div>
            )}

            {PLANS.filter(p => p.id !== currentPlan && currentPlan !== 'premium').map(p => {
              const price = getPrice(p.monthlyPrice)
              const saving = getSaving(p.monthlyPrice)
              return (
                <div key={p.id} onClick={() => setSelectedPlan(p.id)}
                  className={`relative rounded-3xl border-2 cursor-pointer transition-all p-6 ${
                    selectedPlan === p.id
                      ? p.color === 'violet' ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-100' : 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                  {p.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`text-white text-xs font-black px-4 py-1 rounded-full ${p.color === 'violet' ? 'bg-violet-600' : 'bg-blue-600'}`}>{p.badge}</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-black text-slate-800">{p.name}</h3>
                        <span className="text-slate-400 text-sm">{p.nameAr}</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-3xl font-black ${p.color === 'violet' ? 'text-violet-600' : 'text-blue-600'}`}>
                          {price.toLocaleString()}
                        </span>
                        <span className="text-slate-400 text-sm">DA</span>
                        <span className="text-slate-300 text-xs">/ {billing === 'annual' ? 'an' : 'mois'}</span>
                      </div>
                      {billing === 'annual' && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-400 text-xs line-through">{(p.monthlyPrice * 12).toLocaleString()} DA</span>
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                            Économie : {saving.toLocaleString()} DA
                          </span>
                        </div>
                      )}
                      {billing === 'monthly' && (
                        <p className="text-xs text-slate-300 mt-0.5">soit {(price * 12).toLocaleString()} DA/an</p>
                      )}
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition shrink-0 mt-1 ${
                      selectedPlan === p.id
                        ? p.color === 'violet' ? 'border-violet-500 bg-violet-500' : 'border-blue-500 bg-blue-500'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {selectedPlan === p.id && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-sm text-slate-600">
                        <span className={`text-xs font-bold shrink-0 ${p.color === 'violet' ? 'text-violet-500' : 'text-blue-500'}`}>✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {currentPlan === 'premium' && (
              <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6 text-center">
                <p className="text-2xl mb-2">👑</p>
                <p className="font-black text-violet-700">Vous êtes déjà sur le plan Premium !</p>
              </div>
            )}

            {currentPlan !== 'premium' && (
              <button onClick={() => selectedPlan && setStep('contact')} disabled={!selectedPlan}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-200">
                Continuer → {plan && `${getPrice(plan.monthlyPrice).toLocaleString()} DA / ${billing === 'annual' ? 'an' : 'mois'}`}
              </button>
            )}
          </div>
        )}

        {/* ── STEP 2: Contact + Méthode + Preuve ── */}
        {step === 'contact' && plan && (
          <div className="space-y-4">

            {/* Récap */}
            <div className={`rounded-2xl p-4 border flex items-center justify-between ${
              plan.color === 'violet' ? 'bg-violet-50 border-violet-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <div>
                <p className={`text-xs font-bold ${plan.color === 'violet' ? 'text-violet-400' : 'text-blue-400'}`}>
                  {plan.name} · {billing === 'annual' ? 'Annuel' : 'Mensuel'}
                </p>
                <p className={`text-xl font-black ${plan.color === 'violet' ? 'text-violet-700' : 'text-blue-700'}`}>
                  {getPrice(plan.monthlyPrice).toLocaleString()} DA
                  {billing === 'annual' && <span className="text-sm font-normal text-emerald-600 ml-2">(-{getSaving(plan.monthlyPrice).toLocaleString()} DA)</span>}
                </p>
              </div>
              <button onClick={() => setStep('plans')} className={`text-xs underline ${plan.color === 'violet' ? 'text-violet-400' : 'text-blue-400'}`}>
                Changer
              </button>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <p className="text-sm font-black text-slate-700">Vos coordonnées</p>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Nom complet</label>
                <input type="text" value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
                  placeholder="Votre nom complet..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                  Téléphone (WhatsApp de préférence)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">+213</span>
                  <input type="tel" value={form.contact_phone} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))}
                    placeholder="06 XX XX XX XX"
                    className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">📱 Notre équipe vous contactera sur ce numéro</p>
              </div>
            </div>

            {/* Méthode paiement */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-black text-slate-700 mb-4">Méthode de paiement préférée</p>
              <div className="grid grid-cols-2 gap-3">
                {METHODS.map(m => (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    className={`flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl border-2 text-xs font-bold transition ${
                      method === m.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}>
                    <span className="text-2xl">{m.icon}</span>
                    <span>{m.label}</span>
                    <span className="text-[9px] font-normal opacity-60">{m.labelAr}</span>
                  </button>
                ))}
              </div>

              {/* Devise info */}
              {method === 'devise' && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                  <span className="text-xl shrink-0">💶</span>
                  <div>
                    <p className="text-blue-800 font-black text-sm">Paiement en devise étrangère</p>
                    <p className="text-blue-600 text-xs mt-1 leading-relaxed">
                      Notre équipe vous contactera pour vous communiquer les coordonnées bancaires
                      (Visa, Mastercard, virement SWIFT, PayPal, etc.) selon votre pays.
                    </p>
                  </div>
                </div>
              )}

              {/* Soon methods */}
              <div className="mt-3">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">Bientôt disponible</p>
                <div className="grid grid-cols-2 gap-3">
                  {SOON_METHODS.map((m, i) => (
                    <div key={i} className="relative flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 text-xs text-slate-300 cursor-not-allowed overflow-hidden">
                      <span className="text-2xl opacity-40">{m.icon}</span>
                      <span className="font-bold">{m.label}</span>
                      <span className="text-[9px] opacity-60">{m.desc}</span>
                      <div className="absolute top-1.5 right-1.5 bg-indigo-100 text-indigo-500 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        Bientôt
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5">
                  <span className="text-base shrink-0">⚡</span>
                  <p className="text-xs text-indigo-600 leading-relaxed">
                    Paiement par carte <span className="font-bold">CIB & Edahabia</span> via Chargily Pay — disponible très prochainement !
                  </p>
                </div>
              </div>
            </div>



            {/* Note */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Note (optionnel)</label>
              <input type="text" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                placeholder="Numéro de transaction, remarque..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition" />
            </div>

            {/* Info contact */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
              <span className="text-2xl shrink-0">💬</span>
              <div>
                <p className="text-amber-800 font-black text-sm">Notre équipe vous contacte sous 24h</p>
                <p className="text-amber-600 text-xs mt-1 leading-relaxed">
                  Sur WhatsApp ou par appel téléphonique, on vous guide pour finaliser le paiement et activer votre plan.
                  فريقنا سيتواصل معك على الواتساب أو بالهاتف.
                </p>
              </div>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading || !form.contact_name || !form.contact_phone}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition disabled:opacity-40 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Envoi...</>
                : '📩 Envoyer ma demande — Être contacté'}
            </button>

            <p className="text-center text-xs text-slate-400">
              Gratuit de soumettre. Vous payez seulement après confirmation de notre équipe.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
