'use client'

import { useState, useEffect } from 'react'

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null)

  useEffect(() => { loadMerchants() }, [])

  const loadMerchants = async () => {
    try {
      const { getAllMerchants } = await import('@/database/supabase-client')
      const data = await getAllMerchants()
      setMerchants(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, merchantId: string, plan?: string) => {
    const mod = await import('@/database/supabase-client')
    switch (action) {
      case 'approve': await mod.approveMerchant(merchantId); break
      case 'suspend': await mod.suspendMerchant(merchantId); break
      case 'delete':
        if (confirm('⚠️ Supprimer ce commerçant ? Cette action est irréversible.')) {
          await mod.deleteMerchant(merchantId)
        }
        break
      case 'upgrade': await mod.changeMerchantPlan(merchantId, plan as any); break
    }
    loadMerchants()
    setSelectedMerchant(null)
  }

  const filteredMerchants = merchants.filter((m) => {
    const matchSearch = !search || 
      m.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || m.status === filter
    return matchSearch && matchFilter
  })

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    pending: 'bg-amber-500/20 text-amber-400',
    suspended: 'bg-red-500/20 text-red-400',
  }

  const planColors: Record<string, string> = {
    starter: 'bg-gray-500/20 text-gray-400',
    pro: 'bg-blue-500/20 text-blue-400',
    premium: 'bg-purple-500/20 text-purple-400',
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-spin">⏳</div></div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">🏪 Commerçants</h2>
          <p className="text-gray-500 text-sm">{merchants.length} commerçants au total</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Rechercher..."
            className="flex-1 md:w-64 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:ring-2 focus:ring-red-500 outline-none"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
          >
            <option value="all" className="bg-gray-900">Tous</option>
            <option value="active" className="bg-gray-900">Actifs</option>
            <option value="pending" className="bg-gray-900">En attente</option>
            <option value="suspended" className="bg-gray-900">Suspendus</option>
          </select>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', count: merchants.length, color: 'from-blue-500 to-cyan-500' },
          { label: 'Actifs', count: merchants.filter(m => m.status === 'active').length, color: 'from-green-500 to-emerald-500' },
          { label: 'En attente', count: merchants.filter(m => m.status === 'pending').length, color: 'from-amber-500 to-orange-500' },
          { label: 'Suspendus', count: merchants.filter(m => m.status === 'suspended').length, color: 'from-red-500 to-rose-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
            <div className={`text-3xl font-extrabold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.count}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Commerçant</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Secteur</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Plan</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Statut</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Inscription</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMerchants.map((m: any) => (
                <tr key={m.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {(m.business_name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white">{m.business_name}</p>
                        <p className="text-xs text-gray-500">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{m.sector || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${planColors[m.plan] || planColors.starter}`}>
                      {m.plan || 'starter'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[m.status] || statusColors.pending}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(m.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {m.status === 'pending' && (
                        <button
                          onClick={() => handleAction('approve', m.id)}
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30 transition"
                        >
                          ✓ Valider
                        </button>
                      )}
                      {m.status === 'active' && (
                        <button
                          onClick={() => handleAction('suspend', m.id)}
                          className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition"
                        >
                          ⏸ Suspendre
                        </button>
                      )}
                      {m.status === 'suspended' && (
                        <button
                          onClick={() => handleAction('approve', m.id)}
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30 transition"
                        >
                          ▶ Réactiver
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedMerchant(m)}
                        className="px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg text-xs font-bold hover:bg-white/20 transition"
                      >
                        👁 Détails
                      </button>
                      <button
                        onClick={() => handleAction('delete', m.id)}
                        className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 transition"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMerchants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-500">Aucun commerçant trouvé</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMerchant(null)}>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Détails commerçant</h3>
              <button onClick={() => setSelectedMerchant(null)} className="text-gray-500 hover:text-white text-2xl">×</button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl font-bold">
                {(selectedMerchant.business_name || '?')[0].toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-bold">{selectedMerchant.business_name}</h4>
                <p className="text-sm text-gray-500">{selectedMerchant.name}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Email', value: selectedMerchant.email },
                { label: 'Téléphone', value: selectedMerchant.phone },
                { label: 'Secteur', value: selectedMerchant.sector },
                { label: 'Plan', value: selectedMerchant.plan },
                { label: 'Statut', value: selectedMerchant.status },
                { label: 'Inscrit le', value: new Date(selectedMerchant.created_at).toLocaleDateString('fr-FR') },
                { label: 'Dernière connexion', value: selectedMerchant.last_login_at ? new Date(selectedMerchant.last_login_at).toLocaleDateString('fr-FR') : 'Jamais' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="text-white font-medium">{item.value || '—'}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <select
                onChange={(e) => { if (e.target.value) handleAction('upgrade', selectedMerchant.id, e.target.value) }}
                className="col-span-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none"
                defaultValue=""
              >
                <option value="" className="bg-gray-900">Changer le plan...</option>
                <option value="starter" className="bg-gray-900">Starter</option>
                <option value="pro" className="bg-gray-900">Pro</option>
                <option value="premium" className="bg-gray-900">Premium</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
