'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ClientCardPage() {
  const params = useParams()
  const phone = decodeURIComponent(params.phone as string)

  const [clientData, setClientData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showInstall, setShowInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    loadClientCards()

    // Détecter si on peut installer la PWA
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const loadClientCards = async () => {
    try {
      const { supabase } = await import('@/database/supabase-client')

      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', phone)
        .single()

      if (!client) { setLoading(false); return }

      const { data: clientCards } = await supabase
        .from('client_cards')
        .select('*, loyalty_cards(*)')
        .eq('client_id', client.id)

      setClientData((clientCards || []).map((cc: any) => ({
        ...cc,
        client_name: client.name,
        client_phone: client.phone,
      })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShowInstall(false)
    setDeferredPrompt(null)
  }

  const handleAddToHomeScreen = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (isIOS) {
      alert('📱 Pour ajouter à votre écran :\n\n1. Appuyez sur le bouton Partager (↑)\n2. Sélectionnez "Sur l\'écran d\'accueil"\n3. Appuyez sur "Ajouter"')
    } else if (deferredPrompt) {
      handleInstall()
    } else {
      alert('📱 Pour ajouter à votre écran :\n\n1. Ouvrez le menu (⋮) en haut\n2. Sélectionnez "Ajouter à l\'écran d\'accueil"\n3. Confirmez')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (clientData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-xl font-bold mb-2">Aucune carte trouvée</p>
          <p className="text-white/60">Scannez un QR code pour rejoindre un programme</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4 pb-24">
      {/* Header */}
      <div className="text-center pt-6 pb-8">
        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 border border-white/10">
          💳
        </div>
        <h1 className="text-xl font-bold text-white">Mes cartes fidélité</h1>
        <p className="text-white/50 text-sm mt-1">{clientData[0]?.client_name}</p>
      </div>

      {/* Cards */}
      <div className="space-y-6 max-w-md mx-auto">
        {clientData.map((cc, index) => {
          const card = cc.loyalty_cards
          if (!card) return null

          const maxPts = card.max_points || 10
          const pct = Math.min(((cc.points || 0) / maxPts) * 100, 100)
          const isComplete = pct >= 100

          return (
            <div key={cc.id || index} className="relative">
              {/* Carte principale */}
              <div
                className="rounded-3xl p-6 relative overflow-hidden shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${card.color1 || '#1e3a5f'}, ${card.color2 || '#2d5a87'})`,
                  minHeight: '220px',
                }}
              >
                {/* Pattern décoratif */}
                <div className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                  }}
                />
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/[0.05] rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/[0.05] rounded-full" />

                <div className="relative z-10">
                  {/* Header carte */}
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">Carte de fidélité</p>
                      <h2 className="text-xl font-bold text-white mt-1">{card.business_name}</h2>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                      <span className="text-sm font-bold text-white">{cc.points}/{maxPts}</span>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mb-4">
                    <div className="flex gap-[5px]">
                      {Array.from({ length: maxPts }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 h-3 rounded-full transition-all duration-500"
                          style={{
                            background: i < (cc.points || 0)
                              ? 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.7))'
                              : 'rgba(255,255,255,0.12)',
                            boxShadow: i < (cc.points || 0) ? '0 0 8px rgba(255,255,255,0.2)' : 'none',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Récompense */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">Récompense</p>
                      <p className="text-white font-medium text-sm">🎁 {card.reward}</p>
                    </div>
                    {isComplete && (
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full animate-pulse border border-white/20">
                        <span className="text-sm font-bold text-white">🎉 Réclamez !</span>
                      </div>
                    )}
                  </div>

                  {/* Numéro */}
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-white/30 text-[10px] font-mono">{card.code}</p>
                    <p className="text-white/30 text-[10px]">{cc.client_phone}</p>
                  </div>
                </div>
              </div>

              {/* Info sous la carte */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl mx-4 -mt-2 p-4 border border-white/10">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-white font-bold">{cc.points || 0}</p>
                    <p className="text-white/40 text-[10px]">Points</p>
                  </div>
                  <div className="border-x border-white/10">
                    <p className="text-white font-bold">{cc.total_rewards_redeemed || 0}</p>
                    <p className="text-white/40 text-[10px]">Récompenses</p>
                  </div>
                  <div>
                    <p className="text-white font-bold">{Math.round(pct)}%</p>
                    <p className="text-white/40 text-[10px]">Progression</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Boutons Wallet */}
      <div className="max-w-md mx-auto mt-8 space-y-3">
        {/* Ajouter à l'écran d'accueil */}
        <button
          onClick={handleAddToHomeScreen}
          className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-gray-50 transition"
        >
          📱 Ajouter à mon écran d&apos;accueil
        </button>

        {/* Apple Wallet */}
        <button
          onClick={() => window.open(`/api/wallet/apple?phone=${encodeURIComponent(phone)}`, '_blank')}
          className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-gray-900 transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          Ajouter à Apple Wallet
        </button>

        {/* Google Wallet */}
        <button
          onClick={() => window.open(`/api/wallet/google?phone=${encodeURIComponent(phone)}`, '_blank')}
          className="w-full py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-gray-50 transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Ajouter à Google Wallet
        </button>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 pb-4">
        <p className="text-white/30 text-xs">Propulsé par Fidali 💙</p>
      </div>
    </div>
  )
}
