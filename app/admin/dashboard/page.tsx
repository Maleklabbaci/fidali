'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'overview' | 'payments' | 'messages'

export default function AdminDashboard() {
  const router = useRouter()
  const [overview, setOverview] = useState<any>(null)
  const [pendingMerchants, setPendingMerchants] = useState<any[]>([])
  const [allMerchants, setAllMerchants] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [paymentFilter, setPaymentFilter] = useState<'pending' | 'confirmed' | 'rejected' | 'all'>('pending')
  const realtimeRef = useRef<any>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = useCallback(async () => {
    try {
      const { getPlatformOverview, getPendingMerchants, getAllMerchants, supabase } = await import('@/database/supabase-client')

      const [ov, pending, all] = await Promise.all([
        getPlatformOverview(),
        getPendingMerchants(),
        getAllMerchants(),
      ])

      // Charger TOUS les paiements (pas juste pending)
      const { data: pays } = await supabase
        .from('payment_requests')
        .select('*, merchants(business_name, email, name)')
        .order('created_at', { ascending: false })

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      setOverview(ov)
      setPendingMerchants(Array.isArray(pending) ? pending : [])
      setAllMerchants(Array.isArray(all) ? all : [])
      setPayments(pays || [])
      setMessages(msgs || [])
    } catch (e) {
      console.error('loadData error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Realtime subscription pour paiements + messages
  useEffect(() => {
    loadData()

    const setupRealtime = async () => {
      const { supabase } = await import('@/database/supabase-client')

      realtimeRef.current = supabase
        .channel('admin-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_requests' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            showToast('💳 Nouveau paiement reçu !', 'ok')
          }
          loadData()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            showToast('💬 Nouveau message reçu !', 'ok')
          }
          loadData()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'merchants' }, () => {
          loadData()
        })
        .subscribe()
    }

    setupRealtime()

    return () => {
      if (realtimeRef.current) {
        realtimeRef.current.unsubscribe()
      }
    }
  }, [loadData])

  const handleMerchant = async (action: 'approve' | 'suspend', merchantId: string) => {
    setActionLoading(merchantId + action)
    try {
      const mod = await import('@/database/supabase-client')
      if (action === 'approve') await mod.approveMerchant(merchantId)
      if (action === 'suspend') await mod.suspendMerchant(merchantId)
      showToast(action === 'approve' ? '✓ Commerçant validé' : 'Commerçant suspendu')
      await loadData()
    } finally {
      setActionLoading(null)
    }
  }

  const handlePayment = async (action: 'approve' | 'reject', p: any) => {
    setActionLoading(p.id + action)
    try {
      const mod = await import('@/database/supabase-client')
      if (action === 'approve') {
        await mod.approvePayment(p.id, p.merchant_id, p.requested_plan)
        showToast(`✓ Paiement confirmé — ${p.requested_plan} activé`)
      } else {
        await mod.rejectPayment(p.id)
        showToast('Paiement refusé')
      }
      await loadData()
    } finally {
      setActionLoading(null)
    }
  }

  const handleReply = async (msgId: string) => {
    if (!replyText.trim()) return
    const { supabase } = await import('@/database/supabase-client')
    await supabase.from('messages').update({
      admin_reply: replyText.trim(),
      status: 'replied',
      replied_at: new Date().toISOString(),
    }).eq('id', msgId)
    setReplyingTo(null)
    setReplyText('')
    showToast('✓ Réponse envoyée')
    loadData()
  }

  const handleDeleteMsg = async (msgId: string) => {
    const { supabase } = await import('@/database/supabase-client')
    await supabase.from('messages').delete().eq('id', msgId)
    loadData()
  }

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return 'maintenant'
    if (s < 3600) return `${Math.floor(s / 60)}m`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    return `${Math.floor(s / 86400)}j`
  }

  const unread = messages.filter(m => m.status === 'unread').length
  const pendingPayments = payments.filter(p => p.status === 'pending')
  const filteredPayments = paymentFilter === 'all' ? payments : payments.filter(p => p.status === paymentFilter)

  const PLAN_COLOR: any = {
    starter: 'text-slate-400',
    pro: 'text-blue-400',
    premium: 'text-violet-400',
  }

  const PLAN_BG: any = {
    starter: 'bg-slate-500/10 text-slate-400',
    pro: 'bg-blue-500/10 text-blue-400',
    premium: 'bg-violet-500/10 text-violet-400',
  }

  const METHOD_LABEL: any = { baridimob: 'Baridi Mob', ccp: 'CCP', especes: 'Espèces', virement: 'Virement' }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
    </div>
  )

  const kpis = [
    { label: 'Commerçants', value: allMerchants.length, sub: `${allMerchants.filter(m => m.status === 'active').length} actifs`, color: 'text-white', dot: 'bg-emerald-400' },
    { label: 'En attente', value: pendingMerchants.length, sub: 'à valider', color: pendingMerchants.length > 0 ? 'text-amber-400' : 'text-white', dot: 'bg-amber-400' },
    { label: 'Clients', value: overview?.total_clients ?? 0, sub: 'total plateforme', color: 'text-white', dot: 'bg-blue-400' },
    { label: 'Cartes', value: overview?.total_cards ?? 0, sub: `${overview?.activities_today ?? 0} visites/jour`, color: 'text-white', dot: 'bg-violet-400' },
    { label: 'Paiements', value: pendingPayments.length, sub: 'en attente', color: pendingPayments.length > 0 ? 'text-rose-400' : 'text-white', dot: 'bg-rose-400' },
    { label: 'Messages', value: unread, sub: 'non lus', color: unread > 0 ? 'text-violet-400' : 'text-white', dot: 'bg-violet-400' },
  ]

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl border transition-all ${
          toast.type === 'ok'
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/20 border-red-500/30 text-red-300'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Vue d'ensemble</h1>
          <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
            Temps réel actif
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
          {([
            { id: 'overview', label: 'Dashboard' },
            { id: 'payments', label: `Paiements${pendingPayments.length > 0 ? ` · ${pendingPayments.length}` : ''}` },
            { id: 'messages', label: `Messages${unread > 0 ? ` · ${unread}` : ''}` },
          ] as { id: Tab; label: string }[]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                tab === t.id
                  ? 'bg-white text-black'
                  : `text-white/40 hover:text-white/70 ${
                      (t.id === 'payments' && pendingPayments.length > 0) ? 'text-rose-400' :
                      (t.id === 'messages' && unread > 0) ? 'text-violet-400' : ''
                    }`
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {tab === 'overview' && (
        <div className="space-y-5">

          {/* KPIs */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {kpis.map((k, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 hover:bg-white/[0.05] transition cursor-default">
                <div className={`flex items-center gap-1.5 mb-2`}>
                  <span className={`w-1.5 h-1.5 ${k.dot} rounded-full`} />
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">{k.label}</p>
                </div>
                <p className={`text-2xl font-black ${k.color}`}>{typeof k.value === 'number' ? k.value.toLocaleString() : k.value}</p>
                <p className="text-[10px] text-white/20 mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Plans */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Starter', count: allMerchants.filter(m => m.plan === 'starter').length, color: 'text-slate-400', bar: 'bg-slate-500' },
              { label: 'Pro', count: allMerchants.filter(m => m.plan === 'pro').length, color: 'text-blue-400', bar: 'bg-blue-500' },
              { label: 'Premium', count: allMerchants.filter(m => m.plan === 'premium').length, color: 'text-violet-400', bar: 'bg-violet-500' },
            ].map((p, i) => {
              const pct = allMerchants.length > 0 ? Math.round((p.count / allMerchants.length) * 100) : 0
              return (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs font-semibold ${p.color}`}>{p.label}</p>
                    <p className={`text-xl font-black ${p.color}`}>{p.count}</p>
                  </div>
                  <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full ${p.bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-white/20 mt-1.5">{pct}% des commerçants</p>
                </div>
              )
            })}
          </div>

          {/* Alertes urgentes */}
          {(pendingMerchants.length > 0 || pendingPayments.length > 0 || unread > 0) && (
            <div className="flex flex-wrap gap-2">
              {pendingMerchants.length > 0 && (
                <button onClick={() => router.push('/admin/dashboard/merchants')}
                  className="flex items-center gap-2 px-3.5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 hover:bg-amber-500/15 transition">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                  {pendingMerchants.length} commerçant{pendingMerchants.length > 1 ? 's' : ''} à valider
                </button>
              )}
              {pendingPayments.length > 0 && (
                <button onClick={() => setTab('payments')}
                  className="flex items-center gap-2 px-3.5 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 hover:bg-rose-500/15 transition">
                  <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
                  {pendingPayments.length} paiement{pendingPayments.length > 1 ? 's' : ''} en attente
                </button>
              )}
              {unread > 0 && (
                <button onClick={() => setTab('messages')}
                  className="flex items-center gap-2 px-3.5 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-xs text-violet-400 hover:bg-violet-500/15 transition">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                  {unread} message{unread > 1 ? 's' : ''} non lu{unread > 1 ? 's' : ''}
                </button>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Commerçants en attente */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider">
                  Commerçants en attente
                  {pendingMerchants.length > 0 && <span className="ml-2 text-amber-400">({pendingMerchants.length})</span>}
                </p>
                <button onClick={() => router.push('/admin/dashboard/merchants')} className="text-[10px] text-white/25 hover:text-white/50 transition">Tous →</button>
              </div>
              {pendingMerchants.length === 0 ? (
                <div className="py-10 text-center text-white/20 text-xs">Aucun en attente ✓</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {pendingMerchants.slice(0, 4).map((m: any) => (
                    <div key={m.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-white/[0.07] rounded-xl flex items-center justify-center text-xs font-bold text-white/50 shrink-0">
                          {(m.business_name || m.name || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{m.business_name || m.name}</p>
                          <p className="text-[11px] text-white/30 truncate">{m.email} · {timeAgo(m.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0 ml-3">
                        <button onClick={() => handleMerchant('approve', m.id)}
                          disabled={!!actionLoading}
                          className="px-2.5 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/25 transition disabled:opacity-40">
                          {actionLoading === m.id + 'approve' ? '…' : 'Valider'}
                        </button>
                        <button onClick={() => handleMerchant('suspend', m.id)}
                          disabled={!!actionLoading}
                          className="px-2.5 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition disabled:opacity-40">
                          {actionLoading === m.id + 'suspend' ? '…' : 'Refuser'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Paiements récents */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider">
                  Paiements récents
                  {pendingPayments.length > 0 && <span className="ml-2 text-rose-400">({pendingPayments.length} en attente)</span>}
                </p>
                <button onClick={() => setTab('payments')} className="text-[10px] text-white/25 hover:text-white/50 transition">Tous →</button>
              </div>
              {payments.length === 0 ? (
                <div className="py-10 text-center text-white/20 text-xs">Aucun paiement ✓</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {payments.slice(0, 4).map((p: any) => (
                    <div key={p.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{p.contact_name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${PLAN_BG[p.requested_plan] || ''}`}>{p.requested_plan}</span>
                        </div>
                        <p className="text-[11px] text-white/30">{p.amount_dzd?.toLocaleString()} DA · {METHOD_LABEL[p.payment_method] || p.payment_method} · {timeAgo(p.created_at)}</p>
                      </div>
                      {p.status === 'pending' ? (
                        <div className="flex gap-1.5 shrink-0 ml-3">
                          <button onClick={() => handlePayment('approve', p)}
                            disabled={!!actionLoading}
                            className="px-2.5 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/25 transition disabled:opacity-40">
                            {actionLoading === p.id + 'approve' ? '…' : '✓'}
                          </button>
                          <button onClick={() => handlePayment('reject', p)}
                            disabled={!!actionLoading}
                            className="px-2.5 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition disabled:opacity-40">
                            {actionLoading === p.id + 'reject' ? '…' : '✕'}
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[10px] px-2 py-1 rounded-lg font-semibold shrink-0 ml-3 ${
                          p.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>{p.status === 'confirmed' ? 'Confirmé' : 'Refusé'}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Derniers commerçants */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Derniers inscrits</p>
              <button onClick={() => router.push('/admin/dashboard/merchants')} className="text-[10px] text-white/25 hover:text-white/50 transition">Voir tous →</button>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {allMerchants.slice(0, 5).map((m: any) => (
                <div key={m.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 bg-white/[0.07] rounded-lg flex items-center justify-center text-[11px] font-bold text-white/40 shrink-0">
                      {(m.business_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{m.business_name}</p>
                      <p className="text-[11px] text-white/25 truncate">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className={`text-[10px] font-bold capitalize ${PLAN_COLOR[m.plan] || 'text-white/40'}`}>{m.plan || 'starter'}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      m.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      m.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>{m.status}</span>
                    <span className="text-[10px] text-white/20">{timeAgo(m.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== PAYMENTS TAB ===== */}
      {tab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Paiements</h2>
              <p className="text-xs text-white/30 mt-0.5">{pendingPayments.length} en attente · {payments.length} total</p>
            </div>
            <div className="flex gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1">
              {(['pending', 'confirmed', 'rejected', 'all'] as const).map(f => (
                <button key={f} onClick={() => setPaymentFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    paymentFilter === f ? 'bg-white text-black' : 'text-white/40 hover:text-white/70'
                  }`}>
                  {f === 'pending' ? `En attente${pendingPayments.length > 0 ? ` (${pendingPayments.length})` : ''}` :
                   f === 'confirmed' ? 'Confirmés' :
                   f === 'rejected' ? 'Refusés' : 'Tous'}
                </button>
              ))}
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl py-16 text-center text-white/20 text-sm">
              Aucun paiement {paymentFilter !== 'all' ? `(${paymentFilter})` : ''}
            </div>
          ) : (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/[0.04]">
                {filteredPayments.map((p: any) => (
                  <div key={p.id} className={`px-5 py-4 hover:bg-white/[0.02] transition ${p.status === 'pending' ? 'border-l-2 border-rose-500/40' : ''}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-white/[0.07] rounded-xl flex items-center justify-center text-sm font-bold text-white/50 shrink-0">
                          {(p.contact_name || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-white">{p.contact_name}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${PLAN_BG[p.requested_plan] || ''}`}>{p.requested_plan}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${
                              p.status === 'pending' ? 'bg-rose-500/10 text-rose-400' :
                              p.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' :
                              'bg-white/[0.05] text-white/30'
                            }`}>
                              {p.status === 'pending' ? 'En attente' : p.status === 'confirmed' ? 'Confirmé' : 'Refusé'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-white/30">
                            <span>{p.contact_phone}</span>
                            <span>·</span>
                            <span className="font-semibold text-white/50">{p.amount_dzd?.toLocaleString()} DA</span>
                            <span>·</span>
                            <span>{METHOD_LABEL[p.payment_method] || p.payment_method}</span>
                            <span>·</span>
                            <span>{timeAgo(p.created_at)}</span>
                          </div>
                          {p.merchants?.business_name && (
                            <p className="text-[10px] text-white/20 mt-0.5">Commerce : {p.merchants.business_name}</p>
                          )}
                        </div>
                      </div>
                      {p.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handlePayment('approve', p)}
                            disabled={!!actionLoading}
                            className="px-4 py-2 bg-emerald-500/15 text-emerald-400 rounded-xl text-xs font-semibold hover:bg-emerald-500/25 transition disabled:opacity-40">
                            {actionLoading === p.id + 'approve' ? '…' : 'Confirmer'}
                          </button>
                          <button onClick={() => handlePayment('reject', p)}
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
      )}

      {/* ===== MESSAGES TAB ===== */}
      {tab === 'messages' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Messages support</h2>
            <p className="text-xs text-white/30 mt-0.5">{messages.length} messages · {unread} non lu{unread > 1 ? 's' : ''}</p>
          </div>

          {messages.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl py-16 text-center text-white/20 text-sm">Aucun message</div>
          ) : (
            <div className="space-y-2">
              {messages.map(msg => (
                <div key={msg.id} className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition ${
                  msg.status === 'unread' ? 'border-violet-500/25' : 'border-white/[0.06]'
                }`}>
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 bg-white/[0.07] rounded-xl flex items-center justify-center text-xs font-bold text-white/50 shrink-0 mt-0.5">
                          {(msg.merchant_name || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 w-full">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-white">{msg.merchant_name}</p>
                            {msg.status === 'unread' && (
                              <span className="text-[9px] bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Nouveau</span>
                            )}
                            {msg.status === 'replied' && (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Répondu</span>
                            )}
                            <span className="text-[10px] text-white/20">{timeAgo(msg.created_at)}</span>
                          </div>
                          <p className="text-[11px] text-white/35 mt-0.5 font-medium">{msg.subject}</p>
                          <p className="text-sm text-white/60 mt-2 leading-relaxed">{msg.message}</p>

                          {msg.admin_reply && (
                            <div className="mt-3 pl-4 border-l-2 border-emerald-500/25 py-1">
                              <p className="text-[10px] text-emerald-400/60 mb-1 font-semibold uppercase tracking-wider">Votre réponse</p>
                              <p className="text-sm text-white/45 leading-relaxed">{msg.admin_reply}</p>
                            </div>
                          )}

                          {replyingTo === msg.id && (
                            <div className="mt-3 space-y-2">
                              <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                                placeholder="Votre réponse..." rows={3} autoFocus
                                className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:border-white/20 resize-none" />
                              <div className="flex gap-2">
                                <button onClick={() => handleReply(msg.id)} disabled={!replyText.trim()}
                                  className="px-4 py-2 bg-white text-black rounded-lg text-xs font-semibold disabled:opacity-30 hover:bg-white/90 transition">
                                  Envoyer
                                </button>
                                <button onClick={() => { setReplyingTo(null); setReplyText('') }}
                                  className="px-4 py-2 text-white/40 hover:text-white/70 text-xs transition">
                                  Annuler
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {replyingTo !== msg.id && (
                          <button onClick={() => { setReplyingTo(msg.id); setReplyText('') }}
                            className="px-3 py-1.5 text-xs text-white/35 hover:text-white/70 hover:bg-white/[0.05] rounded-lg transition font-medium">
                            Répondre
                          </button>
                        )}
                        <button onClick={() => handleDeleteMsg(msg.id)}
                          className="p-1.5 text-red-400/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs transition">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
