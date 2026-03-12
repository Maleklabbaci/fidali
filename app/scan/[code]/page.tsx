'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Step = 'loading' | 'not_found' | 'new_client' | 'returning' | 'pending' | 'validated' | 'rejected' | 'cooldown' | 'error'

// Helper pour convertir la clé VAPID
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

// Activer les notifications push pour un client
async function enablePushForClient(clientId: string) {
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
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON(), clientId }),
    })
  } catch (e) {
    console.error('Push subscribe error:', e)
  }
}

export default function ScanPage() {
  const params = useParams()
  const router = useRouter()
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
  const [cooldownMinutes, setCooldownMinutes] = useState(0)
  const [pushEnabled, setPushEnabled] = useState(false)

  useEffect(() => { loadCard() }, [cardCode])

  useEffect(() => {
    if (!presenceId) return
    const interval = setInterval(async () => {
      try {
        const { supabase } = await import('@/database/supabase-client')
        const { data } = await supabase.from('pending_presences').select('status').eq('id', presenceId).single()
        if (data?.status === 'confirmed') { setStep('validated'); clearInterval(interval) }
        else if (data?.status === 'rejected') { setStep('rejected'); clearInterval(interval) }
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [presenceId])

  // Cooldown timer
  useEffect(() => {
    if (step !== 'cooldown' || cooldownMinutes <= 0) return
    const interval = setInterval(() => {
      setCooldownMinutes((prev) => {
        if (prev <= 1) { setStep('returning'); return 0 }
        return prev - 1
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [step, cooldownMinutes])

  // Vérifier si push déjà activé
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof Notification !== 'undefined') {
        setPushEnabled(Notification.permission === 'granted')
      }
    } catch {}
  }, [])

  const loadCard = async () => {
    try {
      const { supabase } = await import('@/database/supabase-client')
      const { data: cardData } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('code', cardCode)
        .eq('is_active', true)
        .single()

      if (!cardData) { setStep('not_found'); return }
      setCard(cardData)
      setMaxPoints(cardData.max_points)

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
      const { supabase } = await import('@/database/supabase-client')

      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', clientPhone)
        .single()

      if (!client) { setStep('new_client'); return }

      const { data: clientCard } = await supabase
        .from('client_cards')
        .select('*')
        .eq('client_id', client.id)
        .eq('card_id', cardData.id)
        .single()

      if (!clientCard) { setStep('new_client'); return }

      setClientData({ client, clientCard })
      setPoints(clientCard.points || 0)
      setName(client.name)
      setPhone(clientPhone)

      localStorage.setItem('fidali_client', JSON.stringify(client))

      const { data: lastPresence } = await supabase
        .from('pending_presences')
        .select('created_at')
        .eq('client_id', client.id)
        .eq('card_id', cardData.id)
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (lastPresence) {
        const timeSince = Date.now() - new Date(lastPresence.created_at).getTime()
        const twoHours = 2 * 60 * 60 * 1000
        if (timeSince < twoHours) {
          const remaining = Math.ceil((twoHours - timeSince) / 60000)
          setCooldownMinutes(remaining)
          setStep('cooldown')
          return
        }
      }

      setStep('returning')
    } catch {
      setStep('new_client')
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setLoading(true)
    setError('')
    const cleanPhone = phone.replace(/\s/g, '')

    try {
      const { supabase } = await import('@/database/supabase-client')

      let { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', cleanPhone)
        .maybeSingle()

      if (!client) {
        const { data: newClient, error: clientErr } = await supabase
          .from('clients')
          .insert({ name: name.trim(), phone: cleanPhone })
          .select()
          .single()
        if (clientErr) { setError('Erreur: ' + clientErr.message); setLoading(false); return }
        client = newClient
      }

      let { data: clientCard } = await supabase
        .from('client_cards')
        .select('*')
        .eq('client_id', client.id)
        .eq('card_id', card.id)
        .maybeSingle()

      if (!clientCard) {
        const { data: newCC, error: ccErr } = await supabase
          .from('client_cards')
          .insert({ client_id: client.id, card_id: card.id, points: 0, total_rewards_redeemed: 0 })
          .select()
          .single()
        if (ccErr) { setError('Erreur: ' + ccErr.message); setLoading(false); return }
        clientCard = newCC

        await supabase.from('activities').insert({
          merchant_id: card.merchant_id,
          card_id: card.id,
          client_id: client.id,
          client_card_id: newCC.id,
          type: 'join',
          points_amount: 0,
          description: `👋 ${name.trim()} a rejoint ${card.business_name}`,
        })
      }

      try { localStorage.setItem(`fidali_phone_${cardCode}`, cleanPhone) } catch {}
      try { localStorage.setItem('fidali_client', JSON.stringify(client)) } catch {}
      setClientData({ client, clientCard })
      setPoints(clientCard.points || 0)

      // Activer les push notifications — en arrière-plan, ne bloque pas le flow
      enablePushForClient(client.id).then(() => {
        try {
          setPushEnabled(typeof Notification !== 'undefined' && Notification.permission === 'granted')
        } catch {}
      }).catch(() => {})

      const { data: presence } = await supabase
        .from('pending_presences')
        .insert({
          client_id: client.id,
          client_card_id: clientCard.id,
          card_id: card.id,
          merchant_id: card.merchant_id,
          client_name: name.trim(),
          client_phone: cleanPhone,
          status: 'pending',
        })
        .select()
        .single()

      if (presence) setPresenceId(presence.id)
      setStep('pending')
    } catch (err) {
      console.error(err)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmVisit = async () => {
    if (!clientData) return
    setLoading(true)
    setError('')

    try {
      const { supabase } = await import('@/database/supabase-client')

      const { data: lastPresence } = await supabase
        .from('pending_presences')
        .select('created_at')
        .eq('client_id', clientData.client.id)
        .eq('card_id', card.id)
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (lastPresence) {
        const timeSince = Date.now() - new Date(lastPresence.created_at).getTime()
        const twoHours = 2 * 60 * 60 * 1000
        if (timeSince < twoHours) {
          const remaining = Math.ceil((twoHours - timeSince) / 60000)
          setCooldownMinutes(remaining)
          setStep('cooldown')
          setLoading(false)
          return
        }
      }

      const { data: presence } = await supabase
        .from('pending_presences')
        .insert({
          client_id: clientData.client.id,
          client_card_id: clientData.clientCard.id,
          card_id: card.id,
          merchant_id: card.merchant_id,
          client_name: clientData.client.name,
          client_phone: clientData.client.phone,
          status: 'pending',
        })
        .select()
        .single()

      if (presence) setPresenceId(presence.id)
      setStep('pending')
    } catch (err) {
      console.error(err)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleEnablePush = async () => {
    if (!clientData?.client?.id) return
    await enablePushForClient(clientData.client.id)
    setPushEnabled(Notification.permission === 'granted')
  }

  const progressPct = maxPoints > 0 ? Math.min((points / maxPoints) * 100, 100) : 0
  const rewardReached = points >= maxPoints

  const formatCooldown = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h > 0) return `${h}h${m > 0 ? ` ${m}min` : ''}`
    return `${m} min`
  }

  return (
    <div className="min-h-screen" style={{ background: card ? `linear-gradient(135deg, ${card.color1 || '#4f46e5'}, ${card.color2 || '#7c3aed'})` : '#4f46e5' }}>
      <div className="min-h-screen bg-black/20 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          {/* LOADING */}
          {step === 'loading' && (
            <div className="text-center text-white">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium">Chargement...</p>
            </div>
          )}

          {/* NOT FOUND */}
          {step === 'not_found' && (
            <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
              <p className="text-5xl mb-4">❌</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Carte introuvable</h2>
              <p className="text-gray-500 text-sm mb-6">Le code <strong>{cardCode}</strong> n&apos;existe pas ou a été désactivé.</p>
              <a href="/" className="text-indigo-600 hover:underline text-sm font-medium">Retour</a>
            </div>
          )}

          {/* NEW CLIENT */}
          {step === 'new_client' && card && (
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 text-white text-center border border-white/20">
                <div className="text-4xl mb-2">{card.logo_emoji || '🏪'}</div>
                <h2 className="text-2xl font-extrabold">{card.business_name}</h2>
                <p className="text-sm opacity-80 mt-1">{card.welcome_message || 'Bienvenue !'}</p>
                <div className="mt-4 bg-white/20 rounded-xl px-4 py-2 inline-block">
                  <span className="text-sm font-medium">🎁 {card.reward}</span>
                </div>
                <div className="mt-2 text-white/50 text-xs">{card.max_points} points pour la récompense</div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-gray-900 mb-1 text-center">Rejoindre le programme</h3>
                <p className="text-sm text-gray-500 mb-5 text-center">Gagnez des points à chaque visite !</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm mb-4">{error}</div>
                )}

                <form onSubmit={handleJoin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Votre nom</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Mohamed" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" autoFocus />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="0555 00 00 00" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>

                  {/* Push notification opt-in */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-3">
                    <span className="text-xl">🔔</span>
                    <div>
                      <p className="text-xs font-semibold text-indigo-800">Activer les notifications</p>
                      <p className="text-xs text-indigo-600 mt-0.5">Recevez une alerte quand vous gagnez des points ou débloquez une récompense.</p>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 text-sm">
                    {loading ? 'Inscription...' : '✅ Rejoindre & confirmer ma visite'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* RETURNING CLIENT */}
          {step === 'returning' && card && (
            <div className="space-y-4">
              <div
                className="rounded-3xl p-6 relative overflow-hidden shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${card.color1 || '#4f46e5'}, ${card.color2 || '#7c3aed'})`, minHeight: '200px' }}
              >
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/[0.05] rounded-full" />

                <div className="relative z-10 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <img src="/logo-white.png" alt="" className="w-5 h-5 object-contain opacity-50" />
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Carte de fidélité</p>
                      </div>
                      <h2 className="text-xl font-bold mt-0.5">{card.business_name}</h2>
                    </div>
                    <div className="bg-white/15 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                      <span className="text-sm font-bold">{points}/{maxPoints}</span>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-xl p-3 mb-4">
                    <p className="text-sm font-semibold">👤 {name}</p>
                    <p className="text-xs text-white/60">{phone}</p>
                  </div>

                  <div className="flex gap-[5px] mb-3">
                    {Array.from({ length: Math.min(maxPoints, 15) }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-3 rounded-full transition-all duration-500"
                        style={{
                          background: i < points
                            ? 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.7))'
                            : 'rgba(255,255,255,0.12)',
                          boxShadow: i < points ? '0 0 8px rgba(255,255,255,0.2)' : 'none',
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-white/60 text-xs">🎁 {card.reward}</p>
                    <p className="text-white/30 text-[10px] font-mono">{card.code}</p>
                  </div>

                  {rewardReached && (
                    <div className="mt-3 bg-yellow-400/20 border border-yellow-400/40 rounded-xl p-3 text-center animate-pulse">
                      <p className="font-bold">🎉 Récompense disponible !</p>
                      <p className="text-sm opacity-80">Demandez votre {card.reward}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl mx-4 -mt-2 p-4 border border-white/10">
                <div className="grid grid-cols-3 gap-3 text-center text-white">
                  <div>
                    <p className="font-bold">{points}</p>
                    <p className="text-white/40 text-[10px]">Points</p>
                  </div>
                  <div className="border-x border-white/10">
                    <p className="font-bold">{clientData?.clientCard?.total_rewards_redeemed || 0}</p>
                    <p className="text-white/40 text-[10px]">Récompenses</p>
                  </div>
                  <div>
                    <p className="font-bold">{Math.round(progressPct)}%</p>
                    <p className="text-white/40 text-[10px]">Progression</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-2xl text-center">
                <p className="text-4xl mb-3">🛍️</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmer votre visite</h3>
                <p className="text-sm text-gray-500 mb-5">Le commerçant devra valider pour ajouter vos points.</p>

                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm mb-4">{error}</div>
                )}

                <button onClick={handleConfirmVisit} disabled={loading} className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 text-sm mb-3">
                  {loading ? 'Envoi...' : '✅ Oui, confirmer ma visite'}
                </button>

                {/* Activer push si pas encore fait */}
                {!pushEnabled && (
                  <button onClick={handleEnablePush} className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-2xl transition flex items-center justify-center gap-2 text-sm border border-indigo-100 mb-3">
                    🔔 Activer les notifications push
                  </button>
                )}

                <button onClick={() => router.push(`/avis/${card.code}`)} className="w-full py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-2xl transition flex items-center justify-center gap-2 text-sm border border-amber-100">
                  ⭐ Donner mon avis
                </button>

                {phone && (
                  <button onClick={() => router.push(`/client/${encodeURIComponent(phone)}`)} className="w-full mt-2 py-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-semibold transition">
                    💳 Voir toutes mes cartes
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PENDING */}
          {step === 'pending' && card && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-pulse">⏳</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">En attente de validation</h2>
              <p className="text-gray-500 text-sm mb-6">
                <strong>{card.business_name}</strong> doit confirmer votre visite.
              </p>
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
                <p className="text-sm text-gray-500 mt-2">Veuillez patienter...</p>
                <p className="text-xs text-gray-400 mt-1">Mise à jour automatique</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                💡 Montrez cette page au commerçant
              </div>
            </div>
          )}

          {/* VALIDATED */}
          {step === 'validated' && card && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Visite confirmée !</h2>
                <p className="text-gray-500 text-sm mb-4">+{card.points_per_visit || 1} point(s) ajouté(s)</p>

                <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                  <div className="text-3xl font-extrabold text-gray-900">
                    {Math.min(points + (card.points_per_visit || 1), maxPoints)}/{maxPoints}
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(((points + (card.points_per_visit || 1)) / maxPoints) * 100, 100)}%`,
                        background: `linear-gradient(90deg, ${card.color1 || '#4f46e5'}, ${card.color2 || '#7c3aed'})`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">🎁 {card.reward}</p>
                </div>

                {(points + (card.points_per_visit || 1)) >= maxPoints && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4 animate-pulse">
                    <p className="text-2xl mb-1">🎉</p>
                    <p className="font-bold text-yellow-800">Récompense débloquée !</p>
                    <p className="text-sm text-yellow-600">Réclamez votre {card.reward}</p>
                  </div>
                )}

                <p className="text-sm text-gray-400 mb-4">Merci pour votre fidélité !</p>

                <div className="space-y-2">
                  <button onClick={() => router.push(`/avis/${card.code}`)} className="w-full py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-2xl transition flex items-center justify-center gap-2 text-sm border border-amber-100">
                    ⭐ Donner mon avis sur {card.business_name}
                  </button>

                  {phone && (
                    <button onClick={() => router.push(`/client/${encodeURIComponent(phone)}`)} className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold rounded-2xl transition text-sm border border-indigo-100">
                      💳 Voir toutes mes cartes
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* REJECTED */}
          {step === 'rejected' && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <p className="text-5xl mb-4">😔</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Visite non confirmée</h2>
              <p className="text-gray-500 text-sm mb-6">Le commerçant n&apos;a pas validé cette visite.</p>
              <button onClick={() => window.location.reload()} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 text-sm">
                Réessayer
              </button>
            </div>
          )}

          {/* COOLDOWN */}
          {step === 'cooldown' && card && (
            <div className="space-y-4">
              <div
                className="rounded-3xl p-6 relative overflow-hidden shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${card.color1 || '#4f46e5'}, ${card.color2 || '#7c3aed'})` }}
              >
                <div className="relative z-10 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Carte de fidélité</p>
                      <h2 className="text-xl font-bold mt-0.5">{card.business_name}</h2>
                    </div>
                    <div className="bg-white/15 px-3 py-1.5 rounded-full">
                      <span className="text-sm font-bold">{points}/{maxPoints}</span>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 mb-4">
                    <p className="text-sm font-semibold">👤 {name}</p>
                    <p className="text-xs text-white/60">{phone}</p>
                  </div>
                  <div className="flex gap-[5px] mb-3">
                    {Array.from({ length: Math.min(maxPoints, 15) }).map((_, i) => (
                      <div key={i} className="flex-1 h-3 rounded-full" style={{ background: i < points ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.12)' }} />
                    ))}
                  </div>
                  <p className="text-white/60 text-xs">🎁 {card.reward}</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-2xl text-center">
                <p className="text-4xl mb-3">⏰</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Trop tôt !</h3>
                <p className="text-sm text-gray-500 mb-4">Vous avez déjà validé une visite récemment.</p>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
                  <p className="text-2xl font-extrabold text-amber-700">{formatCooldown(cooldownMinutes)}</p>
                  <p className="text-xs text-amber-600 mt-1">avant la prochaine validation</p>
                </div>

                <button onClick={() => router.push(`/avis/${card.code}`)} className="w-full py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-2xl transition flex items-center justify-center gap-2 text-sm border border-amber-100">
                  ⭐ Donner mon avis en attendant
                </button>

                {phone && (
                  <button onClick={() => router.push(`/client/${encodeURIComponent(phone)}`)} className="w-full mt-2 py-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-semibold transition">
                    💳 Voir toutes mes cartes
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ERROR */}
          {step === 'error' && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <p className="text-5xl mb-4">⚠️</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur</h2>
              <p className="text-gray-500 text-sm mb-6">Une erreur est survenue.</p>
              <button onClick={() => window.location.reload()} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 text-sm">Réessayer</button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
