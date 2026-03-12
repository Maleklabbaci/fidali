'use client'

import { useState, useEffect } from 'react'

const STATUS_STYLE: any = {
  active: 'bg-emerald-500/10 text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-400',
  suspended: 'bg-red-500/10 text-red-400',
}
const PLAN_STYLE: any = {
  starter: 'bg-white/[0.06] text-white/50',
  pro: 'bg-blue-500/10 text-blue-400',
  premium: 'bg-violet-500/10 text-violet-400',
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const { getAllMerchants } = await import('@/database/supabase-client')
      const data = await getAllMerchants()
      setMerchants(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const [actionMsg, setActionMsg] = useState<string | null>(null)

  const action = async (type: string, id: string, plan?: string) => {
    const mod = await import('@/database/supabase-client')
    if (type === 'approve') await mod.approveMerchant(id)
    if (type === 'suspend') await mod.suspendMerchant(id)
    if (type === 'delete') { if (!confirm('Supprimer ce commerçant ?')) return; await mod.deleteMerchant(id) }
    if (type === 'plan') {
      await mod.changeMerchantPlan(id, plan as any)
      setActionMsg(`Plan mis à jour → ${plan}`)
      setTimeout(() => setActionMsg(null), 2500)
    }
    load()
    if (type !== 'plan') setSelected(null)
    else {
      // Update selected in place
      setSelected((prev: any) => prev ? { ...prev, plan } : null)
      setMerchants((prev: any[]) => prev.map(m => m.id === id ? { ...m, plan } : m))
    }
  }

  const filtered = merchants.filter(m => {
    const s = !search || [m.business_name, m.email, m.name].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const f = filter === 'all' || m.status === filter
    return s && f
  })

  const counts = {
    all: merchants.length,
    active: merchants.filter(m => m.status === 'active').length,
    pending: merchants.filter(m => m.status === 'pending').length,
    suspended: merchants.filter(m => m.status === 'suspended').length,
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-5 h-5 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      {actionMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-900/90 border border-emerald-500/30 text-emerald-300 px-5 py-3 rounded-xl text-sm font-medium shadow-xl">
          ✓ {actionMsg}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Commerçants</h1>
          <p className="text-sm text-white/30 mt-0.5">{merchants.length} enregistrés</p>
        </div>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..." className="w-64 px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
      </div>

      {/* Filters */}
      <div className="flex gap-1">
        {[['all', 'Tous'], ['active', 'Actifs'], ['pending', 'En attente'], ['suspended', 'Suspendus']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === val ? 'bg-white text-black' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.05]'}`}>
            {label} <span className="ml-1 text-xs opacity-60">{(counts as any)[val]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Commerçant', 'Secteur', 'Plan', 'Statut', 'Inscrit', ''].map((h, i) => (
                <th key={i} className="text-left px-5 py-3 text-xs text-white/25 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((m: any) => (
              <tr key={m.id} className="hover:bg-white/[0.02] transition">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/[0.08] rounded-lg flex items-center justify-center text-xs font-bold text-white/60 shrink-0">
                      {(m.business_name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{m.business_name}</p>
                      <p className="text-xs text-white/30">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-white/40">{m.sector || '—'}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PLAN_STYLE[m.plan] || PLAN_STYLE.starter}`}>{m.plan || 'starter'}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[m.status] || STATUS_STYLE.pending}`}>{m.status}</span>
                </td>
                <td className="px-5 py-3.5 text-sm text-white/30">{new Date(m.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    {m.status === 'pending' && <button onClick={() => action('approve', m.id)} className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/25 transition">Valider</button>}
                    {m.status === 'active' && <button onClick={() => action('suspend', m.id)} className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs hover:bg-amber-500/20 transition">Suspendre</button>}
                    {m.status === 'suspended' && <button onClick={() => action('approve', m.id)} className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/25 transition">Réactiver</button>}
                    <button onClick={() => setSelected(m)} className="px-3 py-1.5 bg-white/[0.06] text-white/50 rounded-lg text-xs hover:bg-white/10 transition">Détails</button>
                    <button onClick={() => action('delete', m.id)} className="px-2 py-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs transition">✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-16 text-center text-white/20 text-sm">Aucun commerçant trouvé</div>}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-[#111114] border border-white/10 rounded-2xl p-7 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Détails</h3>
              <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white/70 transition text-xl leading-none">×</button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/[0.08] rounded-xl flex items-center justify-center text-xl font-bold text-white/60">
                {(selected.business_name || '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-white">{selected.business_name}</p>
                <p className="text-sm text-white/40">{selected.name}</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              {[
                ['Email', selected.email],
                ['Téléphone', selected.phone || '—'],
                ['Secteur', selected.sector || '—'],
                ['Plan', selected.plan],
                ['Statut', selected.status],
                ['Inscrit', new Date(selected.created_at).toLocaleDateString('fr-FR')],
                ['Dernière connexion', selected.last_login_at ? new Date(selected.last_login_at).toLocaleDateString('fr-FR') : 'Jamais'],
              ].map(([l, v], i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/30">{l}</span>
                  <span className="text-white/80 font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-white/25 mb-2">Changer le plan</p>
              <div className="grid grid-cols-3 gap-2">
                {['starter', 'pro', 'premium'].map(p => (
                  <button key={p} onClick={() => action('plan', selected.id, p)}
                    className={`py-2 rounded-lg text-xs font-medium transition ${selected.plan === p ? 'bg-white text-black' : 'bg-white/[0.05] text-white/50 hover:bg-white/10'}`}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
