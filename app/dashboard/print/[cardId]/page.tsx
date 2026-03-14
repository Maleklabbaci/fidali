'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'

export default function PrintPage() {
  const params = useParams()
  const router = useRouter()
  const cardId = params.cardId as string

  const [card, setCard] = useState<any>(null)
  const [merchant, setMerchant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'large' | 'mini'>('large')

  useEffect(() => {
    loadData()
  }, [cardId])

  const loadData = async () => {
    try {
      const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
      const merchantData = stored ? JSON.parse(stored) : null

      const { supabase } = await import('@/database/supabase-client')
      
      const { data: cardData, error: cardErr } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('id', cardId)
        .single()

      if (cardErr) throw cardErr

      setCard(cardData)
      setMerchant(merchantData)
    } catch (err) {
      console.error(err)
      alert('Erreur lors du chargement')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!card) return null

  const qrUrl = `${window.location.origin}/scan/${card.code}`

  return (
    <>
      <div className="print:hidden min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
            >
              ← Retour au dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Impression QR Code</h1>
            <p className="text-gray-600">{card.business_name}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Choisissez le format</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode('large')}
                className={`p-6 border-2 rounded-xl transition ${mode === 'large' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="text-4xl mb-2">📄</div>
                <h3 className="font-bold text-gray-900 mb-1">Grand QR A4</h3>
                <p className="text-sm text-gray-600">Pour afficher en vitrine</p>
              </button>
              <button
                onClick={() => setMode('mini')}
                className={`p-6 border-2 rounded-xl transition ${mode === 'mini' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="text-4xl mb-2">🎴</div>
                <h3 className="font-bold text-gray-900 mb-1">8 Mini Cartes</h3>
                <p className="text-sm text-gray-600">À découper et distribuer</p>
              </button>
            </div>
            <button
              onClick={handlePrint}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition flex items-center justify-center gap-2"
            >
              🖨️ Imprimer maintenant
            </button>
          </div>

          <div className="bg-gray-100 rounded-2xl p-6">
            <p className="text-sm text-gray-600 mb-4 text-center font-medium">Aperçu</p>
            <div style={{ transform: 'scale(0.42)', transformOrigin: 'top center', height: '380px', overflow: 'hidden' }}>
              {mode === 'large' ? (
                <LargeQRTemplate card={card} qrUrl={qrUrl} />
              ) : (
                <MiniCardsTemplate card={card} qrUrl={qrUrl} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden print:block">
        {mode === 'large' ? (
          <LargeQRTemplate card={card} qrUrl={qrUrl} />
        ) : (
          <MiniCardsTemplate card={card} qrUrl={qrUrl} />
        )}
      </div>

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; }
        }
      `}</style>
    </>
  )
}

function LargeQRTemplate({ card, qrUrl }: any) {
  return (
    <div
      className="w-[210mm] h-[297mm] flex flex-col items-center justify-between py-10 px-14 relative overflow-hidden"
      style={{ background: `linear-gradient(150deg, ${card.color1 || '#4f46e5'} 0%, ${card.color2 || '#7c3aed'} 100%)` }}
    >
      <div className="absolute -top-28 -right-28 w-[380px] h-[380px] bg-white/[0.07] rounded-full" />
      <div className="absolute -bottom-36 -left-36 w-[480px] h-[480px] bg-white/[0.07] rounded-full" />

      {/* Header */}
      <div className="relative z-10 text-center w-full">
        <p className="text-white/50 text-xs uppercase tracking-[0.3em] font-semibold mb-2">Programme de fidélité</p>
        <h1 className="text-[58px] font-black text-white leading-none mb-4">{card.business_name}</h1>
        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-2xl px-6 py-2.5">
          <span className="text-xl">🎁</span>
          <span className="text-white font-bold text-lg">{card.reward}</span>
        </div>
      </div>

      {/* QR Code */}
      <div className="relative z-10 text-center">
        <div className="bg-white p-7 rounded-[28px] shadow-2xl shadow-black/30 inline-block">
          <QRCodeSVG value={qrUrl} size={290} level="H" />
        </div>
        <p className="text-white/40 text-xs font-mono mt-3 tracking-widest">{card.code}</p>
      </div>

      {/* Instructions */}
      <div className="relative z-10 w-full">
        <div className="bg-white/10 border-2 border-white/20 rounded-3xl p-6">
          <p className="text-white font-black text-xl text-center mb-4">📱 Comment utiliser votre carte ?</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-2">1️⃣</p>
              <p className="text-white text-[11px] font-semibold leading-snug">
                Scannez ce QR code lors de votre <strong>1er achat</strong> pour rejoindre le programme
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-2">2️⃣</p>
              <p className="text-white text-[11px] font-semibold leading-snug">
                Rescannez ce même code à <strong>chaque achat</strong> pour cumuler vos points
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-2">3️⃣</p>
              <p className="text-white text-[11px] font-semibold leading-snug">
                Après <strong>{card.max_points} visites</strong>, réclamez votre récompense gratuite !
              </p>
            </div>
          </div>
          <div className="bg-white/20 rounded-2xl py-3 px-6 text-center">
            <p className="text-white font-black text-lg">
              {card.max_points} visites = <span className="text-yellow-300">{card.reward}</span> 🎉
            </p>
          </div>
        </div>
        <p className="text-white/25 text-[10px] text-center mt-3">Propulsé par Fidali 💙</p>
      </div>
    </div>
  )
}

function MiniCardsTemplate({ card, qrUrl }: any) {
  return (
    <div className="w-[210mm] h-[297mm] p-3 bg-white">
      <div className="grid grid-cols-2 gap-3 h-full">
        {Array.from({ length: 8 }).map((_, index) => (
          <MiniCard key={index} card={card} qrUrl={qrUrl} />
        ))}
      </div>
    </div>
  )
}

function MiniCard({ card, qrUrl }: any) {
  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between"
      style={{
        background: `linear-gradient(135deg, ${card.color1 || '#4f46e5'}, ${card.color2 || '#7c3aed'})`,
        border: '2px dashed rgba(255,255,255,0.25)',
      }}
    >
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/[0.07] rounded-full" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/[0.07] rounded-full" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-white/40 text-[8px] uppercase tracking-wider font-semibold">Carte de fidélité</p>
            <h3 className="text-white font-black text-sm leading-tight">{card.business_name}</h3>
          </div>
          <div className="bg-white/20 rounded-lg px-2 py-1 text-center">
            <p className="text-white font-black text-xs">{card.max_points}</p>
            <p className="text-white/60 text-[7px]">visites</p>
          </div>
        </div>

        {/* QR + instructions */}
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl flex-shrink-0">
            <QRCodeSVG value={qrUrl} size={78} level="H" />
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-[11px] mb-2">📱 Scannez à chaque achat !</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-1.5">
                <span className="text-white/50 text-[9px] leading-tight mt-0.5">①</span>
                <p className="text-white/75 text-[9px] leading-tight">
                  <strong className="text-white">1er scan</strong> : rejoindre le programme
                </p>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-white/50 text-[9px] leading-tight mt-0.5">②</span>
                <p className="text-white/75 text-[9px] leading-tight">
                  <strong className="text-white">Chaque achat</strong> = 1 point cumulé
                </p>
              </div>
              <div className="flex items-start gap-1.5 bg-white/15 rounded-lg px-2 py-1">
                <span className="text-yellow-300 text-[9px] leading-tight mt-0.5">★</span>
                <p className="text-yellow-200 text-[9px] font-bold leading-tight">
                  {card.max_points} visites = {card.reward}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-2 pt-2 border-t border-white/15 flex items-center justify-between">
        <p className="text-white/30 text-[7px] font-mono">{card.code}</p>
        <p className="text-white/25 text-[7px]">fidali.app 💙</p>
      </div>
    </div>
  )
}
