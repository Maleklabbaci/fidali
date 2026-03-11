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
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    if (!merchant || refreshing) return
    setRefreshing(true)
    loadData(merchant.id)
  }

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
        showToast('Visite confirmée')
      } else {
        showToast('Visite refusée')
      }
      setPending((prev) => prev.filter((p) => p.id !== presenceId))
      setTimeout(() => { if (merchant) loadData(merchant.id) }, 500)
    } catch (err) {
      console.error('Error:', err)
    }
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
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error')
    } finally {
      setActionLoading(false)
    }
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
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditCard = async () => {
    if (!editCard) return
    setActionLoading(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      const { error } = await supabase.from('loyalty_cards').update({
        reward: editForm.reward,
        max_points: editForm.max_points,
        welcome_message: editForm.welcome_message,
        points_per_visit: editForm.points_per_visit,
      }).eq('id', editCard.id)
      if (error) { showToast('Erreur: ' + error.message, 'error'); return }
      setEditCard(null)
      showToast('Carte modifiée')
      if (merchant) loadData(merchant.id)
    } catch (err) {
      showToast('Erreur lors de la modification', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const openEditCard = (card: any) => {
    setEditForm({
      reward: card.reward || '',
      max_points: card.max_points || 10,
      welcome_message: card.welcome_message || '',
      points_per_visit: card.points_per_visit || 1,
    })
    setEditCard(card)
  }

  const handleExportPDF = async () => {
    if (!merchant) return
    setExportingPDF(true)
    try {
      await exportDashboardPDF({ merchantName: merchant.name, businessName: merchant.business_name || merchant.name, plan: merchant.plan || 'starter', stats, clients, cards })
    } catch (err) { console.error(err) }
    finally { setExportingPDF(false) }
  }

  const handleLogout = () => {
  localStorage.removeItem('merchant')
  localStorage.removeItem('fidali_remember')
  sessionStorage.removeItem('merchant')
  router.push('/')
}

  const handleShare = async (card: any) => {
    const url = getCardURL(card.code)
    if (navigator.share) {
      try { await navigator.share({ title: card.business_name, text: `Rejoignez le programme fidélité de ${card.business_name}`, url }) } catch {}
    } else { handleCopyLink(card.code) }
  }

  const handlePrintQR = (card: any) => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><title>${card.business_name}</title></head><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;margin:0"><h1 style="font-size:24px;margin-bottom:4px">${card.business_name}</h1><p style="color:#666;margin-bottom:20px">Programme de fidélité</p><div style="padding:16px;border:2px solid #000;border-radius:12px"><img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getCardURL(card.code))}" width="300" height="300"/></div><p style="color:#999;margin-top:12px;font-size:14px">Scannez pour rejoindre</p><p style="font-weight:bold;margin-top:8px">${card.reward}</p><script>setTimeout(()=>window.print(),500)</script></body></html>`)
    w.document.close()
  }

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return 'Maintenant'
    if (s < 3600) return `${Math.floor(s / 60)}min`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    if (s < 604800) return `${Math.floor(s / 86400)}j`
    return new Date(d).toLocaleDateString('fr-FR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb]">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-top ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">F</div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-gray-900">{merchant?.business_name}</h1>
              <p className="text-[11px] text-gray-400">{merchant?.plan === 'premium' ? 'Premium' : merchant?.plan === 'pro' ? 'Pro' : 'Starter'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={handleRefresh} className={`px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition ${refreshing ? 'animate-spin' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <button onClick={handleExportPDF} disabled={exportingPDF} className="hidden md:block px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition disabled:opacity-50">
              {exportingPDF ? 'Export...' : 'Exporter PDF'}
            </button>
            {merchant?.plan !== 'premium' && (
              <button onClick={() => router.push('/dashboard/upgrade')} className="hidden md:block px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-md transition font-medium">
                Upgrade
              </button>
            )}
            <button onClick={handleLogout} className="px-3 py-1.5 text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* TABS */}
      <div className="bg-white border-b border-gray-200 sticky top-[49px] z-10">
        <div className="max-w-[1400px] mx-auto px-6 flex gap-0">
          {[
            { id: 'overview', label: 'Vue d\'ensemble' },
            { id: 'pending', label: 'Validations', count: pending.length },
            { id: 'cards', label: 'Cartes', count: cards.length },
            { id: 'clients', label: 'Clients', count: stats.total_clients },
            { id: 'activity', label: 'Activité' },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${tab.id === 'pending' && tab.count > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{confirmDelete.name}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium">Annuler</button>
              <button
                onClick={() => confirmDelete.type === 'client' ? handleDeleteClient(confirmDelete.id) : handleDeleteCard(confirmDelete.id)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CARD MODAL */}
      {editCard && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={() => setEditCard(null)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Modifier la carte</h3>
            <p className="text-sm text-gray-400 mb-5">{editCard.business_name} — {editCard.code}</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Récompense</label>
                <input type="text" value={editForm.reward} onChange={(e) => setEditForm({ ...editForm, reward: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Points max</label>
                  <input type="number" value={editForm.max_points} onChange={(e) => setEditForm({ ...editForm, max_points: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Points / visite</label>
                  <input type="number" value={editForm.points_per_visit} onChange={(e) => setEditForm({ ...editForm, points_per_visit: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Message de bienvenue</label>
                <input type="text" value={editForm.welcome_message} onChange={(e) => setEditForm({ ...editForm, welcome_message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setEditCard(null)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium">Annuler</button>
              <button onClick={handleEditCard} disabled={actionLoading} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
                {actionLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={() => setShowQR(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const card = cards.find((c) => c.code === showQR)
              if (!card) return null
              return (
                <>
                  <div className="text-center mb-4">
                    <h3 className="text-base font-semibold text-gray-900">{card.business_name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Scannez pour rejoindre</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center mb-4">
                    <QRCode value={getCardURL(card.code)} size={200} level="H" />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 mb-4">
                    <p className="text-xs font-mono text-gray-500 text-center break-all">{getCardURL(card.code)}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <button onClick={() => handleCopyLink(card.code)} className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition">{copied ? 'Copié !' : 'Copier'}</button>
                    <button onClick={() => handleShare(card)} className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition">Partager</button>
                    <button onClick={() => handlePrintQR(card)} className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition">Imprimer</button>
                  </div>
                  <button onClick={() => setShowQR(null)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition">Fermer</button>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* CONTENT */}
      <main className="max-w-[1400px] mx-auto px-6 py-6">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {pending.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition" onClick={() => setActiveTab('pending')}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <p className="text-sm font-medium text-amber-800">{pending.length} visite{pending.length > 1 ? 's' : ''} en attente de validation</p>
                </div>
                <span className="text-xs text-amber-600 font-medium">Voir &rarr;</span>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Clients', value: stats.total_clients, sub: 'actifs', color: 'text-blue-600' },
                { label: 'Cartes', value: cards.length, sub: 'actives', color: 'text-violet-600' },
                { label: 'Points distribués', value: stats.total_points, sub: 'au total', color: 'text-amber-600' },
                { label: 'Récompenses', value: stats.total_rewards, sub: 'distribuées', color: 'text-emerald-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
                  <p className="text-[11px] text-gray-300 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Cartes */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Cartes de fidélité</h3>
                  <button onClick={() => setActiveTab('cards')} className="text-xs text-blue-600 hover:underline">Voir tout</button>
                </div>

                {cards.length === 0 ? (
                  <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-400 text-sm mb-3">Aucune carte créée</p>
                    <button onClick={() => router.push('/dashboard/create-card')} className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition">Créer une carte</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cards.map((card) => {
                      const cc = clients.filter((c) => c.card_id === card.id)
                      return (
                        <div key={card.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="flex">
                            <div className="flex-1 p-4" style={{ background: `linear-gradient(135deg, ${card.color1 || '#1e3a5f'}, ${card.color2 || '#2d5a87'})` }}>
                              <div className="flex items-start justify-between text-white mb-3">
                                <div>
                                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Fidélité</p>
                                  <h4 className="font-semibold">{card.business_name}</h4>
                                  <p className="text-white/40 text-[10px] font-mono mt-0.5">{card.code}</p>
                                </div>
                                <span className="text-xs bg-white/15 px-2 py-0.5 rounded">{card.max_points} pts</span>
                              </div>
                              <div className="flex gap-[3px]">
                                {Array.from({ length: Math.min(card.max_points, 15) }).map((_, i) => (
                                  <div key={i} className="flex-1 h-1.5 rounded-full bg-white/15" />
                                ))}
                              </div>
                              <p className="text-white/60 text-xs mt-2">{card.reward}</p>
                            </div>
                            <div className="w-[120px] bg-white flex flex-col items-center justify-center p-3 gap-2 border-l border-gray-100">
                              <div className="cursor-pointer hover:opacity-80 transition" onClick={() => setShowQR(card.code)}>
                                <QRCode value={getCardURL(card.code)} size={70} level="M" />
                              </div>
                              <div className="flex gap-1 w-full">
                                <button onClick={() => handleCopyLink(card.code)} className="flex-1 py-1 bg-gray-50 hover:bg-gray-100 rounded text-[9px] font-medium text-gray-500 transition">Copier</button>
                                <button onClick={() => handleShare(card)} className="flex-1 py-1 bg-gray-50 hover:bg-gray-100 rounded text-[9px] font-medium text-gray-500 transition">Partager</button>
                              </div>
                            </div>
                          </div>
                          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex gap-4 text-xs text-gray-400">
                              <span><strong className="text-gray-700">{cc.length}</strong> clients</span>
                              <span><strong className="text-gray-700">{cc.reduce((s: number, c: any) => s + (c.points || 0), 0)}</strong> pts</span>
                              <span><strong className="text-gray-700">{card.points_per_visit || 1}</strong> pt/visite</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => openEditCard(card)} className="px-2 py-1 text-[10px] text-blue-600 hover:bg-blue-50 rounded transition font-medium">Modifier</button>
                              <button onClick={() => setConfirmDelete({ type: 'card', id: card.id, name: card.business_name })} className="px-2 py-1 text-[10px] text-red-500 hover:bg-red-50 rounded transition font-medium">Supprimer</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <button onClick={() => router.push('/dashboard/create-card')} className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-xs text-gray-400 hover:text-blue-600 hover:border-blue-300 transition font-medium">+ Nouvelle carte</button>
                  </div>
                )}
              </div>

              {/* Activité */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Activité récente</h3>
                  <button onClick={() => setActiveTab('activity')} className="text-xs text-blue-600 hover:underline">Tout</button>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {activities.length === 0 ? (
                    <p className="p-6 text-center text-xs text-gray-400">Aucune activité</p>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {activities.slice(0, 10).map((a, i) => (
                        <div key={i} className="px-4 py-2.5 hover:bg-gray-50 transition">
                          <p className="text-xs text-gray-700 leading-snug">{a.description || a.type}</p>
                          <p className="text-[10px] text-gray-300 mt-0.5">{timeAgo(a.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top clients */}
            {clients.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Top clients</h3>
                  <button onClick={() => setActiveTab('clients')} className="text-xs text-blue-600 hover:underline">Voir tout</button>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-[11px] font-medium text-gray-400 px-4 py-2.5">#</th>
                        <th className="text-left text-[11px] font-medium text-gray-400 px-4 py-2.5">Client</th>
                        <th className="text-left text-[11px] font-medium text-gray-400 px-4 py-2.5 hidden md:table-cell">Carte</th>
                        <th className="text-left text-[11px] font-medium text-gray-400 px-4 py-2.5">Progression</th>
                        <th className="text-right text-[11px] font-medium text-gray-400 px-4 py-2.5">Récomp.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...clients].sort((a: any, b: any) => (b.points || 0) - (a.points || 0)).slice(0, 5).map((cc, i) => {
                        const maxPts = cc.loyalty_cards?.max_points || 10
                        const pct = Math.min(((cc.points || 0) / maxPts) * 100, 100)
                        return (
                          <tr key={cc.id || i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                            <td className="px-4 py-2.5 text-xs text-gray-300 font-medium">{i + 1}</td>
                            <td className="px-4 py-2.5">
                              <p className="text-xs font-medium text-gray-900">{cc.clients?.name || cc.client_name}</p>
                              <p className="text-[10px] text-gray-400">{cc.clients?.phone || cc.client_phone}</p>
                            </td>
                            <td className="px-4 py-2.5 text-xs text-gray-500 hidden md:table-cell">{cc.loyalty_cards?.business_name}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${pct >= 100 ? 'bg-amber-400' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[11px] font-medium text-gray-500">{cc.points}/{maxPts}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-right text-xs font-medium text-gray-700">{cc.total_rewards_redeemed || 0}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PENDING */}
        {activeTab === 'pending' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Visites en attente</h2>
              <button onClick={handleRefresh} className="text-xs text-blue-600 hover:underline">Rafraîchir</button>
            </div>
            {pending.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
                <p className="text-gray-400 text-sm">Aucune visite en attente</p>
              </div>
            ) : (
              pending.map((p) => (
                <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                        {(p.clients?.name || p.client_name || '?')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.clients?.name || p.client_name}</p>
                        <p className="text-[11px] text-gray-400">{p.clients?.phone || p.client_phone} · {p.loyalty_cards?.business_name} · {timeAgo(p.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handlePresence(p.id, 'validated')} className="px-4 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-medium hover:bg-emerald-700 transition">Confirmer</button>
                      <button onClick={() => handlePresence(p.id, 'rejected')} className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium hover:bg-red-50 hover:text-red-600 transition">Refuser</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CARDS */}
        {activeTab === 'cards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Cartes de fidélité</h2>
              <button onClick={() => router.push('/dashboard/create-card')} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition">+ Nouvelle carte</button>
            </div>
            {cards.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center">
                <p className="text-gray-900 font-medium mb-1">Aucune carte</p>
                <p className="text-gray-400 text-xs mb-4">Créez votre première carte de fidélité</p>
                <button onClick={() => router.push('/dashboard/create-card')} className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition">Créer une carte</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {cards.map((card) => {
                  const cc = clients.filter((c) => c.card_id === card.id)
                  const totalPts = cc.reduce((s: number, c: any) => s + (c.points || 0), 0)
                  const totalRew = cc.reduce((s: number, c: any) => s + (c.total_rewards_redeemed || 0), 0)
                  return (
                    <div key={card.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-5 relative" style={{ background: `linear-gradient(135deg, ${card.color1 || '#1e3a5f'}, ${card.color2 || '#2d5a87'})` }}>
                        <div className="flex items-start justify-between text-white mb-4">
                          <div>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Carte de fidélité</p>
                            <h3 className="font-semibold text-lg mt-0.5">{card.business_name}</h3>
                          </div>
                          <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full font-medium">{card.max_points} pts</span>
                        </div>
                        <div className="flex gap-[3px] mb-3">
                          {Array.from({ length: Math.min(card.max_points, 15) }).map((_, i) => (
                            <div key={i} className="flex-1 h-2 rounded-full bg-white/15" />
                          ))}
                        </div>
                        <div className="flex justify-between text-white/60 text-xs">
                          <span>{card.reward}</span>
                          <span className="font-mono text-white/30">{card.code}</span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex gap-3 mb-4">
                          <div className="cursor-pointer hover:opacity-80 transition" onClick={() => setShowQR(card.code)}>
                            <QRCode value={getCardURL(card.code)} size={80} level="M" />
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                              <p className="text-lg font-bold text-gray-900">{cc.length}</p>
                              <p className="text-[10px] text-gray-400">Clients</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                              <p className="text-lg font-bold text-gray-900">{totalPts}</p>
                              <p className="text-[10px] text-gray-400">Points</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                              <p className="text-lg font-bold text-gray-900">{totalRew}</p>
                              <p className="text-[10px] text-gray-400">Récomp.</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                              <p className="text-lg font-bold text-gray-900">{card.points_per_visit || 1}</p>
                              <p className="text-[10px] text-gray-400">Pts/visite</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleCopyLink(card.code)} className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-600 transition">{copied ? 'Copié !' : 'Copier lien'}</button>
                          <button onClick={() => handleShare(card)} className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-600 transition">Partager</button>
                          <button onClick={() => handlePrintQR(card)} className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-600 transition">Imprimer</button>
                        </div>
                        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                          <button onClick={() => openEditCard(card)} className="flex-1 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition">Modifier</button>
                          <button onClick={() => setConfirmDelete({ type: 'card', id: card.id, name: card.business_name })} className="flex-1 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition">Supprimer</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* CLIENTS */}
        {activeTab === 'clients' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Clients ({stats.total_clients})</h2>
            </div>
            {clients.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
                <p className="text-gray-400 text-sm">Aucun client</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-[11px] font-medium text-gray-400 px-4 py-2.5">Client</th>
                      <th className="text-left text-[11px] font-medium text-gray-400 px-4 py-2.5 hidden md:table-cell">Carte</th>
                      <th className="text-left text-[11px] font-medium text-gray-400 px-4 py-2.5">Points</th>
                      <th className="text-center text-[11px] font-medium text-gray-400 px-4 py-2.5">Récomp.</th>
                      <th className="text-right text-[11px] font-medium text-gray-400 px-4 py-2.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...clients].sort((a: any, b: any) => (b.points || 0) - (a.points || 0)).map((cc, i) => {
                      const maxPts = cc.loyalty_cards?.max_points || 10
                      const pct = Math.min(((cc.points || 0) / maxPts) * 100, 100)
                      return (
                        <tr key={cc.id || i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-500">
                                {(cc.clients?.name || cc.client_name || '?')[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-900">{cc.clients?.name || cc.client_name}</p>
                                <p className="text-[10px] text-gray-400">{cc.clients?.phone || cc.client_phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{cc.loyalty_cards?.business_name}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${pct >= 100 ? 'bg-amber-400' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[11px] font-medium text-gray-500">{cc.points}/{maxPts}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-xs font-medium text-gray-700">{cc.total_rewards_redeemed || 0}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setConfirmDelete({ type: 'client', id: cc.id, name: cc.clients?.name || cc.client_name || 'ce client' })}
                              className="px-2.5 py-1 text-[10px] font-medium text-red-500 hover:bg-red-50 rounded transition"
                            >
                              Supprimer
                            </button>
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

        {/* ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Historique d&apos;activité</h2>
              <button onClick={handleRefresh} className="text-xs text-blue-600 hover:underline">Rafraîchir</button>
            </div>
            {activities.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
                <p className="text-gray-400 text-sm">Aucune activité</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-50">
                {activities.map((a, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-gray-50 transition flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-700">{a.description || a.type}</p>
                      <p className="text-[10px] text-gray-300 mt-0.5">{timeAgo(a.created_at)}</p>
                    </div>
                    <span className="text-[10px] font-medium text-gray-300 bg-gray-50 px-2 py-0.5 rounded">{a.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
