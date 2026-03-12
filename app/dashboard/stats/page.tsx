'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ── Composant barre chart léger sans librairie ──
function BarChart({ data, color = '#6C3FE8' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1 h-28 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
          <div className="w-full rounded-t-sm transition-all duration-700"
            style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 8 : 2)}%`, backgroundColor: color, opacity: d.value > 0 ? 0.85 : 0.15 }} />
          <span className="text-[9px] text-slate-400 truncate w-full text-center leading-none">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Composant KPI ──
function KPI({ label, value, sub, color = 'indigo' }: { label: string; value: string | number; sub?: string; color?: string }) {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-700',
    blue: 'bg-blue-50 text-blue-700',
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-3xl font-extrabold text-slate-800">{value}</p>
      <p className="text-sm font-semibold text-slate-600 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function StatsPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<7 | 14 | 30>(7)

  const [stats, setStats] = useState<any>(null)
  const [cardStats, setCardStats] = useState<any[]>([])
  const [dailyData, setDailyData] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)

    // Plan check — Pro & Premium uniquement
    if (m.plan === 'starter' || !m.plan) {
      router.push('/dashboard')
      return
    }

    loadAll(m.id)
  }, [router])

  useEffect(() => {
    if (merchant) loadDaily(merchant.id)
  }, [period, merchant])

  const loadAll = async (merchantId: string) => {
    try {
      const { getMerchantStats, getCardStats, getDailyActivity, getActivities, getMyClients } = await import('@/database/supabase-client')
      const [s, cs, acts, cls] = await Promise.all([
        getMerchantStats(merchantId),
        getCardStats(merchantId),
        getActivities(merchantId, 50),
        getMyClients(merchantId),
      ])
      setStats(s)
      setCardStats(Array.isArray(cs) ? cs : [])
      setActivities(Array.isArray(acts) ? acts : [])
      setClients(Array.isArray(cls) ? cls : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const loadDaily = async (merchantId: string) => {
    try {
      const { getDailyActivity } = await import('@/database/supabase-client')
      const data = await getDailyActivity(merchantId, period)
      setDailyData(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
  }

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return 'maintenant'
    if (s < 3600) return `${Math.floor(s / 60)}m`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    return `${Math.floor(s / 86400)}j`
  }

  // Calculs depuis les activités brutes
  const visitsToday = activities.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString()).length
  const visitsWeek = activities.filter(a => {
    const d = new Date(a.created_at)
    const now = new Date()
    return (now.getTime() - d.getTime()) < 7 * 86400000
  }).length
  const rewardsTotal = activities.filter(a => a.type === 'reward').length
  const avgVisitsPerClient = clients.length > 0 ? (visitsWeek / clients.length).toFixed(1) : '0'

  // Top clients
  const topClients = [...clients].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5)

  // Daily chart data — fill missing days
  const buildChartData = () => {
    const days = []
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const found = dailyData.find((x: any) => x.day === key)
      days.push({
        label: d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 2),
        value: found?.visit_count || 0,
      })
    }
    return days
  }

  // Activité par heure (depuis les 50 dernières activités)
  const hourlyData = Array.from({ length: 24 }, (_, h) => ({
    label: h % 6 === 0 ? `${h}h` : '',
    value: activities.filter(a => new Date(a.created_at).getHours() === h).length,
  }))

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
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
            <h1 className="text-base font-bold text-slate-800">Statistiques avancées</h1>
            <p className="text-xs text-slate-400">Plan {merchant?.plan} · Données en temps réel</p>
          </div>
        </div>
        {/* Period selector */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {([7, 14, 30] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${period === p ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {p}j
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Clients total" value={clients.length} sub="Enregistrés" color="indigo" />
          <KPI label="Visites aujourd'hui" value={visitsToday} sub={`${visitsWeek} cette semaine`} color="green" />
          <KPI label="Récompenses" value={rewardsTotal} sub="Total distribuées" color="amber" />
          <KPI label="Moy. visites/client" value={avgVisitsPerClient} sub={`Sur ${period} jours`} color="violet" />
        </div>

        {/* Visites par jour */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-bold text-slate-700">Visites par jour</p>
              <p className="text-xs text-slate-400 mt-0.5">Sur les {period} derniers jours</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-indigo-600">{visitsWeek}</p>
              <p className="text-xs text-slate-400">cette semaine</p>
            </div>
          </div>
          <BarChart data={buildChartData()} color="#6C3FE8" />
        </div>

        {/* Activité par heure */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="mb-6">
            <p className="text-sm font-bold text-slate-700">Heures de pointe</p>
            <p className="text-xs text-slate-400 mt-0.5">Répartition des visites sur la journée</p>
          </div>
          <BarChart data={hourlyData} color="#10B981" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Top clients */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-700">Top clients</p>
              <p className="text-xs text-slate-400 mt-0.5">Par points accumulés</p>
            </div>
            {topClients.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">Aucun client encore</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {topClients.map((c: any, i) => (
                  <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{c.name || c.client_name || 'Client'}</p>
                        <p className="text-xs text-slate-400">{c.phone || '—'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-600">{c.points || 0} pts</p>
                      <p className="text-xs text-slate-400">{c.visit_count || 0} visites</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats par carte */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-700">Performance par carte</p>
              <p className="text-xs text-slate-400 mt-0.5">{cardStats.length} carte{cardStats.length > 1 ? 's' : ''} active{cardStats.length > 1 ? 's' : ''}</p>
            </div>
            {cardStats.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">Aucune carte</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {cardStats.map((c: any, i) => {
                  const maxClients = Math.max(...cardStats.map((x: any) => x.client_count || 0), 1)
                  const pct = Math.round(((c.client_count || 0) / maxClients) * 100)
                  return (
                    <div key={i} className="px-5 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-slate-700 truncate">{c.business_name || `Carte ${i + 1}`}</p>
                        <p className="text-xs font-bold text-slate-500 shrink-0 ml-2">{c.client_count || 0} clients</p>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div className="h-1.5 bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-xs text-slate-400">{c.total_visits || 0} visites</span>
                        <span className="text-xs text-slate-400">{c.rewards_given || 0} récompenses</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Dernières activités */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700">Activité récente</p>
            <span className="text-xs text-slate-400">{activities.length} entrées</span>
          </div>
          {activities.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">Aucune activité</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {activities.slice(0, 15).map((a: any, i) => {
                const isReward = a.type === 'reward'
                return (
                  <div key={i} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${isReward ? 'bg-amber-100' : 'bg-indigo-50'}`}>
                        {isReward ? '🎁' : '⭐'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {a.clients?.name || 'Client'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {a.loyalty_cards?.business_name || '—'} · {isReward ? 'Récompense' : `+${a.points_amount || 1} pt`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{timeAgo(a.created_at)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
