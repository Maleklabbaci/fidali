'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'overview' | 'merchants' | 'payments' | 'messages'

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
  const [search, setSearch] = useState('')
  const [changingPlan, setChangingPlan] = useState<string | null>(null)
  const realtimeRef = useRef<any>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const adminFetch = async (method: string, params?: any) => {
    const stored = localStorage.getItem('admin')
    const adminId = stored ? JSON.parse(stored)?.id : ''
    const headers: any = { 'x-admin-id': adminId, 'Content-Type': 'application/json' }
    if (method === 'GET') {
      const qs = new URLSearchParams(params).toString()
      const res = await fetch(`/api/admin/data?${qs}`, { headers })
      return res.json()
    }
    const res = await fetch('/api/admin/data', { method: 'POST', headers, body: JSON.stringify(params) })
    return res.json()
  }

  const loadData = useCallback(async () => {
    try {
      const [ov, merchants, pending, pays, msgs] = await Promise.all([
        adminFetch('GET', { type: 'overview' }),
        adminFetch('GET', { type: 'merchants' }),
        adminFetch('GET', { type: 'pending' }),
        adminFetch('GET', { type: 'payments' }),
        adminFetch('GET', { type: 'messages' }),
      ])
      setOverview(ov)
      setAllMerchants(Array.isArray(merchants.data) ? merchants.data : [])
      setPendingMerchants(Array.isArray(pending.data) ? pending.data : [])
      setPayments(pays.data || [])
      setMessages(msgs.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    // Vérifier que l'admin est bien connecté avant de charger quoi que ce soit
    const stored = localStorage.getItem('admin')
    if (!stored) {
      router.push('/admin')
      return
    }
    try {
      const admin = JSON.parse(stored)
      if (!admin?.id || !admin?.email) {
        localStorage.removeItem('admin')
        router.push('/admin')
        return
      }
    } catch {
      localStorage.removeItem('admin')
      router.push('/admin')
      return
    }

    loadData()
    const setup = async () => {
      const { supabase } = await import('@/database/supabase-client')
      realtimeRef.current = supabase.channel('admin-rt')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_requests' }, (p) => {
          if (p.eventType === 'INSERT') {
            showToast('💳 Nouveau paiement reçu !')
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                const n = new Notification('💳 Fidali Admin — Nouveau paiement', { body: "Nouvelle demande de paiement.", icon: '/logo.png', tag: 'fidali-payment', requireInteraction: true })
                n.onclick = () => { window.focus(); n.close() }
              } catch {}
            }
            document.title = '(1) Admin Fidali — Nouveau paiement'
          }
          loadData()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (p) => {
          if (p.eventType === 'INSERT') {
            showToast('💬 Nouveau message !')
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                const n = new Notification('💬 Fidali Admin — Nouveau message', { body: 'Un commerçant vous a envoyé un message.', icon: '/logo.png', tag: 'fidali-message' })
                n.onclick = () => { window.focus(); n.close() }
              } catch {}
            }
          }
          loadData()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'merchants' }, () => loadData())
        .subscribe()
    }
    setup()
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
    return () => { realtimeRef.current?.unsubscribe() }
  }, [loadData])

  const handleMerchant = async (action: 'approve' | 'suspend', merchantId: string) => {
    setActionLoading(merchantId + action)
    try {
      const mod = await import('@/database/supabase-client')
      if (action === 'approve') await mod.approveMerchant(merchantId)
      if (action === 'suspend') await mod.suspendMerchant(merchantId)
      showToast(action === 'approve' ? '✓ Commerçant validé' : 'Commerçant suspendu')
      await loadData()
    } finally { setActionLoading(null) }
  }

  const handleChangePlan = async (merchantId: string, plan: string) => {
    setActionLoading(merchantId + 'plan')
    try {
      const { changeMerchantPlan } = await import('@/database/supabase-client')
      await changeMerchantPlan(merchantId, plan)
      showToast(`✓ Plan mis à jour → ${plan}`)
      setChangingPlan(null)
      await loadData()
    } finally { setActionLoading(null) }
  }

  const handlePayment = async (action: 'approve' | 'reject', p: any) => {
    setActionLoading(p.id + action)
    try {
      const mod = await import('@/database/supabase-client')
      if (action === 'approve') { await mod.approvePayment(p.id, p.merchant_id, p.requested_plan); showToast(`✓ ${p.requested_plan} activé pour ${p.contact_name}`) }
      else { await mod.rejectPayment(p.id); showToast('Paiement refusé') }
      await loadData()
    } finally { setActionLoading(null) }
  }

  const handleReply = async (msgId: string) => {
    if (!replyText.trim()) return
    const { supabase } = await import('@/database/supabase-client')
    await supabase.from('messages').update({ admin_reply: replyText.trim(), status: 'replied', replied_at: new Date().toISOString() }).eq('id', msgId)
    setReplyingTo(null); setReplyText('')
    showToast('✓ Réponse envoyée')
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
  const filteredMerchants = search.trim()
    ? allMerchants.filter(m => [m.business_name, m.email, m.name, m.phone].some(f => f?.toLowerCase().includes(search.toLowerCase())))
    : allMerchants
  const totalRevenue = payments.filter(p => p.status === 'confirmed').reduce((s, p) => s + (p.amount_dzd || 0), 0)
  const monthRevenue = payments.filter(p => p.status === 'confirmed' && new Date(p.created_at) > new Date(Date.now() - 30 * 86400000)).reduce((s, p) => s + (p.amount_dzd || 0), 0)

  const PLAN_BG: any = { starter: 'bg-slate-500/10 text-slate-400', pro: 'bg-blue-500/10 text-blue-400', premium: 'bg-violet-500/10 text-violet-400' }
  const METHOD: any = { baridimob: 'Baridi Mob', ccp: 'CCP', especes: 'Espèces', virement: 'Virement' }

  useEffect(() => {
    const reset = () => { if (document.title.startsWith('(')) document.title = 'Admin Fidali' }
    window.addEventListener('focus', reset)
    return () => window.removeEventListener('focus', reset)
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
    </div>
  )

  const tabs = [
    { id: 'overview' as Tab, label: "Vue d'ensemble", badge: 0 },
    { id: 'merchants' as Tab, label: 'Commerçants', badge: pendingMerchants.length },
    { id: 'payments' as Tab, label: 'Paiements', badge: pendingPayments.length },
    { id: 'messages' as Tab, label: 'Messages', badge: unread },
  ]

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl border ${toast.type === 'ok' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-red-500/20 border-red-500/30 text-red-300'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            🛡️ Admin Fidali
          </h1>
          <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
            Temps réel · {allMerchants.length} commerçants · {allMerchants.filter(m => m.status === 'active').length} actifs
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${tab === t.id ? 'bg-white text-black' : 'text-white/40 hover:text-white/70'}`}>
              {t.label}
              {t.badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {tab === 'overview' && (
        <div className="space-y-5">

          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Commerçants', value: allMerchants.length, sub: `${allMerchants.filter(m => m.status === 'active').length} actifs`, dot: 'bg-emerald-400', color: 'text-white' },
              { label: 'En attente', value: pendingMerchants.length, sub: 'à valider', dot: 'bg-amber-400', color: pendingMerchants.length > 0 ? 'text-amber-400' : 'text-white' },
              { label: 'Clients', value: overview?.total_clients ?? 0, sub: 'total', dot: 'bg-blue-400', color: 'text-white' },
              { label: 'Visites/jour', value: overview?.activities_today ?? 0, sub: `${overview?.activities_week ?? 0} cette semaine`, dot: 'bg-cyan-400', color: 'text-white' },
              { label: 'Paiements', value: pendingPayments.length, sub: 'en attente', dot: 'bg-rose-400', color: pendingPayments.length > 0 ? 'text-rose-400' : 'text-white' },
              { label: 'Revenu/mois', value: `${monthRevenue.toLocaleString()}`, sub: `${totalRevenue.toLocaleString()} DA total`, dot: 'bg-violet-400', color: 'text-violet-400' },
            ].map((k, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 hover:bg-white/[0.05] transition">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`w-1.5 h-1.5 ${k.dot} rounded-full`} />
                  <p className="text-[10px] text-white/30 uppercase tracking-wider truncate">{k.label}</p>
                </div>
                <p className={`text-2xl font-black ${k.color}`}>{typeof k.value === 'number' ? k.value.toLocaleString() : k.value}</p>
                <p className="text-[10px] text-white/20 mt-0.5 truncate">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Anti-fraude status */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Système anti-fraude — Actif sur toutes les cartes</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: '🔄', label: 'QR Dynamique', desc: 'Lien expire toutes les 10 min' },
                { icon: '⏱️', label: 'Auto-validation', desc: 'Point ajouté après 2 min' },
                { icon: '⏰', label: 'Cooldown 8h', desc: '1 point max toutes les 8h' },
                { icon: '📊', label: 'Traçabilité', desc: 'Auto 🤖 / Manuel ✋ par client' },
              ].map((f, i) => (
                <div key={i} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                  <p className="text-lg mb-1">{f.icon}</p>
                  <p className="text-white text-[11px] font-bold">{f.label}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Plans distribution */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Répartition des plans</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Starter', count: allMerchants.filter(m => m.plan === 'starter').length, color: 'text-slate-400', bar: 'bg-slate-500', price: 0 },
                { label: 'Pro', count: allMerchants.filter(m => m.plan === 'pro').length, color: 'text-blue-400', bar: 'bg-blue-500', price: 2500 },
                { label: 'Premium', count: allMerchants.filter(m => m.plan === 'premium').length, color: 'text-violet-400', bar: 'bg-violet-500', price: 5000 },
              ].map((p, i) => {
                const pct = allMerchants.length > 0 ? Math.round((p.count / allMerchants.length) * 100) : 0
                const mrr = p.count * p.price
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-black ${p.color}`}>{p.label}</span>
                      <span className={`text-xl font-black ${p.color}`}>{p.count}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-1.5">
                      <div className={`h-full ${p.bar} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-white/20">{pct}%</span>
                      {mrr > 0 && <span className="text-[10px] text-white/30">{mrr.toLocaleString()} DA/mois</span>}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-white/30">MRR théorique</span>
              <span className="text-sm font-black text-violet-400">
                {(allMerchants.filter(m => m.plan === 'pro').length * 2500 + allMerchants.filter(m => m.plan === 'premium').length * 5000).toLocaleString()} DA/mois
              </span>
            </div>
          </div>

          {/* Alertes */}
          {(pendingMerchants.length > 0 || pendingPayments.length > 0 || unread > 0) && (
            <div className="flex flex-wrap gap-2">
              {pendingMerchants.length > 0 && (
                <button onClick={() => setTab('merchants')} className="flex items-center gap-2 px-3.5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 hover:bg-amber-500/15 transition">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                  {pendingMerchants.length} commerçant{pendingMerchants.length > 1 ? 's' : ''} à valider
                </button>
              )}
              {pendingPayments.length > 0 && (
                <button onClick={() => setTab('payments')} className="flex items-center gap-2 px-3.5 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 hover:bg-rose-500/15 transition">
                  <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
                  {pendingPayments.length} paiement{pendingPayments.length > 1 ? 's' : ''} en attente
                </button>
              )}
              {unread > 0 && (
                <button onClick={() => setTab('messages')} className="flex items-center gap-2 px-3.5 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-xs text-violet-400 hover:bg-violet-500/15 transition">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                  {unread} message{unread > 1 ? 's' : ''} non lu{unread > 1 ? 's' : ''}
                </button>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Pending merchants */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider">
                  En attente {pendingMerchants.length > 0 && <span className="text-amber-400">({pendingMerchants.length})</span>}
                </p>
                <button onClick={() => setTab('merchants')} className="text-[10px] text-white/25 hover:text-white/50 transition">Voir tous →</button>
              </div>
              {pendingMerchants.length === 0 ? (
                <div className="py-8 text-center text-white/20 text-xs">Aucun en attente ✓</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {pendingMerchants.slice(0, 5).map((m: any) => (
                    <div key={m.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-white/[0.07] rounded-xl flex items-center justify-center text-xs font-bold text-white/50 shrink-0">
                          {(m.business_name || m.name || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{m.business_name || m.name}</p>
                          <p className="text-[11px] text-white/30 truncate">{m.email} · {timeAgo(m.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0 ml-2">
                        <button onClick={() => handleMerchant('approve', m.id)} disabled={!!actionLoading}
                          className="px-2.5 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/25 transition disabled:opacity-40">
                          {actionLoading === m.id + 'approve' ? '…' : '✓ Valider'}
                        </button>
                        <button onClick={() => handleMerchant('suspend', m.id)} disabled={!!actionLoading}
                          className="px-2.5 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition disabled:opacity-40">
                          {actionLoading === m.id + 'suspend' ? '…' : '✕'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent payments */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider">
                  Paiements récents {pendingPayments.length > 0 && <span className="text-rose-400">({pendingPayments.length} en attente)</span>}
                </p>
                <button onClick={() => setTab('payments')} className="text-[10px] text-white/25 hover:text-white/50 transition">Tous →</button>
              </div>
              {payments.length === 0 ? (
                <div className="py-8 text-center text-white/20 text-xs">Aucun paiement</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {payments.slice(0, 5).map((p: any) => (
                    <div key={p.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{p.contact_name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${PLAN_BG[p.requested_plan] || ''}`}>{p.requested_plan}</span>
                        </div>
                        <p className="text-[11px] text-white/30">{p.amount_dzd?.toLocaleString()} DA · {METHOD[p.payment_method] || p.payment_method} · {timeAgo(p.created_at)}</p>
                      </div>
                      {p.status === 'pending' ? (
                        <div className="flex gap-1.5 shrink-0 ml-2">
                          <button onClick={() => handlePayment('approve', p)} disabled={!!actionLoading}
                            className="px-2.5 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/25 transition disabled:opacity-40">
                            {actionLoading === p.id + 'approve' ? '…' : '✓'}
                          </button>
                          <button onClick={() => handlePayment('reject', p)} disabled={!!actionLoading}
                            className="px-2.5 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition disabled:opacity-40">
                            {actionLoading === p.id + 'reject' ? '…' : '✕'}
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[10px] px-2 py-1 rounded-lg font-semibold shrink-0 ml-2 ${p.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {p.status === 'confirmed' ? '✓' : '✕'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MERCHANTS ═══ */}
      {tab === 'merchants' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un commerçant..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition" />
            </div>
            <div className="text-xs text-white/30 shrink-0">{filteredMerchants.length} résultats</div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="divide-y divide-white/[0.04]">
              {filteredMerchants.length === 0 ? (
                <div className="py-12 text-center text-white/20 text-sm">Aucun résultat</div>
              ) : filteredMerchants.map((m: any) => (
                <div key={m.id} className="px-5 py-4 hover:bg-white/[0.02] transition">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-white/[0.07] rounded-xl flex items-center justify-center text-sm font-bold text-white/50 shrink-0">
                        {(m.business_name || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-white truncate">{m.business_name || m.name}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${m.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : m.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                            {m.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/30 truncate">{m.email} · {m.phone || 'N/A'} · {timeAgo(m.created_at)}</p>
                        {m.sub_end && m.plan !== 'starter' && (() => {
                          const d = Math.ceil((new Date(m.sub_end).getTime() - Date.now()) / 86400000)
                          const end = new Date(m.sub_end).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short', year: 'numeric' })
                          return (
                            <p className={`text-[10px] mt-0.5 font-medium ${d <= 0 ? 'text-red-400' : d <= 7 ? 'text-amber-400' : 'text-emerald-400/70'}`}>
                              📅 {m.sub_billing === 'annual' ? 'Annuel' : 'Mensuel'} · expire le {end} {d <= 0 ? '⚠️ EXPIRÉ' : `(${d}j)`}
                            </p>
                          )
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {changingPlan === m.id ? (
                        <div className="flex items-center gap-1">
                          {['starter', 'pro', 'premium'].map(p => (
                            <button key={p} onClick={() => handleChangePlan(m.id, p)} disabled={!!actionLoading}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition disabled:opacity-40 ${m.plan === p ? 'bg-white text-black' : 'bg-white/[0.06] text-white/50 hover:bg-white/10'}`}>
                              {actionLoading === m.id + 'plan' ? '…' : p}
                            </button>
                          ))}
                          <button onClick={() => setChangingPlan(null)} className="text-white/20 hover:text-white/50 text-xs px-2 transition">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setChangingPlan(m.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition hover:opacity-80 ${PLAN_BG[m.plan || 'starter']}`}>
                          {m.plan || 'starter'} ↓
                        </button>
                      )}
                      {m.status === 'pending' && (
                        <button onClick={() => handleMerchant('approve', m.id)} disabled={!!actionLoading}
                          className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/25 transition disabled:opacity-40">
                          {actionLoading === m.id + 'approve' ? '…' : '✓ Valider'}
                        </button>
                      )}
                      {m.status === 'active' && (
                        <button onClick={() => handleMerchant('suspend', m.id)} disabled={!!actionLoading}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition disabled:opacity-40">
                          {actionLoading === m.id + 'suspend' ? '…' : 'Suspendre'}
                        </button>
                      )}
                      {m.status === 'suspended' && (
                        <button onClick={() => handleMerchant('approve', m.id)} disabled={!!actionLoading}
                          className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/25 transition disabled:opacity-40">
                          {actionLoading === m.id + 'approve' ? '…' : 'Réactiver'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ PAYMENTS ═══ */}
      {tab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Paiements</h2>
              <p className="text-xs text-white/30 mt-0.5">{pendingPayments.length} en attente · {totalRevenue.toLocaleString()} DA encaissé</p>
            </div>
            <div className="flex gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1">
              {(['pending', 'confirmed', 'rejected', 'all'] as const).map(f => (
                <button key={f} onClick={() => setPaymentFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${paymentFilter === f ? 'bg-white text-black' : 'text-white/40 hover:text-white/70'}`}>
                  {f === 'pending' ? `En attente${pendingPayments.length > 0 ? ` (${pendingPayments.length})` : ''}` : f === 'confirmed' ? 'Confirmés' : f === 'rejected' ? 'Refusés' : 'Tous'}
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
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-white/[0.07] rounded-xl flex items-center justify-center text-sm font-bold text-white/50 shrink-0">
                          {(p.contact_name || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="text-sm font-semibold text-white">{p.contact_name}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${PLAN_BG[p.requested_plan] || ''}`}>{p.requested_plan}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${p.status === 'pending' ? 'bg-rose-500/10 text-rose-400' : p.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.05] text-white/30'}`}>
                              {p.status === 'pending' ? '⏳ En attente' : p.status === 'confirmed' ? '✓ Confirmé' : '✕ Refusé'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-white/30 flex-wrap">
                            <span className="font-semibold text-white/50">{p.amount_dzd?.toLocaleString()} DA</span>
                            <span>·</span><span>{METHOD[p.payment_method] || p.payment_method}</span>
                            <span>·</span><span>{p.contact_phone}</span>
                            <span>·</span><span>{timeAgo(p.created_at)}</span>
                          </div>
                          {p.note && p.note.replace(/\[.*?\]\s*/, '') && (
                            <p className="text-[11px] text-white/40 mt-1 italic">"{p.note.replace(/\[.*?\]\s*/, '')}"</p>
                          )}
                          <span className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full font-bold ${p.note?.includes('[Annuel]') ? 'bg-violet-500/15 text-violet-400' : 'bg-blue-500/15 text-blue-400'}`}>
                            {p.note?.includes('[Annuel]') ? '📅 Annuel — 12 mois' : '📅 Mensuel — 1 mois'}
                          </span>
                          {p.proof_url && (
                            <a href={p.proof_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-blue-400 hover:text-blue-300 transition">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                              Voir preuve de paiement
                            </a>
                          )}
                        </div>
                      </div>
                      {p.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handlePayment('approve', p)} disabled={!!actionLoading}
                            className="px-4 py-2 bg-emerald-500/15 text-emerald-400 rounded-xl text-xs font-semibold hover:bg-emerald-500/25 transition disabled:opacity-40">
                            {actionLoading === p.id + 'approve' ? '…' : '✓ Confirmer'}
                          </button>
                          <button onClick={() => handlePayment('reject', p)} disabled={!!actionLoading}
                            className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-semibold hover:bg-red-500/20 transition disabled:opacity-40">
                            {actionLoading === p.id + 'reject' ? '…' : '✕ Refuser'}
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

      {/* ═══ MESSAGES ═══ */}
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
                <div key={msg.id} className={`bg-white/[0.03] border rounded-2xl overflow-hidden ${msg.status === 'unread' ? 'border-violet-500/25' : 'border-white/[0.06]'}`}>
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 bg-white/[0.07] rounded-xl flex items-center justify-center text-xs font-bold text-white/50 shrink-0 mt-0.5">
                          {(msg.merchant_name || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 w-full">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-sm font-semibold text-white">{msg.merchant_name}</p>
                            {msg.status === 'unread' && <span className="text-[9px] bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Nouveau</span>}
                            {msg.status === 'replied' && <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Répondu</span>}
                            <span className="text-[10px] text-white/20">{timeAgo(msg.created_at)}</span>
                          </div>
                          <p className="text-[11px] text-white/40 font-medium mb-2">{msg.subject}</p>
                          <p className="text-sm text-white/60 leading-relaxed">{msg.message}</p>
                          {msg.admin_reply && (
                            <div className="mt-3 pl-4 border-l-2 border-emerald-500/25 py-1">
                              <p className="text-[10px] text-emerald-400/60 mb-1 font-bold uppercase tracking-wider">Votre réponse</p>
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
                                  className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold disabled:opacity-30 hover:bg-white/90 transition">
                                  Envoyer
                                </button>
                                <button onClick={() => { setReplyingTo(null); setReplyText('') }} className="px-4 py-2 text-white/40 hover:text-white/70 text-xs transition">
                                  Annuler
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {replyingTo !== msg.id && (
                        <button onClick={() => { setReplyingTo(msg.id); setReplyText('') }}
                          className="px-3 py-1.5 text-xs text-white/35 hover:text-white/70 hover:bg-white/[0.05] rounded-lg transition font-medium shrink-0">
                          Répondre
                        </button>
                      )}
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
