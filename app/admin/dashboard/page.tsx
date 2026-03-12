'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const [overview, setOverview] = useState<any>(null)
  const [pendingMerchants, setPendingMerchants] = useState<any[]>([])
  const [allMerchants, setAllMerchants] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'messages'>('overview')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const { getPlatformOverview, getPendingMerchants, getAllMerchants, getPendingPayments, supabase } = await import('@/database/supabase-client')
      const [ov, pending, all, pays] = await Promise.all([
        getPlatformOverview(),
        getPendingMerchants(),
        getAllMerchants(),
        getPendingPayments(),
      ])
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      setOverview(ov)
      setPendingMerchants(Array.isArray(pending) ? pending : [])
      setAllMerchants(Array.isArray(all) ? all : [])
      setPayments(Array.isArray(pays) ? pays : [])
      setMessages(msgs || [])
    } catch (e) {
      console.error('loadData error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const id = setInterval(loadData, 20000)
    return () => clearInterval(id)
  }, [loadData])

  const handleMerchant = async (action: 'approve' | 'suspend', merchantId: string) => {
    setActionLoading(merchantId + action)
    try {
      const mod = await import('@/database/supabase-client')
      if (action === 'approve') await mod.approveMerchant(merchantId)
      if (action === 'suspend') await mod.suspendMerchant(merchantId)
      await loadData()
    } finally {
      setActionLoading(null)
    }
  }

  const handlePayment = async (action: 'approve' | 'reject', p: any) => {
    setActionLoading(p.id + action)
    try {
      const mod = await import('@/database/supabase-client')
      if (action === 'approve') await mod.approvePayment(p.id, p.merchant_id, p.requested_plan)
      if (action === 'reject') await mod.rejectPayment(p.id)
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

  const PLAN_COLOR: any = {
    starter: 'text-white/40',
    pro: 'text-blue-400',
    premium: 'text-violet-400',
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
    </div>
  )

  const kpis = [
    { label: 'Commerçants', value: overview?.total_merchants ?? allMerchants.length, sub: `${overview?.active_merchants ?? allMerchants.filter(m=>m.status==='active').length} actifs` },
    { label: 'En attente', value: overview?.pending_merchants ?? pendingMerchants.length, sub: 'À valider' },
    { label: 'Clients', value: overview?.total_clients ?? 0, sub: 'Total plateforme' },
    { label: 'Cartes actives', value: overview?.total_cards ?? 0, sub: `${overview?.activities_today ?? 0} visites aujourd'hui` },
  ]

  return (
    <div className="space-y-8">

      {/* Header + tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vue d'ensemble</h1>
          <p className="text-sm text-white/30 mt-0.5">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex gap-2">
          {[
            { id: 'overview', label: 'Dashboard' },
            { id: 'messages', label: `Messages${unread > 0 ? ` · ${unread}` : ''}` },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === t.id ? 'bg-white text-black' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.05]'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                <p className="text-3xl font-bold text-white">{typeof k.value === 'number' ? k.value.toLocaleString() : k.value}</p>
                <p className="text-sm text-white/50 mt-1">{k.label}</p>
                <p className="text-xs text-white/25 mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Plan distribution */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Starter', count: overview?.starter_count ?? allMerchants.filter(m=>m.plan==='starter').length, color: 'text-white/50' },
              { label: 'Pro', count: overview?.pro_count ?? allMerchants.filter(m=>m.plan==='pro').length, color: 'text-blue-400' },
              { label: 'Premium', count: overview?.premium_count ?? allMerchants.filter(m=>m.plan==='premium').length, color: 'text-violet-400' },
            ].map((p, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${p.color}`}>{p.count}</p>
                <p className="text-xs text-white/30 mt-1">{p.label}</p>
              </div>
            ))}
          </div>

          {/* Alertes */}
          {(pendingMerchants.length > 0 || payments.length > 0 || unread > 0) && (
            <div className="flex flex-wrap gap-3">
              {pendingMerchants.length > 0 && (
                <button onClick={() => router.push('/admin/dashboard/merchants')}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-400 hover:bg-amber-500/15 transition">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  {pendingMerchants.length} commerçant{pendingMerchants.length > 1 ? 's' : ''} en attente
                </button>
              )}
              {payments.length > 0 && (
                <button onClick={() => router.push('/admin/dashboard/payments')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400 hover:bg-blue-500/15 transition">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  {payments.length} paiement{payments.length > 1 ? 's' : ''} en attente
                </button>
              )}
              {unread > 0 && (
                <button onClick={() => setActiveTab('messages')}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-sm text-violet-400 hover:bg-violet-500/15 transition">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                  {unread} message{unread > 1 ? 's' : ''} non lu{unread > 1 ? 's' : ''}
                </button>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pending merchants */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <p className="text-sm font-semibold text-white/80">Commerçants en attente <span className="text-amber-400">({pendingMerchants.length})</span></p>
                <button onClick={() => router.push('/admin/dashboard/merchants')} className="text-xs text-white/30 hover:text-white/60 transition">Tous →</button>
              </div>
              {pendingMerchants.length === 0 ? (
                <div className="px-5 py-10 text-center text-white/20 text-sm">Aucun en attente ✓</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {pendingMerchants.slice(0, 5).map((m: any) => (
                    <div key={m.id} className="px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-white/[0.08] rounded-lg flex items-center justify-center text-xs font-bold text-white/60 shrink-0">
                          {(m.business_name || m.name || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{m.business_name || m.name}</p>
                          <p className="text-xs text-white/30 truncate">{m.email} · {m.sector || '—'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 ml-3">
                        <button onClick={() => handleMerchant('approve', m.id)}
                          disabled={actionLoading === m.id + 'approve'}
                          className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/25 transition disabled:opacity-40">
                          {actionLoading === m.id + 'approve' ? '...' : 'Valider'}
                        </button>
                        <button onClick={() => handleMerchant('suspend', m.id)}
                          disabled={actionLoading === m.id + 'suspend'}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition disabled:opacity-40">
                          {actionLoading === m.id + 'suspend' ? '...' : 'Refuser'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending payments */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <p className="text-sm font-semibold text-white/80">Paiements en attente <span className="text-blue-400">({payments.length})</span></p>
                <button onClick={() => router.push('/admin/dashboard/payments')} className="text-xs text-white/30 hover:text-white/60 transition">Tous →</button>
              </div>
              {payments.length === 0 ? (
                <div className="px-5 py-10 text-center text-white/20 text-sm">Aucun paiement en attente ✓</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {payments.slice(0, 5).map((p: any) => (
                    <div key={p.id} className="px-5 py-3.5 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{p.contact_name}</p>
                        <p className="text-xs text-white/30">
                          <span className={`font-semibold capitalize ${PLAN_COLOR[p.requested_plan] || ''}`}>{p.requested_plan}</span>
                          {' · '}{p.amount_dzd?.toLocaleString()} DA · {p.payment_method}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0 ml-3">
                        <button onClick={() => handlePayment('approve', p)}
                          disabled={actionLoading === p.id + 'approve'}
                          className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/25 transition disabled:opacity-40">
                          {actionLoading === p.id + 'approve' ? '...' : 'Confirmer'}
                        </button>
                        <button onClick={() => handlePayment('reject', p)}
                          disabled={actionLoading === p.id + 'reject'}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition disabled:opacity-40">
                          {actionLoading === p.id + 'reject' ? '...' : 'Refuser'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Derniers commerçants */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-sm font-semibold text-white/80">Derniers commerçants inscrits</p>
              <button onClick={() => router.push('/admin/dashboard/merchants')} className="text-xs text-white/30 hover:text-white/60 transition">Voir tous →</button>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {allMerchants.slice(0, 6).map((m: any) => (
                <div key={m.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-white/[0.08] rounded-lg flex items-center justify-center text-xs font-bold text-white/60 shrink-0">
                      {(m.business_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{m.business_name}</p>
                      <p className="text-xs text-white/30 truncate">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className={`text-xs font-semibold capitalize ${PLAN_COLOR[m.plan] || 'text-white/40'}`}>{m.plan || 'starter'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : m.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                      {m.status}
                    </span>
                    <span className="text-xs text-white/20">{timeAgo(m.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick nav */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Commerçants', path: '/admin/dashboard/merchants', value: allMerchants.length },
              { label: 'Paiements', path: '/admin/dashboard/payments', value: payments.length + ' en attente' },
              { label: 'Statistiques', path: '/admin/dashboard/stats', value: '→' },
              { label: 'Paramètres', path: '/admin/dashboard/settings', value: '→' },
            ].map((item, i) => (
              <button key={i} onClick={() => router.push(item.path)}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 text-left hover:bg-white/[0.06] hover:border-white/10 transition group">
                <p className="text-xl font-bold text-white/70 group-hover:text-white transition">{item.value}</p>
                <p className="text-xs text-white/30 mt-1">{item.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Messages</h2>
              <p className="text-xs text-white/30 mt-0.5">{messages.length} total · {unread} non lu{unread > 1 ? 's' : ''}</p>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl py-16 text-center text-white/20 text-sm">Aucun message</div>
          ) : (
            <div className="space-y-2">
              {messages.map(msg => (
                <div key={msg.id} className={`bg-white/[0.03] border rounded-xl overflow-hidden ${msg.status === 'unread' ? 'border-violet-500/20' : 'border-white/[0.06]'}`}>
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 bg-white/[0.08] rounded-lg flex items-center justify-center text-xs font-bold text-white/50 shrink-0 mt-0.5">
                          {(msg.merchant_name || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 w-full">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">{msg.merchant_name}</p>
                            {msg.status === 'unread' && <span className="w-1.5 h-1.5 bg-violet-400 rounded-full shrink-0" />}
                            <span className="text-xs text-white/20">{timeAgo(msg.created_at)}</span>
                          </div>
                          <p className="text-xs text-white/40 mt-0.5">{msg.subject}</p>
                          <p className="text-sm text-white/60 mt-2 leading-relaxed">{msg.message}</p>
                          {msg.admin_reply && (
                            <div className="mt-3 pl-3 border-l-2 border-emerald-500/30">
                              <p className="text-xs text-emerald-400/70 mb-1">Votre réponse</p>
                              <p className="text-sm text-white/50">{msg.admin_reply}</p>
                            </div>
                          )}
                          {replyingTo === msg.id && (
                            <div className="mt-3 space-y-2">
                              <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                                placeholder="Votre réponse..." rows={3} autoFocus
                                className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-sm text-white placeholder-white/20 outline-none focus:border-white/20 resize-none" />
                              <div className="flex gap-2">
                                <button onClick={() => handleReply(msg.id)} disabled={!replyText.trim()}
                                  className="px-4 py-2 bg-white text-black rounded-lg text-xs font-semibold disabled:opacity-30 hover:bg-white/90 transition">
                                  Envoyer
                                </button>
                                <button onClick={() => setReplyingTo(null)}
                                  className="px-4 py-2 text-white/40 hover:text-white/70 rounded-lg text-xs transition">
                                  Annuler
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {!msg.admin_reply && replyingTo !== msg.id && (
                          <button onClick={() => setReplyingTo(msg.id)}
                            className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.05] rounded-lg transition">
                            Répondre
                          </button>
                        )}
                        <button onClick={() => handleDeleteMsg(msg.id)}
                          className="px-2 py-1.5 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs transition">
                          ✕
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
