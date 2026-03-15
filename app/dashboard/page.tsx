'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import { exportDashboardPDF } from '@/lib/export-pdf'
import ShareModal from '@/components/ShareModal'
import OnboardingGuide from '@/components/OnboardingGuide'
import MobileNav from '@/components/MobileNav'

export default function DashboardPage() {
  const router = useRouter()

  const [merchant, setMerchant] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [pending, setPending] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [stats, setStats] = useState({ total_clients: 0, total_points: 0, total_points_earned: 0, total_rewards: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [exportingPDF, setExportingPDF] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showQR, setShowQR] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [editCard, setEditCard] = useState<any>(null)
  const [editForm, setEditForm] = useState({ reward: '', max_points: 0, welcome_message: '', points_per_visit: 1 })
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string; name: string } | null>(null)
  const [shareCard, setShareCard] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Chat states
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatSubject, setChatSubject] = useState('')
  const [chatSending, setChatSending] = useState(false)
  const [chatStep, setChatStep] = useState<'list' | 'new' | 'thread'>('list')
  const [selectedThread, setSelectedThread] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)

    // Vérifier profil + status avant d'accéder au dashboard
    const init = async () => {
      try {
        const { getMerchantProfile } = await import('@/database/supabase-client')
        const profile = await getMerchantProfile(m.id)
        if (!profile) {
          router.push('/complete-profile')
          return
        }
        // Profil soumis mais en attente ou rejeté
        if (profile.status === 'pending') {
          router.push('/dashboard/pending')
          return
        }
        if (profile.status !== 'active' && profile.status !== 'approved' && profile.status !== 'pending') {
          // statut inconnu ou rejected
        }
        if (profile.status === 'rejected') {
          router.push('/dashboard/pending?rejected=1')
          return
        }
      } catch (e) {
        console.warn('Vérification profil échouée:', e)
      }
      setMerchant(m)
      loadData(m.id)
      loadMessages(m.id)
      // 🔔 Activer les push notifications pour le commerçant automatiquement
      setTimeout(() => enableMerchantPush(m.id), 2000)
    }
    init()

    // Vérifie si le plan a changé en DB (upgrade admin)
    const checkPlanUpdate = async () => {
      try {
        const { supabase } = await import('@/database/supabase-client')
        const { data } = await supabase.from('merchants').select('plan, status, sub_start, sub_end, sub_billing').eq('id', m.id).maybeSingle()
        if (data && (data.plan !== m.plan || data.sub_end !== m.sub_end)) {
          const updated = { ...m, plan: data.plan, status: data.status, sub_start: data.sub_start, sub_end: data.sub_end, sub_billing: data.sub_billing }
          localStorage.setItem('merchant', JSON.stringify(updated))
          sessionStorage.setItem('merchant', JSON.stringify(updated))
          setMerchant(updated)
          showToast(`🎉 Votre plan a été mis à jour vers ${data.plan.toUpperCase()} !`)
        }
      } catch {}
    }

    const interval = setInterval(() => {
      loadData(m.id)
      loadMessages(m.id)
      checkPlanUpdate()
    }, 15000)
    // Vérif immédiate au chargement
    checkPlanUpdate()
    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    if (chatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, chatOpen, selectedThread])

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
      const totalPointsEarned = clientCardsData.reduce((sum: number, c: any) => sum + (c.total_points_earned || 0), 0)
      const totalRewards = clientCardsData.reduce((sum: number, c: any) => sum + (c.total_rewards_redeemed || 0), 0)
      setStats({ total_clients: totalClients, total_points: totalPoints, total_points_earned: totalPointsEarned, total_rewards: totalRewards })
    } catch (err) { console.error('Error:', err) }
    finally { setLoading(false); setRefreshing(false) }
  }

  const loadMessages = async (merchantId: string) => {
    try {
      const { supabase } = await import('@/database/supabase-client')
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: true })
      setChatMessages(data || [])
      const unread = (data || []).filter((m: any) => m.status === 'replied' && !m.read_by_merchant).length
      setUnreadCount(unread)
    } catch (err) { console.error(err) }
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return
    if (chatStep === 'new' && !chatSubject) return
    setChatSending(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      await supabase.from('messages').insert({
        merchant_id: merchant?.id,
        merchant_name: merchant?.business_name || merchant?.name,
        merchant_email: merchant?.email,
        subject: chatStep === 'new' ? chatSubject : (selectedThread?.subject || 'Message'),
        message: chatInput.trim(),
      })
      setChatInput('')
      if (chatStep === 'new') {
        setChatSubject('')
        setChatStep('list')
      }
      if (merchant) loadMessages(merchant.id)
    } catch (err) { console.error(err) }
    finally { setChatSending(false) }
  }

  const openThread = async (msg: any) => {
    setSelectedThread(msg)
    setChatStep('thread')
    // Marquer comme lu par le marchand
    if (msg.status === 'replied' && !msg.read_by_merchant) {
      try {
        const { supabase } = await import('@/database/supabase-client')
        await supabase.from('messages').update({ read_by_merchant: true }).eq('id', msg.id)
        if (merchant) loadMessages(merchant.id)
      } catch {}
    }
  }

  const handleRefresh = () => { if (!merchant || refreshing) return; setRefreshing(true); loadData(merchant.id) }

  const handlePresence = async (presenceId: string, action: 'validated' | 'rejected') => {
    try {
      const dbStatus = action === 'validated' ? 'confirmed' : 'rejected'
      const { supabase } = await import('@/database/supabase-client')
      const presence = pending.find((p) => p.id === presenceId)
      if (!presence) return

      // Vérifier que la présence est encore pending (pas déjà traitée par auto-validation)
      const { data: freshPresence } = await supabase
        .from('pending_presences').select('status').eq('id', presenceId).maybeSingle()
      if (freshPresence?.status !== 'pending') {
        showToast('Déjà traitée automatiquement', 'error')
        setPending((prev) => prev.filter((p) => p.id !== presenceId))
        return
      }

      const { error: e1 } = await supabase
        .from('pending_presences')
        .update({ status: dbStatus, resolved_at: new Date().toISOString() })
        .eq('id', presenceId)
      if (e1) { showToast('Erreur: ' + e1.message, 'error'); return }

      if (action === 'validated') {
        const clientCard = clients.find((c) => c.client_id === presence.client_id && c.card_id === presence.card_id) || clients.find((c) => c.id === presence.client_card_id)
        if (clientCard) {
          const card = cards.find((c) => c.id === (clientCard.card_id || presence.card_id))
          const maxPts = card?.max_points || 10
          const pointsGain = card?.points_per_visit || 1
          const newPts = Math.min((clientCard.points || 0) + pointsGain, maxPts)
          const reward = newPts >= maxPts

          // Mise à jour complète — total_points_earned était oublié avant
          await supabase.from('client_cards').update({
            points: reward ? 0 : newPts,
            total_rewards_redeemed: (clientCard.total_rewards_redeemed || 0) + (reward ? 1 : 0),
            total_points_earned: (clientCard.total_points_earned || 0) + pointsGain,
          }).eq('id', clientCard.id)

          // Enregistrer dans activities (était oublié pour les validations manuelles)
          await supabase.from('activities').insert({
            merchant_id: presence.merchant_id,
            card_id: presence.card_id,
            client_id: presence.client_id,
            type: 'validation',
            points_amount: pointsGain,
            description: `✅ Visite validée pour ${presence.client_name}`,
          })
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

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
    return outputArray
  }

  const enableMerchantPush = async (merchantId: string) => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') return
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })
      await fetch('/api/push/subscribe-merchant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), merchantId }),
      })
    } catch (e) {
      console.warn('Merchant push subscribe failed:', e)
    }
  }
  const getCardURL = (code: string) => `${typeof window !== 'undefined' ? window.location.origin : ''}/scan/${code}`
  const handleCopyLink = (code: string) => { navigator.clipboard.writeText(getCardURL(code)); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const handleShare = async (card: any) => {
    const url = getCardURL(card.code)
    if (navigator.share) { try { await navigator.share({ title: card.business_name, text: `Rejoignez ${card.business_name}`, url }) } catch {} }
    else { handleCopyLink(card.code) }
  }
  const handlePrintQR = (card: any) => {
    router.push(`/dashboard/print/${card.id}`)
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

  const formatTime = (d: string) => {
    return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return "Aujourd'hui"
    if (date.toDateString() === yesterday.toDateString()) return 'Hier'
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  // Grouper les messages par sujet pour faire des "threads"
  const groupedMessages = chatMessages.reduce((acc: any, msg: any) => {
    const key = msg.subject || 'Sans sujet'
    if (!acc[key]) acc[key] = []
    acc[key].push(msg)
    return acc
  }, {})

  const threadList = Object.entries(groupedMessages).map(([subject, msgs]: [string, any]) => {
    const lastMsg = msgs[msgs.length - 1]
    const hasUnread = msgs.some((m: any) => m.status === 'replied' && !m.read_by_merchant)
    return { subject, messages: msgs, lastMsg, hasUnread }
  }).sort((a: any, b: any) => new Date(b.lastMsg.created_at).getTime() - new Date(a.lastMsg.created_at).getTime())

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
<img src="/logo.png" alt="Fidali" className="w-12 h-12 rounded-2xl mx-auto mb-4 animate-pulse object-contain" />
          <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {toast && (
        <div className={`fixed top-4 left-4 right-4 md:left-auto md:top-5 md:right-5 md:w-auto z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-center ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* Header Clean - Style Rise */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Left - Logo + Business */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Fidali" className="w-10 h-10 rounded-lg object-contain" />
              <div>
                <h1 className="text-base font-bold text-gray-900">{merchant?.business_name}</h1>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-md font-medium ${merchant?.plan === 'premium' ? 'bg-purple-100 text-purple-700' : merchant?.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                    {merchant?.plan?.toUpperCase() || 'STARTER'}
                  </span>
                  {merchant?.sub_end && merchant?.plan !== 'starter' && (() => {
                    const daysLeft = Math.ceil((new Date(merchant.sub_end).getTime() - Date.now()) / 86400000)
                    return (
                      <span className={`px-2 py-0.5 rounded-md font-medium ${daysLeft <= 0 ? 'bg-red-100 text-red-700' : daysLeft <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {daysLeft <= 0 ? 'Expiré' : `${daysLeft}j`}
                      </span>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2">
              
              <button onClick={handleRefresh} className={`p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition ${refreshing ? 'animate-spin' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>

              <button onClick={handleExportPDF} disabled={exportingPDF} className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition">
                📄 {exportingPDF ? 'Export...' : 'PDF'}
              </button>

              {(merchant?.plan === 'pro' || merchant?.plan === 'premium') && (
                <button onClick={() => router.push('/dashboard/stats')} className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition">
                  📊 Stats
                </button>
              )}

              {(merchant?.plan === 'pro' || merchant?.plan === 'premium') && (
                <button onClick={() => router.push('/dashboard/personnalisation')} className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                  ✦ Style
                </button>
              )}

              {merchant?.plan === 'premium' && (
                <button onClick={() => router.push('/dashboard/branches')} className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition">
                  🏪 Branches
                </button>
              )}

              {merchant?.plan === 'premium' && (
                <button onClick={() => router.push('/dashboard/api')} className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition">
                  🔑 API
                </button>
              )}

              {merchant?.plan !== 'premium' && (
                <button onClick={() => router.push('/dashboard/upgrade')} className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
                  ⭐ {merchant?.plan === 'pro' ? 'Premium' : 'Upgrade'}
                </button>
              )}

              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Tabs Clean - Style Rise */}
      <div className="hidden md:block bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-[1280px] mx-auto px-6 flex gap-0">
          {[
            { id: 'overview', label: "Vue d'ensemble", icon: '📊' },
            { id: 'pending', label: 'Validations', icon: '🔔', count: pending.length },
            { id: 'cards', label: 'Cartes', icon: '💳', count: cards.length },
            { id: 'clients', label: 'Clients', icon: '👤', count: stats.total_clients },
            { id: 'activity', label: 'Activité', icon: '📋' },
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}>
              <span>{tab.icon}</span> 
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  tab.id === 'pending' && tab.count > 0 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Mobile bottom nav */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} pendingCount={pending.length} />

      {/* MODALS */}
      {shareCard && <ShareModal card={shareCard} onClose={() => setShareCard(null)} />}

      {/* Modal Delete Clean */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Voulez-vous vraiment supprimer <strong className="text-gray-900">{confirmDelete.name}</strong> ?
              <br />
              <span className="text-xs text-red-600">Cette action est irréversible.</span>
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                Annuler
              </button>
              <button 
                onClick={() => confirmDelete.type === 'client' ? handleDeleteClient(confirmDelete.id) : handleDeleteCard(confirmDelete.id)} 
                disabled={actionLoading} 
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                {actionLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Edit Clean */}
      {editCard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditCard(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Modifier la carte</h3>
                <p className="text-sm text-gray-500">{editCard.business_name} — {editCard.code}</p>
              </div>
              <button onClick={() => setEditCard(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Récompense offerte</label>
                <input 
                  type="text" 
                  value={editForm.reward} 
                  onChange={(e) => setEditForm({ ...editForm, reward: e.target.value })} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" 
                  placeholder="Ex: Un café offert"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Points max</label>
                  <input 
                    type="number" 
                    value={editForm.max_points} 
                    onChange={(e) => setEditForm({ ...editForm, max_points: parseInt(e.target.value) || 0 })} 
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Points/visite</label>
                  <input 
                    type="number" 
                    value={editForm.points_per_visit} 
                    onChange={(e) => setEditForm({ ...editForm, points_per_visit: parseInt(e.target.value) || 1 })} 
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Message de bienvenue</label>
                <input 
                  type="text" 
                  value={editForm.welcome_message} 
                  onChange={(e) => setEditForm({ ...editForm, welcome_message: e.target.value })} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" 
                  placeholder="Ex: Bienvenue !"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setEditCard(null)} 
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                Annuler
              </button>
              <button 
                onClick={handleEditCard} 
                disabled={actionLoading} 
                className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
                {actionLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal QR Clean */}
      {showQR && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQR(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const card = cards.find((c) => c.code === showQR)
              if (!card) return null
              return (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{card.business_name}</h3>
                      <p className="text-xs text-gray-500">Code: {card.code}</p>
                    </div>
                    <button onClick={() => setShowQR(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-8 flex items-center justify-center mb-5">
                    <QRCode value={getCardURL(card.code)} size={220} level="H" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => handleCopyLink(card.code)} className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition">
                      {copied ? 'Copié' : 'Copier'}
                    </button>
                    <button onClick={() => handleShare(card)} className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition">
                      Partager
                    </button>
                    <button onClick={() => handlePrintQR(card)} className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition">
                      Print
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* CONTENT Clean */}
      <main className="max-w-[1280px] mx-auto px-6 py-6 pb-32 md:pb-6 space-y-6">

        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* 🛡️ Bannière sécurité */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">🛡️</span>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm mb-3">Système anti-fraude Fidali — Actif</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { icon: '🔄', title: 'QR Dynamique', desc: 'Le lien change toutes les 10 min. Une photo du QR devient invalide rapidement.' },
                      { icon: '⏱️', title: 'Auto-validation 2 min', desc: 'Sans action de ta part, le point est ajouté après 2 min. Tu peux refuser avant.' },
                      { icon: '⏰', title: 'Cooldown 8h', desc: 'Impossible de gagner 2 points en moins de 8h avec le même numéro.' },
                      { icon: '📊', title: 'Traçabilité complète', desc: 'Dans Clients : auto 🤖 = sans toi, manuel ✋ = tu as validé toi-même.' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xl mb-1.5">{item.icon}</p>
                        <p className="text-white text-[11px] font-bold mb-1">{item.title}</p>
                        <p className="text-white/40 text-[10px] leading-snug">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/30 text-[10px] mt-3 leading-relaxed">
                    💡 Onglet Clients : <span className="text-amber-400 font-semibold">⚠️ Tous auto</span> = client jamais validé manuellement, peut être suspect. Bouton <span className="text-amber-400 font-semibold">-1pt</span> pour corriger une fraude détectée.
                  </p>
                </div>
              </div>
            </div>
            {pending.length > 0 && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition shadow-md shadow-amber-200" onClick={() => setActiveTab('pending')}>
                <div className="flex items-center gap-3 text-white">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <p className="font-bold text-sm">{pending.length} visite{pending.length > 1 ? 's' : ''} en attente</p>
                    <p className="text-white/70 text-xs">Cliquez pour gérer</p>
                  </div>
                </div>
              </div>
            )}

            {/* KPI Cards Clean */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Clients actifs', value: stats.total_clients, icon: '👤', color: 'blue' },
                { label: 'Cartes actives', value: cards.length, icon: '💳', color: 'purple' },
                { label: 'Points distribués', value: stats.total_points, icon: '⭐', color: 'amber' },
                { label: 'Récompenses', value: stats.total_rewards, icon: '🎁', color: 'emerald' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition">
                  <div className={`w-11 h-11 bg-${s.color}-50 rounded-lg flex items-center justify-center text-xl mb-3`}>
                    {s.icon}
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{s.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Mes cartes de fidélité</h3>
                  <button onClick={() => setActiveTab('cards')} className="text-xs text-indigo-600 hover:underline font-medium">Voir tout</button>
                </div>
                <OnboardingGuide
                  cards={cards}
                  clients={clients}
                  totalPoints={stats.total_points_earned}
                  onCreateCard={() => router.push('/dashboard/create-card')}
                  onShowQR={() => { if (cards[0]) setShowQR(cards[0].code) }}
                  onGoValidations={() => setActiveTab('pending')}
                  merchantName={merchant?.name}
                  plan={merchant?.plan}
                  onUpgrade={() => router.push('/dashboard/upgrade')}
                />
                {cards.length > 0 && (
                  <div className="space-y-3">
                    {cards.map((card) => {
                      const cc = clients.filter((c) => c.card_id === card.id)
                      return (
                        <div key={card.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition">
                          <div className="flex">
                            <div className="flex-1 p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${card.color1 || '#4f46e5'}, ${card.color2 || '#7c3aed'})` }}>
                              <div className="relative z-10 text-white">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <div className="flex items-center gap-2">
  <img src="/logo-white.png" alt="" className="w-5 h-5 object-contain opacity-60" />
  <p className="text-[9px] text-white/40 uppercase tracking-[0.15em] font-semibold">Fidélité</p>
</div>
                                    <h4 className="font-bold text-base">{card.business_name}</h4>
                                  </div>
                                  <span className="text-[11px] bg-white/20 px-2.5 py-1 rounded-lg font-bold">{card.max_points} pts</span>
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
                              <div className="cursor-pointer" onClick={() => setShowQR(card.code)}>
                                <QRCode value={getCardURL(card.code)} size={72} level="M" />
                              </div>
                            </div>
                          </div>
                          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex gap-5 text-xs text-slate-400">
                              <span><strong className="text-slate-700">{cc.length}</strong> clients</span>
                              <span><strong className="text-slate-700">{cc.reduce((s: number, c: any) => s + (c.points || 0), 0)}</strong> pts</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => setShareCard(card)} className="px-2.5 py-1 text-[10px] text-emerald-600 hover:bg-emerald-50 rounded-lg transition font-semibold">Partager</button>
                              <button onClick={() => openEditCard(card)} className="px-2.5 py-1 text-[10px] text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-semibold">Modifier</button>
                              <button onClick={() => setConfirmDelete({ type: 'card', id: card.id, name: card.business_name })} className="px-2.5 py-1 text-[10px] text-red-500 hover:bg-red-50 rounded-lg transition font-semibold">Supprimer</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <button onClick={() => router.push('/dashboard/create-card')} className="w-full py-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition font-semibold">+ Nouvelle carte</button>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">Activité récente</h3>
                  <button onClick={() => setActiveTab('activity')} className="text-xs text-indigo-600 hover:underline font-medium">Tout</button>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                  {activities.length === 0 ? (
                    <p className="p-8 text-center text-xs text-slate-400">Aucune activité</p>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {activities.slice(0, 8).map((a, i) => {
                        const f = formatActivity(a)
                        return (
                          <div key={i} className="px-4 py-3 hover:bg-slate-50/50 transition flex items-center gap-3">
                            <div className={`w-8 h-8 ${f.bg} rounded-lg flex items-center justify-center text-sm flex-shrink-0`}>{f.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-700 truncate">{f.description}</p>
                              <p className="text-[10px] text-slate-300 mt-0.5">{timeAgo(a.created_at)}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {clients.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">Meilleurs clients</h3>
                  <button onClick={() => setActiveTab('clients')} className="text-xs text-indigo-600 hover:underline font-medium">Tous</button>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                  {[...clients].sort((a: any, b: any) => (b.points || 0) - (a.points || 0)).slice(0, 5).map((cc, i) => {
                    const maxPts = cc.loyalty_cards?.max_points || 10
                    const pct = Math.min(((cc.points || 0) / maxPts) * 100, 100)
                    const colors = ['bg-amber-400', 'bg-slate-400', 'bg-orange-400', 'bg-indigo-300', 'bg-slate-300']
                    return (
                      <div key={cc.id || i} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0">
                        <div className={`w-7 h-7 ${colors[i]} rounded-full flex items-center justify-center text-[10px] font-bold text-white`}>{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{cc.clients?.name || cc.client_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-[6px] bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                              <div className={`h-full rounded-full ${pct >= 100 ? 'bg-amber-400' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500">{cc.points}/{maxPts}</span>
                          </div>
                        </div>
                        {pct >= 100 && <span>🎁</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Visites en attente</h2>
              {pending.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{pending.length}</span>
              )}
            </div>
            {pending.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-slate-700 font-bold text-sm">Tout est validé</p>
                <p className="text-slate-400 text-xs mt-1">Les nouvelles visites apparaîtront ici</p>
              </div>
            ) : (
              pending.map((p) => (
                <div key={p.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  {/* Client info */}
                  <div className="flex items-center gap-3 p-4 pb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-amber-200 shrink-0">
                      {(p.clients?.name || p.client_name || '?')[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-slate-800 truncate">{p.clients?.name || p.client_name}</p>
                      <p className="text-xs text-slate-400 truncate">{p.clients?.phone || p.client_phone}</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">{p.loyalty_cards?.business_name} · {timeAgo(p.created_at)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-1 rounded-lg border border-amber-100">
                        En attente
                      </span>
                    </div>
                  </div>
                  {/* Big action buttons on mobile */}
                  <div className="grid grid-cols-2 border-t border-slate-100">
                    <button
                      onClick={() => handlePresence(p.id, 'rejected')}
                      className="py-4 text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center gap-2 border-r border-slate-100 active:scale-95"
                    >
                      <span className="text-lg">✕</span>
                      <span>Refuser</span>
                    </button>
                    <button
                      onClick={() => handlePresence(p.id, 'validated')}
                      className="py-4 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <span className="text-lg">✓</span>
                      <span>Valider</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Mes cartes</h2>
              <button onClick={() => router.push('/dashboard/create-card')} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition">+ Nouvelle carte</button>
            </div>
            <OnboardingGuide
              cards={cards}
              clients={clients}
              totalPoints={stats.total_points_earned}
              onCreateCard={() => router.push('/dashboard/create-card')}
              onShowQR={() => { if (cards[0]) setShowQR(cards[0].code) }}
              onGoValidations={() => setActiveTab('pending')}
              merchantName={merchant?.name}
              plan={merchant?.plan}
              onUpgrade={() => router.push('/dashboard/upgrade')}
            />
            {cards.length > 0 && (
              <div className="grid md:grid-cols-2 gap-5">
                {cards.map((card) => {
                  const cc = clients.filter((c) => c.card_id === card.id)
                  return (
                    <div key={card.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition">
                      <div className="p-6 relative" style={{ background: `linear-gradient(135deg, ${card.color1 || '#4f46e5'}, ${card.color2 || '#7c3aed'})` }}>
                        <div className="relative z-10 text-white">
                          <h3 className="font-bold text-lg">{card.business_name}</h3>
                          <p className="text-white/60 text-xs mt-1">🎁 {card.reward}</p>
                          <p className="text-white/30 text-[10px] font-mono mt-2">{card.code} · {card.max_points} pts</p>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex gap-4 mb-4">
                          <div className="cursor-pointer" onClick={() => setShowQR(card.code)}>
                            <QRCode value={getCardURL(card.code)} size={82} level="M" />
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="bg-blue-50 text-blue-600 rounded-xl p-2 text-center">
                              <p className="text-lg font-extrabold">{cc.length}</p>
                              <p className="text-[9px]">Clients</p>
                            </div>
                            <div className="bg-amber-50 text-amber-600 rounded-xl p-2 text-center">
                              <p className="text-lg font-extrabold">{cc.reduce((s: number, c: any) => s + (c.points || 0), 0)}</p>
                              <p className="text-[9px]">Points</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-slate-100">
                          <button onClick={() => setShareCard(card)} className="flex-1 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-xl transition">Partager</button>
                          <button onClick={() => openEditCard(card)} className="flex-1 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition">Modifier</button>
                          <button onClick={() => setConfirmDelete({ type: 'card', id: card.id, name: card.business_name })} className="flex-1 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-xl transition">Supprimer</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Clients ({stats.total_clients})</h2>
            </div>

            {/* Légende anti-fraude */}
            <div className="bg-slate-800 rounded-xl p-3 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-bold">🤖 Auto</span>
                <p className="text-white/60 text-[11px]">Point validé automatiquement après 2 min</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-green-100 text-green-600 px-2 py-0.5 rounded font-bold">✋ Manuel</span>
                <p className="text-white/60 text-[11px]">Point que tu as validé toi-même</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-amber-400 font-bold">⚠️ Tous auto</span>
                <p className="text-white/60 text-[11px]">Potentiellement suspect — vérifie</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded font-bold">-1pt</span>
                <p className="text-white/60 text-[11px]">Retirer un point en cas de fraude</p>
              </div>
            </div>
            {clients.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                <p className="text-3xl mb-3">👤</p>
                <p className="text-slate-700 font-bold text-sm">Aucun client</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left text-[11px] font-semibold text-slate-400 px-5 py-3">Client</th>
                      <th className="text-left text-[11px] font-semibold text-slate-400 px-5 py-3">Progression</th>
                      <th className="text-center text-[11px] font-semibold text-slate-400 px-5 py-3">Auto/Manuel</th>
                      <th className="text-center text-[11px] font-semibold text-slate-400 px-5 py-3">Récomp.</th>
                      <th className="text-right text-[11px] font-semibold text-slate-400 px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...clients].sort((a: any, b: any) => (b.points || 0) - (a.points || 0)).map((cc, i) => {
                      const maxPts = cc.loyalty_cards?.max_points || 10
                      const pct = Math.min(((cc.points || 0) / maxPts) * 100, 100)
                      const autoPoints = cc.auto_validated_points || 0
                      const manualPoints = (cc.total_points_earned || 0) - autoPoints
                      const isSuspect = autoPoints > 0 && manualPoints === 0
                      return (
                        <tr key={cc.id || i} className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/50 ${isSuspect ? 'bg-amber-50/50' : ''}`}>
                          <td className="px-5 py-3.5">
                            <p className="text-xs font-semibold text-slate-800">{cc.clients?.name || cc.client_name}</p>
                            <p className="text-[10px] text-slate-400">{cc.clients?.phone || cc.client_phone}</p>
                            {isSuspect && <span className="text-[9px] text-amber-500 font-bold">⚠️ Tous auto</span>}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-[6px] bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${pct >= 100 ? 'bg-amber-400' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[11px] text-slate-500">{cc.points}/{maxPts}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold" title="Points auto-validés">{autoPoints}🤖</span>
                              <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-bold" title="Points validés manuellement">{manualPoints > 0 ? manualPoints : 0}✋</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-center text-xs font-bold text-slate-700">{cc.total_rewards_redeemed || 0}</td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {cc.points > 0 && (
                                <button
                                  onClick={async () => {
                                    if (!confirm(`Retirer 1 point à ${cc.clients?.name} ?`)) return
                                    const { supabase } = await import('@/database/supabase-client')
                                    await supabase.from('client_cards').update({ points: Math.max(0, (cc.points || 1) - 1) }).eq('id', cc.id)
                                    showToast('Point retiré')
                                    if (merchant) loadData(merchant.id)
                                  }}
                                  className="px-2 py-1 text-[10px] font-semibold text-amber-500 hover:bg-amber-50 rounded-lg transition"
                                  title="Retirer 1 point (fraude)"
                                >
                                  -1pt
                                </button>
                              )}
                              <button onClick={() => setConfirmDelete({ type: 'client', id: cc.id, name: cc.clients?.name || 'ce client' })} className="px-3 py-1 text-[10px] font-semibold text-red-500 hover:bg-red-50 rounded-lg transition">Supprimer</button>
                            </div>
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

        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Historique ({activities.length})</h2>
            {activities.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                <p className="text-3xl mb-3">📋</p>
                <p className="text-slate-700 font-bold text-sm">Aucune activité</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.map((a, i) => {
                  const f = formatActivity(a)
                  const prevDate = i > 0 ? new Date(activities[i - 1].created_at).toDateString() : null
                  const currentDate = new Date(a.created_at).toDateString()
                  const showDateSep = i === 0 || currentDate !== prevDate
                  return (
                    <div key={i}>
                      {showDateSep && (
                        <div className="flex items-center gap-3 py-3">
                          <div className="h-px bg-slate-200 flex-1" />
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {new Date(a.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </span>
                          <div className="h-px bg-slate-200 flex-1" />
                        </div>
                      )}
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>{f.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 font-medium">{f.description}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{formatTime(a.created_at)} · {timeAgo(a.created_at)}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${f.bg} ${f.color}`}>{f.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ============================================ */}
      {/* CHAT BUBBLE - Style Chatbot                  */}
      {/* ============================================ */}

      {/* Bouton flottant */}
      <button
        onClick={() => { setChatOpen(!chatOpen); if (!chatOpen) setChatStep('list') }}
        className="fixed bottom-6 md:bottom-6 right-6 z-30 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center transition-all hover:scale-110 active:scale-95" style={{ bottom: "calc(env(safe-area-inset-bottom) + 88px)" }}
      >
        {chatOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>
            )}
          </>
        )}
      </button>

      {/* Fenêtre chat */}
      {chatOpen && (
        <div className="fixed z-40 bg-white shadow-2xl border-slate-200 overflow-hidden flex flex-col inset-0 md:inset-auto md:bottom-28 md:right-6 md:w-[380px] md:rounded-2xl md:border" style={{ height: "100%", maxHeight: "100dvh" }} >

          {/* Header chat */}
          <div className="bg-indigo-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              {chatStep !== 'list' && (
                <button onClick={() => { setChatStep('list'); setSelectedThread(null) }} className="text-white/70 hover:text-white transition mr-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm">
                  {chatStep === 'list' ? 'Support Fidali' : chatStep === 'new' ? 'Nouveau message' : selectedThread?.subject}
                </p>
                <p className="text-white/60 text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  En ligne · Répond rapidement
                </p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-white/50 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* === LISTE DES CONVERSATIONS === */}
          {chatStep === 'list' && (
            <div className="flex-1 overflow-y-auto">
              {/* Message de bienvenue */}
              <div className="p-4 bg-indigo-50 border-b border-indigo-100">
                <p className="text-sm text-indigo-900 font-medium">👋 Bonjour {merchant?.business_name} !</p>
                <p className="text-xs text-indigo-600 mt-1">Comment pouvons-nous vous aider ?</p>
              </div>

              {/* Bouton nouveau message */}
              <button
                onClick={() => setChatStep('new')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition border-b border-slate-100"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-indigo-600">Nouveau message</p>
                  <p className="text-[10px] text-slate-400">Posez votre question</p>
                </div>
              </button>

              {/* Liste des threads */}
              {threadList.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-sm text-slate-500">Aucun message</p>
                  <p className="text-xs text-slate-400 mt-1">Envoyez votre premier message !</p>
                </div>
              ) : (
                <div>
                  {threadList.map((thread, i) => (
                    <button
                      key={i}
                      onClick={() => openThread(thread.lastMsg)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition border-b border-slate-50 text-left ${thread.hasUnread ? 'bg-indigo-50/50' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        thread.lastMsg.status === 'replied' ? 'bg-emerald-100' : thread.lastMsg.status === 'unread' ? 'bg-amber-100' : 'bg-slate-100'
                      }`}>
                        {thread.lastMsg.status === 'replied' ? (
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${thread.hasUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{thread.subject}</p>
                          <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">{timeAgo(thread.lastMsg.created_at)}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {thread.lastMsg.admin_reply ? `Admin: ${thread.lastMsg.admin_reply.slice(0, 40)}...` : thread.lastMsg.message?.slice(0, 40)}...
                        </p>
                      </div>
                      {thread.hasUnread && (
                        <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === NOUVEAU MESSAGE === */}
          {chatStep === 'new' && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4">
                {/* Bot message */}
                <div className="flex gap-2 mb-4">
                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                    <p className="text-sm text-slate-700">Quel est le sujet de votre message ?</p>
                  </div>
                </div>

                {/* Sujets rapides */}
                <div className="space-y-2 ml-9">
                  {[
                    { value: 'Problème technique', emoji: '🔧' },
                    { value: 'Question abonnement', emoji: '💰' },
                    { value: 'Demande fonctionnalité', emoji: '💡' },
                    { value: 'Signaler un bug', emoji: '🐛' },
                    { value: 'Aide utilisation', emoji: '❓' },
                    { value: 'Autre', emoji: '📋' },
                  ].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setChatSubject(s.value)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition ${
                        chatSubject === s.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      {s.emoji} {s.value}
                    </button>
                  ))}
                </div>

                {chatSubject && (
                  <div className="mt-4">
                    <div className="flex gap-2 mb-3">
                      <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="bg-slate-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                        <p className="text-sm text-slate-700">Décrivez votre problème ci-dessous 👇</p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              {chatSubject && (
                <div className="p-3 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={chatSending || !chatInput.trim()}
                    className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition disabled:opacity-40"
                  >
                    {chatSending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* === THREAD (conversation) === */}
          {chatStep === 'thread' && selectedThread && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">

                {/* Afficher tous les messages du même sujet */}
                {chatMessages
                  .filter((m) => m.subject === selectedThread.subject)
                  .map((msg, i) => (
                    <div key={msg.id || i}>
                      {/* Date separator */}
                      {(i === 0 || formatDate(msg.created_at) !== formatDate(chatMessages.filter((m) => m.subject === selectedThread.subject)[i - 1]?.created_at)) && (
                        <div className="text-center my-3">
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{formatDate(msg.created_at)}</span>
                        </div>
                      )}

                      {/* Message du marchand (à droite) */}
                      <div className="flex justify-end">
                        <div className="max-w-[80%]">
                          <div className="bg-indigo-600 text-white rounded-2xl rounded-br-md px-4 py-2.5">
                            <p className="text-sm">{msg.message}</p>
                          </div>
                          <p className="text-[10px] text-slate-400 text-right mt-1">{formatTime(msg.created_at)}</p>
                        </div>
                      </div>

                      {/* Réponse admin (à gauche) */}
                      {msg.admin_reply && (
                        <div className="flex gap-2 mt-2">
                          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-xs">🛡️</span>
                          </div>
                          <div className="max-w-[80%]">
                            <div className="bg-slate-100 rounded-2xl rounded-tl-md px-4 py-2.5">
                              <p className="text-sm text-slate-700">{msg.admin_reply}</p>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">{msg.replied_at ? formatTime(msg.replied_at) : ''} · Admin</p>
                          </div>
                        </div>
                      )}

                      {/* Status */}
                      {!msg.admin_reply && (
                        <div className="flex justify-end mt-1">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            {msg.status === 'unread' ? '⏳ En attente' : msg.status === 'read' ? '👁 Lu' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                <div ref={chatEndRef} />
              </div>

              {/* Input pour répondre dans le thread */}
              <div className="p-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Envoyer un message..."
                  className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={chatSending || !chatInput.trim()}
                  className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition disabled:opacity-40"
                >
                  {chatSending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
