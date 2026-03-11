'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [pendingPresences, setPendingPresences] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'clients'>('overview')

  // Horloge en temps réel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const loadData = useCallback(async (merchantId: string) => {
    try {
      const mod = await import('@/database/supabase-client')
      const [cardsData, statsData, presences, clientsData, activitiesData] = await Promise.all([
        mod.getMyCards(merchantId),
        mod.getMerchantStats(merchantId),
        mod.getPendingPresences(merchantId),
        mod.getMyClients(merchantId),
        mod.getActivities(merchantId, 30),
      ])
      setCards(cardsData)
      setStats(statsData)
      setPendingPresences(presences)
      setClients(clientsData)
      setActivities(activitiesData)
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

  // Auto-refresh toutes les 5 secondes
  useEffect(() => {
    if (!merchant) return
    const interval = setInterval(async () => {
      try {
        const { getPendingPresences } = await import('@/database/supabase-client')
        const presences = await getPendingPresences(merchant.id)
        if (presences.length > pendingPresences.length) {
          const newest = presences[0]
          setNotification(`🔔 ${newest.client_name} demande une validation !`)
          setTimeout(() => setNotification(null), 5000)
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
          // Son de notification
          try { new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU').play() } catch {}
        }
        setPendingPresences(presences)
      } catch (e) { console.error(e) }
    }, 5000)
    return () => clearInterval(interval)
  }, [merchant, pendingPresences.length])

  const handleValidate = async (presence: any) => {
    try {
      const card = cards.find((c: any) => c.id === presence.card_id)
      const mod = await import('@/database/supabase-client')
      await mod.validatePresence(presence.client_card_id, card?.points_per_visit || 1, presence.merchant_id)
      await mod.supabase.from('pending_presences').update({ status: 'confirmed', resolved_at: new Date().toISOString() }).eq('id', presence.id)
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

  const handleRedeemReward = async (clientCardId: string, clientName: string) => {
    try {
      const { redeemReward } = await import('@/database/supabase-client')
      const result = await redeemReward(clientCardId, merchant.id)
      if (result.success) {
        setNotification(`🎁 Récompense donnée à ${clientName} !`)
        setTimeout(() => setNotification(null), 4000)
        loadData(merchant.id)
      }
    } catch (err) { console.error(err) }
  }

  const handleLogout = async () => {
    const { logout } = await import('@/database/supabase-client')
    await logout()
    localStorage.removeItem('merchant')
    router.push('/')
  }

  // Helpers
  const getGreeting = () => {
    const h = currentTime.getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'join': return '👋'
      case 'pts': return '⭐'
      case 'redeem': return '🎁'
      default: return '📌'
    }
  }

  const getActivityText = (a: any) => {
    switch (a.type) {
      case 'join': return `${a.clients?.name || 'Client'} a rejoint la carte`
      case 'pts': return `${a.clients?.name || 'Client'} a gagné ${a.points_amount} point(s)`
      case 'redeem': return `${a.clients?.name || 'Client'} a utilisé sa récompense`
      default: return 'Activité'
    }
  }

  const planLimits: Record<string, { cards: number; clients: number }> = {
    starter: { cards: 1, clients: 50 },
    pro: { cards: 5, clients: 500 },
    premium: { cards: 999, clients: 99999 },
  }

  const currentPlan = merchant?.plan || 'starter'
  const limits = planLimits[currentPlan] || planLimits.starter
  const cardUsage = Math.round((cards.length / limits.cards) * 100)
  const clientUsage = Math.round(((stats?.total_clients || 0) / limits.clients) * 100)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🎯</div>
          <p className="text-gray-500 font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ===== Notification Toast ===== */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 px-6 py-4 max-w-sm">
            <p className="font-bold text-gray-900">{notification}</p>
          </div>
        </div>
      )}

      {/* ===== Header ===== */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg">
              🎯
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{merchant?.business_name}</h1>
              <p className="text-xs text-gray-500">
                {getGreeting()}, {merchant?.name?.split(' ')[0]} • {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pending badge */}
            {pendingPresences.length > 0 && (
              <button
                onClick={() => {
                  const el = document.getElementById('presences')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="relative px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold animate-pulse"
              >
                🔔 {pendingPresences.length} visite(s)
              </button>
            )}

            {/* Plan badge */}
            <button
              onClick={() => setShowUpgrade(true)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold cursor-pointer transition hover:scale-105 ${
                currentPlan === 'premium' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                currentPlan === 'pro' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {currentPlan === 'premium' ? '💎' : currentPlan === 'pro' ? '⭐' : '🆓'} {currentPlan.toUpperCase()}
            </button>

            <button onClick={handleLogout} className="px-4 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ===== KPIs ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Clients fidèles',
              value: stats?.total_clients || 0,
              icon: '👥',
              gradient: 'from-blue-500 to-cyan-500',
              bg: 'bg-blue-50',
              change: '+12%',
              detail: `sur ${limits.clients} max`,
            },
            {
              label: 'Cartes actives',
              value: cards.length,
              icon: '💳',
              gradient: 'from-purple-500 to-pink-500',
              bg: 'bg-purple-50',
              change: null,
              detail: `sur ${limits.cards} max`,
            },
            {
              label: 'Points distribués',
              value: stats?.total_points_distributed || stats?.total_active_points || 0,
              icon: '⭐',
              gradient: 'from-amber-500 to-orange-500',
              bg: 'bg-amber-50',
              change: '+25%',
              detail: 'au total',
            },
            {
              label: 'Récompenses données',
              value: stats?.total_rewards || 0,
              icon: '🎁',
              gradient: 'from-green-500 to-emerald-500',
              bg: 'bg-green-50',
              change: '+8%',
              detail: 'au total',
            },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 bg-gradient-to-br ${kpi.gradient} rounded-xl flex items-center justify-center text-xl shadow-lg`}>
                  {kpi.icon}
                </div>
                {kpi.change && (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {kpi.change}
                  </span>
                )}
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mb-1">
                {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
              </div>
              <div className="text-sm text-gray-500">{kpi.label}</div>
              <div className="text-xs text-gray-400 mt-1">{kpi.detail}</div>
            </div>
          ))}
        </div>

        {/* ===== Plan Usage ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">📊 Utilisation du plan {currentPlan}</h3>
            {currentPlan === 'starter' && (
              <button
                onClick={() => setShowUpgrade(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold"
              >
                Upgrader →
              </button>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Cartes</span>
                <span className="font-bold text-gray-900">{cards.length}/{limits.cards}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    cardUsage >= 90 ? 'bg-red-500' : cardUsage >= 70 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(cardUsage, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Clients</span>
                <span className="font-bold text-gray-900">{stats?.total_clients || 0}/{limits.clients === 99999 ? '∞' : limits.clients}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    clientUsage >= 90 ? 'bg-red-500' : clientUsage >= 70 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(clientUsage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== Pending Presences ===== */}
        {pendingPresences.length > 0 && (
          <div id="presences" className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-extrabold text-amber-800 flex items-center gap-3">
                <span className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center text-2xl animate-bounce">🔔</span>
                {pendingPresences.length} visite(s) à valider
              </h3>
              <span className="text-sm text-amber-600">Mise à jour auto toutes les 5s</span>
            </div>
            <div className="space-y-3">
              {pendingPresences.map((p: any) => {
                const cardInfo = cards.find((c: any) => c.id === p.card_id)
                const minutesLeft = Math.max(0, Math.round((new Date(p.expires_at).getTime() - Date.now()) / 60000))
                return (
                  <div key={p.id} className="bg-white rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border-l-4 border-amber-400">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl text-white font-bold shadow-lg">
                        {p.client_name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-900 text-lg">{p.client_name}</p>
                        <p className="text-sm text-gray-500">{p.client_phone}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            {cardInfo?.business_name || 'Carte'}
                          </span>
                          <span className="text-xs text-gray-400">
                            🕐 {new Date(p.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            minutesLeft <= 1 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                            ⏳ {minutesLeft}min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleValidate(p)}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-md hover:shadow-lg active:scale-95"
                      >
                        ✓ Valider (+{cardInfo?.points_per_visit || 1} pt)
                      </button>
                      <button
                        onClick={() => handleReject(p.id, p.client_name)}
                        className="px-4 py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition active:scale-95"
                      >
                        ✗ Refuser
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ===== Tabs ===== */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
          {[
            { key: 'overview', label: '📊 Vue d\'ensemble' },
            { key: 'activity', label: '📋 Activité récente' },
            { key: 'clients', label: '👥 Mes clients' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === t.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ===== Overview Tab ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Cards */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">💳 Mes cartes</h2>
                <button
                  onClick={() => router.push('/dashboard/create-card')}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition shadow-lg shadow-blue-600/20 active:scale-95"
                >
                  + Nouvelle carte
                </button>
              </div>

              {cards.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4">
                    💳
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Créez votre première carte</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">Personnalisez votre carte de fidélité et partagez le QR code à vos clients</p>
                  <button
                    onClick={() => router.push('/dashboard/create-card')}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                  >
                    🎨 Créer une carte
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cards.map((card: any) => {
                    const cardPresences = pendingPresences.filter((p: any) => p.card_id === card.id)
                    const cardClients = clients.filter((c: any) => c.business_name === card.business_name)
                    return (
                      <div key={card.id} className="group relative">
                        <div
                          onClick={() => router.push(`/dashboard/card/${card.id}`)}
                          className="rounded-2xl shadow-lg text-white cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${card.color1}, ${card.color2})` }}
                        >
                          {/* Notification badge */}
                          {cardPresences.length > 0 && (
                            <div className="absolute top-3 right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse shadow-lg">
                              {cardPresences.length}
                            </div>
                          )}

                          <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-lg font-extrabold">{card.business_name}</h3>
                                <p className="text-sm opacity-80">{card.points_rule}</p>
                              </div>
                            </div>

                            <p className="text-sm opacity-90 mb-4">🎁 {card.reward}</p>

                            {/* Mini stats */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <div className="bg-white/15 rounded-lg p-2 text-center backdrop-blur-sm">
                                <div className="text-lg font-bold">{cardClients.length}</div>
                                <div className="text-[10px] opacity-70">Clients</div>
                              </div>
                              <div className="bg-white/15 rounded-lg p-2 text-center backdrop-blur-sm">
                                <div className="text-lg font-bold">{card.max_points}</div>
                                <div className="text-[10px] opacity-70">Pts max</div>
                              </div>
                              <div className="bg-white/15 rounded-lg p-2 text-center backdrop-blur-sm">
                                <div className="text-lg font-bold">{card.points_per_visit}</div>
                                <div className="text-[10px] opacity-70">Pt/visite</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium">
                                📱 {card.code}
                              </span>
                              <span className="text-xs opacity-70 group-hover:opacity-100 transition">
                                Gérer →
                              </span>
                            </div>
                          </div>

                          {/* Decorative */}
                          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
                        </div>

                        {/* Delete */}
                        <button
                          onClick={(e) => handleDeleteCard(card.id, e)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600 z-10"
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Quick Stats Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Activity Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">📈 Activité des 7 derniers jours</h3>
                <div className="flex items-end gap-2 h-40">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const date = new Date()
                    date.setDate(date.getDate() - (6 - i))
                    const dayStr = date.toISOString().split('T')[0]
                    const dayActivities = activities.filter((a: any) => a.created_at?.startsWith(dayStr))
                    const count = dayActivities.length
                    const maxCount = Math.max(...Array.from({ length: 7 }).map((_, j) => {
                      const d = new Date()
                      d.setDate(d.getDate() - (6 - j))
                      return activities.filter((a: any) => a.created_at?.startsWith(d.toISOString().split('T')[0])).length
                    }), 1)
                    const height = (count / maxCount) * 100

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-gray-700">{count}</span>
                        <div className="w-full relative" style={{ height: '120px' }}>
                          <div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-700 hover:from-blue-500 hover:to-blue-300"
                            style={{ height: `${Math.max(height, 5)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top Clients */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Top clients</h3>
                {clients.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">👥</div>
                    <p className="text-gray-400 text-sm">Aucun client pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clients.slice(0, 5).map((c: any, i: number) => {
                      const pct = c.max_points > 0 ? Math.min((c.points / c.max_points) * 100, 100) : 0
                      const canRedeem = c.points >= c.max_points
                      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
                      return (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition">
                          <div className="flex items-center gap-3">
                            <span className="text-lg w-6 text-center">{medals[i]}</span>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm text-white font-bold">
                              {(c.client_name || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{c.client_name}</p>
                              <p className="text-xs text-gray-500">{c.business_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">{c.points}/{c.max_points}</p>
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-0.5">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            {canRedeem && (
                              <button
                                onClick={() => handleRedeemReward(c.client_card_id, c.client_name)}
                                className="px-3 py-1.5 bg-yellow-400 text-yellow-900 rounded-lg text-xs font-bold hover:bg-yellow-500 animate-pulse"
                              >
                                🎁
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== Activity Tab ===== */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">📋 Activité récente</h3>
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-gray-500">Aucune activité pour le moment</p>
              </div>
            ) : (
              <div className="space-y-1">
                {activities.map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      a.type === 'join' ? 'bg-blue-50' :
                      a.type === 'pts' ? 'bg-amber-50' :
                      'bg-green-50'
                    }`}>
                      {getActivityIcon(a.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{getActivityText(a)}</p>
                      <p className="text-xs text-gray-500">
                        {a.loyalty_cards?.business_name} • {new Date(a.created_at).toLocaleDateString('fr-FR')} à {new Date(a.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {a.points_amount > 0 && (
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                        a.type === 'redeem' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {a.type === 'redeem' ? '🎁' : `+${a.points_amount}`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== Clients Tab ===== */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">👥 Tous les clients ({clients.length})</h3>
            </div>
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👥</div>
                <p className="text-gray-500">Partagez votre QR code pour avoir des clients</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {clients.map((c: any, i: number) => {
                  const pct = c.max_points > 0 ? Math.min((c.points / c.max_points) * 100, 100) : 0
                  const canRedeem = c.points >= c.max_points
                  return (
                    <div key={i} className="p-5 hover:bg-gray-50 transition flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg text-white font-bold">
                          {(c.client_name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{c.client_name}</p>
                          <p className="text-sm text-gray-500">{c.client_phone}</p>
                          <p className="text-xs text-gray-400">{c.business_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-extrabold text-gray-900">{c.points}/{c.max_points}</p>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${canRedeem ? 'bg-yellow-400' : 'bg-blue-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{Math.round(pct)}%</p>
                        </div>
                        {canRedeem && (
                          <button
                            onClick={() => handleRedeemReward(c.client_card_id, c.client_name)}
                            className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-xl text-sm font-bold hover:bg-yellow-500 transition animate-pulse"
                          >
                            🎁 Récompenser
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== Quick Actions ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">⚡ Actions rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { icon: '🎨', label: 'Créer une carte', action: () => router.push('/dashboard/create-card'), color: 'hover:bg-blue-50' },
              { icon: '📱', label: 'Mon QR Code', action: () => cards[0] && router.push(`/dashboard/card/${cards[0].id}`), color: 'hover:bg-purple-50' },
              { icon: '👥', label: 'Voir clients', action: () => setActiveTab('clients'), color: 'hover:bg-green-50' },
              { icon: '📋', label: 'Activité', action: () => setActiveTab('activity'), color: 'hover:bg-amber-50' },
              { icon: '💎', label: 'Upgrader', action: () => setShowUpgrade(true), color: 'hover:bg-pink-50' },
            ].map((a, i) => (
              <button
                key={i}
                onClick={a.action}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:-translate-y-0.5 ${a.color} border border-transparent hover:border-gray-200`}
              >
                <span className="text-2xl">{a.icon}</span>
                <span className="text-xs text-gray-600 font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* ===== Upgrade Modal ===== */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowUpgrade(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">💎</div>
              <h2 className="text-2xl font-extrabold text-gray-900">Passez au niveau supérieur</h2>
              <p className="text-gray-500 mt-1">Débloquez plus de fonctionnalités</p>
            </div>

            <div className="space-y-4 mb-6">
              {[
                { plan: 'Pro', price: '4 500 DA/mois', features: ['5 cartes', '500 clients', 'Stats avancées'], current: currentPlan === 'pro' },
                { plan: 'Premium', price: '9 000 DA/mois', features: ['Cartes illimitées', 'Clients illimités', 'Support dédié'], current: currentPlan === 'premium' },
              ].map((t, i) => (
                <div key={i} className={`p-4 rounded-xl border-2 ${t.current ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">{t.plan}</span>
                    <span className="text-sm font-bold text-blue-600">{t.price}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {t.features.map((f, j) => (
                      <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">✓ {f}</span>
                    ))}
                  </div>
                  {t.current && <p className="text-xs text-blue-600 font-bold mt-2">✅ Plan actuel</p>}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowUpgrade(false)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50">
                Plus tard
              </button>
              <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
                Contacter pour upgrader
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
