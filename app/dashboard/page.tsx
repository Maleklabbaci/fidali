'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import { LanguageSwitcher, useTranslation } from '@/components/LanguageSwitcher'
import { ThemePicker } from '@/components/ThemePicker'
import { exportDashboardPDF } from '@/lib/export-pdf'
import { loadTheme, getTheme, applyTheme } from '@/lib/themes'

export default function DashboardPage() {
  const router = useRouter()
  const { t, locale, isRTL } = useTranslation()

  const [merchant, setMerchant] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [pending, setPending] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [stats, setStats] = useState({ total_clients: 0, total_points: 0, total_rewards: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showSettings, setShowSettings] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showQR, setShowQR] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const savedTheme = loadTheme()
    applyTheme(getTheme(savedTheme))
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)
    loadData(m.id)
    const interval = setInterval(() => loadData(m.id), 30000)
    return () => clearInterval(interval)
  }, [router])

  const loadData = async (merchantId: string) => {
    try {
      const { supabase } = await import('@/database/supabase-client')

      const { data: cardsData } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      const cardIds = (cardsData || []).map((c: any) => c.id)

      let clientCardsData: any[] = []
      if (cardIds.length > 0) {
        const { data } = await supabase
          .from('client_cards')
          .select('*, clients(*), loyalty_cards(*)')
          .in('card_id', cardIds)
        clientCardsData = data || []
      }

      let pendingData: any[] = []
      if (cardIds.length > 0) {
        const { data } = await supabase
          .from('pending_presences')
          .select('*, clients(*), loyalty_cards(*)')
          .in('card_id', cardIds)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
        pendingData = data || []
      }

      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(30)

      setCards(cardsData || [])
      setClients(clientCardsData)
      setPending(pendingData)
      setActivities(activitiesData || [])

      const totalClients = new Set(clientCardsData.map((c: any) => c.client_id)).size
      const totalPoints = clientCardsData.reduce((sum: number, c: any) => sum + (c.points || 0), 0)
      const totalRewards = clientCardsData.reduce((sum: number, c: any) => sum + (c.total_rewards_redeemed || 0), 0)
      setStats({ total_clients: totalClients, total_points: totalPoints, total_rewards: totalRewards })
    } catch (err) {
      console.error('Error loading data:', err)
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
      const { supabase } = await import('@/database/supabase-client')
      const presence = pending.find((p) => p.id === presenceId)
      if (!presence) return

      await supabase
        .from('pending_presences')
        .update({ status: action })
        .eq('id', presenceId)

      if (action === 'validated') {
        const clientCard = clients.find((c) => c.client_id === presence.client_id && c.card_id === presence.card_id)
        if (clientCard) {
          const card = cards.find((c) => c.id === presence.card_id)
          const maxPts = card?.max_points || 10
          const ptsPerVisit = card?.points_per_visit || 1
          const newPoints = Math.min((clientCard.points || 0) + ptsPerVisit, maxPts)
          const rewardEarned = newPoints >= maxPts
          await supabase
            .from('client_cards')
            .update({
              points: rewardEarned ? 0 : newPoints,
              total_rewards_redeemed: (clientCard.total_rewards_redeemed || 0) + (rewardEarned ? 1 : 0)
            })
            .eq('id', clientCard.id)
        }
      }

      setPending((prev) => prev.filter((p) => p.id !== presenceId))
      if (merchant) { loadData(merchant.id) }
    } catch (err) {
      console.error('Error:', err)
    }
  }
  const handleExportPDF = async () => {
    if (!merchant) return
    setExportingPDF(true)
    try {
      await exportDashboardPDF({
        merchantName: merchant.name,
        businessName: merchant.business_name || merchant.name,
        plan: merchant.plan || 'starter',
        stats, clients, cards,
      })
    } catch (err) {
      console.error('PDF error:', err)
    } finally {
      setExportingPDF(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('merchant')
    router.push('/')
  }

  const getCardURL = (code: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/scan/${code}`
  }

  const handleCopyLink = (code: string) => {
    navigator.clipboard.writeText(getCardURL(code))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async (card: any) => {
    const url = getCardURL(card.code)
    const text = `🎁 Rejoignez le programme de fidélité de ${card.business_name} !\n\n✅ ${card.reward}\n📱 Scannez ou cliquez :`

    if (navigator.share) {
      try {
        await navigator.share({ title: `${card.business_name} - Fidélité`, text, url })
      } catch (e) { /* user cancelled */ }
    } else {
      handleCopyLink(card.code)
    }
  }

  const handlePrintQR = (card: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>QR Code - ${card.business_name}</title></head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Arial,sans-serif;margin:0;padding:20px;">
        <h1 style="font-size:28px;margin-bottom:8px;">${card.business_name}</h1>
        <p style="font-size:16px;color:#666;margin-bottom:24px;">Programme de fidélité</p>
        <div style="padding:20px;border:3px solid #000;border-radius:16px;display:inline-block;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getCardURL(card.code))}" width="300" height="300" />
        </div>
        <p style="font-size:14px;color:#999;margin-top:16px;">Scannez pour rejoindre</p>
        <p style="font-size:18px;font-weight:bold;color:#333;margin-top:8px;">🎁 ${card.reward}</p>
        <p style="font-size:12px;color:#aaa;margin-top:24px;">Propulsé par Fidali</p>
        <script>setTimeout(()=>window.print(),500)</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return "À l'instant"
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`
    return new Date(dateStr).toLocaleDateString('fr-FR')
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'visit': case 'presence_validated': return { icon: '👣', bg: 'bg-blue-100', text: 'text-blue-600' }
      case 'reward': case 'reward_redeemed': return { icon: '🎁', bg: 'bg-amber-100', text: 'text-amber-600' }
      case 'new_client': case 'client_joined': return { icon: '👤', bg: 'bg-green-100', text: 'text-green-600' }
      case 'presence_rejected': return { icon: '❌', bg: 'bg-red-100', text: 'text-red-600' }
      case 'card_created': return { icon: '🃏', bg: 'bg-purple-100', text: 'text-purple-600' }
      default: return { icon: '📌', bg: 'bg-gray-100', text: 'text-gray-600' }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 animate-pulse">F</div>
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t.common_loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ========== HEADER ========== */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm px-4 md:px-6 py-3 sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">F</div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{merchant?.business_name || 'Fidali'}</h1>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${merchant?.plan === 'premium' ? 'bg-purple-100 text-purple-700' : merchant?.plan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {merchant?.plan === 'premium' ? '💎' : merchant?.plan === 'pro' ? '⭐' : '🆓'} {merchant?.plan || 'starter'}
                </span>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleRefresh} className={`p-2 hover:bg-gray-100 rounded-lg transition text-sm ${refreshing ? 'animate-spin' : ''}`}>🔄</button>
            <LanguageSwitcher />
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-gray-100 rounded-lg transition text-sm">⚙️</button>
            <button onClick={handleExportPDF} disabled={exportingPDF} className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition text-xs font-bold disabled:opacity-50">
              {exportingPDF ? '⏳' : '📊'} PDF
            </button>
            {merchant?.plan !== 'premium' && (
              <button onClick={() => router.push('/dashboard/upgrade')} className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs font-bold hover:opacity-90 transition shadow-md shadow-blue-500/20">💎 Upgrade</button>
            )}
            <button onClick={handleLogout} className="p-2 hover:bg-red-50 rounded-lg transition text-sm">🚪</button>
          </div>
        </div>
      </header>

      {/* ========== SETTINGS ========== */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex justify-end" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900">⚙️ Paramètres</h2>
              <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">✕</button>
            </div>
            <div className="space-y-8">
              <ThemePicker />
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">🌍 Langue</h3>
                <div className="flex gap-2">
                  <button onClick={() => { localStorage.setItem('fidali_locale', 'fr'); window.location.reload() }} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${locale === 'fr' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>🇫🇷 Français</button>
                  <button onClick={() => { localStorage.setItem('fidali_locale', 'ar'); window.location.reload() }} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${locale === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>🇩🇿 العربية</button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">📊 Rapports</h3>
                <button onClick={handleExportPDF} disabled={exportingPDF} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50">{exportingPDF ? '⏳' : '📊'} Télécharger PDF</button>
              </div>
              {merchant?.plan !== 'premium' && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3">💎 Plan</h3>
                  <button onClick={() => router.push('/dashboard/upgrade')} className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold">💎 Upgrader</button>
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">👤 Compte</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Nom</span><span className="font-medium">{merchant?.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{merchant?.email}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tél</span><span className="font-medium">{merchant?.phone}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== QR CODE MODAL ========== */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={() => setShowQR(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const card = cards.find((c) => c.code === showQR)
              if (!card) return null
              return (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{card.business_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Scannez pour rejoindre le programme</p>
                  </div>

                  <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 flex items-center justify-center mb-6">
                    <QRCode value={getCardURL(card.code)} size={220} level="H" />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 mb-6">
                    <p className="text-xs text-gray-400 text-center mb-1">Lien direct</p>
                    <p className="text-sm font-mono text-gray-700 text-center break-all">{getCardURL(card.code)}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button onClick={() => handleCopyLink(card.code)} className="py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1">
                      {copied ? '✅' : '📋'}
                      <span>{copied ? 'Copié !' : 'Copier'}</span>
                    </button>
                    <button onClick={() => handleShare(card)} className="py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1">
                      📤
                      <span>Partager</span>
                    </button>
                    <button onClick={() => handlePrintQR(card)} className="py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1">
                      🖨️
                      <span>Imprimer</span>
                    </button>
                  </div>

                  <button onClick={() => setShowQR(null)} className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">Fermer</button>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* ========== TABS ========== */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-[65px] z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Vue d\'ensemble' },
            { id: 'pending', label: `🔔 Validations`, count: pending.length },
            { id: 'cards', label: '🃏 Mes cartes', count: cards.length },
            { id: 'clients', label: '👥 Clients', count: stats.total_clients },
            { id: 'activity', label: '📋 Activité' },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab.id === 'pending' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ========== CONTENT ========== */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* ===== OVERVIEW ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {pending.length > 0 && (
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg cursor-pointer hover:shadow-xl transition" onClick={() => setActiveTab('pending')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl animate-bounce">🔔</div>
                    <div>
                      <h3 className="font-bold text-lg">{pending.length} visite{pending.length > 1 ? 's' : ''} en attente</h3>
                      <p className="text-white/80 text-sm">Cliquez pour valider</p>
                    </div>
                  </div>
                  <span className="text-2xl">→</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t.dash_clients, value: stats.total_clients, icon: '👥', gradient: 'from-blue-500 to-blue-600' },
                { label: t.dash_cards, value: cards.length, icon: '🃏', gradient: 'from-purple-500 to-purple-600' },
                { label: t.dash_points, value: stats.total_points, icon: '⭐', gradient: 'from-amber-500 to-orange-500' },
                { label: t.dash_rewards, value: stats.total_rewards, icon: '🎁', gradient: 'from-emerald-500 to-green-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition border border-gray-100 group">
                  <div className={`w-11 h-11 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform mb-3`}>{stat.icon}</div>
                  <p className="text-3xl font-extrabold text-gray-900">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Cartes avec QR */}
            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-lg">🃏 Mes cartes</h3>
                  <button onClick={() => setActiveTab('cards')} className="text-sm text-blue-600 font-medium hover:underline">Voir tout →</button>
                </div>

                {cards.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-dashed border-gray-200">
                    <p className="text-5xl mb-4">🃏</p>
                    <p className="text-gray-900 font-bold mb-2">Aucune carte créée</p>
                    <p className="text-gray-400 text-sm mb-6">Créez votre première carte de fidélité</p>
                    <button onClick={() => router.push('/dashboard/create-card')} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition">+ Créer ma carte</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cards.map((card) => {
                      const cardClients = clients.filter((c) => c.card_id === card.id)
                      return (
                        <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                          <div className="flex">
                            {/* Carte visuelle */}
                            <div className="flex-1 p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${card.color1 || '#1e3a5f'}, ${card.color2 || '#2d5a87'})` }}>
                              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                              <div className="relative z-10 text-white">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h4 className="text-lg font-bold">{card.business_name}</h4>
                                    <p className="text-white/50 text-xs font-mono">{card.code}</p>
                                  </div>
                                  <div className="bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                    <span className="text-xs font-bold">{card.max_points} pts</span>
                                  </div>
                                </div>
                                <div className="flex gap-1 mb-3">
                                  {Array.from({ length: Math.min(card.max_points, 12) }).map((_, i) => (
                                    <div key={i} className="flex-1 h-2 rounded-full bg-white/15" />
                                  ))}
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-white/70 text-xs">🎁 {card.reward}</p>
                                  <p className="text-white/40 text-[10px]">{cardClients.length} clients</p>
                                </div>
                              </div>
                            </div>

                            {/* QR Code à droite */}
                            <div className="w-[140px] bg-white flex flex-col items-center justify-center p-3 border-l border-gray-100 gap-2">
                              <div className="cursor-pointer hover:scale-105 transition" onClick={() => setShowQR(card.code)}>
                                <QRCode value={getCardURL(card.code)} size={80} level="M" />
                              </div>
                              <div className="flex gap-1 w-full">
                                <button onClick={() => handleCopyLink(card.code)} className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-bold transition" title="Copier le lien">📋</button>
                                <button onClick={() => handleShare(card)} className="flex-1 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-[10px] font-bold transition" title="Partager">📤</button>
                                <button onClick={() => handlePrintQR(card)} className="flex-1 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-[10px] font-bold transition" title="Imprimer">🖨️</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <button onClick={() => router.push('/dashboard/create-card')} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-300 transition font-medium text-sm">+ Nouvelle carte</button>
                  </div>
                )}
              </div>

              {/* Activité récente */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">📋 Activité</h3>
                  <button onClick={() => setActiveTab('activity')} className="text-sm text-blue-600 font-medium hover:underline">Tout →</button>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {activities.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-3xl mb-2">📋</p>
                      <p className="text-gray-400 text-sm">Aucune activité</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {activities.slice(0, 8).map((a, i) => {
                        const s = getActivityIcon(a.type)
                        return (
                          <div key={i} className="flex items-start gap-3 p-3.5 hover:bg-gray-50 transition">
                            <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center text-sm flex-shrink-0`}>{s.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-900 leading-snug">{a.description || a.type}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(a.created_at)}</p>
                            </div>
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">🏆 Top clients</h3>
                  <button onClick={() => setActiveTab('clients')} className="text-sm text-blue-600 font-medium hover:underline">Voir tout →</button>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {[...clients].sort((a: any, b: any) => (b.points || 0) - (a.points || 0)).slice(0, 5).map((cc, i) => {
                    const maxPts = cc.loyalty_cards?.max_points || 10
                    const pct = Math.min(((cc.points || 0) / maxPts) * 100, 100)
                    return (
                      <div key={cc.id || i} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                        <div className="w-7 text-sm font-bold text-gray-300">#{i + 1}</div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {(cc.clients?.name || cc.client_name || '?')[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{cc.clients?.name || cc.client_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${pct >= 100 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-500">{cc.points}/{maxPts}</span>
                          </div>
                        </div>
                        {pct >= 100 && <span className="text-lg animate-bounce">🎁</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Actions rapides */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">⚡ Actions rapides</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { icon: '🃏', label: 'Nouvelle carte', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700', action: () => router.push('/dashboard/create-card') },
                  { icon: '📱', label: 'Voir QR Code', color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700', action: () => cards.length > 0 ? setShowQR(cards[0].code) : router.push('/dashboard/create-card') },
                  { icon: '📊', label: 'Export PDF', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700', action: handleExportPDF },
                  { icon: '🎨', label: 'Thèmes', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700', action: () => setShowSettings(true) },
                  { icon: '💎', label: 'Upgrader', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700', action: () => router.push('/dashboard/upgrade') },
                ].map((act, i) => (
                  <button key={i} onClick={act.action} className={`p-4 ${act.color} rounded-xl text-center transition-all hover:scale-105`}>
                    <span className="text-2xl block mb-1">{act.icon}</span>
                    <span className="text-xs font-bold">{act.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== PENDING ===== */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">🔔 Visites en attente</h2>
              <button onClick={handleRefresh} className="text-sm text-blue-600 font-medium hover:underline">🔄 Rafraîchir</button>
            </div>
            {pending.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
                <p className="text-gray-900 font-bold">Tout est à jour !</p>
                <p className="text-gray-400 text-sm">Aucune visite en attente</p>
              </div>
            ) : (
              pending.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {(p.clients?.name || p.client_name || '?')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{p.clients?.name || p.client_name}</p>
                        <p className="text-sm text-gray-400">{p.clients?.phone || p.client_phone}</p>
                        <p className="text-xs text-gray-300 mt-0.5">{p.loyalty_cards?.business_name} • {timeAgo(p.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handlePresence(p.id, 'validated')} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition">✓ Valider</button>
                      <button onClick={() => handlePresence(p.id, 'rejected')} className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition">✕</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ===== CARDS ===== */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">🃏 Mes cartes de fidélité</h2>
              <button onClick={() => router.push('/dashboard/create-card')} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition">+ Nouvelle carte</button>
            </div>

            {cards.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-dashed border-gray-200">
                <p className="text-5xl mb-4">🃏</p>
                <p className="text-gray-900 font-bold text-lg mb-2">Créez votre première carte</p>
                <p className="text-gray-400 text-sm mb-6">Personnalisez les couleurs, la récompense et les règles</p>
                <button onClick={() => router.push('/dashboard/create-card')} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition">🚀 Créer ma carte</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {cards.map((card) => {
                  const cardClients = clients.filter((c) => c.card_id === card.id)
                  const totalPts = cardClients.reduce((s: number, c: any) => s + (c.points || 0), 0)
                  const totalRewards = cardClients.reduce((s: number, c: any) => s + (c.total_rewards_redeemed || 0), 0)

                  return (
                    <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group">
                      {/* Carte visuelle */}
                      <div className="p-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${card.color1 || '#1e3a5f'}, ${card.color2 || '#2d5a87'})` }}>
                        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/[0.04] rounded-full" />
                        <div className="relative z-10">
                          <div className="flex items-start justify-between text-white mb-6">
                            <div>
                              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Carte de fidélité</p>
                              <h3 className="text-xl font-bold">{card.business_name}</h3>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
                              <span className="text-xs font-bold">{card.max_points} pts</span>
                            </div>
                          </div>
                          <div className="flex gap-[5px] mb-3">
                            {Array.from({ length: Math.min(card.max_points, 15) }).map((_, i) => (
                              <div key={i} className="flex-1 h-2.5 rounded-full bg-white/15" />
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-white/70 text-sm">🎁 {card.reward}</p>
                            <p className="text-white/40 text-[10px] font-mono">{card.code}</p>
                          </div>
                        </div>
                      </div>

                      {/* QR + Stats */}
                      <div className="p-5">
                        <div className="flex gap-4 mb-4">
                          {/* QR Code */}
                          <div className="flex flex-col items-center gap-2">
                            <div className="p-2 bg-white border-2 border-gray-100 rounded-xl cursor-pointer hover:scale-105 transition" onClick={() => setShowQR(card.code)}>
                              <QRCode value={getCardURL(card.code)} size={90} level="M" />
                            </div>
                            <p className="text-[10px] text-gray-400">Cliquez pour agrandir</p>
                          </div>

                          {/* Stats */}
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="p-2.5 bg-blue-50 rounded-xl text-center">
                              <p className="text-xl font-extrabold text-blue-700">{cardClients.length}</p>
                              <p className="text-[10px] text-blue-500">Clients</p>
                            </div>
                            <div className="p-2.5 bg-amber-50 rounded-xl text-center">
                              <p className="text-xl font-extrabold text-amber-700">{totalPts}</p>
                              <p className="text-[10px] text-amber-500">Points</p>
                            </div>
                            <div className="p-2.5 bg-green-50 rounded-xl text-center">
                              <p className="text-xl font-extrabold text-green-700">{totalRewards}</p>
                              <p className="text-[10px] text-green-500">Récomp.</p>
                            </div>
                            <div className="p-2.5 bg-purple-50 rounded-xl text-center">
                              <p className="text-xl font-extrabold text-purple-700">{card.points_per_visit || 1}</p>
                              <p className="text-[10px] text-purple-500">Pts/visite</p>
                            </div>
                          </div>
                        </div>

                        {/* Boutons partage */}
                        <div className="grid grid-cols-3 gap-2">
                          <button onClick={() => handleCopyLink(card.code)} className="py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1">
                            {copied ? '✅ Copié' : '📋 Copier'}
                          </button>
                          <button onClick={() => handleShare(card)} className="py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1">📤 Partager</button>
                          <button onClick={() => handlePrintQR(card)} className="py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1">🖨️ Imprimer</button>
                        </div>

                        {card.welcome_message && (
                          <p className="text-xs text-gray-400 mt-3 italic text-center">&ldquo;{card.welcome_message}&rdquo;</p>
                        )}
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
            <h2 className="text-xl font-bold text-gray-900">👥 Tous les clients ({stats.total_clients})</h2>
            {clients.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">👥</div>
                <p className="text-gray-900 font-bold">Aucun client</p>
                <p className="text-gray-400 text-sm">Vos clients apparaîtront ici après leur premier scan</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-4">Client</div>
                  <div className="col-span-3">Carte</div>
                  <div className="col-span-3">Points</div>
                  <div className="col-span-2">Récomp.</div>
                </div>
                {[...clients].sort((a: any, b: any) => (b.points || 0) - (a.points || 0)).map((cc, i) => {
                  const maxPts = cc.loyalty_cards?.max_points || 10
                  const pct = Math.min(((cc.points || 0) / maxPts) * 100, 100)
                  return (
                    <div key={cc.id || i} className="flex md:grid md:grid-cols-12 gap-4 items-center px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                      <div className="md:col-span-4 flex items-center gap-3 flex-1">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {(cc.clients?.name || cc.client_name || '?')[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{cc.clients?.name || cc.client_name}</p>
                          <p className="text-[11px] text-gray-400 truncate">{cc.clients?.phone || cc.client_phone}</p>
                        </div>
                      </div>
                      <div className="md:col-span-3 hidden md:block">
                        <p className="text-xs font-medium text-gray-600 truncate">{cc.loyalty_cards?.business_name}</p>
                      </div>
                      <div className="md:col-span-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden hidden md:block">
                            <div className={`h-full rounded-full ${pct >= 100 ? 'bg-amber-400' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-600">{cc.points}/{maxPts}</span>
                        </div>
                      </div>
                      <div className="md:col-span-2 flex items-center gap-1">
                        <span className="text-sm font-bold text-gray-900">{cc.total_rewards_redeemed || 0}</span>
                        {pct >= 100 && <span>🎁</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== ACTIVITY ===== */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">📋 Toute l&apos;activité</h2>
              <button onClick={handleRefresh} className="text-sm text-blue-600 font-medium hover:underline">🔄 Rafraîchir</button>
            </div>
            {activities.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">📋</div>
                <p className="text-gray-900 font-bold">Pas encore d&apos;activité</p>
                <p className="text-gray-400 text-sm">Les événements apparaîtront ici</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {activities.map((a, i) => {
                  const s = getActivityIcon(a.type)
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition">
                      <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-base flex-shrink-0`}>{s.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{a.description || a.type}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-gray-400">{timeAgo(a.created_at)}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${s.bg} ${s.text}`}>{a.type}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
