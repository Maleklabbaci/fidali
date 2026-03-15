'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Step = 'loading' | 'register' | 'pending' | 'validated' | 'used' | 'error'

export default function ScanTokenPage() {
  const params = useParams()
  const router = useRouter()
  const token = (params.token as string).toUpperCase()

  const [step, setStep] = useState<Step>('loading')
  const [card, setCard] = useState<any>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { checkToken() }, [token])

  const checkToken = async () => {
    try {
      const { supabase } = await import('@/database/supabase-client')
      const { data: qrToken } = await supabase
        .from('qr_tokens').select('*, loyalty_cards(*)').eq('token', token).maybeSingle()

      if (!qrToken) { setStep('error'); return }
      if (qrToken.used) { setStep('used'); return }

      setCard(qrToken.loyalty_cards)

      // Vérifier si déjà inscrit
      const savedPhone = localStorage.getItem(`fidali_phone_${qrToken.loyalty_cards?.code}`)
      if (savedPhone) {
        const { data: client } = await supabase.from('clients').select('*').eq('phone', savedPhone).maybeSingle()
        if (client) {
          setName(client.name)
          setPhone(savedPhone)
        }
      }
      setStep('register')
    } catch { setStep('error') }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setLoading(true)
    setError('')
    const cleanPhone = phone.replace(/\s/g, '')

    try {
      const { supabase } = await import('@/database/supabase-client')

      // Vérifier que le token est encore disponible
      const { data: qrToken } = await supabase.from('qr_tokens').select('*').eq('token', token).eq('used', false).maybeSingle()
      if (!qrToken) { setStep('used'); return }

      // Créer ou récupérer client
      let { data: client } = await supabase.from('clients').select('*').eq('phone', cleanPhone).maybeSingle()
      if (!client) {
        const { data: nc } = await supabase.from('clients').insert({ name: name.trim(), phone: cleanPhone }).select().maybeSingle()
        client = nc
      }

      // Créer ou récupérer client_card
      let { data: cc } = await supabase.from('client_cards').select('*').eq('client_id', client.id).eq('card_id', card.id).maybeSingle()
      if (!cc) {
        const { data: ncc } = await supabase.from('client_cards').insert({ client_id: client.id, card_id: card.id, points: 0, total_rewards_redeemed: 0 }).select().maybeSingle()
        cc = ncc
        await supabase.from('activities').insert({
          merchant_id: card.merchant_id, card_id: card.id, client_id: client.id,
          client_card_id: ncc.id, type: 'join', points_amount: 0,
          description: `👋 ${name.trim()} a rejoint ${card.business_name} via colis`,
        })
      }

      // Vérifier cooldown 8h
      const { data: lastPresence } = await supabase.from('pending_presences')
        .select('created_at').eq('client_id', client.id).eq('card_id', card.id)
        .in('status', ['pending', 'confirmed']).order('created_at', { ascending: false }).limit(1).maybeSingle()

      if (lastPresence) {
        const timeSince = Date.now() - new Date(lastPresence.created_at).getTime()
        if (timeSince < 8 * 60 * 60 * 1000) {
          setError('Vous avez déjà gagné un point récemment.')
          setLoading(false)
          return
        }
      }

      // Ajouter le point directement (pas de validation manuelle pour livraison)
      const maxPts = card.max_points || 10
      const newPts = Math.min((cc.points || 0) + (card.points_per_visit || 1), maxPts)
      const reward = newPts >= maxPts
      await supabase.from('client_cards').update({
        points: reward ? 0 : newPts,
        total_rewards_redeemed: (cc.total_rewards_redeemed || 0) + (reward ? 1 : 0),
        total_points_earned: (cc.total_points_earned || 0) + (card.points_per_visit || 1),
        auto_validated_points: (cc.auto_validated_points || 0) + (card.points_per_visit || 1),
      }).eq('id', cc.id)

      // Marquer le token comme utilisé
      await supabase.from('qr_tokens').update({ used: true, used_at: new Date().toISOString(), used_by_client_id: client.id }).eq('token', token)

      // Activity
      await supabase.from('activities').insert({
        merchant_id: card.merchant_id, card_id: card.id, client_id: client.id,
        type: 'pts', points_amount: card.points_per_visit || 1,
        description: `📦 Point ajouté via colis pour ${name.trim()}`,
      })

      localStorage.setItem(`fidali_phone_${card.code}`, cleanPhone)
      setStep('validated')
      setTimeout(() => router.push(`/client/${encodeURIComponent(cleanPhone)}`), 2000)
    } catch { setError('Une erreur est survenue') }
    finally { setLoading(false) }
  }

  if (step === 'loading') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
      <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (step === 'used') return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #7f1d1d, #991b1b)' }}>
      <div className="text-center text-white">
        <p className="text-6xl mb-4">💀</p>
        <p className="text-2xl font-black mb-2">QR Code déjà utilisé</p>
        <p className="text-white/60">Ce QR code a déjà été scanné et est mort.</p>
        <p className="text-white/40 text-sm mt-2">Chaque QR dans un colis = usage unique</p>
      </div>
    </div>
  )

  if (step === 'error') return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
      <div className="text-center text-white">
        <p className="text-5xl mb-4">❌</p>
        <p className="text-xl font-bold">QR Code invalide</p>
      </div>
    </div>
  )

  if (step === 'validated') return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #064e3b, #065f46)' }}>
      <div className="text-center text-white">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <p className="text-5xl">✅</p>
        </div>
        <p className="text-3xl font-black mb-2">Point ajouté !</p>
        <p className="text-white/70 mb-1">{name}</p>
        <p className="text-white/50 text-sm mb-4">{card?.business_name}</p>
        <p className="text-white/40 text-xs">Redirection vers votre carte...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: `linear-gradient(135deg, ${card?.color1 || '#4f46e5'}, ${card?.color2 || '#7c3aed'})` }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-2xl px-4 py-2 mb-4">
            <span>📦</span>
            <span className="text-white/80 text-xs font-semibold">QR Code Colis — Usage unique</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-1">{card?.business_name}</h1>
          <p className="text-white/70 text-sm">🎁 {card?.reward} après {card?.max_points} visites</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-7 border border-white/15">
          <h2 className="text-white font-black text-xl mb-2">Scannez pour gagner un point !</h2>
          <p className="text-white/50 text-sm mb-5">Ce QR est dans votre colis. Il ne fonctionne qu'une seule fois.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/70 text-sm block mb-1.5">Nom complet</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ahmed Benali" required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-white/30" />
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-1.5">Numéro de téléphone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0555 12 34 56" required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-white/30" />
            </div>
            {error && <p className="text-red-300 text-sm bg-red-500/20 rounded-xl px-4 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-white font-black text-lg rounded-xl transition hover:bg-white/90 disabled:opacity-50"
              style={{ color: card?.color1 || '#4f46e5' }}>
              {loading ? 'Validation...' : '🎉 Valider mon point'}
            </button>
          </form>
        </div>
        <p className="text-white/25 text-xs text-center mt-4">Propulsé par Fidali 💙</p>
      </div>
    </div>
  )
}
