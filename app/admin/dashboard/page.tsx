'use client'

import { useState, useEffect } from 'react'

interface OverviewData {
  total_merchants: number
  active_merchants: number
  pending_merchants: number
  suspended_merchants: number
  total_clients: number
  total_cards: number
  total_visits: number
  total_rewards: number
  revenue_dzd: number
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [recentMerchants, setRecentMerchants] = useState<any[]>([])
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replySending, setReplySending] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const { getPlatformOverview, getPendingMerchants, getPendingPayments } = await import('@/database/supabase-client')
      const { supabase } = await import('@/database/supabase-client')

      const [ov, merchants, payments] = await Promise.all([
        getPlatformOverview(),
        getPendingMerchants(),
        getPendingPayments(),
      ])

      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

      setOverview(ov as any)
setRecentMerchants(Array.isArray(merchants) ? merchants : [])
setPendingPayments(Array.isArray(payments) ? payments : [])
  setMessages(messagesData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (messageId: string) => {
    if (!replyText.trim()) return
    setReplySending(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      await supabase.from('messages').update({
        admin_reply: replyText.trim(),
        status: 'replied',
        replied_at: new Date().toISOString(),
      }).eq('id', messageId)
      setReplyingTo(null)
      setReplyText('')
      loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setReplySending(false)
    }
  }

  const handleMarkRead = async (messageId: string) => {
    try {
      const { supabase } = await import('@/database/supabase-client')
      await supabase.from('messages').update({ status: 'read' }).eq('id', messageId)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { supabase } = await import('@/database/supabase-client')
      await supabase.from('messages').delete().eq('id', messageId)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return 'Maintenant'
    if (s < 3600) return `${Math.floor(s / 60)} min`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    if (s < 604800) return `${Math.floor(s / 86400)}j`
    return new Date(d).toLocaleDateString('fr-FR')
  }

  const unreadCount = messages.filter((m) => m.status === 'unread').length

  const filteredMessages = filterStatus === 'all'
    ? messages
    : messages.filter((m) => m.status === filterStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-4xl animate-spin">⏳</div>
      </div>
    )
  }

  const kpis = [
    { label: 'Commerçants', value: overview?.total_merchants || 0, icon: '🏪', color: 'from-blue-500 to-cyan-500', change: '+12%' },
    { label: 'Actifs', value: overview?.active_merchants || 0, icon: '✅', color: 'from-green-500 to-emerald-500', change: '+8%' },
    { label: 'En attente', value: overview?.pending_merchants || 0, icon: '⏳', color: 'from-amber-500 to-orange-500', change: null },
    { label: 'Clients total', value: overview?.total_clients || 0, icon: '👥', color: 'from-purple-500 to-violet-500', change: '+25%' },
    { label: 'Cartes créées', value: overview?.total_cards || 0, icon: '💳', color: 'from-pink-500 to-rose-500', change: '+15%' },
    { label: 'Visites', value: overview?.total_visits || 0, icon: '📊', color: 'from-indigo-500 to-blue-500', change: '+30%' },
    { label: 'Récompenses', value: overview?.total_rewards || 0, icon: '🎁', color: 'from-teal-500 to-cyan-500', change: '+18%' },
    { label: 'Revenu', value: `${(overview?.revenue_dzd || 0).toLocaleString()} DA`, icon: '💰', color: 'from-yellow-500 to-amber-500', change: '+22%' },
  ]

  return (
    <div className="space-y-6">

      {/* TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
          { id: 'messages', label: 'Messages', icon: '💬', count: unreadCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-white/10 text-white border border-white/10'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW ===== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">

          {/* Alerte messages non lus */}
          {unreadCount > 0 && (
            <div
              className="bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-indigo-500/40 transition"
              onClick={() => setActiveTab('messages')}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="text-sm font-bold text-white">{unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-400">Cliquez pour voir</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}

          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <div
                key={i}
                className="group bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                    {kpi.icon}
                  </div>
                  {kpi.change && (
                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                      {kpi.change}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-extrabold text-white mb-1">
                  {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                </div>
                <div className="text-sm text-gray-500">{kpi.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Pending Merchants */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-amber-400">⏳</span> Commerçants en attente
                </h3>
                <span className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full font-bold">
                  {recentMerchants.length}
                </span>
              </div>

              {recentMerchants.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-gray-500">Aucun commerçant en attente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMerchants.slice(0, 5).map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4 hover:bg-white/10 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                          {(m.business_name || m.name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{m.business_name || m.name}</p>
                          <p className="text-xs text-gray-500">{m.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            const { approveMerchant } = await import('@/database/supabase-client')
                            await approveMerchant(m.id)
                            loadData()
                          }}
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30 transition"
                        >
                          ✓ Valider
                        </button>
                        <button
                          onClick={async () => {
                            const { suspendMerchant } = await import('@/database/supabase-client')
                            await suspendMerchant(m.id)
                            loadData()
                          }}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition"
                        >
                          ✗ Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Payments */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-green-400">💰</span> Paiements en attente
                </h3>
                <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold">
                  {pendingPayments.length}
                </span>
              </div>

              {pendingPayments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-gray-500">Aucun paiement en attente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPayments.slice(0, 5).map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4 hover:bg-white/10 transition">
                      <div>
                        <p className="font-medium text-sm">{p.contact_name}</p>
                        <p className="text-xs text-gray-500">
                          {p.requested_plan} • {p.payment_method} • {p.amount_dzd?.toLocaleString()} DA
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            const { approvePayment } = await import('@/database/supabase-client')
                            await approvePayment(p.id, p.merchant_id, p.requested_plan)
                            loadData()
                          }}
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30 transition"
                        >
                          ✓ Confirmer
                        </button>
                        <button
                          onClick={async () => {
                            const { rejectPayment } = await import('@/database/supabase-client')
                            await rejectPayment(p.id)
                            loadData()
                          }}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition"
                        >
                          ✗ Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Derniers messages (aperçu) */}
          {messages.length > 0 && (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-indigo-400">💬</span> Derniers messages
                </h3>
                <button onClick={() => setActiveTab('messages')} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition">
                  Voir tout →
                </button>
              </div>
              <div className="space-y-3">
                {messages.slice(0, 3).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-center justify-between rounded-xl p-4 transition cursor-pointer ${
                      msg.status === 'unread'
                        ? 'bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/15'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => setActiveTab('messages')}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        msg.status === 'unread'
                          ? 'bg-gradient-to-br from-indigo-500 to-violet-500'
                          : 'bg-white/10'
                      }`}>
                        {msg.merchant_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{msg.merchant_name}</p>
                          {msg.status === 'unread' && (
                            <span className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{msg.subject} — {msg.message?.slice(0, 50)}...</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-600 flex-shrink-0 ml-3">{timeAgo(msg.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">⚡ Actions rapides</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🏪', label: 'Voir commerçants', path: '/admin/dashboard/merchants' },
                { icon: '💳', label: 'Voir paiements', path: '/admin/dashboard/payments' },
                { icon: '📈', label: 'Statistiques', path: '/admin/dashboard/stats' },
                { icon: '⚙️', label: 'Paramètres', path: '/admin/dashboard/settings' },
              ].map((action, i) => (
                <a
                  key={i}
                  href={action.path}
                  className="flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-6 transition-all hover:-translate-y-1"
                >
                  <span className="text-3xl">{action.icon}</span>
                  <span className="text-sm text-gray-400">{action.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== MESSAGES ===== */}
      {activeTab === 'messages' && (
        <div className="space-y-6">

          {/* Header + Filtres */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                💬 Messages des commerçants
                {unreadCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                    {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{messages.length} message{messages.length > 1 ? 's' : ''} au total</p>
            </div>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'Tous', count: messages.length },
                { id: 'unread', label: 'Non lus', count: messages.filter((m) => m.status === 'unread').length },
                { id: 'read', label: 'Lus', count: messages.filter((m) => m.status === 'read').length },
                { id: 'replied', label: 'Répondus', count: messages.filter((m) => m.status === 'replied').length },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filterStatus === f.id
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold text-red-400">{messages.filter((m) => m.status === 'unread').length}</p>
              <p className="text-xs text-gray-500 mt-1">Non lus</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold text-amber-400">{messages.filter((m) => m.status === 'read').length}</p>
              <p className="text-xs text-gray-500 mt-1">En attente de réponse</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold text-green-400">{messages.filter((m) => m.status === 'replied').length}</p>
              <p className="text-xs text-gray-500 mt-1">Répondus</p>
            </div>
          </div>

          {/* Liste des messages */}
          {filteredMessages.length === 0 ? (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-12 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-white font-bold">Aucun message</p>
              <p className="text-gray-500 text-sm mt-1">
                {filterStatus === 'all' ? 'Aucun message reçu pour le moment' : `Aucun message ${filterStatus === 'unread' ? 'non lu' : filterStatus === 'read' ? 'en attente' : 'répondu'}`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-2xl overflow-hidden transition ${
                    msg.status === 'unread'
                      ? 'bg-indigo-500/10 border-2 border-indigo-500/30'
                      : 'bg-white/5 border border-white/5'
                  }`}
                >
                  {/* Header message */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          msg.status === 'unread'
                            ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white'
                            : msg.status === 'replied'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-white/10 text-gray-400'
                        }`}>
                          {msg.merchant_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-white text-sm">{msg.merchant_name}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              msg.status === 'unread'
                                ? 'bg-red-500/20 text-red-400'
                                : msg.status === 'replied'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {msg.status === 'unread' ? '● Non lu' : msg.status === 'replied' ? '✓ Répondu' : '○ Lu'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{msg.merchant_email} · {timeAgo(msg.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {msg.status === 'unread' && (
                          <button
                            onClick={() => handleMarkRead(msg.id)}
                            className="px-2.5 py-1.5 text-[10px] font-bold text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                            title="Marquer comme lu"
                          >
                            👁 Lu
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="px-2.5 py-1.5 text-[10px] font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Supprimer"
                        >
                          🗑
                        </button>
                      </div>
                    </div>

                    {/* Sujet */}
                    <div className="mt-3 ml-14">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                          {msg.subject}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                      <p className="text-[10px] text-gray-600 mt-2">
                        {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Réponse existante */}
                    {msg.admin_reply && (
                      <div className="mt-4 ml-14 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-green-400">✓ Votre réponse</span>
                          {msg.replied_at && (
                            <span className="text-[10px] text-gray-600">· {timeAgo(msg.replied_at)}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{msg.admin_reply}</p>
                      </div>
                    )}

                    {/* Bouton répondre */}
                    {!msg.admin_reply && replyingTo !== msg.id && (
                      <div className="mt-3 ml-14">
                        <button
                          onClick={() => { setReplyingTo(msg.id); setReplyText(''); if (msg.status === 'unread') handleMarkRead(msg.id) }}
                          className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-500/30 transition"
                        >
                          💬 Répondre
                        </button>
                      </div>
                    )}

                    {/* Formulaire réponse */}
                    {replyingTo === msg.id && (
                      <div className="mt-4 ml-14 space-y-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Écrivez votre réponse..."
                          rows={3}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReply(msg.id)}
                            disabled={replySending || !replyText.trim()}
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-xs font-bold hover:from-indigo-400 hover:to-violet-400 transition disabled:opacity-40"
                          >
                            {replySending ? '⏳ Envoi...' : '📤 Envoyer la réponse'}
                          </button>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-4 py-2.5 bg-white/5 text-gray-400 rounded-xl text-xs font-bold hover:bg-white/10 transition"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
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
