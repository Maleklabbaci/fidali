'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    price: '2 500',
    color: 'blue',
    features: ['3 cartes de fidélité', '150 clients max', 'Stats avancées', 'Personnalisation des cartes', 'Support prioritaire'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '5 000',
    color: 'violet',
    highlight: true,
    features: ['Cartes illimitées', 'Clients illimités', 'Multi-branches', 'Stats avancées', 'Personnalisation complète', 'Support dédié', 'Accès API'],
  },
]

const METHODS = [
  { id: 'baridimob', label: 'Baridi Mob', icon: '📱' },
  { id: 'ccp', label: 'CCP', icon: '🏦' },
  { id: 'especes', label: 'Espèces', icon: '💵' },
]

export default function UpgradePage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [method, setMethod] = useState<string>('baridimob')
  const [step, setStep] = useState<'plans' | 'payment' | 'confirm'>('plans')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ contact_name: '', contact_phone: '' })

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)
    setForm({ contact_name: m.name || '', contact_phone: m.phone || '' })
  }, [router])

  const handleSubmit = async () => {
    if (!selectedPlan || !merchant) return
    setLoading(true)
    try {
      const { requestUpgrade } = await import('@/database/supabase-client')
      const plan = PLANS.find(p => p.id === selectedPlan)!
      await requestUpgrade(merchant.id, {
        plan: selectedPlan as any,
        paymentMethod: method,
        name: form.contact_name,
        phone: form.contact_phone,
        email: merchant.email,
      })
      setDone(true)
    } catch (e) {
      console.error(e)
      alert('Erreur lors de la demande. Réessaie.')
    } finally {
      setLoading(false)
    }
  }

  const currentPlan = merchant?.plan || 'starter'
  const amount = PLANS.find(p => p.id === selectedPlan)?.price

  if (done) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Demande envoyée !</h2>
        <p className="text-slate-500 mb-2">Votre demande de passage au plan <strong className="text-indigo-600 capitalize">{selectedPlan}</strong> a été envoyée.</p>
        <p className="text-sm text-slate-400 mb-8">L'équipe Fidali va confirmer votre paiement sous 24h. Vous recevrez une notification dès que votre plan sera activé.</p>
        <button onClick={() => router.push('/dashboard')}
          className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition">
          Retour au dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
        <button onClick={() => step === 'plans' ? router.push('/dashboard') : setStep('plans')}
          className="p-2 hover:bg-slate-100 rounded-lg transition">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-800">Passer à la version supérieure</h1>
          <p className="text-xs text-slate-400">Plan actuel : <span className="font-semibold capitalize text-slate-600">{currentPlan}</span></p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Step: Choisir plan */}
        {step === 'plans' && (
          <div className="space-y-5">
            <p className="text-sm text-slate-400 text-center mb-6">Choisissez le plan qui correspond à vos besoins</p>

            {PLANS.filter(p => p.id !== currentPlan).map(plan => (
              <div key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative bg-white rounded-3xl border-2 cursor-pointer transition-all ${selectedPlan === plan.id
                  ? plan.color === 'violet' ? 'border-violet-500 shadow-lg shadow-violet-100' : 'border-blue-500 shadow-lg shadow-blue-100'
                  : 'border-slate-200 hover:border-slate-300'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full">Recommandé</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
                      <p className={`text-2xl font-black mt-1 ${plan.color === 'violet' ? 'text-violet-600' : 'text-blue-600'}`}>
                        {plan.price} <span className="text-sm font-medium text-slate-400">DA/mois</span>
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${selectedPlan === plan.id
                      ? plan.color === 'violet' ? 'border-violet-500 bg-violet-500' : 'border-blue-500 bg-blue-500'
                      : 'border-slate-300'}`}>
                      {selectedPlan === plan.id && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                        <span className={`text-xs font-bold ${plan.color === 'violet' ? 'text-violet-500' : 'text-blue-500'}`}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <button onClick={() => selectedPlan && setStep('payment')}
              disabled={!selectedPlan}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 mt-4">
              Continuer →
            </button>
          </div>
        )}

        {/* Step: Paiement */}
        {step === 'payment' && (
          <div className="space-y-5">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-400">Plan sélectionné</p>
                <p className="text-base font-bold text-indigo-700 capitalize">{selectedPlan} — {amount} DA/mois</p>
              </div>
              <button onClick={() => setStep('plans')} className="text-xs text-indigo-400 hover:text-indigo-600 underline">Changer</button>
            </div>

            {/* Contact info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <p className="text-sm font-bold text-slate-700">Vos informations</p>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nom complet</label>
                <input type="text" value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Numéro de téléphone</label>
                <input type="tel" value={form.contact_phone} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            {/* Méthode paiement */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-bold text-slate-700 mb-4">Méthode de paiement</p>
              <div className="grid grid-cols-3 gap-3">
                {METHODS.map(m => (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 text-sm font-medium transition ${method === m.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    <span className="text-2xl">{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-xs text-amber-700 leading-relaxed">
                Après validation, envoyez le paiement de <strong>{amount} DA</strong> via <strong>{METHODS.find(m2 => m2.id === method)?.label}</strong> puis cliquez sur Confirmer. Votre plan sera activé sous 24h.
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading || !form.contact_name || !form.contact_phone}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition disabled:opacity-40 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Envoi en cours...</>
                : `Envoyer la demande — ${amount} DA`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
