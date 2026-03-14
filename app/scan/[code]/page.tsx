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
        const { data } = await supabase.from('pending_presences').select('status').eq('id', presenceId).maybeSingle()
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
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPushEnabled((window as any).Notification.permission === 'granted')
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
        .maybeSingle()

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
        .maybeSingle()

      if (!client) { setStep('new_client'); return }

      const { data: clientCard } = await supabase
        .from('client_cards')
        .select('*')
        .eq('client_id', client.id)
        .eq('card_id', cardData.id)
        .maybeSingle()

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
        .maybeSingle()

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

  // ✅ MODIFICATION PRINCIPALE : AUTO-ACCEPTATION
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
          .maybeSingle()
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
          .maybeSingle()
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

      localStorage.setItem(`fidali_phone_${cardCode}`, cleanPhone)
      localStorage.setItem('fidali_client', JSON.stringify(client))
      setClientData({ client, clientCard })
      setPoints(clientCard.points || 0)

      // Activer les push notifications (non-bloquant)
      try { enablePushForClient(client.id).catch(() => {}) } catch {}
      try { if ('Notification' in window) setPushEnabled((window as any).Notification.permission === 'granted') } catch {}

      // ✅ NOUVEAU : Redirection directe sans attente de validation
      setTimeout(() => {
        router.push(`/client/${encodeURIComponent(cleanPhone)}`)
      }, 1500)

      setStep('validated')
      setLoading(false)

    } catch (err: any) {
      console.error(err)
      setError('Une erreur est survenue')
      setLoading(false)
    }
  }

  const handleRequestPoints = async () => {
    if (!clientData) return
    setLoading(true)

    try {
      const { supabase } = await import('@/database/supabase-client')

      const { data: presence, error } = await supabase
        .from('pending_presences')
        .insert({
          client_id: clientData.client.id,
          client_card_id: clientData.clientCard.id,
          card_id: card.id,
          merchant_id: card.merchant_id,
          client_name: name,
          client_phone: phone,
          status: 'pending',
        })
        .select()
        .maybeSingle()

      if (error) throw error

      setPresenceId(presence.id)
      setStep('pending')
    } catch (err) {
      console.error(err)
      setError('Erreur lors de la demande')
    } finally {
      setLoading(false)
    }
  }

  const handleEnablePush = async () => {
    if (!clientData?.client?.id) return
    try {
      await enablePushForClient(clientData.client.id)
      setPushEnabled(true)
    } catch (e) {
      alert('Impossible d\'activer les notifications')
    }
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (step === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <p className="text-6xl mb-6">❌</p>
          <p className="text-2xl font-bold mb-2">Carte introuvable</p>
          <p className="text-white/60">Ce code QR n'est pas valide</p>
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <p className="text-6xl mb-6">⚠️</p>
          <p className="text-2xl font-bold mb-2">Erreur</p>
          <p className="text-white/60">Une erreur est survenue</p>
        </div>
      </div>
    )
  }

  if (step === 'new_client') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div
            className="rounded-3xl p-8 mb-6 relative overflow-hidden shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${card?.color1 || '#1e3a5f'}, ${card?.color2 || '#2d5a87'})`,
            }}
          >
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} />
            <div className="relative z-10 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">{card?.business_name}</h1>
              <p className="text-white/80 text-sm">Programme de fidélité</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Rejoindre le programme</h2>
            
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Nom complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmed Benali"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Numéro de téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0555 12 34 56"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition disabled:opacity-50"
              >
                {loading ? 'Inscription...' : '🎉 Rejoindre maintenant'}
              </button>
            </form>

            <p className="text-white/40 text-xs text-center mt-4">
              Vos données sont sécurisées et ne seront jamais partagées
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'validated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <p className="text-5xl">✅</p>
          </div>
          <p className="text-3xl font-bold mb-3">Bienvenue !</p>
          <p className="text-white/80 mb-6">Vous faites maintenant partie du programme</p>
          <p className="text-sm text-white/60">Redirection...</p>
        </div>
      </div>
    )
  }

  if (step === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-rose-800 to-pink-900 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <p className="text-6xl mb-6">❌</p>
          <p className="text-2xl font-bold mb-2">Demande refusée</p>
          <p className="text-white/60">Le commerçant n'a pas validé votre demande</p>
        </div>
      </div>
    )
  }

  if (step === 'cooldown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <p className="text-6xl mb-6">⏱️</p>
          <p className="text-2xl font-bold mb-2">Trop tôt !</p>
          <p className="text-white/70 mb-4">Vous avez déjà validé une visite récemment</p>
          <p className="text-3xl font-mono">{cooldownMinutes} min</p>
          <p className="text-white/40 text-sm mt-2">Temps d'attente avant la prochaine validation</p>
        </div>
      </div>
    )
  }

  if (step === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <div className="w-24 h-24 border-8 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
          <p className="text-2xl font-bold mb-2">En attente...</p>
          <p className="text-white/60">Le commerçant va valider votre présence</p>
        </div>
      </div>
    )
  }

  // step === 'returning'
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div
          className="rounded-3xl p-8 mb-6 relative overflow-hidden shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${card?.color1 || '#1e3a5f'}, ${card?.color2 || '#2d5a87'})`,
          }}
        >
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Votre carte</p>
                <h2 className="text-2xl font-bold text-white">{card?.business_name}</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-lg font-bold text-white">{points}/{maxPoints}</span>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {Array.from({ length: maxPoints }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-3 rounded-full transition-all duration-500"
                  style={{
                    background: i < points
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.7))'
                      : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Récompense</p>
                <p className="text-white font-semibold">🎁 {card?.reward}</p>
              </div>
              {points >= maxPoints && (
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full animate-pulse">
                  <span className="text-sm font-bold text-white">🎉 Réclamez !</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <button
            onClick={handleRequestPoints}
            disabled={loading}
            className="w-full py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition disabled:opacity-50 mb-4"
          >
            {loading ? 'Envoi...' : '✨ Valider ma visite'}
          </button>

          {!pushEnabled && (
            <button
              onClick={handleEnablePush}
              className="w-full py-3 bg-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition border border-white/20"
            >
              🔔 Activer les notifications
            </button>
          )}

          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-white/40 text-sm mt-6">
          Bonjour {name} 👋
        </p>
      </div>
    </div>
  )
}
