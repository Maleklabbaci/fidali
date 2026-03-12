'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Branch {
  id: string
  name: string
  address?: string
  city?: string
  phone?: string
  manager_name?: string
  is_active: boolean
  created_at: string
}

interface BranchForm {
  name: string
  address: string
  city: string
  phone: string
  manager_name: string
}

const EMPTY_FORM: BranchForm = {
  name: '',
  address: '',
  city: '',
  phone: '',
  manager_name: '',
}

export default function BranchesPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchStats, setBranchStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<Branch | null>(null)
  const [form, setForm] = useState<BranchForm>(EMPTY_FORM)
  const [confirmDelete, setConfirmDelete] = useState<Branch | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)
    if (m.plan === 'starter' || !m.plan) { router.push('/dashboard'); return }
    loadAll(m.id)
  }, [router])

  const loadAll = async (merchantId: string) => {
    try {
      const { getBranches, getBranchStats } = await import('@/database/supabase-client')
      const [b, s] = await Promise.all([getBranches(merchantId), getBranchStats(merchantId)])
      setBranches(Array.isArray(b) ? b : [])
      const statsMap: Record<string, number> = {}
      if (Array.isArray(s)) s.forEach((x: any) => { statsMap[x.id] = x.count })
      setBranchStats(statsMap)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditTarget(null)
    setModal('create')
  }

  const openEdit = (branch: Branch) => {
    setForm({
      name: branch.name || '',
      address: branch.address || '',
      city: branch.city || '',
      phone: branch.phone || '',
      manager_name: branch.manager_name || '',
    })
    setEditTarget(branch)
    setModal('edit')
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const { createBranch, updateBranch } = await import('@/database/supabase-client')
      if (modal === 'create') {
        const result = await createBranch(merchant.id, form)
        if (result) setBranches(prev => [...prev, result as Branch])
        showToast('Branche créée ✓')
      } else if (modal === 'edit' && editTarget) {
        const result = await updateBranch(editTarget.id, form)
        if (result) setBranches(prev => prev.map(b => b.id === editTarget.id ? { ...b, ...form } : b))
        showToast('Branche mise à jour ✓')
      }
      setModal(null)
    } catch (e) {
      console.error(e)
      showToast('Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(confirmDelete.id)
    try {
      const { deleteBranch } = await import('@/database/supabase-client')
      await deleteBranch(confirmDelete.id)
      setBranches(prev => prev.filter(b => b.id !== confirmDelete.id))
      showToast('Branche supprimée')
      setConfirmDelete(null)
    } catch (e) {
      console.error(e)
      showToast('Erreur lors de la suppression', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const set = (key: keyof BranchForm, val: string) => setForm(p => ({ ...p, [key]: val }))

  const totalVisits = Object.values(branchStats).reduce((a, b) => a + b, 0)

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-800">Multi-branches</h1>
            <p className="text-xs text-slate-400">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase mr-1.5 ${merchant?.plan === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                {merchant?.plan}
              </span>
              {branches.length} branche{branches.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5">
          <span className="text-base leading-none">+</span> Ajouter
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Branches', value: branches.length, icon: '🏪' },
            { label: 'Visites totales', value: totalVisits, icon: '👥' },
            { label: 'Branche active', value: branches.length > 0 ? branches[0].name.split(' ')[0] : '—', icon: '⭐' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
              <p className="text-2xl mb-1">{kpi.icon}</p>
              <p className="text-xl font-extrabold text-slate-800">{kpi.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Liste branches */}
        {branches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-4xl mb-3">🏪</p>
            <p className="text-base font-bold text-slate-700">Aucune branche</p>
            <p className="text-sm text-slate-400 mt-1 mb-5">Ajoute tes points de vente pour suivre chaque adresse séparément</p>
            <button onClick={openCreate}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
              + Créer ma première branche
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {branches.map((branch, i) => {
              const visits = branchStats[branch.id] || 0
              const pct = totalVisits > 0 ? Math.round((visits / totalVisits) * 100) : 0
              return (
                <div key={branch.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-lg shrink-0">
                          🏪
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-800 truncate">{branch.name}</p>
                            {i === 0 && (
                              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded uppercase shrink-0">
                                Principale
                              </span>
                            )}
                          </div>
                          {branch.city && <p className="text-xs text-slate-500 mt-0.5">{branch.city}</p>}
                          {branch.address && <p className="text-xs text-slate-400 truncate">{branch.address}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => openEdit(branch)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setConfirmDelete(branch)}
                          className="p-2 hover:bg-red-50 rounded-lg transition text-slate-400 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-base font-extrabold text-slate-700">{visits}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Visites</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-base font-extrabold text-slate-700">{pct}%</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Du trafic</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-base font-extrabold text-slate-700 truncate">{branch.manager_name?.split(' ')[0] || '—'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Gérant</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {totalVisits > 0 && (
                      <div className="mt-3">
                        <div className="h-1.5 bg-slate-100 rounded-full">
                          <div className="h-1.5 bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Infos supplémentaires */}
                    {branch.phone && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                        <span>📞</span> {branch.phone}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Info box */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
          <span className="text-xl shrink-0">💡</span>
          <div>
            <p className="text-xs font-bold text-indigo-700">Comment ça marche ?</p>
            <p className="text-xs text-indigo-500 mt-1 leading-relaxed">
              Tes clients scannent la même carte peu importe la branche. Les visites sont automatiquement attribuées à la branche selon le scan. Tu peux voir les stats de chaque point de vente séparément.
            </p>
          </div>
        </div>

      </div>

      {/* Modal créer / modifier */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">
                {modal === 'create' ? '+ Nouvelle branche' : 'Modifier la branche'}
              </p>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nom de la branche <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Ex: Branche Centre-ville, Agence Bab Ezzouar…"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ville</label>
                  <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                    placeholder="Ex: Alger, Oran…"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Téléphone</label>
                  <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="0550 000 000"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Adresse</label>
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                  placeholder="Ex: 12 Rue Didouche Mourad"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nom du gérant</label>
                <input type="text" value={form.manager_name} onChange={e => set('manager_name', e.target.value)}
                  placeholder="Ex: Mohamed Amine"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {saving
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sauvegarde...</>
                  : modal === 'create' ? 'Créer' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <p className="text-base font-bold text-slate-800 mb-2">Supprimer cette branche ?</p>
            <p className="text-sm text-slate-500 mb-5">
              <strong>{confirmDelete.name}</strong> sera désactivée. Les données de visites sont conservées.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition">
                Annuler
              </button>
              <button onClick={handleDelete} disabled={!!deleting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50">
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
