'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function JoinCardPage() {
  const params = useParams()
  const router = useRouter()
  const cardCode = (params.code as string).toUpperCase()

  const [step, setStep] = useState<'loading' | 'register' | 'mycard' | 'done' | 'error'>('loading')
  const [card, setCard] = useState<any>(null)
  const [clientData, setClientData] = useState<any>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadCard() }, [cardCode])

  const loadCard = async () => {
    try {
      const { supabase } = await import('@/database/supabase-client')
      const { data: cardData } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('code', cardCode)
        .eq('is_active', true)
        .maybeSingle()

      if (!cardData) { setStep('error'); return }
      setCard(cardData)

      // Vérifier si déjà inscrit
      const savedPhone = localStorage.getItem(`fidali_phone_${cardCode}`)
      if (savedPhone) {
        const { data: client } = await supabase.from('clients').select('*').eq('phone', savedPhone).maybeSingle()
        if (client) {
          const { data: cc } = await supabase.from('client_cards').select('*, loyalty_cards(*)').eq('client_id', client.id).eq('card_id', cardData.id).maybeSingle()
          if (cc) {
            setClientData({ client, clientCard: cc })
            setName(client.name)
            setPhone(savedPhone)
            setStep('mycard')
            return
          }
        }
      }
      setStep('register')
    } catch { setStep('error') }
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
        const { data: newClient, error: e1 } = await supabase.from('clients').insert({ name: name.trim(), phone: cleanPhone }).select().maybeSingle()
        if (e1) { setError('Erreur: ' + e1.message); setLoading(false); return }
        client = newClient
      }

      let { data: cc } = await supabase.from('client_cards').select('*').eq('client_id', client.id).eq('card_id', card.id).maybeSingle()
      if (!cc) {
        const { data: newCC, error: e2 } = await supabase.from('client_cards').insert({ client_id: client.id, card_id: card.id, points: 0, total_rewards_redeemed: 0 }).select().maybeSingle()
        if (e2) { setError('Erreur: ' + e2.message); setLoading(false); return }
        cc = newCC
        await supabase.from('activities').insert({
          merchant_id: card.merchant_id, card_id: card.id, client_id: client.id,
          client_card_id: newCC.id, type: 'join', points_amount: 0,
          description: `👋 ${name.trim()} a rejoint ${card.business_name}`,
        })
      }

      localStorage.setItem(`fidali_phone_${cardCode}`, cleanPhone)
      localStorage.setItem('fidali_client', JSON.stringify(client))
      setClientData({ client, clientCard: cc })
      setStep('mycard')
    } catch { setError('Une erreur est survenue') }
    finally { setLoading(false) }
  }

  if (step === 'loading') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
      <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (step === 'error') return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
      <div className="text-center text-white">
        <p className="text-5xl mb-4">❌</p>
        <p className="text-xl font-bold">Carte introuvable</p>
        <p className="text-white/50 mt-2">Ce lien n'est plus valide</p>
      </div>
    </div>
  )

  if (step === 'register') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: `linear-gradient(135deg, ${card?.color1 || '#4f46e5'}, ${card?.color2 || '#7c3aed'})` }}>
      <div className="w-full max-w-md">
        {/* Header carte */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            🏪
          </div>
          <h1 className="text-3xl font-black text-white mb-1">{card?.business_name}</h1>
          <p className="text-white/70">Programme de fidélité</p>
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-xl px-4 py-2 mt-3">
            <span>🎁</span>
            <span className="text-white font-semibold text-sm">{card?.reward} après {card?.max_points} visites</span>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-7 border border-white/15">
          <h2 className="text-white font-bold text-xl mb-5">Rejoindre le programme</h2>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="text-white/70 text-sm block mb-1.5">Nom complet</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Ahmed Benali" required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-white/30" />
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-1.5">Numéro de téléphone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="0555 12 34 56" required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-white/30" />
            </div>
            {error && <p className="text-red-300 text-sm bg-red-500/20 rounded-xl px-4 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-white font-black text-lg rounded-xl transition hover:bg-white/90 disabled:opacity-50"
              style={{ color: card?.color1 || '#4f46e5' }}>
              {loading ? 'Inscription...' : '🎉 Rejoindre maintenant'}
            </button>
          </form>
          <p className="text-white/30 text-xs text-center mt-4">Vos données sont sécurisées</p>
        </div>
      </div>
    </div>
  )

  // step === 'mycard'
  const cc = clientData?.clientCard
  const maxPts = card?.max_points || 10
  const pts = cc?.points || 0
  const pct = Math.min((pts / maxPts) * 100, 100)
  const isComplete = pct >= 100

  return (
    <div className="min-h-screen p-5 pb-10" style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
      <div className="max-w-md mx-auto pt-6">

        {/* Carte fidélité */}
        <div className="rounded-3xl p-6 mb-4 relative overflow-hidden shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${card?.color1 || '#4f46e5'}, ${card?.color2 || '#7c3aed'})` }}>
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/[0.07] rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/[0.07] rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Carte de fidélité</p>
                <h2 className="text-white font-black text-xl">{card?.business_name}</h2>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-full">
                <span className="text-white font-black">{pts}/{maxPts}</span>
              </div>
            </div>
            <div className="flex gap-1.5 mb-4">
              {Array.from({ length: maxPts }).map((_, i) => (
                <div key={i} className="flex-1 h-3 rounded-full"
                  style={{ background: i < pts ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)' }} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-white/70 text-sm">🎁 {card?.reward}</p>
              {isComplete && <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full animate-pulse">Réclamez !</span>}
            </div>
            <p className="text-white/30 text-xs font-mono mt-3">{name} · {phone}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Points', value: pts, icon: '⭐' },
            { label: 'Récompenses', value: cc?.total_rewards_redeemed || 0, icon: '🎁' },
            { label: 'Progression', value: `${Math.round(pct)}%`, icon: '📊' },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
              <p className="text-lg mb-1">{s.icon}</p>
              <p className="text-white font-black text-lg">{s.value}</p>
              <p className="text-white/40 text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Comment gagner des points */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
          <p className="text-white font-bold text-sm mb-2">📱 Comment gagner des points ?</p>
          <p className="text-white/60 text-xs leading-relaxed">
            Scannez le QR code affiché <strong className="text-white">en magasin à chaque achat</strong>. Le lien change toutes les 10 min — vous devez être présent pour scanner.
          </p>
        </div>

        {/* Bouton avis */}
        <button onClick={() => router.push(`/avis/${card?.code}`)}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 mb-3 border border-white/15 text-white/80 hover:bg-white/10 transition">
          ⭐ Donner mon avis sur {card?.business_name}
        </button>

        {/* Wallet — bientôt */}
        <div className="grid grid-cols-2 gap-3">
          <button disabled className="py-3 bg-black/50 border border-white/10 rounded-2xl text-white/30 text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            Apple Wallet
            <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded">Bientôt</span>
          </button>
          <button disabled className="py-3 bg-white/5 border border-white/10 rounded-2xl text-white/30 text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google Wallet
            <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded">Bientôt</span>
          </button>
        </div>

        <p className="text-white/20 text-xs text-center mt-6">Propulsé par Fidali 💙</p>
      </div>
    </div>
  )
}
