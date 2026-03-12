'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PRESETS = [
  { color1: '#FF6B35', color2: '#FF9A5C', name: 'Orange' },
  { color1: '#3B82F6', color2: '#60A5FA', name: 'Bleu' },
  { color1: '#8B5CF6', color2: '#A78BFA', name: 'Violet' },
  { color1: '#10B981', color2: '#34D399', name: 'Vert' },
  { color1: '#EF4444', color2: '#F87171', name: 'Rouge' },
  { color1: '#EC4899', color2: '#F472B6', name: 'Rose' },
  { color1: '#F59E0B', color2: '#FBBF24', name: 'Jaune' },
  { color1: '#06B6D4', color2: '#22D3EE', name: 'Cyan' },
]

const SECTORS = [
  { emoji: '☕', name: 'Café' },
  { emoji: '🍕', name: 'Restaurant' },
  { emoji: '🥖', name: 'Boulangerie' },
  { emoji: '💇', name: 'Coiffure' },
  { emoji: '💊', name: 'Pharmacie' },
  { emoji: '👕', name: 'Boutique' },
  { emoji: '🛒', name: 'Supermarché' },
  { emoji: '🏋️', name: 'Sport' },
  { emoji: '🎮', name: 'Loisirs' },
  { emoji: '🏪', name: 'Autre' },
]

export default function CreateCardPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    businessName: '',
    emoji: '🏪',
    color1: '#3B82F6',
    color2: '#60A5FA',
    pointsRule: '1 point par visite',
    pointsRuleType: 'visit',
    pointsPerVisit: 1,
    reward: '',
    maxPoints: 10,
    welcomeMessage: 'Bienvenue ! Gagnez des points à chaque visite 🎉',
  })

  useEffect(() => {
    const stored = localStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)
    setForm((f) => ({ ...f, businessName: m.business_name || '' }))
  }, [router])

  const handleSubmit = async () => {
    if (!form.businessName || !form.reward) {
      setError('Remplissez tous les champs obligatoires')
      return
    }
    setLoading(true)
    setError('')

    try {
      const { createCard } = await import('@/database/supabase-client')
      const result = await createCard(merchant.id, {
        businessName: form.businessName,
        color1: form.color1,
        color2: form.color2,
        pointsRule: form.pointsRule,
        pointsRuleType: form.pointsRuleType,
        pointsPerVisit: form.pointsPerVisit,
        reward: form.reward,
        maxPoints: form.maxPoints,
        welcomeMessage: form.welcomeMessage,
      })

      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Erreur lors de la création')
      }
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 text-xl">
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Créer une carte</h1>
            <p className="text-sm text-gray-500">Étape {step} sur 3</p>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-10 h-2 rounded-full transition-all ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Info de base */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                <h2 className="text-lg font-bold text-gray-900">📝 Informations</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du commerce *</label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Café El Baraka"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emoji / Icône</label>
                  <div className="flex flex-wrap gap-2">
                    {SECTORS.map((s) => (
                      <button
                        key={s.emoji}
                        type="button"
                        onClick={() => setForm({ ...form, emoji: s.emoji })}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                          form.emoji === s.emoji
                            ? 'bg-blue-100 border-2 border-blue-500 scale-110'
                            : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                        }`}
                      >
                        {s.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Récompense *</label>
                  <input
                    type="text"
                    value={form.reward}
                    onChange={(e) => setForm({ ...form, reward: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="1 café offert ☕"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['☕ Café offert', '🍕 Repas offert', '💇 Coupe offerte', '🎁 -50% sur un article', '🛍️ Article gratuit'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm({ ...form, reward: r })}
                        className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-600 hover:bg-gray-200 transition"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!form.businessName || !form.reward}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Suivant →
                </button>
              </div>
            )}

            {/* Step 2: Points */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                <h2 className="text-lg font-bold text-gray-900">⭐ Configuration des points</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de points</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { type: 'visit', label: '🚶 Par visite', desc: '1 point par passage' },
                      { type: 'da', label: '💰 Par montant', desc: '1 pt / 100 DA dépensés' },
                    ].map((opt) => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setForm({ ...form, pointsRuleType: opt.type, pointsRule: opt.desc })}
                        className={`p-4 rounded-xl border-2 text-left transition ${
                          form.pointsRuleType === opt.type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-bold text-sm">{opt.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points par {form.pointsRuleType === 'visit' ? 'visite' : '100 DA'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.pointsPerVisit}
                    onChange={(e) => setForm({ ...form, pointsPerVisit: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points nécessaires pour la récompense
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="1000"
                    value={form.maxPoints}
                    onChange={(e) => setForm({ ...form, maxPoints: parseInt(e.target.value) || 10 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Le client gagne {form.pointsPerVisit} pt(s) par {form.pointsRuleType === 'visit' ? 'visite' : '100 DA'}.
                    Il faut {form.maxPoints} pts → soit {Math.ceil(form.maxPoints / form.pointsPerVisit)} {form.pointsRuleType === 'visit' ? 'visites' : 'achats'} pour la récompense.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message de bienvenue</label>
                  <textarea
                    value={form.welcomeMessage}
                    onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Design */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                <h2 className="text-lg font-bold text-gray-900">🎨 Design de la carte</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thème de couleurs</label>
                  <div className="grid grid-cols-4 gap-3">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setForm({ ...form, color1: preset.color1, color2: preset.color2 })}
                        className={`h-14 rounded-xl transition-all ${
                          form.color1 === preset.color1 ? 'ring-4 ring-blue-400 scale-105' : 'hover:scale-105'
                        }`}
                        style={{ background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Couleur 1</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.color1}
                        onChange={(e) => setForm({ ...form, color1: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={form.color1}
                        onChange={(e) => setForm({ ...form, color1: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Couleur 2</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.color2}
                        onChange={(e) => setForm({ ...form, color2: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={form.color2}
                        onChange={(e) => setForm({ ...form, color2: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {loading ? '⏳ Création...' : '✅ Créer ma carte'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Aperçu en direct</h3>
            <div
              className="rounded-3xl p-6 text-white shadow-2xl transition-all duration-500"
              style={{ background: `linear-gradient(135deg, ${form.color1}, ${form.color2})` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{form.emoji}</span>
                    <h3 className="text-lg font-extrabold">{form.businessName || 'Mon Commerce'}</h3>
                  </div>
                  <p className="text-sm opacity-80">Carte de fidélité</p>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                  0/{form.maxPoints} pts
                </div>
              </div>

              <div className="flex gap-1.5 mb-4">
                {Array.from({ length: Math.min(form.maxPoints, 20) }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-3 rounded-full bg-white/20"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm opacity-80">🎁 {form.reward || 'Récompense...'}</p>
                <p className="text-xs opacity-60">+{form.pointsPerVisit} pt/{form.pointsRuleType === 'visit' ? 'visite' : '100DA'}</p>
              </div>
            </div>

            {/* Card back info */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mt-4 space-y-3">
              <h4 className="font-bold text-gray-900 text-sm">Résumé</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Commerce</span>
                  <span className="font-medium">{form.businessName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Récompense</span>
                  <span className="font-medium">{form.reward || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Points nécessaires</span>
                  <span className="font-medium">{form.maxPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gain par {form.pointsRuleType === 'visit' ? 'visite' : '100 DA'}</span>
                  <span className="font-medium">{form.pointsPerVisit} pt(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{form.pointsRuleType === 'visit' ? 'Visites' : 'Achats'} nécessaires</span>
                  <span className="font-medium">{Math.ceil(form.maxPoints / form.pointsPerVisit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
