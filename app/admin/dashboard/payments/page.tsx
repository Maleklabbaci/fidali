'use client'

import { useState, useEffect } from 'react'

const METHOD_LABEL: any = { baridimob: 'Baridi Mob', ccp: 'CCP', especes: 'Espèces', virement: 'Virement' }

const PLAN_BG: any = {
  starter: 'bg-slate-500/10 text-slate-400',
  pro: 'bg-blue-500/10 text-blue-400',
  premium: 'bg-violet-500/10 text-violet-400',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const stored = localStorage.getItem('admin')
      const adminId = stored ? JSON.parse(stored)?.id : ''
      const res = await fetch('/api/admin/payments', {
        headers: { 'x-admin-id': adminId }
      })
      const json = await res.json()
      if (json.error) {
        console.error('Payments error:', json.error)
        setPayments([])
      } else {
        setPayments(json.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const action = async (type: 'approve' | 'reject', p: any) => {
    setActionLoading(p.id + type)
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type,
          paymentId: p.id,
          merchantId: p.merchant_id,
          plan: p.requested_plan,
        }),
      })
      const json = await res.json()
      if (json.error) {
        showToast('Erreur : ' + json.error, false)
      } else {
        showToast(type === 'approve' ? `✓ Paiement confirmé — plan ${p.requested_plan} activé` : 'Paiement refusé', type === 'approve')
        await load()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)
  const counts = {
    all: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    confirmed: payments.filter(p => p.status === 'confirmed').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
  }

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return 'maintenant'
    if (s < 3600) return `${Math.floor(s / 60)}m`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    return `${Math.floor(s / 86400)}j`
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">

      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl border ${
          toast.ok
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/20 border-red-500/30 text-red-300'
        }`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-white">Paiements</h1>
        <p className="text-xs text-white/30 mt-0.5">{counts.pending} en attente · {counts.all} total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tous', value: counts.all, color: 'text-white' },
          { label: 'En attente', value: counts.pending, color: 'text-amber-400' },
          { label: 'Confirmés', value: counts.confirmed, color: 'text-emerald-400' },
          { label: 'Refusés', value: counts.rejected, color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/30 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 w-fit">
        {([
          ['pending', `En attente${counts.pending > 0 ? ` (${counts.pending})` : ''}`],
          ['confirmed', 'Confirmés'],
          ['rejected', 'Refusés'],
          ['all', 'Tous'],
        ] as const).map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === val ? 'bg-white text-black' : 'text-white/40 hover:text-white/70'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl py-16 text-center text-white/20 text-sm">
          Aucun paiement {filter !== 'all' ? `(${filter})` : ''}
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((p: any) => (
              <div key={p.id} className={`px-5 py-4 hover:bg-white/[0.02] transition ${p.status === 'pending' ? 'border-l-2 border-rose-500/40' : ''}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-white/[0.07] rounded-xl flex items-center justify-center text-sm font-bold text-white/50 shrink-0">
                      {(p.contact_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white">{p.contact_name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${PLAN_BG[p.requested_plan] || ''}`}>
                          {p.requested_plan}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${
                          p.status === 'pending' ? 'bg-rose-500/10 text-rose-400' :
                          p.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-white/[0.05] text-white/30'
                        }`}>
                          {p.status === 'pending' ? 'En attente' : p.status === 'confirmed' ? 'Confirmé' : 'Refusé'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-white/30 flex-wrap">
                        <span>{p.contact_phone}</span>
                        <span>·</span>
                        <span className="font-semibold text-white/50">{p.amount_dzd?.toLocaleString()} DA</span>
                        <span>·</span>
                        <span>{METHOD_LABEL[p.payment_method] || p.payment_method}</span>
                        <span>·</span>
                        <span>{timeAgo(p.created_at)}</span>
                      </div>
                      {p.merchants?.business_name && (
                        <div className="mt-2 space-y-1.5">
                          <p className="text-[10px] font-bold text-white/20 uppercase tracking-wider">Détails commerçant</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                            <div>
                              <span className="text-white/30">Commerce:</span>
                              <span className="text-white/60 ml-1.5 font-medium">{p.merchants.business_name}</span>
                            </div>
                            {p.merchants.sector && (
                              <div>
                                <span className="text-white/30">Secteur:</span>
                                <span className="text-white/60 ml-1.5">{p.merchants.sector}</span>
                              </div>
                            )}
                            {p.merchants.email && (
                              <div>
                                <span className="text-white/30">Email:</span>
                                <span className="text-white/60 ml-1.5">{p.merchants.email}</span>
                              </div>
                            )}
                            {p.merchants.phone && (
                              <div>
                                <span className="text-white/30">Tél commerce:</span>
                                <span className="text-white/60 ml-1.5">{p.merchants.phone}</span>
                              </div>
                            )}
                            {p.merchants.plan && (
                              <div>
                                <span className="text-white/30">Plan actuel:</span>
                                <span className={`ml-1.5 font-semibold ${
                                  p.merchants.plan === 'starter' ? 'text-slate-400' :
                                  p.merchants.plan === 'pro' ? 'text-blue-400' :
                                  'text-violet-400'
                                }`}>{p.merchants.plan}</span>
                              </div>
                            )}
                            {p.merchants.sub_start && (
                              <div>
                                <span className="text-white/30">Début abonnement:</span>
                                <span className="text-white/60 ml-1.5">{new Date(p.merchants.sub_start).toLocaleDateString('fr-FR')}</span>
                              </div>
                            )}
                            {p.merchants.sub_end && (
                              <div>
                                <span className="text-white/30">Fin abonnement:</span>
                                <span className={`ml-1.5 font-medium ${
                                  new Date(p.merchants.sub_end) < new Date() ? 'text-rose-400' : 'text-emerald-400'
                                }`}>
                                  {new Date(p.merchants.sub_end).toLocaleDateString('fr-FR')}
                                  {new Date(p.merchants.sub_end) < new Date() && ' (expiré)'}
                                </span>
                              </div>
                            )}
                            {p.merchants.sub_billing && (
                              <div>
                                <span className="text-white/30">Facturation:</span>
                                <span className="text-white/60 ml-1.5">{p.merchants.sub_billing === 'monthly' ? 'Mensuel' : 'Annuel'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {p.note && (
                        <div className="mt-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Note du client</p>
                          <p className="text-xs text-white/60">{p.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {p.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => action('approve', p)}
                        disabled={!!actionLoading}
                        className="px-4 py-2 bg-emerald-500/15 text-emerald-400 rounded-xl text-xs font-semibold hover:bg-emerald-500/25 transition disabled:opacity-40">
                        {actionLoading === p.id + 'approve' ? '…' : 'Confirmer'}
                      </button>
                      <button onClick={() => action('reject', p)}
                        disabled={!!actionLoading}
                        className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-semibold hover:bg-red-500/20 transition disabled:opacity-40">
                        {actionLoading === p.id + 'reject' ? '…' : 'Refuser'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
