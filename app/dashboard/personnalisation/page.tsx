'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const COLORS = [
  '#6C3FE8', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#8B5CF6', '#06B6D4', '#F97316', '#1E293B',
  '#DC2626', '#059669',
]

const EMOJIS = ['🏪', '☕', '🍕', '💇', '🏋️', '👗', '💊', '🛒', '🍔', '🎂', '🚗', '📱', '💎', '🌿', '🎯']
const REWARD_EMOJIS = ['🎁', '⭐', '🏆', '💎', '🎉', '🔥', '💰', '🌟', '❤️', '🎊']

export default function PersonnalisationPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    business_name: '',
    color1: '#6C3FE8',
    color2: '#F59E0B',
    logo_emoji: '🏪',
    welcome_message: '',
    reward: '',
    points_per_visit: 1,
    max_points: 10,
  })

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)
    if (m.plan === 'starter' || !m.plan) { router.push('/dashboard'); return }
    loadCards(m.id)
  }, [router])

  const loadCards = async (merchantId: string) => {
    try {
      const { getMyCards } = await import('@/database/supabase-client')
      const data = await getMyCards(merchantId)
      const list = Array.isArray(data) ? data : []
      setCards(list)
      if (list.length > 0) selectCard(list[0])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const selectCard = (card: any) => {
    setSelectedCard(card)
    setSaved(false)
    setForm({
      business_name: card.business_name || '',
      color1: card.color1 || '#6C3FE8',
      color2: card.color2 || '#F59E0B',
      logo_emoji: card.logo_emoji || '🏪',
      welcome_message: card.welcome_message || '',
      reward: card.reward || '',
      points_per_visit: card.points_per_visit || 1,
      max_points: card.max_points || 10,
    })
  }

  const handleSave = async () => {
    if (!selectedCard) return
    setSaving(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      const { error } = await supabase.from('loyalty_cards').update({
        business_name: form.business_name,
        color1: form.color1,
        color2: form.color2,
        logo_emoji: form.logo_emoji,
        welcome_message: form.welcome_message,
        reward: form.reward,
        points_per_visit: form.points_per_visit,
        max_points: form.max_points,
        updated_at: new Date().toISOString(),
      }).eq('id', selectedCard.id)

      if (error) throw error

      // Update local list
      const updated = { ...selectedCard, ...form }
      setCards(prev => prev.map(c => c.id === selectedCard.id ? updated : c))
      setSelectedCard(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }))

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  if (cards.length === 0) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-3">💳</p>
        <p className="text-lg font-bold text-slate-700">Aucune carte créée</p>
        <p className="text-sm text-slate-400 mt-1 mb-5">Crée d'abord une carte avant de la personnaliser</p>
        <button onClick={() => router.push('/dashboard/create-card')}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
          + Créer une carte
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-800">Personnalisation des cartes</h1>
            <p className="text-xs text-slate-400">Plan {merchant?.plan} · {cards.length} carte{cards.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving || !selectedCard}
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
          {saving
            ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sauvegarde...</>
            : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Sélecteur de carte */}
        {cards.length > 1 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Choisir une carte à personnaliser</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {cards.map(card => (
                <button key={card.id} onClick={() => selectCard(card)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition shrink-0 ${selectedCard?.id === card.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                  <span className="text-base">{card.logo_emoji || '🏪'}</span>
                  {card.business_name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">

          {/* LEFT — Éditeur */}
          <div className="space-y-5">

            {/* Identité */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-700">Identité de la carte</p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nom affiché sur la carte</label>
                  <input type="text" value={form.business_name} onChange={e => set('business_name', e.target.value)}
                    maxLength={40}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Emoji / Icône</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => set('logo_emoji', e)}
                        className={`w-9 h-9 text-lg rounded-xl transition-all ${form.logo_emoji === e ? 'bg-indigo-100 ring-2 ring-indigo-400 scale-110' : 'bg-slate-100 hover:bg-slate-200'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Couleurs */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-700">Couleurs</p>
              </div>
              <div className="px-6 py-5 space-y-5">
                {[
                  { label: 'Couleur principale', key: 'color1' },
                  { label: 'Couleur secondaire', key: 'color2' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-500 mb-3">{label}</label>
                    <div className="flex flex-wrap gap-2.5 items-center">
                      {COLORS.map(c => (
                        <button key={c} onClick={() => set(key, c)}
                          className={`w-7 h-7 rounded-full transition-all ${(form as any)[key] === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: c }} />
                      ))}
                      <input type="color" value={(form as any)[key]}
                        onChange={e => set(key, e.target.value)}
                        className="w-7 h-7 rounded-full border-2 border-dashed border-slate-300 cursor-pointer"
                        title="Couleur personnalisée" />
                      <span className="text-xs text-slate-400 font-mono">{(form as any)[key]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Message de bienvenue */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-700">Message & Récompense</p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Message de bienvenue</label>
                  <textarea value={form.welcome_message} onChange={e => set('welcome_message', e.target.value)}
                    rows={2} maxLength={120} placeholder="Ex: Bienvenue ! Gagnez des points à chaque visite 🎉"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  <p className="text-xs text-slate-400 mt-1">{form.welcome_message.length}/120</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Récompense</label>
                  <input type="text" value={form.reward} onChange={e => set('reward', e.target.value)}
                    maxLength={60} placeholder="Ex: Café offert ☕"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </section>

            {/* Points */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-700">Règle de points</p>
              </div>
              <div className="px-6 py-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Points par visite</label>
                  <input type="number" value={form.points_per_visit} min={1} max={100}
                    onChange={e => set('points_per_visit', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Points pour récompense</label>
                  <input type="number" value={form.max_points} min={1} max={1000}
                    onChange={e => set('max_points', parseInt(e.target.value) || 10)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2 bg-indigo-50 rounded-xl px-4 py-3 text-sm text-indigo-600">
                  Il faut <strong>{Math.ceil(form.max_points / form.points_per_visit)} visites</strong> pour obtenir la récompense
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT — Aperçu carte */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aperçu en direct</p>

            {/* Card preview */}
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/40"
              style={{ background: `linear-gradient(135deg, ${form.color1}, ${form.color2})` }}>
              <div className="p-6">
                {/* Top */}
                <div className="flex items-center justify-between mb-7">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white/25 rounded-2xl flex items-center justify-center text-2xl">
                      {form.logo_emoji}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">{form.business_name || 'Votre commerce'}</p>
                      <p className="text-white/50 text-[10px] mt-0.5">Carte de fidélité</p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-white/60 text-xs">Progression</span>
                    <span className="text-white text-xs font-bold">4 / {form.max_points} pts</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full">
                    <div className="h-2 bg-white rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((4 / Math.max(form.max_points, 1)) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Reward */}
                {form.reward && (
                  <div className="bg-white/15 rounded-xl px-3 py-2 mb-4">
                    <p className="text-white/60 text-[10px] mb-0.5">Récompense</p>
                    <p className="text-white text-xs font-semibold">{form.reward}</p>
                  </div>
                )}

                {/* Bottom */}
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-[9px] font-mono">CODE · {selectedCard?.code || 'XXXXX'}</span>
                  <span className="text-white/40 text-[9px]">{form.points_per_visit} pt/visite</span>
                </div>
              </div>
            </div>

            {/* Welcome message preview */}
            {form.welcome_message && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-400 mb-1.5">Message de bienvenue</p>
                <p className="text-sm text-slate-600 leading-relaxed">{form.welcome_message}</p>
              </div>
            )}

            {/* Plan badge */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">
                {merchant?.plan === 'premium' ? '★' : 'P'}
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-700 capitalize">Plan {merchant?.plan}</p>
                <p className="text-[11px] text-indigo-400">Personnalisation complète activée</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
