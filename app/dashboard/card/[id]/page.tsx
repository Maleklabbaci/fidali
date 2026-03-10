'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'

export default function CardDetailPage() {
  const router = useRouter()
  const params = useParams()
  const cardId = params.id as string

  const [card, setCard] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [pendingPresences, setPendingPresences] = useState<any[]>([])
  const [merchant, setMerchant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'qr' | 'clients' | 'presences'>('qr')
  const [notification, setNotification] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const stored = localStorage.getItem('merchant')
      if (!stored) { router.push('/login'); return }
      const m = JSON.parse(stored)
      setMerchant(m)

      const { getMyCards, getMyClients, getPendingPresences } = await import('@/database/supabase-client')
      const [cards, clientsData, presences] = await Promise.all([
        getMyCards(m.id),
        getMyClients(m.id),
        getPendingPresences(m.id),
      ])

      const found = cards.find((c: any) => c.id === cardId)
      setCard(found || null)
      setClients(clientsData)
      setPendingPresences(presences)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [cardId, router])

  useEffect(() => { loadData() }, [loadData])

  // Auto-refresh presences toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!merchant) return
      try {
        const { getPendingPresences } = await import('@/database/supabase-client')
        const presences = await getPendingPresences(merchant.id)
        
        // Nouvelle présence ?
        if (presences.length > pendingPresences.length) {
          const newest = presences[0]
          setNotification(`🔔 ${newest.client_name} demande une validation !`)
          setTimeout(() => setNotification(null), 5000)

          // Vibration
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
        }

        setPendingPresences(presences)
      } catch (e) {
        console.error(e)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [merchant, pendingPresences.length])

  const handleValidate = async (presence: any) => {
    try {
      const { validatePresence } = await import('@/database/supabase-client')
      const result = await validatePresence(
        presence.client_card_id,
        card?.points_per_visit || 1,
        presence.merchant_id
      )

      // Mettre à jour le statut de la présence
      const { supabase } = await import('@/database/supabase-client')
      await supabase
        .from('pending_presences')
        .update({ status: 'confirmed', resolved_at: new Date().toISOString() })
        .eq('id', presence.id)

      setNotification(`✅ ${presence.client_name} : +${card?.points_per_visit || 1} point(s)`)
      setTimeout(() => setNotification(null), 3000)

      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleReject = async (presenceId: string, clientName: string) => {
    try {
      const { rejectPresence } = await import('@/database/supabase-client')
      await rejectPresence(presenceId)

      setNotification(`❌ Visite de ${clientName} refusée`)
      setTimeout(() => setNotification(null), 3000)

      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRedeemReward = async (clientCardId: string, clientName: string) => {
    try {
      const { redeemReward } = await import('@/database/supabase-client')
      const result = await redeemReward(clientCardId, merchant.id)

      if (result.success) {
        setNotification(`🎁 Récompense donnée à ${clientName} ! Points remis à 0`)
        setTimeout(() => setNotification(null), 4000)
        loadData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-4xl animate-spin">⏳</div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold">Carte introuvable</h2>
          <button onClick={() => router.push('/dashboard')} className="mt-4 text-blue-600 hover:underline">← Retour</button>
        </div>
      </div>
    )
  }

  const scanUrl = typeof window !== 'undefined' ? `${window.location.origin}/scan/${card.code}` : ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification popup */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 px-6 py-4 animate-bounce max-w-sm">
          <p className="font-bold text-gray-900">{notification}</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{card.business_name}</h1>
            <p className="text-sm text-gray-500">Code : {card.code}</p>
          </div>
        </div>
        {pendingPresences.length > 0 && (
          <button
            onClick={() => setTab('presences')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-bold text-sm animate-pulse"
          >
            🔔 {pendingPresences.length} en attente
          </button>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Card Preview */}
        <div
          className="rounded-3xl p-6 text-white shadow-xl"
          style={{ background: `linear-gradient(135deg, ${card.color1}, ${card.color2})` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">{card.business_name}</h2>
              <p className="text-sm opacity-80 mt-1">{card.points_rule}</p>
              <p className="text-sm opacity-80 mt-2">🎁 {card.reward}</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 px-4 py-2 rounded-xl">
                <p className="text-xs opacity-80">Max</p>
                <p className="text-2xl font-extrabold">{card.max_points}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'qr', label: '📱 QR Code', count: null },
            { key: 'presences', label: '⏳ Validations', count: pendingPresences.length },
            { key: 'clients', label: '👥 Clients', count: clients.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition relative ${
                tab === t.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {t.label}
              {t.count !== null && t.count > 0 && (
                <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  tab === t.key ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* QR Code Tab */}
        {tab === 'qr' && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-gray-100">
                  <QRCodeSVG
                    value={scanUrl}
                    size={250}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Vos clients scannent ce QR pour gagner des points
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Partager la carte</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Lien</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={scanUrl}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm truncate"
                        />
                        <button
                          onClick={() => { navigator.clipboard.writeText(scanUrl); setNotification('📋 Lien copié !'); setTimeout(() => setNotification(null), 2000) }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shrink-0"
                        >
                          📋
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Code</label>
                      <div className="px-6 py-4 bg-gray-50 rounded-xl text-center">
                        <span className="text-3xl font-extrabold tracking-widest text-gray-900">{card.code}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `${card.business_name} — Carte de fidélité`,
                            text: `Rejoignez le programme de fidélité de ${card.business_name} ! 🎁 ${card.reward}`,
                            url: scanUrl,
                          })
                        }
                      }}
                      className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition"
                    >
                      📤 Partager
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                    >
                      🖨️ Imprimer le QR Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Presences Tab */}
        {tab === 'presences' && (
          <div className="space-y-3">
            {pendingPresences.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune visite en attente</h3>
                <p className="text-gray-500">Les visites de vos clients apparaîtront ici en temps réel.</p>
              </div>
            ) : (
              pendingPresences.map((p: any) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-amber-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl text-white font-bold">
                        {p.client_name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{p.client_name}</p>
                        <p className="text-sm text-gray-500">{p.client_phone}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          📍 {new Date(p.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {' • '}Expire dans {Math.max(0, Math.round((new Date(p.expires_at).getTime() - Date.now()) / 60000))} min
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleValidate(p)}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-sm"
                      >
                        ✓ Valider (+{card?.points_per_visit || 1} pt)
                      </button>
                      <button
                        onClick={() => handleReject(p.id, p.client_name)}
                        className="px-4 py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition"
                      >
                        ✗
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Clients Tab */}
        {tab === 'clients' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun client</h3>
                <p className="text-gray-500">Partagez votre QR code pour avoir vos premiers clients !</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {clients.map((c: any, i: number) => {
                  const pct = c.max_points > 0 ? Math.min((c.points / c.max_points) * 100, 100) : 0
                  const canRedeem = c.points >= c.max_points
                  return (
                    <div key={i} className="p-5 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg text-white font-bold">
                            {(c.client_name || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{c.client_name}</p>
                            <p className="text-sm text-gray-500">{c.client_phone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-extrabold text-gray-900">{c.points}/{c.max_points}</p>
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  background: `linear-gradient(90deg, ${card?.color1 || '#3B82F6'}, ${card?.color2 || '#8B5CF6'})`,
                                }}
                              />
                            </div>
                          </div>

                          {canRedeem && (
                            <button
                              onClick={() => handleRedeemReward(c.client_card_id, c.client_name)}
                              className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-xl text-sm font-bold hover:bg-yellow-500 transition animate-pulse"
                            >
                              🎁 Donner
                            </button>
                          )}
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
