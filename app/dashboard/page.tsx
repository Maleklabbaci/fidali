'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('merchant')
    if (!stored) {
      router.push('/login')
      return
    }

    const m = JSON.parse(stored)
    setMerchant(m)

    loadData(m.id)
  }, [router])

  const loadData = async (merchantId: string) => {
    try {
      const { getMyCards, getMerchantStats } = await import('@/database/supabase-client')
      const [cardsData, statsData] = await Promise.all([
        getMyCards(merchantId),
        getMerchantStats(merchantId),
      ])
      setCards(cardsData)
      setStats(statsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🎯 Fidali</h1>
          <p className="text-sm text-gray-500">{merchant?.business_name}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
        >
          Déconnexion
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Clients', value: stats?.total_clients || 0, icon: '👥' },
            { label: 'Visites aujourd\'hui', value: stats?.today_visits || 0, icon: '📊' },
            { label: 'Points distribués', value: stats?.total_points || 0, icon: '⭐' },
            { label: 'Récompenses', value: stats?.total_rewards || 0, icon: '🎁' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{kpi.label}</span>
                <span className="text-2xl">{kpi.icon}</span>
              </div>
              <span className="text-3xl font-bold text-gray-900">{kpi.value}</span>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mes cartes</h2>
          <button
            onClick={() => router.push('/dashboard/create-card')}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            + Nouvelle carte
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune carte</h3>
            <p className="text-gray-500 mb-6">Créez votre première carte de fidélité</p>
            <button
              onClick={() => router.push('/dashboard/create-card')}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
            >
              Créer une carte
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card: any) => (
              <div
                key={card.id}
                className="rounded-2xl shadow-lg overflow-hidden text-white"
                style={{
                  background: `linear-gradient(135deg, ${card.color1}, ${card.color2})`,
                }}
              >
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-1">{card.business_name}</h3>
                  <p className="text-sm opacity-80 mb-4">{card.reward}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                      Code : {card.code}
                    </span>
                    <span className="text-xs opacity-70">
                      {card.max_points} pts max
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
