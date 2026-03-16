'use client'

import { useState, useEffect } from 'react'

const STATUS_STYLE: any = {
  active:    'bg-emerald-500/10 text-emerald-400',
  approved:  'bg-emerald-500/10 text-emerald-400',
  pending:   'bg-amber-500/10 text-amber-400',
  suspended: 'bg-red-500/10 text-red-400',
  rejected:  'bg-red-500/10 text-red-400',
}
const PLAN_STYLE: any = {
  starter: 'bg-white/[0.06] text-white/50',
  pro:     'bg-blue-500/10 text-blue-400',
  premium: 'bg-violet-500/10 text-violet-400',
}

export default function MerchantsPage() {
  const [merchants, setMerchants]     = useState<any[]>([])
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('all')
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState<any>(null)
  const [actionMsg, setActionMsg]     = useState<string | null>(null)

  // Modal suspension avec durée
  const [suspendModal, setSuspendModal] = useState<{ id: string; name: string } | null>(null)
  const [suspendDays, setSuspendDays]   = useState<string>('7')
  const [suspending, setSuspending]     = useState(false)

  // Modal suppression
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting]       = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const stored = localStorage.getItem('admin')
      const adminId = stored ? JSON.parse(stored)?.id : ''
      // Utiliser l'API admin (service role) pour bypasser le RLS
      const res = await fetch('/api/admin/merchants', {
        headers: { 'x-admin-id': adminId }
      })
      const json = await res.json()
      setMerchants(Array.isArray(json.data) ? json.data : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const showMsg = (msg: string) => {
    setActionMsg(msg)
    setTimeout(() => setActionMsg(null), 3000)
  }


  const adminId = () => {
    const s = localStorage.getItem('admin')
    return s ? JSON.parse(s)?.id || '' : ''
  }

  const adminPost = async (action: string, data: any) => {
    const res = await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'x-admin-id': adminId(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data }),
    })
    return res.json()
  }

  const action = async (type: string, id: string, plan?: string) => {
    if (type === 'approve') {
      await adminPost('approve_merchant', { merchantId: id })
      showMsg('✓ Commerçant validé')
    }
    if (type === 'plan') {
      await adminPost('change_plan', { merchantId: id, plan })
      showMsg(`Plan mis à jour → ${plan}`)
      setSelected((prev: any) => prev ? { ...prev, plan } : null)
      setMerchants((prev: any[]) => prev.map(m => m.id === id ? { ...m, plan } : m))
      return
    }
    load()
    if (type !== 'plan') setSelected(null)
  }

  // Suspendre avec durée
  const handleSuspend = async () => {
    if (!suspendModal) return
    setSuspending(true)
    try {
      const days = parseInt(suspendDays) || 0
      await adminPost('suspend_merchant', { merchantId: suspendModal.id, days })

      setSuspendModal(null)
      load()
      showMsg(days > 0 ? `⏸️ Suspendu pour ${days} jour(s)` : '⏸️ Suspendu indéfiniment')
    } catch (e) { console.error(e) }
    finally { setSuspending(false) }
  }

  // Réactiver
  const handleReactivate = async (id: string) => {
    await adminPost('reactivate_merchant', { merchantId: id })
    load()
    showMsg('✅ Compte réactivé')
  }

  // Supprimer définitivement
  const handleDelete = async () => {
    if (!deleteModal) return
    setDeleting(true)
    try {
      await adminPost('delete_merchant', { merchantId: deleteModal.id })
      setDeleteModal(null)
      load()
      showMsg('🗑️ Commerçant supprimé définitivement')
    } catch (e) { console.error(e) }
    finally { setDeleting(false) }
  }

  const filtered = merchants.filter(m => {
    const s = !search || [m.business_name, m.email, m.name].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const f = filter === 'all' || m.status === filter
    return s && f
  })

  const counts = {
    all:       merchants.length,
    active:    merchants.filter(m => m.status === 'active' || m.status === 'approved').length,
    pending:   merchants.filter(m => m.status === 'pending').length,
    suspended: merchants.filter(m => m.status === 'suspended').length,
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-5 h-5 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">

      {/* Toast */}
      {actionMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-900/90 border border-emerald-500/30 text-emerald-300 px-5 py-3 rounded-xl text-sm font-medium shadow-xl">
          {actionMsg}
        </div>
      )}

      {/* ── MODAL SUSPENSION ── */}
      {suspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f12] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-1">⏸️ Suspendre le compte</h3>
            <p className="text-white/40 text-sm mb-5">{suspendModal.name}</p>

            <label className="block text-white/50 text-xs mb-2">Durée de suspension</label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {['1', '7', '30', '0'].map(d => (
                <button key={d} onClick={() => setSuspendDays(d)}
                  className={`py-2 rounded-lg text-xs font-bold transition ${suspendDays === d ? 'bg-amber-500 text-white' : 'bg-white/[0.06] text-white/50 hover:bg-white/10'}`}>
                  {d === '0' ? '∞' : `${d}j`}
                </button>
              ))}
            </div>
            <input
              type="number" min="1" max="365"
              value={suspendDays}
              onChange={e => setSuspendDays(e.target.value)}
              placeholder="Nombre de jours (0 = illimité)"
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/20 outline-none focus:border-white/20 mb-5"
            />

            <p className="text-white/30 text-xs mb-5">
              {suspendDays === '0' || suspendDays === ''
                ? '⚠️ Suspension indéfinie — tu devras réactiver manuellement'
                : `Le compte sera automatiquement réactivé dans ${suspendDays} jour(s)`}
            </p>

            <div className="flex gap-3">
              <button onClick={() => setSuspendModal(null)}
                className="flex-1 py-2.5 bg-white/[0.06] text-white/60 rounded-xl text-sm hover:bg-white/10 transition">
                Annuler
              </button>
              <button onClick={handleSuspend} disabled={suspending}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition disabled:opacity-50">
                {suspending ? 'Suspension...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL SUPPRESSION ── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f12] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-1">🗑️ Supprimer définitivement</h3>
            <p className="text-white/40 text-sm mb-4">{deleteModal.name}</p>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-5">
              <p className="text-red-400 text-sm font-semibold mb-1">⚠️ Action irréversible</p>
              <p className="text-red-400/70 text-xs">Toutes les cartes, clients et données seront supprimés définitivement. Impossible de récupérer.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 bg-white/[0.06] text-white/60 rounded-xl text-sm hover:bg-white/10 transition">
                Annuler
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition disabled:opacity-50">
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
{/* ── MODAL DÉTAILS MARCHAND ── */}
{selected && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-[#0f0f12] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-white font-bold text-lg">
            {selected.business_name || selected.name}
          </h3>
          <p className="text-white/30 text-sm mt-0.5">{selected.email}</p>
        </div>
        <button
          onClick={() => setSelected(null)}
          className="text-white/30 hover:text-white transition text-xl leading-none"
        >
          ✕
        </button>
      </div>

      {/* Infos principales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          ['Nom complet', selected.name || '—'],
          ['Commerce', selected.business_name || '—'],
          ['Email', selected.email || '—'],
          ['Téléphone', selected.phone || '—'],
          ['Secteur', selected.sector || '—'],
          ['Adresse', selected.address || '—'],
          ['Ville', selected.city || '—'],
          ['Inscrit le', selected.created_at
            ? new Date(selected.created_at).toLocaleDateString('fr-FR')
            : '—'
          ],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-[11px] text-white/25 uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="text-sm text-white/70">{value}</p>
          </div>
        ))}
      </div>

      {/* Statut & Plan */}
      <div className="flex items-center gap-3 mb-6">
        <div>
          <p className="text-[11px] text-white/25 uppercase tracking-wider mb-1">Statut</p>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[selected.status] || STATUS_STYLE.pending}`}>
            {selected.status}
          </span>
          {selected.suspend_until && selected.status === 'suspended' && (
            <p className="text-[10px] text-white/25 mt-1">
              Jusqu'au {new Date(selected.suspend_until).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
        <div className="ml-6">
          <p className="text-[11px] text-white/25 uppercase tracking-wider mb-1">Plan</p>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PLAN_STYLE[selected.plan] || PLAN_STYLE.starter}`}>
            {selected.plan || 'starter'}
          </span>
        </div>
      </div>

      {/* Changer le plan */}
      <div className="mb-6">
        <p className="text-[11px] text-white/25 uppercase tracking-wider mb-2">
          Changer le plan
        </p>
        <div className="flex gap-2">
          {['starter', 'pro', 'premium'].map(p => (
            <button
              key={p}
              onClick={() => action('plan', selected.id, p)}
              disabled={selected.plan === p}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                selected.plan === p
                  ? 'bg-white text-black cursor-default'
                  : 'bg-white/[0.06] text-white/50 hover:bg-white/10'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="border-t border-white/[0.06] pt-4 flex flex-wrap gap-2">
        {selected.status === 'pending' && (
          <button
            onClick={() => action('approve', selected.id)}
            className="px-4 py-2 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/25 transition"
          >
            ✓ Valider le compte
          </button>
        )}
        {(selected.status === 'active' || selected.status === 'approved') && (
          <button
            onClick={() => {
              setSelected(null)
              setSuspendModal({
                id: selected.id,
                name: selected.business_name || selected.name,
              })
            }}
            className="px-4 py-2 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition"
          >
            ⏸️ Suspendre
          </button>
        )}
        {selected.status === 'suspended' && (
          <button
            onClick={() => {
              handleReactivate(selected.id)
              setSelected(null)
            }}
            className="px-4 py-2 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/25 transition"
          >
            ▶️ Réactiver
          </button>
        )}
        <button
          onClick={() => {
            setSelected(null)
            setDeleteModal({
              id: selected.id,
              name: selected.business_name || selected.name,
            })
          }}
          className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 transition"
        >
          🗑️ Supprimer
        </button>
      </div>
    </div>
  </div>
)}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Commerçants</h1>
          <p className="text-sm text-white/30 mt-0.5">{merchants.length} au total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/20 outline-none focus:border-white/20 w-64" />
        <div className="flex gap-2">
          {[['all','Tous'], ['active','Actifs'], ['pending','En attente'], ['suspended','Suspendus']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === val ? 'bg-white text-black' : 'bg-white/[0.05] text-white/40 hover:bg-white/10'}`}>
              {label} <span className="opacity-50 ml-1">{counts[val as keyof typeof counts]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Commerçant', 'Email', 'Secteur', 'Plan', 'Statut', 'Inscrit le', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-white/25 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-white/[0.02] transition">
                <td className="px-5 py-3.5">
                  <p className="text-sm font-medium text-white">{m.business_name || m.name}</p>
                  <p className="text-xs text-white/30">{m.name}</p>
                </td>
                <td className="px-5 py-3.5 text-sm text-white/40">{m.email}</td>
                <td className="px-5 py-3.5 text-sm text-white/40">{m.sector || '—'}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PLAN_STYLE[m.plan] || PLAN_STYLE.starter}`}>{m.plan || 'starter'}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[m.status] || STATUS_STYLE.pending}`}>{m.status}</span>
                    {m.suspend_until && m.status === 'suspended' && (
                      <p className="text-[10px] text-white/25 mt-1">
                        Jusqu'au {new Date(m.suspend_until).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-white/30">{new Date(m.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    {m.status === 'pending' && (
                      <button onClick={() => action('approve', m.id)}
                        className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/25 transition">
                        ✓ Valider
                      </button>
                    )}
                    {(m.status === 'active' || m.status === 'approved') && (
                      <button onClick={() => setSuspendModal({ id: m.id, name: m.business_name || m.name })}
                        className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs hover:bg-amber-500/20 transition">
                        ⏸️ Suspendre
                      </button>
                    )}
                    {m.status === 'suspended' && (
                      <button onClick={() => handleReactivate(m.id)}
                        className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/25 transition">
                        ▶️ Réactiver
                      </button>
                    )}
                    <button onClick={() => setSelected(m)}
                      className="px-3 py-1.5 bg-white/[0.06] text-white/50 rounded-lg text-xs hover:bg-white/10 transition">
                      Détails
                    </button>
                    <button onClick={() => setDeleteModal({ id: m.id, name: m.business_name || m.name })}
                      className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-16 text-center text-white/20 text-sm">Aucun commerçant trouvé</div>}
      </div>
    </div>
  )
}
