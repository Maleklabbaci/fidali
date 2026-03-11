'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import { exportDashboardPDF } from '@/lib/export-pdf'

export default function DashboardPage() {
  const router = useRouter()

  const [merchant, setMerchant] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [pending, setPending] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [stats, setStats] = useState({ total_clients: 0, total_points: 0, total_rewards: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [exportingPDF, setExportingPDF] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showQR, setShowQR] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [editCard, setEditCard] = useState<any>(null)
  const [editForm, setEditForm] = useState({ reward: '', max_points: 0, welcome_message: '', points_per_visit: 1 })
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string; name: string } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)
    loadData(m.id)
    const interval = setInterval(() => loadData(m.id), 30000)
    return () => clearInterval(interval)
  }, [router])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = async (merchantId: string) => {
    try {
      const { supabase } = await import('@/database/supabase-client')
      const { data: cardsData } = await supabase.from('loyalty_cards').select('*').eq('merchant_id', merchantId).eq('is_active', true).order('created_at', { ascending: false })
      const cardIds = (cardsData || []).map((c: any) => c.id)
      let clientCardsData: any[] = []
      if (cardIds.length > 0) {
        const { data } = await supabase.from('client_cards').select('*, clients(*), loyalty_cards(*)').in('card_id', cardIds)
        clientCardsData = data || []
      }
      let pendingData: any[] = []
      if (cardIds.length > 0) {
        const { data } = await supabase.from('pending_presences').select('*, clients(*), loyalty_cards(*)').in('card_id', cardIds).eq('status', 'pending').order('created_at', { ascending: false })
        pendingData = data || []
      }
      const { data: activitiesData } = await supabase.from('activities').select('*').eq('merchant_id', merchantId).order('created_at', { ascending: false }).limit(30)
      setCards(cardsData || [])
      setClients(clientCardsData)
      setPending(pendingData)
      setActivities(activitiesData || [])
      const totalClients = new Set(clientCardsData.map((c: any) => c.client_id)).size
      const totalPoints = clientCardsData.reduce((sum: number, c: any) => sum + (c.points || 0), 0)
      const totalRewards = clientCardsData.reduce((sum: number, c: any) => sum + (c.total_rewards_redeemed || 0), 0)
      setStats({ total_clients: totalClients, total_points: totalPoints, total_rewards: totalRewards })
    } catch (err) { console.error('Error:', err) }
    finally { setLoading(false); setRefreshing(false) }
  }

  const handleRefresh = () => { if (!merchant || refreshing) return; setRefreshing(true); loadData(merchant.id) }

  const handlePresence = async (presenceId: string, action: 'validated' | 'rejected') => {
    try {
      const dbStatus = action === 'validated' ? 'confirmed' : 'rejected'
      const { supabase } = await import('@/database/supabase-client')
      const presence = pending.find((p) => p.id === presenceId)
      if (!presence) return
      const { error: e1 } = await supabase.from('pending_presences').update({ status: dbStatus }).eq('id', presenceId)
      if (e1) { showToast('Erreur: ' + e1.message, 'error'); return }
      if (action === 'validated') {
        const clientCard = clients.find((c) => c.client_id === presence.client_id && c.card_id === presence.card_id) || clients.find((c) => c.id === presence.client_card_id)
        if (clientCard) {
          const card = cards.find((c) => c.id === (clientCard.card_id || presence.card_id))
          const maxPts = card?.max_points || 10
          const newPts = Math.min((clientCard.points || 0) + (card?.points_per_visit || 1), maxPts)
          const reward = newPts >= maxPts
          await supabase.from('client_cards').update({ points: reward ? 0 : newPts, total_rewards_redeemed: (clientCard.total_rewards_redeemed || 0) + (reward ? 1 : 0) }).eq('id', clientCard.id)
        }
        showToast('Visite confirmée ✓')
      } else { showToast('Visite refusée') }
      setPending((prev) => prev.filter((p) => p.id !== presenceId))
      setTimeout(() => { if (merchant) loadData(merchant.id) }, 500)
    } catch (err) { console.error('Error:', err) }
  }

  const handleDeleteClient = async (clientCardId: string) => {
    setActionLoading(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      await supabase.from('client_cards').delete().eq('id', clientCardId)
      setClients((prev) => prev.filter((c) => c.id !== clientCardId))
      setConfirmDelete(null)
      showToast('Client supprimé')
      if (merchant) loadData(merchant.id)
    } catch { showToast('Erreur', 'error') }
    finally { setActionLoading(false) }
  }

  const handleDeleteCard = async (cardId: string) => {
    setActionLoading(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      await supabase.from('loyalty_cards').update({ is_active: false }).eq('id', cardId)
      setCards((prev) => prev.filter((c) => c.id !== cardId))
      setConfirmDelete(null)
      showToast('Carte supprimée')
      if (merchant) loadData(merchant.id)
    } catch { showToast('Erreur', 'error') }
    finally { setActionLoading(false) }
  }

  const handleEditCard = async () => {
    if (!editCard) return
    setActionLoading(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      const { error } = await supabase.from('loyalty_cards').update({ reward: editForm.reward, max_points: editForm.max_points, welcome_message: editForm.welcome_message, points_per_visit: editForm.points_per_visit }).eq('id', editCard.id)
      if (error) { showToast('Erreur: ' + error.message, 'error'); return }
      setEditCard(null)
      showToast('Carte modifiée ✓')
      if (merchant) loadData(merchant.id)
    } catch { showToast('Erreur', 'error') }
    finally { setActionLoading(false) }
  }

  const openEditCard = (card: any) => {
    setEditForm({ reward: card.reward || '', max_points: card.max_points || 10, welcome_message: card.welcome_message || '', points_per_visit: card.points_per_visit || 1 })
    setEditCard(card)
  }

  const handleExportPDF = async () => {
    if (!merchant) return
    setExportingPDF(true)
    try { await exportDashboardPDF({ merchantName: merchant.name, businessName: merchant.business_name || merchant.name, plan: merchant.plan || 'starter', stats, clients, cards }) }
    catch (err) { console.error(err) }
    finally { setExportingPDF(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('merchant')
    localStorage.removeItem('fidali_remember')
    sessionStorage.removeItem('merchant')
    router.push('/')
  }

  const getCardURL = (code: string) => `${typeof window !== 'undefined' ? window.location.origin : ''}/scan/${code}`
  const handleCopyLink = (code: string) => { navigator.clipboard.writeText(getCardURL(code)); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const handleShare = async (card: any) => {
    const url = getCardURL(card.code)
    if (navigator.share) { try { await navigator.share({ title: card.business_name, text: `Rejoignez ${card.business_name}`, url }) } catch {} }
    else { handleCopyLink(card.code) }
  }
  const handlePrintQR = (card: any) => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><title>${card.business_name}</title></head><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;margin:0"><h1 style="margin-bottom:4px">${card.business_name}</h1><p style="color:#666;margin-bottom:20px">Programme de fidélité</p><div style="padding:16px;border:2px solid #000;border-radius:12px"><img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getCardURL(card.code))}" width="300" height="300"/></div><p style="font-weight:bold;margin-top:12px">${card.reward}</p><script>setTimeout(()=>window.print(),500)</script></body></html>`)
    w.document.close()
  }

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return 'Maintenant'
    if (s < 3600) return `${Math.floor(s / 60)} min`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    if (s < 604800) return `${Math.floor(s / 86400)}j`
    return new Date(d).toLocaleDateString('fr-FR')
  }

  const formatActivity = (a: any) => {
    const type = a.type || ''
    const desc = a.description || ''
    const config: Record<string, { icon: string; color: string; bg: string; label: string }> = {
      'join': { icon: '👋', color: 'text-blue-600', bg: 'bg-blue-50', label: 'Nouveau client' },
      'pts': { icon: '⭐', color: 'text-amber-600', bg: 'bg-amber-50', label: 'Points ajoutés' },
      'points': { icon: '⭐', color: 'text-amber-600', bg: 'bg-amber-50', label: 'Points ajoutés' },
      'reward': { icon: '🎁', color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Récompense obtenue' },
      'review': { icon: '💬', color: 'text-violet-600', bg: 'bg-violet-50', label: 'Nouvel avis' },
      'validation': { icon: '✅', color: 'text-green-600', bg: 'bg-green-50', label: 'Visite validée' },
      'rejected': { icon: '❌', color: 'text-red-600', bg: 'bg-red-50', label: 'Visite refusée' },
      'card_created': { icon: '💳', color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Carte créée' },
      'scan': { icon: '📱', color: 'text-cyan-600', bg: 'bg-cyan-50', label: 'Scan QR' },
    }
    const c = config[type] || { icon: '📋', color: 'text-slate-600', bg: 'bg-slate-50', label: type || 'Activité' }
    return { ...c, description: desc || c.label }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold mx-auto mb-4 animate-pulse">F</div>
          <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-5 md:px-8 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-[1300px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-200">F</div>
            <div>
              <h1 className="text-[15px] font-bold text-slate-900">{merchant?.business_name}</h1>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${merchant?.plan === 'premium' ? 'bg-violet-100 text-violet-600' : merchant?.plan === 'pro' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                  {merchant?.plan || 'starter'}
                </span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> en ligne</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className={`p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition ${refreshing ? 'animate-spin' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <button onClick={handleExportPDF} disabled={exportingPDF} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition disabled:opacity-50">
              📄 {exportingPDF ? 'Export...' : 'Export PDF'}
            </button>
            {merchant?.plan !== 'premium' && (
              <button onClick={() => router.push('/dashboard/upgrade')} className="hidden md:flex px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition shadow-sm">
                ✨ Upgrade
              </button>
            )}
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* TABS */}
      <div className="bg-white border-b border-slate-200 sticky top-[61px] z-10">
        <div className="max-w-[1300px] mx-auto px-5 md:px-8 flex gap-0 overflow-x-auto">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
            { id: 'pending', label: 'Validations', icon: '🔔', count: pending.length },
            { id: 'cards', label: 'Cartes', icon: '💳', count: cards.length },
            { id: 'clients', label: 'Clients', icon: '👤', count: stats.total_clients },
            { id: 'activity', label: 'Activité', icon: '📋' },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium whitespace-nowrap border-b-2 transition ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <span className="text-sm">{tab.icon}</span> {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab.id === 'pending' && tab.count > 0 ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* MODALS */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">Supprimer ?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Voulez-vous supprimer <strong>{confirmDelete.name}</strong> ?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition">Annuler</button>
              <button onClick={() => confirmDelete.type === 'client' ? handleDeleteClient(confirmDelete.id) : handleDeleteCard(confirmDelete.id)} disabled={actionLoading} className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition disabled:opacity-50">
                {actionLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editCard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={() => setEditCard(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 mb-1">✏️ Modifier la carte</h3>
            <p className="text-sm text-slate-400 mb-5">{editCard.business_name} — {editCard.code}</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">🎁 Récompense</label>
                <input type="text" value={editForm.reward} onChange={(e) => setEditForm({ ...editForm, reward: e.target.value })} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">⭐ Points max</label>
                  <input type="number" value={editForm.max_points} onChange={(e) => setEditForm({ ...editForm, max_points: parseInt(e.target.value) || 0 })} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">📍 Points/visite</label>
                  <input type="number" value={editForm.points_per_visit} onChange={(e) => setEditForm({ ...editForm, points_per_visit: parseInt(e.target.value) || 1 })} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">💬 Message de bienvenue</label>
                <input type="text" value={editForm.welcome_message} onChange={(e) => setEditForm({ ...editForm, welcome_message: e.target.value })} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditCard(null)} className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition">Annuler</button>
              <button onClick={handleEditCard} disabled={actionLoading} className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
                {actionLoading ? 'Sauvegarde...' : '✓ Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showQR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={() => setShowQR(null)}>
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const card = cards.find((c) => c.code === showQR)
              if (!card) return null
              return (
                <>
                  <div className="text-center mb-5">
                    <h3 className="text-lg font-bold text-slate-900">{card.business_name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Scannez pour rejoindre le programme</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-8 flex items-center justify-center mb-5">
                    <QRCode value={getCardURL(card.code)} size={200} level="H" />
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 mb-5">
                    <p className="text-[11px] font-mono text-slate-500 text-center break-all">{getCardURL(card.code)}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button onClick={() => handleCopyLink(card.code)} className="py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-semibold transition">{copied ? '✓ Copié' : '📋 Copier'}</button>
                    <button onClick={() => handleShare(card)} className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-xs font-semibold transition">📤 Partager</button>
                    <button onClick={() => handlePrintQR(card)} className="py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-xl text-xs font-semibold transition">🖨 Imprimer</button>
                  </div>
                  <button onClick={() => setShowQR(null)} className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-600 transition">Fermer</button>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* CONTENT */}
      <main className="max-w-[1300px] mx-auto px-5 md:px-8 py-6">

        {/* ===== OVERVIEW ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {pending.length > 0 && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition shadow-md shadow-amber-200" onClick={() => setActiveTab('pending')}>
                <div className="flex items-center gap-3 text-white">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <p className="font-bold text-sm">{pending.length} visite{pending.length > 1 ? 's' : ''} en attente</p>
                    <p className="text-white/70 text-xs">Cliquez pour gérer</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Clients actifs', value: stats.total_clients, icon: '👤', bg: 'bg-blue-50', text: 'text-blue-600' },
                { label: 'Cartes actives', value: cards.length, icon: '💳', bg: 'bg-violet-50', text: 'text-violet-600' },
                { label: 'Points distribués', value: stats.total_points, icon: '⭐', bg: 'bg-amber-50', text: 'text-amber-600' },
                { label: 'Récompenses', value: stats.total_rewards, icon: '🎁', bg: 'bg-emerald-50', text: 'text-emerald-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-lg`}>{s.icon}</div>
                  </div>
                  <p className={`text-3xl font-extrabold ${s.text}`}>{s.value.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Cards + Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">💳 Mes cartes de fidélité</h3>
                  <button onClick={() => setActiveTab('cards')} className="text-xs text-indigo-600 hover:underline font-medium">Voir tout →</button>
                </div>

                {cards.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
                    <p className="text-4xl mb-3">💳</p>
                    <p className="text-slate-800 font-bold mb-1">Créez votre première carte</p>
                    <p className="text-slate-400 text-xs mb-5">Personnalisez et partagez votre programme</p>
                    <button onClick={() => router.push('/dashboard/create-card')} className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200">+ Créer une carte</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cards.map((card) => {
                      const cc = clients.filter((c) => c.card_id === card.id)
                      return (
                        <div key={card.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition">
                          <div className="flex">
                            <div className="flex-1 p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${card.color1 || '#4f46e5'}, ${card.color2 || '#7c3aed'})` }}>
                              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                              <div className="relative z-10 text-white">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <p className="text-[9px] text-white/40 uppercase tracking-[0.15em] font-semibold">Fidélité</p>
                                    <h4 className="font-bold text-base">{card.business_name}</h4>
                                    <p className="text-white/40 text-[10px] font-mono mt-0.5">{card.code}</p>
                                  </div>
                                  <span className="text-[11px] bg-white/20 backdrop-blur px-2.5 py-1 rounded-lg font-bold">{card.max_points} pts</span>
                                </div>
                                <div className="flex gap-[3px] mb-2">
                                  {Array.from({ length: Math.min(card.max_points, 12) }).map((_, i) => (
                                    <div key={i} className="flex-1 h-[6px] rounded-full bg-white/20" />
                                  ))}
                                </div>
                                <p className="text-white/60 text-xs">🎁 {card.reward}</p>
                              </div>
                            </div>
                            <div className="w-[130px] bg-white flex flex-col items-center justify-center p-3 gap-2">
                              <div className="cursor-pointer hover:opacity-80 transition" onClick={() => setShowQR(card.code)}>
                                <QRCode value={getCardURL(card.code)} size={72} level="M" />
                              </div>
                              <div className="flex gap-1 w-full">
                                <button onClick={() => handleCopyLink(card.code)} className="flex-1 py-1 bg-slate-50 hover:bg-slate-100 rounded text-[9px] font-semibold text-slate-500 transition">Copier</button>
                                <button onClick={() => handleShare(card)} className="flex-1 py-1 bg-slate-50 hover:bg-slate-100 rounded text-[9px] font-semibold text-slate-500 transition">Partager</button>
                              </div>
                            </div>
                          </div>
                          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex gap-5 text-xs text-slate-400">
                              <span><strong className="text-slate-700">{cc.length}</strong> clients</span>
                              <span><strong className="text-slate-700">{cc.reduce((s: number, c: any) => s + (c.points || 0), 0)}</strong> pts</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => openEditCard(card)} className="px-2.5 py-1 text-[10px] text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-semibold">✏️ Modifier</button>
                              <button onClick={() => setConfirmDelete({ type: 'card', id: card.id, name: card.business_name })} className="px-2.5 py-1 text-[10px] text-red-500 hover:bg-red-50 rounded-lg transition font-semibold">🗑 Supprimer</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <button onClick={() => router.push('/dashboard/create-card')} className="w-full py-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition font-semibold">+ Nouvelle carte</button>
                  </div>
                )}
              </div>

              {/* Activité */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">📋 Activité récente</h3>
                  <button onClick={() => setActiveTab('activity')} className="text-xs text-indigo-600 hover:underline font-medium">Tout →</button>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                  {activities.length === 0 ? (
                    <p className="p-8 text-center text-xs text-slate-400">Aucune activité pour le moment</p>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {activities.slice(0, 10).map((a, i) => {
                        const f = formatActivity(a)
                        return (
                          <div key={i} className="px-4 py-3 hover:bg-slate-50/50 transition flex items-center gap-3">
                            <div className={`w-8 h-8 ${f.bg} rounded-lg flex items-center justify-center text-sm flex-shrink-0`}>
                              {f.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-700 truncate">{f.description}</p>
                              <p className="text-[10px] text-slate-300 mt-0.5">{timeAgo(a.created_at)}</p>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${f.bg} ${f.color}`}>
                              {f.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top clients */}
            {clients.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">🏆 Meilleurs clients</h3>
                  <button onClick={() => setActiveTab('clients')} className="text-xs text-indigo-600 hover:underline font-medium">Tous →</button>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                  {[...clients].sort((a: any, b: any) => (b.points || 0) - (a.points || 0)).slice(0, 5).map((cc, i) => {
                    const maxPts = cc.loyalty_cards?.max_points || 10
                    const pct = Math.min(((cc.points || 0) / maxPts) * 100, 100)
                    const colors = ['bg-amber-400', 'bg-slate-400', 'bg-orange-400', 'bg-indigo-300', 'bg-slate-300']
                    return (
                      <div key={cc.id || i} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition">
                        <div className={`w-7 h-7 ${colors[i] || 'bg-slate-200'} rounded-full flex items-center justify-center text-[10px] font-bold text-white`}>{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{cc.clients?.name || cc.client_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-[6px] bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                              <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-gradient-to-r from-amber-400 to-yellow-400' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500">{cc.points}/{maxPts}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-700">{cc.total_rewards_redeemed || 0}</span>
                          <p className="text-[9px] text-slate-300">récomp.</p>
                        </div>
                        {pct >= 100 && <span className="text-base">🎁</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: '💳', label: 'Nouvelle carte', bg: 'bg-indigo-50 hover:bg-indigo-100', text: 'text-indigo-600', action: () => router.push('/dashboard/create-card') },
                { icon: '📄', label: 'Export PDF', bg: 'bg-emerald-50 hover:bg-emerald-100', text: 'text-emerald-600', action: handleExportPDF },
                { icon: '📱', label: 'Voir QR Code', bg: 'bg-violet-50 hover:bg-violet-100', text: 'text-violet-600', action: () => cards.length > 0 ? setShowQR(cards[0].code) : null },
                { icon: '✨', label: 'Upgrader', bg: 'bg-amber-50 hover:bg-amber-100', text: 'text-amber-600', action: () => router.push('/dashboard/upgrade') },
              ].map((a, i) => (
                <button key={i} onClick={a.action} className={`${a.bg} ${a.text} p-4 rounded-2xl text-center transition hover:shadow-sm`}>
                  <span className="text-xl block mb-1">{a.icon}</span>
                  <span className="text-xs font-semibold">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== PENDING ===== */}
        {activeTab === 'pending' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">🔔 Visites en attente</h2>
              <button onClick={handleRefresh} className="text-xs text-indigo-600 hover:underline font-medium">Rafraîchir</button>
            </div>
            {pending.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                <p className="text-3xl mb-3">✅</p>
                <p className="text-slate-700 font-bold text-sm">Tout est à jour</p>
                <p className="text-slate-400 text-xs mt-1">Aucune visite en attente</p>
              </div>
            ) : (
              pending.map((p) => (
                <div key={p.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-amber-200">
                        {(p.clients?.name || p.client_name || '?')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{p.clients?.name || p.client_name}</p>
                        <p className="text-[11px] text-slate-400">{p.clients?.phone || p.client_phone} · {p.loyalty_cards?.business_name} · {timeAgo(p.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handlePresence(p.id, 'validated')} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 transition shadow-sm shadow-emerald-200">✓ Confirmer</button>
                      <button onClick={() => handlePresence(p.id, 'rejected')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-red-50 hover:text-red-500 transition">✕ Refuser</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ===== CARDS ===== */}
        {activeTab === 'cards' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">💳 Mes cartes</h2>
              <button onClick={() => router.push('/dashboard/create-card')} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-200">+ Nouvelle carte</button>
            </div>
            {cards.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                <p className="text-4xl mb-3">💳</p>
                <p className="text-slate-800 font-bold text-base mb-1">Aucune carte</p>
                <p className="text-slate-400 text-xs mb-5">Créez votre première carte de fidélité</p>
                <button onClick={() => router.push('/dashboard/create-card')} className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition">Créer une carte</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {cards.map((card) => {
                  const cc = clients.filter((c) => c.card_id === card.id)
                  const totalPts = cc.reduce((s: number, c: any) => s + (c.points || 0), 0)
                  const totalRew = cc.reduce((s: number, c: any) => s + (c.total_rewards_redeemed || 0), 0)
                  return (
                    <div key={card.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition">
                      <div className="p-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${card.color1 || '#4f46e5'}, ${card.color2 || '#7c3aed'})` }}>
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                        <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/[0.05] rounded-full" />
                        <div className="relative z-10 text-white">
                          <div className="flex justify-between items-start mb-5">
                            <div>
                              <p className="text-[9px] text-white/40 uppercase tracking-[0.15em] font-semibold">Carte de fidélité</p>
                              <h3 className="font-bold text-lg mt-0.5">{card.business_name}</h3>
                            </div>
                            <span className="text-xs bg-white/20 backdrop-blur px-2.5 py-1 rounded-lg font-bold">{card.max_points} pts</span>
                          </div>
                          <div className="flex gap-[4px] mb-3">
                            {Array.from({ length: Math.min(card.max_points, 15) }).map((_, i) => (
                              <div key={i} className="flex-1 h-2 rounded-full bg-white/20" />
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-white/60 text-xs">🎁 {card.reward}</p>
                            <p className="text-white/30 text-[10px] font-mono">{card.code}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex gap-4 mb-4">
                          <div className="cursor-pointer hover:opacity-80 transition" onClick={() => setShowQR(card.code)}>
                            <QRCode value={getCardURL(card.code)} size={82} level="M" />
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            {[
                              { v: cc.length, l: 'Clients', c: 'text-blue-600 bg-blue-50' },
                              { v: totalPts, l: 'Points', c: 'text-amber-600 bg-amber-50' },
                              { v: totalRew, l: 'Récomp.', c: 'text-emerald-600 bg-emerald-50' },
                              { v: card.points_per_visit || 1, l: 'Pts/visite', c: 'text-violet-600 bg-violet-50' },
                            ].map((st, j) => (
                              <div key={j} className={`${st.c} rounded-xl p-2 text-center`}>
                                <p className="text-lg font-extrabold">{st.v}</p>
                                <p className="text-[9px] opacity-70">{st.l}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <button onClick={() => handleCopyLink(card.code)} className="py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 transition">{copied ? '✓ Copié' : '📋 Copier'}</button>
                          <button onClick={() => handleShare(card)} className="py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 transition">📤 Partager</button>
                          <button onClick={() => handlePrintQR(card)} className="py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 transition">🖨 Imprimer</button>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-slate-100">
                          <button onClick={() => openEditCard(card)} className="flex-1 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition">✏️ Modifier</button>
                          <button onClick={() => setConfirmDelete({ type: 'card', id: card.id, name: card.business_name })} className="flex-1 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-xl transition">🗑 Supprimer</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== CLIENTS ===== */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800">👤 Clients ({stats.total_clients})</h2>
            {clients.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                <p className="text-3xl mb-3">👤</p>
                <p className="text-slate-700 font-bold text-sm">Aucun client</p>
                <p className="text-slate-400 text-xs mt-1">Vos clients apparaîtront ici</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left text-[11px] font-semibold text-slate-400 px-5 py-3">Client</th>
                      <th className="text-left text-[11px] font-semibold text-slate-400 px-5 py-3 hidden md:table-cell">Carte</th>
                      <th className="text-left text-[11px] font-semibold text-slate-400 px-5 py-3">Progression</th>
                      <th className="text-center text-[11px] font-semibold text-slate-400 px-5 py-3">Récomp.</th>
                      <th className="text-right text-[11px] font-semibold text-slate-400 px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...clients].sort((a: any, b: any) => (b.points || 0) - (a.points || 0)).map((cc, i) => {
                      const maxPts = cc.loyalty_cards?.max_points || 10
                      const pct = Math.min(((cc.points || 0) / maxPts) * 100, 100)
                      return (
                        <tr key={cc.id || i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                {(cc.clients?.name || cc.client_name || '?')[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-800">{cc.clients?.name || cc.client_name}</p>
                                <p className="text-[10px] text-slate-400">{cc.clients?.phone || cc.client_phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-500 hidden md:table-cell">{cc.loyalty_cards?.business_name}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-[6px] bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${pct >= 100 ? 'bg-amber-400' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[11px] font-semibold text-slate-500">{cc.points}/{maxPts}</span>
                              {pct >= 100 && <span className="text-xs">🎁</span>}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-center text-xs font-bold text-slate-700">{cc.total_rewards_redeemed || 0}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button onClick={() => setConfirmDelete({ type: 'client', id: cc.id, name: cc.clients?.name || cc.client_name || 'ce client' })} className="px-3 py-1 text-[10px] font-semibold text-red-500 hover:bg-red-50 rounded-lg transition">Supprimer</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== ACTIVITY ===== */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">📋 Historique ({activities.length})</h2>
              <button onClick={handleRefresh} className="text-xs text-indigo-600 hover:underline font-medium">Rafraîchir</button>
            </div>

            {activities.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                <p className="text-3xl mb-3">📋</p>
                <p className="text-slate-700 font-bold text-sm">Aucune activité</p>
                <p className="text-slate-400 text-xs mt-1">L&apos;historique apparaîtra ici</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.map((a, i) => {
                  const f = formatActivity(a)
                  const prevDate = i > 0 ? new Date(activities[i - 1].created_at).toDateString() : null
                  const currentDate = new Date(a.created_at).toDateString()
                  const showDate = i === 0 || currentDate !== prevDate

                  return (
                    <div key={i}>
                      {showDate && (
                        <div className="flex items-center gap-3 py-3">
                          <div className="h-px bg-slate-200 flex-1" />
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {new Date(a.created_at).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                            })}
                          </span>
                          <div className="h-px bg-slate-200 flex-1" />
                        </div>
                      )}

                      <div className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md transition flex items-center gap-4">
                        <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
                          {f.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 font-medium leading-snug">
                            {f.description}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(a.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' · '}
                            {timeAgo(a.created_at)}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ${f.bg} ${f.color}`}>
                          {f.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </main>
          {/* ===== BULLE CONTACT ADMIN ===== */}
      {(() => {
        const [showContact, setShowContact] = useState(false)
        const [contactForm, setContactForm] = useState({ subject: '', message: '' })
        const [contactSending, setContactSending] = useState(false)
        const [contactSent, setContactSent] = useState(false)

        const handleSendMessage = async () => {
          if (!contactForm.subject.trim() || !contactForm.message.trim()) return
          setContactSending(true)
          try {
            const { supabase } = await import('@/database/supabase-client')
            await supabase.from('messages').insert({
              merchant_id: merchant?.id,
              merchant_name: merchant?.business_name || merchant?.name,
              merchant_email: merchant?.email,
              subject: contactForm.subject.trim(),
              message: contactForm.message.trim(),
            })
            setContactSent(true)
            setContactForm({ subject: '', message: '' })
          } catch (err) {
            console.error(err)
          } finally {
            setContactSending(false)
          }
        }

        return (
          <>
            {/* Bulle flottante */}
            <button
              onClick={() => { setShowContact(true); setContactSent(false) }}
              className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            {/* Petit label */}
            <div className="fixed bottom-[88px] right-6 z-30 bg-slate-800 text-white text-[10px] font-medium px-3 py-1.5 rounded-lg shadow-lg pointer-events-none opacity-0 hover:opacity-100 transition">
              Besoin d&apos;aide ?
            </div>

            {/* Modal contact */}
            {showContact && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowContact(false)}>
                <div className="bg-white rounded-2xl sm:rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>

                  {contactSent ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Message envoyé !</h3>
                      <p className="text-sm text-slate-400 mb-6">Nous vous répondrons dans les plus brefs délais</p>
                      <button onClick={() => setShowContact(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition">
                        Fermer
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-slate-900">Contactez-nous</h3>
                              <p className="text-xs text-slate-400">Support Fidali</p>
                            </div>
                          </div>
                          <button onClick={() => setShowContact(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Sujet</label>
                          <select
                            value={contactForm.subject}
                            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                          >
                            <option value="">Choisir un sujet...</option>
                            <option value="Problème technique">🔧 Problème technique</option>
                            <option value="Question sur mon abonnement">💰 Question sur mon abonnement</option>
                            <option value="Demande de fonctionnalité">💡 Demande de fonctionnalité</option>
                            <option value="Signaler un bug">🐛 Signaler un bug</option>
                            <option value="Aide utilisation">❓ Aide utilisation</option>
                            <option value="Autre">📋 Autre</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Votre message</label>
                          <textarea
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            placeholder="Décrivez votre problème ou question..."
                            rows={4}
                            maxLength={1000}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                          />
                          <p className="text-[10px] text-slate-300 text-right mt-1">{contactForm.message.length}/1000</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                          <span className="text-lg">👤</span>
                          <div>
                            <p className="text-xs font-semibold text-slate-700">{merchant?.business_name}</p>
                            <p className="text-[10px] text-slate-400">{merchant?.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 pt-0">
                        <button
                          onClick={handleSendMessage}
                          disabled={contactSending || !contactForm.subject || !contactForm.message.trim()}
                          className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-200 text-sm"
                        >
                          {contactSending ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Envoi...
                            </span>
                          ) : (
                            '📤 Envoyer le message'
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )
      })()}
    </div>
  )
}
