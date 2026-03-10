'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

type Step = 'loading' | 'not_found' | 'new_client' | 'returning' | 'pending' | 'validated' | 'rejected' | 'cooldown' | 'error'

export default function ScanPage() {
  const params = useParams()
  const cardCode = (params.code as string).toUpperCase()

  const [step, setStep] = useState<Step>('loading')
  const [card, setCard] = useState<any>(null)
  const [clientData, setClientData] = useState<any>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [presenceId, setPresenceId] = useState<string | null>(null)
  const [points, setPoints] = useState(0)
  const [maxPoints, setMaxPoints] = useState(0)

  useEffect(() => {
    loadCard()
  }, [cardCode])

  // Écouter le statut de la présence
  useEffect(() => {
    if (!presenceId) return
    
    let interval: NodeJS.Timeout
    
    const checkStatus = async () => {
      try {
        const { supabase } = await import('@/database/supabase-client')
        const { data } = await supabase
          .from('pending_presences')
          .select('status')
          .eq('id', presenceId)
          .single()
        
        if (data?.status === 'confirmed') {
          setStep('validated')
          clearInterval(interval)
        } else if (data?.status === 'rejected') {
          setStep('rejected')
          clearInterval(interval)
        }
      } catch (e) {
        console.error(e)
      }
    }

    interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [presenceId])

  const loadCard = async () => {
    try {
      const { getCardByCode } = await import('@/database/supabase-client')
      const cardData = await getCardByCode(cardCode)

      if (!cardData) {
        setStep('not_found')
        return
      }

      setCard(cardData)
      setMaxPoints(cardData.max_points)

      // Vérifier si le client a déjà scanné (via localStorage)
      const savedPhone = localStorage.getItem(`fidali_phone_${cardCode}`)
      if (savedPhone) {
        await checkExistingClient(savedPhone, cardData)
      } else {
        setStep('new_client')
      }
    } catch (err) {
      console.error(err)
      setStep('error')
    }
  }

  const checkExistingClient = async (clientPhone: string, cardData: any) => {
    try {
      const { findClientByPhone } = await import('@/database/supabase-client')
      const result = await findClientByPhone(clientPhone, cardData.id)

      if (result) {
        setClientData(result)
        setPoints(result.clientCard.points)
        setName(result.client.name)
        setPhone(clientPhone)

        // Vérifier le cooldown
        const lastValidation = result.clientCard.last_validation_at
        if (lastValidation) {
          const timeSince = Date.now() - new Date(lastValidation).getTime()
          const twoHours = 2 * 60 * 60 * 1000
          if (timeSince < twoHours) {
            setStep('cooldown')
            return
          }
        }

        setStep('returning')
      } else {
        setStep('new_client')
      }
    } catch {
      setStep('new_client')
    }
  }

  // Nouveau client rejoint la carte
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setLoading(true)
    setError('')

    const cleanPhone = phone.replace(/\s/g, '')

    try {
      const { joinCard, createPendingPresence } = await import('@/database/supabase-client')
      const result = await joinCard(cardCode, name.trim(), cleanPhone)

      if (result.success === false) {
        setError(result.error || 'Erreur')
        setLoading(false)
        return
      }

      // Sauvegarder le téléphone
      localStorage.setItem(`fidali_phone_${cardCode}`, cleanPhone)
      localStorage.setItem(`fidali_name`, name.trim())

      setPoints(result.points || 0)
      setMaxPoints(result.max_points || card.max_points)

      // Créer une présence en attente
      const presence = await createPendingPresence({
        clientId: result.client_id,
        clientCardId: result.client_card_id,
        cardId: card.id,
        merchantId: card.merchant_id,
        clientName: name.trim(),
        clientPhone: cleanPhone,
      })

      if (presence) {
        setPresenceId(presence.id)
      }

      setStep('pending')
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  // Client existant confirme sa visite
  const handleConfirmVisit = async () => {
    if (!clientData) return
    setLoading(true)

    try {
      const { createPendingPresence } = await import('@/database/supabase-client')
      
      const presence = await createPendingPresence({
        clientId: clientData.client.id,
        clientCardId: clientData.clientCard.id,
        cardId: card.id,
        merchantId: card.merchant_id,
        clientName: clientData.client.name,
        clientPhone: clientData.client.phone,
      })

      if (presence) {
        setPresenceId(presence.id)
      }

      setStep('pending')
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const progressPct = maxPoints > 0 ? Math.min((points / maxPoints) * 100, 100) : 0
  const rewardReached = points >= maxPoints

  return (
    <div className="min-h-screen" style={{ background: card ? `linear-gradient(135deg, ${card.color1}, ${card.color2})` : '#3B82F6' }}>
      <div className="min-h-screen bg-black/20 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          {/* ========== LOADING ========== */}
          {step === 'loading' && (
            <div className="text-center text-white">
              <div className="text-6xl animate-spin mb-4">⏳</div>
              <p className="text-xl font-medium">Chargement de la carte...</p>
            </div>
          )}

          {/* ========== NOT FOUND ========== */}
          {step === 'not_found' && (
            <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Carte introuvable</h2>
              <p className="text-gray-500 mb-6">Le code <strong>{cardCode}</strong> n&apos;existe pas ou a été désactivé.</p>
              <a href="/" className="text-blue-600 hover:underline text-sm">Retour à l&apos;accueil</a>
            </div>
          )}

          {/* ========== NEW CLIENT ========== */}
          {step === 'new_client' && card && (
            <div className="space-y-4">
              {/* Card Preview */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 text-white text-center border border-white/20">
                <div className="text-4xl mb-2">{card.logo_emoji || '🏪'}</div>
                <h2 className="text-2xl font-extrabold">{card.business_name}</h2>
                <p className="text-sm opacity-80 mt-1">{card.welcome_message}</p>
                <div className="mt-4 bg-white/20 rounded-xl px-4 py-2 inline-block">
                  <span className="text-sm font-medium">🎁 {card.reward}</span>
                </div>
              </div>

              {/* Join Form */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-gray-900 mb-1 text-center">Rejoindre la carte de fidélité</h3>
                <p className="text-sm text-gray-500 mb-5 text-center">Gagnez des points à chaque visite !</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleJoin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Votre nom</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Mohamed"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="0555 00 00 00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-500 hover:to-purple-500 transition disabled:opacity-50"
                  >
                    {loading ? '⏳ Inscription...' : '✅ Rejoindre & confirmer ma visite'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========== RETURNING CLIENT ========== */}
          {step === 'returning' && card && (
            <div className="space-y-4">
              {/* Points Card */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 text-white border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-extrabold">{card.business_name}</h2>
                    <p className="text-sm opacity-80">Bonjour {name} 👋</p>
                  </div>
                  <div className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-bold">
                    {points}/{maxPoints}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex gap-1.5 mb-3">
                  {Array.from({ length: Math.min(maxPoints, 20) }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-3 rounded-full transition-all ${
                        i < (points / maxPoints) * Math.min(maxPoints, 20)
                          ? 'bg-white shadow-lg shadow-white/30'
                          : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-80">🎁 {card.reward}</span>
                  <span className="opacity-60">{Math.round(progressPct)}%</span>
                </div>

                {rewardReached && (
                  <div className="mt-4 bg-yellow-400/20 border border-yellow-400/40 rounded-xl p-3 text-center">
                    <span className="text-lg">🎉</span>
                    <p className="font-bold">Récompense disponible !</p>
                    <p className="text-sm opacity-80">Demandez votre {card.reward}</p>
                  </div>
                )}
              </div>

              {/* Confirm Visit */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl text-center">
                <div className="text-5xl mb-3">🛍️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Avez-vous effectué un achat ?
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Le commerçant devra confirmer votre visite pour ajouter vos points.
                </p>

                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm mb-4">{error}</div>
                )}

                <button
                  onClick={handleConfirmVisit}
                  disabled={loading}
                  className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-50 mb-3"
                >
                  {loading ? '⏳...' : '✅ Oui, confirmer ma visite'}
                </button>
                
                <a href="/" className="text-gray-400 hover:text-gray-600 text-sm">
                  Non, retour à l&apos;accueil
                </a>
              </div>
            </div>
          )}

          {/* ========== PENDING ========== */}
          {step === 'pending' && card && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-pulse">
                ⏳
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">En attente de validation</h2>
              <p className="text-gray-500 mb-6">
                Le commerçant <strong>{card.business_name}</strong> doit confirmer votre visite.
              </p>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
                <p className="text-sm text-gray-500 mt-2">Veuillez patienter...</p>
                <p className="text-xs text-gray-400 mt-1">Cette page se met à jour automatiquement</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                💡 Montrez cette page au commerçant si nécessaire
              </div>
            </div>
          )}

          {/* ========== VALIDATED ========== */}
          {step === 'validated' && card && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                🎉
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Visite confirmée !</h2>
              <p className="text-gray-500 mb-4">
                +{card.points_per_visit} point(s) ajouté(s)
              </p>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="text-3xl font-extrabold text-gray-900">
                  {points + card.points_per_visit}/{maxPoints}
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(((points + card.points_per_visit) / maxPoints) * 100, 100)}%`,
                      background: `linear-gradient(90deg, ${card.color1}, ${card.color2})`,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">🎁 {card.reward}</p>
              </div>

              <p className="text-sm text-gray-400">Merci pour votre fidélité !</p>
            </div>
          )}

          {/* ========== REJECTED ========== */}
          {step === 'rejected' && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Visite non confirmée</h2>
              <p className="text-gray-500 mb-6">Le commerçant n&apos;a pas validé cette visite.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* ========== COOLDOWN ========== */}
          {step === 'cooldown' && card && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="text-6xl mb-4">⏰</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Trop tôt !</h2>
              <p className="text-gray-500 mb-4">
                Vous avez déjà validé une visite récemment chez <strong>{card.business_name}</strong>.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-amber-700 text-sm font-medium">
                  ⏳ Vous pourrez scanner à nouveau dans 2 heures
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm text-gray-500">Vos points actuels</p>
                <div className="text-3xl font-extrabold text-gray-900">{points}/{maxPoints}</div>
              </div>
            </div>
          )}

          {/* ========== ERROR ========== */}
          {step === 'error' && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
              <p className="text-gray-500 mb-6">Une erreur est survenue. Veuillez réessayer.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
