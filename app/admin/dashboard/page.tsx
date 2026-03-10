'use client'

import { useState, useEffect } from 'react'

interface OverviewData {
  total_merchants: number
  active_merchants: number
  pending_merchants: number
  suspended_merchants: number
  total_clients: number
  total_cards: number
  total_visits: number
  total_rewards: number
  revenue_dzd: number
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [recentMerchants, setRecentMerchants] = useState<any[]>([])
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { getPlatformOverview, getPendingMerchants, getPendingPayments } = await import('@/database/supabase-client')
      const [ov, merchants, payments] = await Promise.all([
        getPlatformOverview(),
        getPendingMerchants(),
        getPendingPayments(),
      ])
      setOverview(ov as any)
      setRecentMerchants(merchants)
      setPendingPayments(payments)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-4xl animate-spin">⏳</div>
      </div>
    )
  }

  const kpis = [
    { label: 'Commerçants', value: overview?.total_merchants || 0, icon: '🏪', color: 'from-blue-500 to-cyan-500', change: '+12%' },
    { label: 'Actifs', value: overview?.active_merchants || 0, icon: '✅', color: 'from-green-500 to-emerald-500', change: '+8%' },
    { label: 'En attente', value: overview?.pending_merchants || 0, icon: '⏳', color: 'from-amber-500 to-orange-500', change: null },
    { label: 'Clients total', value: overview?.total_clients || 0, icon: '👥', color: 'from-purple-500 to-violet-500', change: '+25%' },
    { label: 'Cartes créées', value: overview?.total_cards || 0, icon: '💳', color: 'from-pink-500 to-rose-500', change: '+15%' },
    { label: 'Visites', value: overview?.total_visits || 0, icon: '📊', color: 'from-indigo-500 to-blue-500', change: '+30%' },
    { label: 'Récompenses', value: overview?.total_rewards || 0, icon: '🎁', color: 'from-teal-500 to-cyan-500', change: '+18%' },
    { label: 'Revenu', value: `${(overview?.revenue_dzd || 0).toLocaleString()} DA`, icon: '💰', color: 'from-yellow-500 to-amber-500', change: '+22%' },
  ]

  return (
    <div className="space-y-8">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="group bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                {kpi.icon}
              </div>
              {kpi.change && (
                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                  {kpi.change}
                </span>
              )}
            </div>
            <div className="text-2xl font-extrabold text-white mb-1">
              {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
            </div>
            <div className="text-sm text-gray-500">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pending Merchants */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="text-amber-400">⏳</span> Commerçants en attente
            </h3>
            <span className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full font-bold">
              {recentMerchants.length}
            </span>
          </div>

          {recentMerchants.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-gray-500">Aucun commerçant en attente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMerchants.slice(0, 5).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4 hover:bg-white/10 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {(m.business_name || m.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{m.business_name || m.name}</p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const { approveMerchant } = await import('@/database/supabase-client')
                        await approveMerchant(m.id)
                        loadData()
                      }}
                      className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30 transition"
                    >
                      ✓ Valider
                    </button>
                    <button
                      onClick={async () => {
                        const { suspendMerchant } = await import('@/database/supabase-client')
                        await suspendMerchant(m.id)
                        loadData()
                      }}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition"
                    >
                      ✗ Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Payments */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="text-green-400">💰</span> Paiements en attente
            </h3>
            <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold">
              {pendingPayments.length}
            </span>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-gray-500">Aucun paiement en attente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayments.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4 hover:bg-white/10 transition">
                  <div>
                    <p className="font-medium text-sm">{p.contact_name}</p>
                    <p className="text-xs text-gray-500">
                      {p.requested_plan} • {p.payment_method} • {p.amount_dzd?.toLocaleString()} DA
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const { approvePayment } = await import('@/database/supabase-client')
                        await approvePayment(p.id, p.merchant_id, p.requested_plan)
                        loadData()
                      }}
                      className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30 transition"
                    >
                      ✓ Confirmer
                    </button>
                    <button
                      onClick={async () => {
                        const { rejectPayment } = await import('@/database/supabase-client')
                        await rejectPayment(p.id)
                        loadData()
                      }}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition"
                    >
                      ✗ Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">⚡ Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🏪', label: 'Voir commerçants', path: '/admin/dashboard/merchants' },
            { icon: '💳', label: 'Voir paiements', path: '/admin/dashboard/payments' },
            { icon: '📈', label: 'Statistiques', path: '/admin/dashboard/stats' },
            { icon: '⚙️', label: 'Paramètres', path: '/admin/dashboard/settings' },
          ].map((action, i) => (
            <a
              key={i}
              href={action.path}
              className="flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-6 transition-all hover:-translate-y-1"
            >
              <span className="text-3xl">{action.icon}</span>
              <span className="text-sm text-gray-400">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
