'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'

export default function DashboardPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [pending, setPending] = useState<any[]>([])
  const [stats, setStats] = useState({ total_clients: 0, total_points: 0, total_rewards: 0 })
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)
    loadData(m.id)
  }, [router])

  const loadData = async (merchantId: string) => {
    try {
      const { supabase } = await import('@/database/supabase-client')
      const { data: cardsData } = await supabase.from('loyalty_cards').select('*').eq('merchant_id', merchantId).eq('is_active', true).order('created_at', { ascending: false })
      const cardIds = (cardsData || []).map((c: any) => c.id)
      
      let clientCardsData: any[] = []
      let pendingData: any[] = []
      
      if (cardIds.length > 0) {
        const { data: cc } = await supabase.from('client_cards').select('*, clients(*), loyalty_cards(*)').in('card_id', cardIds)
        clientCardsData = cc || []
        const { data: pd } = await supabase.from('pending_presences').select('*, clients(*), loyalty_cards(*)').in('card_id', cardIds).eq('status', 'pending').order('created_at', { ascending: false })
        pendingData = pd || []
      }
      
      setCards(cardsData || [])
      setClients(clientCardsData)
      setPending(pendingData)
      
      const totalClients = new Set(clientCardsData.map((c: any) => c.client_id)).size
      const totalPoints = clientCardsData.reduce((sum: number, c: any) => sum + (c.points || 0), 0)
      const totalRewards = clientCardsData.reduce((sum: number, c: any) => sum + (c.total_rewards_redeemed || 0), 0)
      setStats({ total_clients: totalClients, total_points: totalPoints, total_rewards: totalRewards })
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleValidate = async (id: string) => {
    try {
      const { supabase } = await import('@/database/supabase-client')
      await supabase.from('pending_presences').update({ status: 'validated' }).eq('id', id)
      if (merchant) loadData(merchant.id)
    } catch {}
  }

  const handleReject = async (id: string) => {
    try {
      const { supabase } = await import('@/database/supabase-client')
      await supabase.from('pending_presences').update({ status: 'rejected' }).eq('id', id)
      if (merchant) loadData(merchant.id)
    } catch {}
  }

  const handlePrintQR = (card: any) => {
    router.push(`/dashboard/print/${card.id}`)
  }

  const getCardURL = (code: string) => {
    return typeof window !== 'undefined' ? `${window.location.origin}/join/${code}` : ''
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900">{merchant?.business_name || 'Dashboard'}</h1>
                <p className="text-xs text-slate-500">Programme de fidélité</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/dashboard/create-card')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition">
                + Nouvelle carte
              </button>
              <button onClick={() => { localStorage.clear(); sessionStorage.clear(); router.push('/login') }} className="p-2 text-slate-400 hover:text-slate-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Clients</span>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.total_clients}</p>
            <p className="text-xs text-slate-400 mt-1">Membres actifs</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Points actifs</span>
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.total_points}</p>
            <p className="text-xs text-slate-400 mt-1">En circulation</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Récompenses</span>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.total_rewards}</p>
            <p className="text-xs text-slate-400 mt-1">Distribuées</p>
          </div>
        </div>

        {/* Validations en attente */}
        {pending.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">!</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Validations en attente</h2>
                  <p className="text-xs text-slate-500">{pending.length} scan{pending.length > 1 ? 's' : ''} à valider</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {pending.map((p: any) => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-slate-600 font-bold text-sm">{(p.clients?.name || 'Client')[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{p.clients?.name || 'Client'}</p>
                      <p className="text-xs text-slate-500">{p.loyalty_cards?.business_name} • {new Date(p.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleValidate(p.id)} className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition">
                      ✓ Valider
                    </button>
                    <button onClick={() => handleReject(p.id)} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition">
                      ✕ Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mes cartes de fidélité */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-black text-slate-900">Mes cartes de fidélité</h2>
            <p className="text-xs text-slate-500 mt-1">{cards.length} carte{cards.length > 1 ? 's' : ''} active{cards.length > 1 ? 's' : ''}</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card: any) => (
              <div key={card.id} className="group relative rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xl">
                <div className="p-6" style={{ background: `linear-gradient(135deg, ${card.color1}, ${card.color2})` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                      {card.logo_emoji || '🎁'}
                    </div>
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-bold">
                      {card.max_points}x
                    </span>
                  </div>
                  <h3 className="text-white font-black text-lg mb-1">{card.business_name}</h3>
                  <p className="text-white/80 text-sm">{card.reward}</p>
                </div>
                <div className="bg-white p-4 flex items-center gap-2">
                  <button onClick={() => router.push(`/dashboard/card/${card.id}`)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition">
                    📊 Détails
                  </button>
                  <button onClick={() => setShowQR(card.code)} className="flex-1 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition">
                    📱 QR
                  </button>
                  <button onClick={() => handlePrintQR(card)} className="flex-1 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-xs font-bold transition">
                    🖨️ Print
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clients récents */}
        {clients.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-black text-slate-900">Clients récents</h2>
              <p className="text-xs text-slate-500 mt-1">{clients.length} membre{clients.length > 1 ? 's' : ''}</p>
            </div>
            <div className="divide-y divide-slate-100">
              {clients.slice(0, 10).map((c: any) => (
                <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-slate-600 font-bold text-sm">{(c.clients?.name || 'C')[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{c.clients?.name}</p>
                      <p className="text-xs text-slate-500">{c.clients?.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600 text-sm">{c.points} pts</p>
                    <p className="text-xs text-slate-400">{c.loyalty_cards?.business_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal QR */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQR(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">QR Code</h3>
              <button onClick={() => setShowQR(null)} className="text-slate-400 hover:text-slate-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 flex items-center justify-center">
              <QRCode value={getCardURL(showQR)} size={200} level="H" />
            </div>
            <p className="text-center text-xs text-slate-500 mt-4 font-mono">{showQR}</p>
          </div>
        </div>
      )}

    </div>
  )
}
