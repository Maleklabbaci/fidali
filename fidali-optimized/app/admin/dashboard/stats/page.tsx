'use client'

import { useState, useEffect } from 'react'

export default function StatsPage() {
  const [overview, setOverview] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const { getPlatformOverview } = await import('@/database/supabase-client')
      setOverview(await getPlatformOverview())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-5 h-5 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" /></div>

  const total = overview?.total_merchants || 1
  const plans = [
    { label: 'Starter', count: overview?.starter_count || 0, color: 'bg-white/20' },
    { label: 'Pro', count: overview?.pro_count || 0, color: 'bg-blue-500' },
    { label: 'Premium', count: overview?.premium_count || 0, color: 'bg-violet-500' },
  ]

  const metrics = [
    { label: 'Total commerçants', value: overview?.total_merchants || 0, desc: `${overview?.active_merchants || 0} actifs · ${overview?.pending_merchants || 0} en attente` },
    { label: 'Clients enregistrés', value: overview?.total_clients || 0, desc: 'Sur toute la plateforme' },
    { label: 'Cartes actives', value: overview?.total_cards || 0, desc: 'En circulation' },
    { label: 'Points distribués', value: (overview?.total_points || 0).toLocaleString(), desc: 'Total cumulé' },
    { label: 'Récompenses', value: overview?.total_rewards || 0, desc: 'Total échangées' },
    { label: 'Visites aujourd\'hui', value: overview?.activities_today || 0, desc: `${overview?.activities_week || 0} cette semaine` },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Statistiques</h1>
        <p className="text-sm text-white/30 mt-0.5">Vue globale de la plateforme</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] transition">
            <p className="text-3xl font-bold text-white">{m.value}</p>
            <p className="text-sm text-white/60 mt-1">{m.label}</p>
            <p className="text-xs text-white/25 mt-0.5">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Plan distribution */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white/70 mb-6">Distribution des plans</h3>
        <div className="space-y-4">
          {plans.map((p, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">{p.label}</span>
                <span className="text-sm font-semibold text-white">{p.count} <span className="text-white/30 font-normal">({Math.round((p.count / total) * 100)}%)</span></span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className={`h-full ${p.color} rounded-full transition-all duration-700`} style={{ width: `${Math.round((p.count / total) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue estimate */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white/70 mb-2">Revenu estimé</h3>
        <p className="text-4xl font-bold text-white">
          {((overview?.pro_count || 0) * 2500 + (overview?.premium_count || 0) * 5000).toLocaleString()} <span className="text-xl text-white/40 font-normal">DA / mois</span>
        </p>
        <p className="text-xs text-white/25 mt-2">Basé sur les plans actifs (Pro: 2 500 DA · Premium: 5 000 DA)</p>
      </div>
    </div>
  )
}
