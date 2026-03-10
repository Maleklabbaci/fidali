'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [pendingPresences, setPendingPresences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)
    loadData(m.id)
  }, [router])

  const loadData = async (merchantId: string) => {
    try {
      const { getMyCards, getMerchantStats, getPendingPresences } = await import('@/database/supabase-client')
      const [cardsData, statsData, presences] = await Promise.all([
        getMyCards(merchantId),
        getMerchantStats(merchantId),
        getPendingPresences(merchantId),
      ])
      setCards(cardsData)
      setStats(statsData)
      setPendingPresences(presences)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async (presence: any) => {
    try {
      const card = cards.find((c: any) => c.id === presence.card_id)
      const { validatePresence } = await import('@/database/supabase-client')
      await validatePresence(presence.client_card_id, card?.points_per_visit || 1, presence.merchant_id)
      loadData(merchant.id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleReject = async (presenceId: string) => {
    try {
      const { rejectPresence } = await import('@/database/supabase-client')
      await rejectPresence(presenceId)
      loadData(merchant.id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Supprimer cette carte ?')) return
    try {
      const { deleteCard } = await import('@/database/supabase-client')
      await deleteCard(cardId)
      loadData(merchant.id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = async () => {
    const { logout } = await import('@/database/supabase-client')
    await logout()
    localStorage.removeItem('merchant')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">🎯 Fidali</h1>
            <p className="text-sm text-gray-500">{merchant?.business_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pendingPresences.length > 0 && (
            <div className="relative">
              <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold animate-pulse">
                🔔 {pendingPresences.length}
              </span>
            </div>
          )}
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${
            merchant?.plan === 'premium' ? 'bg-purple-100 text-purple-700' :
            merchant?.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {(merchant?.plan || 'starter').toUpperCase()}
          </span>
          <button onClick={handleLogout} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Clients', value: stats?.total_clients || 0, icon: '👥', bg: 'bg-blue-50', text: 'text-blue-600' },
            { label: 'Cartes actives', value: cards.length, icon: '💳', bg: 'bg-purple-50', text: 'text-purple-600' },
            { label: 'Points distribués', value: stats?.total_points_distributed || stats?.total_active_points || 0, icon: '⭐', bg: 'bg-amber-50', text: 'text-amber-600' },
            { label: 'Récompenses', value: stats?.total_rewards || 0, icon: '🎁', bg: 'bg-green-50', text: 'text-green-600' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className={`w-10 h-10 ${kpi.bg} ${kpi.text} rounded-xl flex items-center justify-center text-xl`}>
                  {kpi.icon}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{kpi.value}</div>
              <div className="text-sm text-gray-500">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Pending Presences Alert */}
        {pendingPresences.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
              <span className="animate-bounce">🔔</span> 
              {pendingPresences.length} présence(s) en attente de validation
            </h3>
            <div className="space-y-3">
              {pendingPresences.slice(0, 5).map((p: any) => (
                <div key={p.id} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{p.client_name}</p>
                      <p className="text-sm text-gray-500">{p.client_phone} • {new Date(p.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleValidate(p)}
                      className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition shadow-sm"
                    >
                      ✓ Valider
                    </button>
                    <button
                      onClick={() => handleReject(p.id)}
                      className="px-4 py-2.5 bg-red-100 text-red-600 rounded-xl text-sm font-bold hover:bg-red-200 transition"
                    >
                      ✗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cards Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mes cartes</h2>
            <button
              onClick={() => router.push('/dashboard/create-card')}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-sm"
            >
              + Nouvelle carte
            </button>
          </div>

          {cards.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune carte</h3>
              <p className="text-gray-500 mb-6">Créez votre première carte de fidélité pour commencer</p>
              <button
                onClick={() => router.push('/dashboard/create-card')}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
              >
                🎨 Créer une carte
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card: any) => (
                <div key={card.id} className="group relative">
                  {/* Card */}
                  <div
                    onClick={() => router.push(`/dashboard/card/${card.id}`)}
                    className="rounded-2xl shadow-lg overflow-hidden text-white cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    style={{ background: `linear-gradient(135deg, ${card.color1}, ${card.color2})` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold">{card.business_name}</h3>
                          <p className="text-sm opacity-80">{card.points_rule}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold">
                          {card.max_points} pts
                        </div>
                      </div>

                      <p className="text-sm opacity-90 mb-4">🎁 {card.reward}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-medium">
                          📱 {card.code}
                        </span>
                        <span className="text-xs opacity-70">
                          Cliquer pour gérer →
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id) }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ Actions rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '🎨', label: 'Créer une carte', action: () => router.push('/dashboard/create-card') },
              { icon: '📊', label: 'Voir les stats', action: () => {} },
              { icon: '👥', label: 'Mes clients', action: () => {} },
              { icon: '💎', label: 'Upgrader', action: () => {} },
            ].map((a, i) => (
              <button
                key={i}
                onClick={a.action}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <span className="text-2xl">{a.icon}</span>
                <span className="text-xs text-gray-600 font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
