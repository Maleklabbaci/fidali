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
      const { supabase } = await import('@/database/supabase-client')
      
      const { data: cardData, error: cardErr } = await supabase
        .from('loyalty_cards')
        .select('*, merchants(*)')
        .eq('id', cardId)
        .single()

      if (cardErr) throw cardErr

      setCard(cardData)
      setMerchant(cardData.merchants)
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
      {/* Écran de contrôle */}
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
                className={`p-6 border-2 rounded-xl transition ${
                  mode === 'large'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-2">📄</div>
                <h3 className="font-bold text-gray-900 mb-1">Grand QR A4</h3>
                <p className="text-sm text-gray-600">Pour afficher en vitrine</p>
              </button>

              <button
                onClick={() => setMode('mini')}
                className={`p-6 border-2 rounded-xl transition ${
                  mode === 'mini'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
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

          <div className="bg-gray-100 rounded-2xl p-8">
            <p className="text-sm text-gray-600 mb-4 text-center">Aperçu</p>
            <div className="bg-white rounded-xl shadow-lg p-8 transform scale-50 origin-top">
              {mode === 'large' ? (
                <LargeQRTemplate card={card} qrUrl={qrUrl} />
              ) : (
                <MiniCardsTemplate card={card} qrUrl={qrUrl} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page d'impression */}
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
      className="w-[210mm] h-[297mm] flex flex-col items-center justify-center p-16 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${card.color1 || '#4f46e5'}, ${card.color2 || '#7c3aed'})`,
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle at 3px 3px, rgba(255,255,255,0.3) 2px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/[0.08] rounded-full" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-white/[0.08] rounded-full" />

      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-black text-white mb-4">{card.business_name}</h1>
        <p className="text-2xl text-white/80 mb-16">{card.reward}</p>

        <div className="bg-white p-12 rounded-3xl shadow-2xl mb-12 inline-block">
          <QRCodeSVG value={qrUrl} size={400} level="H" />
        </div>

        <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-8 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">📱 Scannez ici</h2>
          <p className="text-xl text-white/90 mb-2">Pour obtenir votre carte de fidélité</p>
          <p className="text-lg text-white/70">
            {card.max_points} {card.points_per_visit === 1 ? 'visites' : 'points'} = 1 récompense
          </p>
        </div>

        <div className="mt-16 text-white/50 text-sm">
          <p>Propulsé par Fidali 💙</p>
        </div>
      </div>
    </div>
  )
}

function MiniCardsTemplate({ card, qrUrl }: any) {
  return (
    <div className="w-[210mm] h-[297mm] p-4">
      <div className="grid grid-cols-2 gap-4 h-full">
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
      className="rounded-2xl p-6 relative overflow-hidden border-2"
      style={{
        background: `linear-gradient(135deg, ${card.color1 || '#4f46e5'}, ${card.color2 || '#7c3aed'})`,
        borderColor: card.color1 || '#4f46e5',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '16px 16px',
        }}
      />
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/[0.08] rounded-full" />

      <div className="relative z-10">
        <div className="mb-6">
          <p className="text-[8px] text-white/40 uppercase tracking-wider mb-1">Carte de fidélité</p>
          <h3 className="text-base font-bold text-white leading-tight">{card.business_name}</h3>
        </div>

        <div className="bg-white p-3 rounded-xl mb-4 inline-block">
          <QRCodeSVG value={qrUrl} size={100} level="H" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-white">📱 Scannez ici</p>
          <p className="text-[10px] text-white/80 leading-tight">
            {card.max_points} {card.points_per_visit === 1 ? 'visites' : 'points'} = {card.reward}
          </p>
        </div>

        <p className="text-[8px] text-white/30 font-mono mt-4">{card.code}</p>
      </div>
    </div>
  )
}
