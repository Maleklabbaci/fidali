'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Step = 'loading' | 'not_found' | 'new_client' | 'returning' | 'pending' | 'validated' | 'rejected' | 'cooldown' | 'error' | 'expired'

const COOLDOWN_HOURS = 8
const AUTO_VALIDATE_SECONDS = 120 // 2 minutes

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

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

// ✅ Vérifie si le token QR est encore valide (fenêtre de 10 min)
// Si pas de token = ancien QR imprimé avant le système = valide
function isQrTokenValid(cardCode: string, token: string | null): boolean {
  if (!token) return true // pas de token = QR classique = toujours valide
  const currentWindow = Math.floor(Date.now() / (10 * 60 * 1000))
  const prevWindow = currentWindow - 1
  const validTokens = [
    btoa(`${cardCode}-${currentWindow}`).replace(/=/g, '').substring(0, 16),
    btoa(`${cardCode}-${prevWindow}`).replace(/=/g, '').substring(0, 16),
  ]
  return validTokens.includes(token)
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
  const [cooldownHours, setCooldownHours] = useState(0)
  const [autoValidateCountdown, setAutoValidateCountdown] = useState(AUTO_VALIDATE_SECONDS)
  const autoValidateRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Vérifier le token QR dynamique
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('t')
    if (!isQrTokenValid(cardCode, token)) {
      setStep('expired')
      return
    }
    loadCard()
  }, [cardCode])

  // Polling statut presence
  useEffect(() => {
    if (!presenceId) return
    const interval = setInterval(async () => {
      try {
        const { supabase } = await import('@/database/supabase-client')
        const { data } = await supabase.from('pending_presences').select('status').eq('id', presenceId).maybeSingle()
        if (data?.status === 'confirmed') { setStep('validated'); clearInterval(interval) }
        else if (data?.status === 'rejected') { setStep('rejected'); clearInterval(interval) }
      } catch {}
    }, 2000)
    return () => clearInterval(interval)
  }, [presenceId])

  // ⏱️ Countdown auto-validation
  useEffect(() => {
    if (step !== 'pending') {
      if (autoValidateRef.current) clearInterval(autoValidateRef.current)
      return
    }
    setAutoValidateCountdown(AUTO_VALIDATE_SECONDS)
    autoValidateRef.current = setInterval(() => {
      setAutoValidateCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(autoValidateRef.current!)
          autoValidatePresence()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (autoValidateRef.current) clearInterval(autoValidateRef.current) }
  }, [step, presenceId])

  const autoValidatePresence = async () => {
    if (!presenceId) return
    try {
      const { supabase } = await import('@/database/supabase-client')
      // Vérifier que la présence est encore en 'pending' avant d'auto-valider
      // Évite le double-point si le commerçant a déjà validé/refusé
      const { data: presence } = await supabase
        .from('pending_presences')
        .select('status')
        .eq('id', presenceId)
        .maybeSingle()

      if (presence?.status === 'confirmed') { setStep('validated'); return }
      if (presence?.status === 'rejected')  { setStep('rejected');  return }
      if (presence?.status !== 'pending')   { return } // statut inconnu, ne rien faire

      await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presenceId, action: 'validate', auto: true }),
      })
      setStep('validated')
    } catch {}
  }

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

      // ⏰ Vérifier cooldown 8h par numéro de téléphone
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
        const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000
        if (timeSince < cooldownMs) {
          const remaining = Math.ceil((cooldownMs - timeSince) / 3600000)
          setCooldownHours(remaining)
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

      let { data: client } = await supabase.from('clients').select('*').eq('phone', cleanPhone).maybeSingle()

      if (!client) {
        const { data: newClient, error: clientErr } = await supabase
          .from('clients').insert({ name: name.trim(), phone: cleanPhone }).select().maybeSingle()
        if (clientErr) { setError('Erreur: ' + clientErr.message); setLoading(false); return }
        client = newClient
      }

      let { data: clientCard } = await supabase
        .from('client_cards').select('*').eq('client_id', client.id).eq('card_id', card.id).maybeSingle()

      if (!clientCard) {
        const { data: newCC, error: ccErr } = await supabase
          .from('client_cards').insert({ client_id: client.id, card_id: card.id, points: 0, total_rewards_redeemed: 0 }).select().maybeSingle()
        if (ccErr) { setError('Erreur: ' + ccErr.message); setLoading(false); return }
        clientCard = newCC
        await supabase.from('activities').insert({
          merchant_id: card.merchant_id, card_id: card.id, client_id: client.id,
          client_card_id: newCC.id, type: 'join', points_amount: 0,
          description: `👋 ${name.trim()} a rejoint ${card.business_name}`,
        })
      }

      localStorage.setItem(`fidali_phone_${cardCode}`, cleanPhone)
      localStorage.setItem('fidali_client', JSON.stringify(client))
      setClientData({ client, clientCard })
      setPoints(clientCard.points || 0)

      try { enablePushForClient(client.id).catch(() => {}) } catch {}

      // Créer directement la demande de point après inscription
      await createPresenceRequest({ client, clientCard })

    } catch (err: any) {
      console.error(err)
      setError('Une erreur est survenue')
      setLoading(false)
    }
  }

  const createPresenceRequest = async (data?: { client: any, clientCard: any }) => {
    const cd = data || clientData
    if (!cd) return
    setLoading(true)

    try {
      const { supabase } = await import('@/database/supabase-client')

      // 🔒 Bloquer double scan
      const { data: existingPending } = await supabase
        .from('pending_presences')
        .select('id')
        .eq('client_id', cd.client.id)
        .eq('card_id', card.id)
        .eq('status', 'pending')
        .maybeSingle()

      if (existingPending) {
        setPresenceId(existingPending.id)
        setStep('pending')
        setLoading(false)
        return
      }

      const { data: presence, error } = await supabase
        .from('pending_presences')
        .insert({
          client_id: cd.client.id,
          client_card_id: cd.clientCard.id,
          card_id: card.id,
          merchant_id: card.merchant_id,
          client_name: cd.client.name,
          client_phone: cd.client.phone,
          status: 'pending',
        })
        .select()
        .maybeSingle()

      if (error) throw error

      setPresenceId(presence.id)
      setStep('pending')

      // 🔔 Notifier le commerçant
      fetch('/api/push/send-merchant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: card.merchant_id,
          presenceId: presence.id,
          clientName: cd.client.name,
          cardName: card.business_name,
        }),
      }).catch(() => {})

    } catch (err) {
      console.error(err)
      setError('Erreur lors de la demande')
    } finally {
      setLoading(false)
    }
  }

  // ---- RENDU ----

  if (step === 'loading') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (step === 'expired') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-orange-900 flex items-center justify-center p-6">
      <div className="text-center text-white">
        <p className="text-6xl mb-6">⏰</p>
        <p className="text-2xl font-bold mb-3">QR Code expiré</p>
        <p className="text-white/60 mb-2">Ce QR code a expiré.</p>
        <p className="text-white/60">Scannez le QR code affiché en magasin.</p>
      </div>
    </div>
  )

  if (step === 'not_found') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-6">
      <div className="text-center text-white">
        <p className="text-6xl mb-6">❌</p>
        <p className="text-2xl font-bold mb-2">Carte introuvable</p>
        <p className="text-white/60">Ce QR code n'est pas valide</p>
      </div>
    </div>
  )

  if (step === 'error') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-6">
      <div className="text-center text-white">
        <p className="text-6xl mb-6">⚠️</p>
        <p className="text-2xl font-bold mb-2">Erreur</p>
        <p className="text-white/60">Une erreur est survenue</p>
      </div>
    </div>
  )

  if (step === 'cooldown') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-6">
      <div className="text-center text-white">
        <p className="text-6xl mb-6">⏱️</p>
        <p className="text-2xl font-bold mb-2">Déjà scanné aujourd'hui !</p>
        <p className="text-white/70 mb-4">Vous avez déjà validé une visite récemment</p>
        <div className="bg-white/10 rounded-2xl px-8 py-4 inline-block">
          <p className="text-3xl font-mono font-bold">{cooldownHours}h</p>
          <p className="text-white/40 text-sm mt-1">Avant le prochain scan</p>
        </div>
        <p className="text-white/40 text-xs mt-6">Revenez dans {cooldownHours} heure{cooldownHours > 1 ? 's' : ''}</p>
      </div>
    </div>
  )

  if (step === 'validated') return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 flex items-center justify-center p-6">
      <div className="text-center text-white">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <p className="text-5xl">✅</p>
        </div>
        <p className="text-3xl font-bold mb-3">Point ajouté !</p>
        <p className="text-white/80 mb-2">{name}</p>
        <p className="text-white/60 mb-6">
          {Math.min(points + (card?.points_per_visit || 1), maxPoints)}/{maxPoints} points
        </p>
        <button
          onClick={() => router.push(`/client/${encodeURIComponent(phone)}`)}
          className="px-8 py-3 bg-white/20 rounded-2xl text-white font-semibold"
        >
          Voir ma carte
        </button>
      </div>
    </div>
  )

  if (step === 'rejected') return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-rose-800 to-pink-900 flex items-center justify-center p-6">
      <div className="text-center text-white">
        <p className="text-6xl mb-6">❌</p>
        <p className="text-2xl font-bold mb-2">Demande refusée</p>
        <p className="text-white/60">Le commerçant a refusé cette visite</p>
      </div>
    </div>
  )

  if (step === 'pending') {
    const minutes = Math.floor(autoValidateCountdown / 60)
    const seconds = autoValidateCountdown % 60
    const pct = ((AUTO_VALIDATE_SECONDS - autoValidateCountdown) / AUTO_VALIDATE_SECONDS) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-6">
        <div className="text-center text-white w-full max-w-sm">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - pct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <p className="text-2xl font-black">{minutes}:{seconds.toString().padStart(2, '0')}</p>
              </div>
            </div>
          </div>

          <p className="text-2xl font-bold mb-2">En attente...</p>
          <p className="text-white/60 mb-1">Validation automatique dans</p>
          <p className="text-white/40 text-sm mb-6">Le commerçant peut refuser avant</p>

          <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
            <p className="text-white font-semibold">{name}</p>
            <p className="text-white/50 text-sm">{card?.business_name}</p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'new_client') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="rounded-3xl p-8 mb-6 relative overflow-hidden shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${card?.color1 || '#1e3a5f'}, ${card?.color2 || '#2d5a87'})` }}>
          <div className="relative z-10 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">{card?.business_name}</h1>
            <p className="text-white/80 text-sm">Programme de fidélité</p>
            <p className="text-white/60 text-xs mt-2">🎁 {card?.reward} après {card?.max_points} visites</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Rejoindre le programme</h2>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Nom complet</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ahmed Benali" required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30" />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Numéro de téléphone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="0555 12 34 56" required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30" />
            </div>
            {error && <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-200 text-sm">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition disabled:opacity-50">
              {loading ? 'Inscription...' : '🎉 Rejoindre et scanner'}
            </button>
          </form>
          <p className="text-white/40 text-xs text-center mt-4">Vos données sont sécurisées</p>
        </div>
      </div>
    </div>
  )

  // step === 'returning'
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="rounded-3xl p-8 mb-6 relative overflow-hidden shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${card?.color1 || '#1e3a5f'}, ${card?.color2 || '#2d5a87'})` }}>
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
                <div key={i} className="flex-1 h-3 rounded-full transition-all duration-500"
                  style={{ background: i < points ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.15)' }} />
              ))}
            </div>
            <p className="text-white/60 text-sm">🎁 {card?.reward}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
          <p className="text-white font-bold text-lg mb-2">Bonjour {name} 👋</p>
          <p className="text-white/60 text-sm mb-6">Appuyez pour valider votre visite</p>
          <button onClick={() => createPresenceRequest()} disabled={loading}
            className="w-full py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition disabled:opacity-50 mb-3">
            {loading ? 'Envoi...' : '✨ Valider ma visite'}
          </button>
          <button onClick={() => router.push(`/client/${encodeURIComponent(phone)}`)}
            className="w-full py-3 text-white/40 text-sm">
            Voir ma carte
          </button>
          {error && <div className="mt-4 bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-200 text-sm">{error}</div>}
        </div>
      </div>
    </div>
  )
}
