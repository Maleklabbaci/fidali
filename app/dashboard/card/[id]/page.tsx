'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function CardDetailPage() {
  const router = useRouter()
  const params = useParams()
  const cardId = params.id as string

  const [card, setCard] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [pendingPresences, setPendingPresences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'clients' | 'presences'>('overview')

  useEffect(() => {
    loadCard()
  }, [cardId])

  const loadCard = async () => {
    try {
      const stored = localStorage.getItem('merchant')
      if (!stored) { router.push('/login'); return }
      const merchant = JSON.parse(stored)

      const { getMyCards, getMyClients, getPendingPresences } = await import('@/database/supabase-client')
      const [cards, clientsData, presences] = await Promise.all([
        getMyCards(merchant.id),
        getMyClients(merchant.id),
        getPendingPresences(merchant.id),
      ])

      const found = cards.find((c: any) => c.id === cardId)
      setCard(found)
      setClients(clientsData)
      setPendingPresences(presences)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleValidatePresence = async (presence: any) => {
    try {
      const { validatePresence } = await import('@/database/supabase-client')
      await validatePresence(presence.client_card_id, card.points_per_visit, presence.merchant_id)
      loadCard()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRejectPresence = async (presenceId: string) => {
    try {
      const { rejectPresence } = await import('@/database/supabase-client')
      await rejectPresence(presenceId)
      loadCard()
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
          <h2 className="text-xl font-bold text-gray-900">Carte introuvable</h2>
          <button onClick={() => router.push('/dashboard')} className="mt-4 text-blue-600 hover:underline">
            ← Retour au dashboard
          </button>
        </div>
      </div>
    )
  }

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join?code=${card.code}`
    : ''

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{card.business_name}</h1>
            <p className="text-sm text-gray-500">Code : {card.code}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Card Preview */}
        <div
          className="rounded-3xl p-6 text-white shadow-xl max-w-md"
          style={{ background: `linear-gradient(135deg, ${card.color1}, ${card.color2})` }}
        >
          <h3 className="text-lg font-extrabold mb-1">{card.business_name}</h3>
          <p className="text-sm opacity-80 mb-3">{card.points_rule}</p>
          <p className="text-sm opacity-80">🎁 {card.reward}</p>
          <p className="text-xs opacity-60 mt-2">{card.max_points} points nécessaires</p>
        </div>

        {/* QR Code & Share */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📱 Partager cette carte</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-6 rounded-2xl border-2 border-gray-100">
                <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                  {/* QR Code placeholder */}
                  <div className="text-center">
                    <div className="text-6xl mb-2">📱</div>
                    <p className="text-sm text-gray-500 font-bold">{card.code}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500">Vos clients scannent ce QR code pour rejoindre</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lien de partage</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700"
                  >
                    📋 Copier
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code de la carte</label>
                <div className="px-6 py-4 bg-gray-50 rounded-xl text-center">
                  <span className="text-3xl font-extrabold tracking-widest text-gray-900">{card.code}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: card.business_name, text: `Rejoignez ma carte de fidélité ! Code : ${card.code}`, url: shareUrl })
                  }
                }}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition"
              >
                📤 Partager
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'overview', label: '📊 Vue d\'ensemble' },
            { key: 'clients', label: '👥 Clients' },
            { key: 'presences', label: '⏳ Présences en attente' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
                tab === t.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'clients' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👥</div>
                <p className="text-gray-500">Aucun client pour le moment</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Client</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Points</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Progression</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Dernière visite</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-sm">{c.client_name}</p>
                        <p className="text-xs text-gray-500">{c.client_phone}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm">{c.points}/{c.max_points}</td>
                      <td className="px-6 py-4">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min((c.points / c.max_points) * 100, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {c.last_validation_at ? new Date(c.last_validation_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'presences' && (
          <div className="space-y-3">
            {pendingPresences.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-gray-500">Aucune présence en attente</p>
              </div>
            ) : (
              pendingPresences.map((p: any) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                      👤
                    </div>
                    <div>
                      <p className="font-bold">{p.client_name}</p>
                      <p className="text-sm text-gray-500">{p.client_phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleValidatePresence(p)}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-bold hover:bg-green-200"
                    >
                      ✓ Valider
                    </button>
                    <button
                      onClick={() => handleRejectPresence(p.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-bold hover:bg-red-200"
                    >
                      ✗ Refuser
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-2xl font-extrabold text-gray-900">{clients.length}</div>
              <div className="text-sm text-gray-500">Clients</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="text-3xl mb-2">⏳</div>
              <div className="text-2xl font-extrabold text-gray-900">{pendingPresences.length}</div>
              <div className="text-sm text-gray-500">En attente</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-extrabold text-gray-900">{card.max_points}</div>
              <div className="text-sm text-gray-500">Points max</div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
