'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const [overview, setOverview] = useState<any>(null)
  const [merchants, setMerchants] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'messages'>('overview')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => { loadData(); const id = setInterval(loadData, 15000); return () => clearInterval(id) }, [])

  const loadData = async () => {
    try {
      const { getPlatformOverview, getPendingMerchants, getPendingPayments, supabase } = await import('@/database/supabase-client')
      const [ov, m, p] = await Promise.all([getPlatformOverview(), getPendingMerchants(), getPendingPayments()])
      const { data: msgs } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
      setOverview(ov)
      setMerchants(Array.isArray(m) ? m : [])
      setPayments(Array.isArray(p) ? p : [])
      setMessages(msgs || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleMerchant = async (action: string, id: string) => {
    const mod = await import('@/database/supabase-client')
    if (action === 'approve') await mod.approveMerchant(id)
    if (action === 'suspend') await mod.suspendMerchant(id)
    loadData()
  }

  const handlePayment = async (action: string, id: string, merchantId?: string, plan?: string) => {
    const mod = await import('@/database/supabase-client')
    if (action === 'approve') await mod.approvePayment(id, merchantId!, plan as any)
    if (action === 'reject') await mod.rejectPayment(id)
    loadData()
  }

  const handleReply = async (msgId: string) => {
    if (!replyText.trim()) return
    const { supabase } = await import('@/database/supabase-client')
    await supabase.from('messages').update({ admin_reply: replyText.trim(), status: 'replied', replied_at: new Date().toISOString() }).eq('id', msgId)
    setReplyingTo(null); setReplyText(''); loadData()
  }

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return 'maintenant'
    if (s < 3600) return `${Math.floor(s / 60)}m`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    return `${Math.floor(s / 86400)}j`
  }

  const unread = messages.filter(m => m.status === 'unread').length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
    </div>
  )

  const kpis = [
    { label: 'Commerçants', value: overview?.total_merchants ?? 0, sub: `${overview?.active_merchants ?? 0} actifs` },
    { label: 'Clients', value: overview?.total_clients ?? 0, sub: 'Total plateforme' },
    { label: 'Cartes', value: overview?.total_cards ?? 0, sub: 'En circulation' },
    { label: 'Visites / 7j', value: overview?.activities_week ?? 0, sub: `${overview?.activities_today ?? 0} aujourd'hui` },
  ]

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vue d'ensemble</h1>
          <p className="text-sm text-white/30 mt-0.5">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex gap-2">
          {[
            { id: 'overview', label: 'Tableau de bord' },
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
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] transition">
                <p className="text-3xl font-bold text-white">{typeof k.value === 'number' ? k.value.toLocaleString() : k.value}</p>
                <p className="text-sm text-white/50 mt-1">{k.label}</p>
                <p className="text-xs text-white/25 mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Alerts row */}
          {(merchants.filter(m => m.status === 'pending').length > 0 || payments.length > 0 || unread > 0) && (
            <div className="flex flex-wrap gap-3">
              {merchants.filter(m => m.status === 'pending').length > 0 && (
                <button onClick={() => router.push('/admin/dashboard/merchants')}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-400 hover:bg-amber-500/15 transition">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  {merchants.filter(m => m.status === 'pending').length} commerçant{merchants.filter(m => m.status === 'pending').length > 1 ? 's' : ''} en attente
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

          {/* Two columns */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Pending merchants */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <p className="text-sm font-semibold text-white/80">Commerçants en attente</p>
                <button onClick={() => router.push('/admin/dashboard/merchants')} className="text-xs text-white/30 hover:text-white/60 transition">Voir tous →</button>
              </div>
              {merchants.filter(m => m.status === 'pending').length === 0 ? (
                <div className="px-5 py-10 text-center text-white/20 text-sm">Aucun en attente</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {merchants.filter(m => m.status === 'pending').slice(0, 4).map((m: any) => (
                    <div key={m.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-white/[0.08] rounded-lg flex items-center justify-center text-xs font-bold text-white/60 shrink-0">
                          {(m.business_name || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{m.business_name || m.name}</p>
                          <p className="text-xs text-white/30 truncate">{m.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 ml-3">
                        <button onClick={() => handleMerchant('approve', m.id)}
                          className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/25 transition">
                          Valider
                        </button>
                        <button onClick={() => handleMerchant('suspend', m.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition">
                          Refuser
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
                <p className="text-sm font-semibold text-white/80">Paiements en attente</p>
                <button onClick={() => router.push('/admin/dashboard/payments')} className="text-xs text-white/30 hover:text-white/60 transition">Voir tous →</button>
              </div>
              {payments.length === 0 ? (
                <div className="px-5 py-10 text-center text-white/20 text-sm">Aucun paiement en attente</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {payments.slice(0, 4).map((p: any) => (
                    <div key={p.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{p.contact_name}</p>
                        <p className="text-xs text-white/30">{p.requested_plan} · {p.amount_dzd?.toLocaleString()} DA · {p.payment_method}</p>
                      </div>
                      <div className="flex gap-2 shrink-0 ml-3">
                        <button onClick={() => handlePayment('approve', p.id, p.merchant_id, p.requested_plan)}
                          className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/25 transition">
                          Confirmer
                        </button>
                        <button onClick={() => handlePayment('reject', p.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition">
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick nav */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Commerçants', path: '/admin/dashboard/merchants', count: overview?.total_merchants },
              { label: 'Paiements', path: '/admin/dashboard/payments', count: payments.length },
              { label: 'Statistiques', path: '/admin/dashboard/stats', count: null },
              { label: 'Paramètres', path: '/admin/dashboard/settings', count: null },
            ].map((item, i) => (
              <button key={i} onClick={() => router.push(item.path)}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 text-left hover:bg-white/[0.06] hover:border-white/10 transition group">
                <p className="text-xl font-bold text-white/80 group-hover:text-white transition">
                  {item.count !== null ? item.count?.toLocaleString() : '→'}
                </p>
                <p className="text-xs text-white/30 mt-1">{item.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Messages</h2>
              <p className="text-xs text-white/30 mt-0.5">{messages.length} total · {unread} non lu{unread > 1 ? 's' : ''}</p>
            </div>
            <div className="flex gap-1 text-xs">
              {['Tous', 'Non lus', 'Répondus'].map((f, i) => (
                <button key={i} className="px-3 py-1.5 text-white/40 hover:text-white/70 hover:bg-white/[0.05] rounded-lg transition">{f}</button>
              ))}
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl py-16 text-center text-white/20 text-sm">
              Aucun message
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map(msg => (
                <div key={msg.id} className={`bg-white/[0.03] border rounded-xl overflow-hidden transition ${msg.status === 'unread' ? 'border-violet-500/20' : 'border-white/[0.06]'}`}>
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 bg-white/[0.08] rounded-lg flex items-center justify-center text-xs font-bold text-white/50 shrink-0 mt-0.5">
                          {(msg.merchant_name || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
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
                      {!msg.admin_reply && replyingTo !== msg.id && (
                        <button onClick={() => setReplyingTo(msg.id)}
                          className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.05] rounded-lg transition shrink-0">
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
