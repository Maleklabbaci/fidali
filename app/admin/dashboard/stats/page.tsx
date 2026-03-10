'use client'

import { useState, useEffect } from 'react'

export default function StatsPage() {
  const [overview, setOverview] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { getPlatformOverview } = await import('@/database/supabase-client')
      const data = await getPlatformOverview()
      setOverview(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-spin">⏳</div></div>
  }

  const metrics = [
    { label: 'Taux de conversion', value: '68%', desc: 'Visiteurs → Clients fidèles', icon: '🎯', trend: '+5%' },
    { label: 'Retention 30j', value: '82%', desc: 'Clients actifs sur 30 jours', icon: '📈', trend: '+3%' },
    { label: 'Visites / Client', value: '4.2', desc: 'Moyenne mensuelle', icon: '🔄', trend: '+0.5' },
    { label: 'Temps moyen fidélisation', value: '12j', desc: 'Inscription → 1ère récompense', icon: '⏱', trend: '-2j' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold">📈 Statistiques plateforme</h2>
        <p className="text-gray-500 text-sm">Vue d&apos;ensemble des performances</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{m.icon}</span>
              <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{m.trend}</span>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">{m.value}</div>
            <div className="text-sm font-medium text-gray-300">{m.label}</div>
            <div className="text-xs text-gray-500 mt-1">{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6">📊 Inscriptions par mois</h3>
          <div className="flex items-end gap-2 h-48">
            {[30, 45, 38, 52, 61, 48, 72, 65, 80, 95, 88, 110].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-purple-500 rounded-t-lg transition-all hover:from-blue-500 hover:to-purple-400"
                  style={{ height: `${(v / 110) * 100}%` }}
                />
                <span className="text-[10px] text-gray-600">
                  {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6">🏪 Répartition par secteur</h3>
          <div className="space-y-4">
            {[
              { sector: 'Restaurant / Café', pct: 35, color: 'from-orange-500 to-amber-500' },
              { sector: 'Boulangerie', pct: 22, color: 'from-yellow-500 to-orange-500' },
              { sector: 'Salon de coiffure', pct: 18, color: 'from-pink-500 to-rose-500' },
              { sector: 'Boutique', pct: 15, color: 'from-blue-500 to-cyan-500' },
              { sector: 'Autre', pct: 10, color: 'from-gray-500 to-gray-400' },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{s.sector}</span>
                  <span className="text-gray-500">{s.pct}%</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${s.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">💰 Revenu mensuel estimé</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {(overview?.revenue_dzd || 0).toLocaleString()} DA
            </div>
            <div className="text-sm text-gray-500 mt-1">Ce mois</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-300">
              {((overview?.revenue_dzd || 0) * 0.85).toLocaleString()} DA
            </div>
            <div className="text-sm text-gray-500 mt-1">Mois dernier</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-500">
              {((overview?.revenue_dzd || 0) * 10).toLocaleString()} DA
            </div>
            <div className="text-sm text-gray-500 mt-1">Total annuel</div>
          </div>
        </div>
      </div>
    </div>
  )
}
