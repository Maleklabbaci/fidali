'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageSwitcher, useTranslation } from '@/components/LanguageSwitcher'
import { ThemePicker } from '@/components/ThemePicker'
import { exportDashboardPDF } from '@/lib/export-pdf'
import { loadTheme, getTheme, applyTheme } from '@/lib/themes'

export default function DashboardPage() {
  const router = useRouter()
  const { t, locale, isRTL } = useTranslation()

  const [merchant, setMerchant] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [pending, setPending] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [stats, setStats] = useState({ total_clients: 0, total_points: 0, total_rewards: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showSettings, setShowSettings] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)

  // Apply saved theme on load
  useEffect(() => {
    const savedTheme = loadTheme()
    applyTheme(getTheme(savedTheme))
  }, [])

  // Load merchant data
  useEffect(() => {
    const stored = localStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)
    loadData(m.id)
  }, [router])

  const loadData = async (merchantId: string) => {
    try {
      setLoading(true)
      const { supabase } = await import('@/database/supabase-client')

      // Load cards — CORRIGÉ: is_active au lieu de active
      const { data: cardsData, error: cardsError } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_active', true)

      console.log('Cards:', cardsData, 'Error:', cardsError)

      const cardIds = (cardsData || []).map((c: any) => c.id)

      // Load client_cards — CORRIGÉ: vérifier que cardIds n'est pas vide
      let clientCardsData: any[] = []
      if (cardIds.length > 0) {
        const { data, error: clientError } = await supabase
          .from('client_cards')
          .select('*, clients(*), loyalty_cards(*)')
          .in('card_id', cardIds)

        console.log('Client cards:', data, 'Error:', clientError)
        clientCardsData = data || []
      }

      // Load pending presences
      let pendingData: any[] = []
      if (cardIds.length > 0) {
        const { data, error: pendingError } = await supabase
          .from('pending_presences')
          .select('*, clients(*), loyalty_cards(*)')
          .in('card_id', cardIds)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        console.log('Pending:', data, 'Error:', pendingError)
        pendingData = data || []
      }

      // Load activities
      const { data: activitiesData, error: actError } = await supabase
        .from('activities')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(20)

      console.log('Activities:', activitiesData, 'Error:', actError)

      setCards(cardsData || [])
      setClients(clientCardsData)
      setPending(pendingData)
      setActivities(activitiesData || [])

      // Calculate stats
      const totalClients = new Set(clientCardsData.map((c: any) => c.client_id)).size
      const totalPoints = clientCardsData.reduce((sum: number, c: any) => sum + (c.points || 0), 0)
      const totalRewards = clientCardsData.reduce((sum: number, c: any) => sum + (c.total_rewards_redeemed || 0), 0)

      setStats({ total_clients: totalClients, total_points: totalPoints, total_rewards: totalRewards })

      console.log('Stats:', { totalClients, totalPoints, totalRewards })
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }
}

  // Validate / Reject presence
  const handlePresence = async (presenceId: string, action: 'validated' | 'rejected') => {
    try {
      const { supabase } = await import('@/database/supabase-client')

      await supabase
        .from('pending_presences')
        .update({ status: action, validated_at: new Date().toISOString() })
        .eq('id', presenceId)

      if (action === 'validated') {
        const presence = pending.find((p) => p.id === presenceId)
        if (presence) {
          const clientCard = clients.find(
            (c) => c.client_id === presence.client_id && c.card_id === presence.card_id
          )
          if (clientCard) {
            const card = cards.find((c) => c.id === presence.card_id)
            const newPoints = Math.min((clientCard.points || 0) + 1, card?.max_points || 10)
            const rewardEarned = newPoints >= (card?.max_points || 10)

            await supabase
              .from('client_cards')
              .update({
                points: rewardEarned ? 0 : newPoints,
                total_rewards_redeemed: (clientCard.total_rewards_redeemed || 0) + (rewardEarned ? 1 : 0),
                last_visit: new Date().toISOString(),
              })
              .eq('id', clientCard.id)
          }
        }
      }

      setPending((prev) => prev.filter((p) => p.id !== presenceId))
      if (merchant) loadData(merchant.id)
    } catch (err) {
      console.error('Error handling presence:', err)
    }
  }

  // ========== EXPORT PDF ==========
  const handleExportPDF = async () => {
    if (!merchant) return
    setExportingPDF(true)
    try {
      await exportDashboardPDF({
        merchantName: merchant.name,
        businessName: merchant.business_name || merchant.name,
        plan: merchant.plan || 'starter',
        stats,
        clients,
        cards,
      })
    } catch (err) {
      console.error('PDF export error:', err)
      alert('Erreur lors de l\'export PDF')
    } finally {
      setExportingPDF(false)
    }
  }

  // ========== LOGOUT ==========
  const handleLogout = () => {
    localStorage.removeItem('merchant')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t.common_loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ========== HEADER ========== */}
      <header className="bg-white shadow-sm px-4 md:px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {merchant?.business_name || 'Fidali'}
              </h1>
              <p className="text-xs text-gray-500 capitalize">
                Plan {merchant?.plan || 'starter'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 🌍 LANGUAGE SWITCHER */}
            <LanguageSwitcher />

            {/* ⚙️ SETTINGS */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-xl"
              title="Paramètres"
            >
              ⚙️
            </button>

            {/* 📊 EXPORT PDF */}
            <button
              onClick={handleExportPDF}
              disabled={exportingPDF}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition text-sm font-medium disabled:opacity-50"
            >
              {exportingPDF ? '⏳' : '📊'} {exportingPDF ? 'Export...' : 'Export PDF'}
            </button>

            {/* 💎 UPGRADE */}
            {merchant?.plan !== 'premium' && (
              <button
                onClick={() => router.push('/dashboard/upgrade')}
                className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-bold hover:opacity-90 transition"
              >
                💎 {t.dash_upgrade}
              </button>
            )}

            {/* 🚪 LOGOUT */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition text-xl"
              title={t.dash_logout}
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* ========== SETTINGS PANEL ========== */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-30 flex justify-end" onClick={() => setShowSettings(false)}>
          <div
            className="w-full max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">⚙️ Paramètres</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            {/* 🎨 THEME PICKER */}
            <div className="mb-8">
              <ThemePicker />
            </div>

            {/* 🌍 LANGUE */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-700 mb-3">🌍 Langue</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    localStorage.setItem('fidali_locale', 'fr')
                    window.location.reload()
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                    locale === 'fr'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🇫🇷 Français
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('fidali_locale', 'ar')
                    window.location.reload()
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                    locale === 'ar'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🇩🇿 العربية
                </button>
              </div>
            </div>

            {/* 📊 EXPORT PDF (mobile) */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-700 mb-3">📊 Rapports</h3>
              <button
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
              >
                {exportingPDF ? '⏳ Génération...' : '📊 Télécharger rapport PDF'}
              </button>
            </div>

            {/* 💎 UPGRADE (mobile) */}
            {merchant?.plan !== 'premium' && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-700 mb-3">💎 Plan</h3>
                <button
                  onClick={() => router.push('/dashboard/upgrade')}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition"
                >
                  💎 Passer au plan supérieur
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== TABS ========== */}
      <div className="bg-white border-b sticky top-[73px] z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: `📊 ${t.dash_overview}`, },
            { id: 'pending', label: `🔔 ${t.dash_pending} (${pending.length})`, },
            { id: 'cards', label: `🃏 ${t.dash_my_cards}`, },
            { id: 'clients', label: `👥 ${t.dash_my_clients}`, },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t.dash_clients, value: stats.total_clients, icon: '👥', color: 'bg-blue-50 text-blue-700' },
                { label: t.dash_cards, value: cards.length, icon: '🃏', color: 'bg-purple-50 text-purple-700' },
                { label: t.dash_points, value: stats.total_points, icon: '⭐', color: 'bg-amber-50 text-amber-700' },
                { label: t.dash_rewards, value: stats.total_rewards, icon: '🎁', color: 'bg-green-50 text-green-700' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-lg mb-3`}>
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Pending Alert */}
            {pending.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-orange-800">
                    🔔 {pending.length} {t.dash_pending}
                  </h3>
                  <button
                    onClick={() => setActiveTab('pending')}
                    className="text-sm text-orange-600 font-medium hover:underline"
                  >
                    Voir tout →
                  </button>
                </div>
                {pending.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-t border-orange-100">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{p.clients?.name}</p>
                      <p className="text-xs text-gray-500">{p.loyalty_cards?.business_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePresence(p.id, 'validated')}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold"
                      >
                        ✓ {t.dash_validate}
                      </button>
                      <button
                        onClick={() => handlePresence(p.id, 'rejected')}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">{t.dash_quick_actions}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => router.push('/dashboard/create-card')}
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-center transition"
                >
                  <span className="text-2xl block mb-1">🃏</span>
                  <span className="text-xs font-bold text-blue-700">{t.dash_create_card}</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={exportingPDF}
                  className="p-4 bg-green-50 hover:bg-green-100 rounded-xl text-center transition disabled:opacity-50"
                >
                  <span className="text-2xl block mb-1">📊</span>
                  <span className="text-xs font-bold text-green-700">
                    {exportingPDF ? 'Export...' : 'Export PDF'}
                  </span>
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl text-center transition"
                >
                  <span className="text-2xl block mb-1">🎨</span>
                  <span className="text-xs font-bold text-purple-700">Thèmes</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/upgrade')}
                  className="p-4 bg-amber-50 hover:bg-amber-100 rounded-xl text-center transition"
                >
                  <span className="text-2xl block mb-1">💎</span>
                  <span className="text-xs font-bold text-amber-700">{t.dash_upgrade}</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            {activities.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">{t.dash_activity}</h3>
                <div className="space-y-3">
                  {activities.slice(0, 10).map((a, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                        {a.type === 'visit' ? '👣' : a.type === 'reward' ? '🎁' : '📌'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{a.description}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(a.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== PENDING TAB ===== */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">🔔 {t.dash_pending}</h2>
            {pending.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-gray-500">Aucune visite en attente</p>
              </div>
            ) : (
              pending.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{p.clients?.name}</p>
                    <p className="text-sm text-gray-500">{p.clients?.phone}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {p.loyalty_cards?.business_name} • {new Date(p.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePresence(p.id, 'validated')}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700"
                    >
                      ✓ {t.dash_validate}
                    </button>
                    <button
                      onClick={() => handlePresence(p.id, 'rejected')}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-sm font-bold hover:bg-red-200"
                    >
                      ✕ {t.dash_reject}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ===== CARDS TAB ===== */}
        {activeTab === 'cards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">🃏 {t.dash_my_cards}</h2>
              <button
                onClick={() => router.push('/dashboard/create-card')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700"
              >
                + {t.dash_create_card}
              </button>
            </div>
            {cards.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                <p className="text-4xl mb-3">🃏</p>
                <p className="text-gray-900 font-bold mb-1">{t.dash_no_cards}</p>
                <p className="text-gray-500 text-sm mb-4">{t.dash_create_first}</p>
                <button
                  onClick={() => router.push('/dashboard/create-card')}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold"
                >
                  + {t.dash_create_card}
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {cards.map((card) => {
                  const cardClients = clients.filter((c) => c.card_id === card.id)
                  return (
                    <div key={card.id} className="bg-white rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">{card.business_name}</h3>
                          <p className="text-xs text-gray-400 font-mono">{card.code}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                          Actif
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="text-center p-2 bg-gray-50 rounded-xl">
                          <p className="text-lg font-bold text-gray-900">{card.max_points}</p>
                          <p className="text-xs text-gray-500">Points max</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-xl">
                          <p className="text-lg font-bold text-gray-900">{cardClients.length}</p>
                          <p className="text-xs text-gray-500">Clients</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-xl">
                          <p className="text-lg font-bold text-gray-900 truncate">{card.reward}</p>
                          <p className="text-xs text-gray-500">Récompense</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">Règle : {card.points_rule}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== CLIENTS TAB ===== */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">👥 {t.dash_my_clients} ({stats.total_clients})</h2>
            {clients.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                <p className="text-4xl mb-3">👥</p>
                <p className="text-gray-500">Aucun client pour le moment</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {clients.map((cc, i) => (
                  <div
                    key={cc.id || i}
                    className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                        {(cc.clients?.name || cc.client_name || '?')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {cc.clients?.name || cc.client_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {cc.clients?.phone || cc.client_phone}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {cc.points}/{cc.loyalty_cards?.max_points || cc.max_points || '?'}
                      </p>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((cc.points || 0) / (cc.loyalty_cards?.max_points || cc.max_points || 10)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
