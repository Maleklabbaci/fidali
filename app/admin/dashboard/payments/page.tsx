'use client'

import { useState, useEffect } from 'react'

const METHOD_LABEL: any = { baridimob: 'Baridi Mob', ccp: 'CCP', especes: 'Espèces' }

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const { supabase } = await import('@/database/supabase-client')
      const { data } = await supabase.from('payment_requests').select('*, merchants(business_name, email)').order('created_at', { ascending: false })
      setPayments(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const action = async (type: string, id: string, merchantId?: string, plan?: string) => {
    const mod = await import('@/database/supabase-client')
    if (type === 'approve') await mod.approvePayment(id, merchantId!, plan as any)
    if (type === 'reject') await mod.rejectPayment(id)
    load()
  }

  const filtered = payments.filter(p => filter === 'all' || p.status === filter)

  const counts = { all: payments.length, pending: payments.filter(p => p.status === 'pending').length, confirmed: payments.filter(p => p.status === 'confirmed').length, rejected: payments.filter(p => p.status === 'rejected').length }

  const STATUS_STYLE: any = { pending: 'bg-amber-500/10 text-amber-400', confirmed: 'bg-emerald-500/10 text-emerald-400', rejected: 'bg-red-500/10 text-red-400', expired: 'bg-white/[0.06] text-white/30' }
  const PLAN_STYLE: any = { starter: 'text-white/50', pro: 'text-blue-400', premium: 'text-violet-400' }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-5 h-5 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Paiements</h1>
        <p className="text-sm text-white/30 mt-0.5">{counts.pending} en attente de confirmation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[['Tous', counts.all, ''], ['En attente', counts.pending, 'text-amber-400'], ['Confirmés', counts.confirmed, 'text-emerald-400'], ['Refusés', counts.rejected, 'text-red-400']].map(([l, v, c], i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <p className={`text-3xl font-bold ${c || 'text-white'}`}>{v}</p>
            <p className="text-xs text-white/30 mt-1">{l}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1">
        {[['all', 'Tous'], ['pending', 'En attente'], ['confirmed', 'Confirmés'], ['rejected', 'Refusés']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === val ? 'bg-white text-black' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.05]'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Commerçant', 'Plan', 'Méthode', 'Montant', 'Statut', 'Date', ''].map((h, i) => (
                <th key={i} className="text-left px-5 py-3 text-xs text-white/25 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((p: any) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition">
                <td className="px-5 py-3.5">
                  <p className="text-sm font-medium text-white">{p.contact_name}</p>
                  <p className="text-xs text-white/30">{p.contact_phone}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-sm font-semibold capitalize ${PLAN_STYLE[p.requested_plan] || ''}`}>{p.requested_plan}</span>
                </td>
                <td className="px-5 py-3.5 text-sm text-white/50">{METHOD_LABEL[p.payment_method] || p.payment_method}</td>
                <td className="px-5 py-3.5 text-sm font-semibold text-white">{p.amount_dzd?.toLocaleString()} DA</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[p.status] || ''}`}>{p.status}</span>
                </td>
                <td className="px-5 py-3.5 text-sm text-white/30">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="px-5 py-3.5">
                  {p.status === 'pending' && (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => action('approve', p.id, p.merchant_id, p.requested_plan)}
                        className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/25 transition">Confirmer</button>
                      <button onClick={() => action('reject', p.id)}
                        className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition">Refuser</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-16 text-center text-white/20 text-sm">Aucun paiement</div>}
      </div>
    </div>
  )
}
