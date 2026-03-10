'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [pendingPresences, setPendingPresences] = useState<any[]>([])
  const [recentClients, setRecentClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<string | null>(null)

  const loadData = useCallback(async (merchantId: string) => {
    try {
      const { getMyCards, getMerchantStats, getPendingPresences, getMyClients } = await import('@/database/supabase-client')
      const [cardsData, statsData, presences, clients] = await Promise.all([
        getMyCards(merchantId),
        getMerchantStats(merchantId),
        getPendingPresences(merchantId),
        getMyClients(merchantId),
      ])
      setCards(cardsData)
      setStats(statsData)
      setPendingPresences(presences)
      setRecentClients(clients.slice(0, 5))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)
    loadData(m.id)
  }, [router, loadData])

  // Auto-refresh presences
  useEffect(() => {
    if (!merchant) return
    const interval = setInterval(async () => {
      try {
        const { getPendingPresences } = await import('@/database/supabase-client')
        const presences = await getPendingPresences(merchant.id)
        if (presences.length > pendingPresences.length) {
          const newest = presences[0]
          setNotification(`🔔 Nouvelle visite de ${newest.client_name} !`)
          setTimeout(() => setNotification(null), 5000)
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
        }
        setPendingPresences(presences)
      } catch (e) { console.error(e) }
    }, 5000)
    return () => clearInterval(interval)
  }, [merchant, pendingPresences.length])

  const handleValidate = async (presence: any) => {
    try {
      const card = cards.find((c: any) => c.id === presence.card_id)
      const { validatePresence, supabase } = await import('@/database/supabase-client')
      await validatePresence(presence.client_card_id, card?.points_per_visit || 1, presence.merchant_id)
      await supabase.from('pending_presences').update({ status: 'confirmed', resolved_at: new Date().toISOString() }).eq('id', presence.id)
      setNotification(`✅ ${presence.client_name} : +${card?.points_per_visit || 1} point(s)`)
      setTimeout(() => setNotification(null), 3000)
      loadData(merchant.id)
    } catch (err) { console.error(err) }
  }

  const handleReject = async (presenceId: string, clientName: string) => {
    try {
      const { rejectPresence } = await import('@/database/supabase-client')
      await rejectPresence(presenceId)
      setNotification(`❌ Visite de ${clientName} refusée`)
      setTimeout(() => setNotification(null), 3000)
      loadData(merchant.id)
    } catch (err) { console.error(err) }
  }

  const handleDeleteCard = async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Supprimer cette carte ?')) return
    try {
      const { deleteCard } = await import('@/database/supabase-client')
      await deleteCard(cardId)
      loadData(merchant.id)
    } catch (err) { console.error(err) }
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
        <div className="text-4xl animate-spin">⏳</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border px-6 py-4 animate-bounce max-w-sm">
          <p className="font-bold text-gray-900">{notification}</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🎯 Fidali</h1>
          <p className="text-sm text-gray-500">{merchant?.business_name}</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingPresences.length > 0 && (
            <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold animate-pulse">
              🔔 {pendingPresences.length} visite(s)
            </span>
          )}
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${
            merchant?.plan === 'premium' ? 'bg-purple-100 text-purple-700' :
            merchant?.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {(merchant?.plan || 'starter').toUpperCase()}
          </span>
          <button onClick={handleLogout} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Clients', value: stats?.total_clients || 0, icon: '👥', bg: 'bg-blue-50', tx: 'text-blue-600' },
            { label: 'Cartes', value: cards.length, icon: '💳', bg: 'bg-purple-50', tx: 'text-purple-600' },
            { label: 'Points distribués', value: stats?.total_points_distributed || stats?.total_active_points || 0, icon: '⭐', bg: 'bg-amber-50', tx: 'text-amber-600' },
            { label: 'Récompenses', value: stats?.total_rewards || 0, icon: '🎁', bg: 'bg-green-50', tx: 'text-green-600' },
          ].map((k, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition">
              <span className={`w-10 h-10 ${k.bg} ${k.tx} rounded-xl flex items-center justify-center text-xl mb-3`}>{k.icon}</span>
              <div className="text-2xl font-extrabold text-gray-900">{k.value}</div>
              <div className="text-sm text-gray-500">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Pending Presences */}
        {pendingPresences.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
              <span className="animate-bounce text-2xl">🔔</span>
              {pendingPresences.length} visite(s) à valider
            </h3>
            <div className="space-y-3">
              {pendingPresences.map((p: any) => {
                const cardInfo = cards.find((c: any) => c.id === p.card_id)
                return (
                  <div key={p.id} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border-l-4 border-amber-400">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg text-white font-bold">
                        {p.client_name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{p.client_name}</p>
                        <p className="text-sm text-gray-500">
                          {p.client_phone} • {cardInfo?.business_name || 'Carte'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(p.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleValidate(p)}
                        className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition"
                      >
                        ✓ +{cardInfo?.points_per_visit || 1} pt
                      </button>
                      <button
                        onClick={() => handleReject(p.id, p.client_name)}
                        className="px-4 py-2.5 bg-red-100 text-red-600 rounded-xl text-sm font-bold hover:bg-red-200"
                      >
                        ✗
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cards */}
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Créez votre première carte</h3>
              <p className="text-gray-500 mb-6">Personnalisez-la et partagez le QR code à vos clients</p>
              <button
                onClick={() => router.push('/dashboard/create-card')}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
              >
                🎨 Créer une carte
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card: any) => (
                <div key={card.id} className="group relative">
                  <div
                    onClick={() => router.push(`/dashboard/card/${card.id}`)}
                    className="rounded-2xl shadow-lg text-white cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${card.color1}, ${card.color2})` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold">{card.business_name}</h3>
                          <p className="text-sm opacity-80">{card.points_rule}</p>
                        </div>
                        <div className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-bold">{card.max_points} pts</div>
                      </div>
                      <p className="text-sm opacity-90 mb-3">🎁 {card.reward}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-white/20 px-3 py-1 rounded-full">📱 {card.code}</span>
                        <span className="text-xs opacity-70">Voir détails →</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteCard(card.id, e)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        {recentClients.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">👥 Derniers clients</h3>
            <div className="space-y-3">
              {recentClients.map((c: any, i: number) => {
                const pct = c.max_points > 0 ? Math.min((c.points / c.max_points) * 100, 100) : 0
                return (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm text-white font-bold">
                        {(c.client_name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{c.client_name}</p>
                        <p className="text-xs text-gray-500">{c.business_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-16 text-right">{c.points}/{c.max_points}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
