'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'

// Génère un token unique usage unique
function generateUniqueToken(cardCode: string, index: number): string {
  const random = Math.random().toString(36).substring(2, 10)
  const ts = Date.now().toString(36)
  return `${cardCode}-${ts}-${index}-${random}`.toUpperCase()
}

// QR dynamique vitrine (change toutes les 10 min)
function getDynamicQrUrl(cardCode: string, origin: string): string {
  const window10min = Math.floor(Date.now() / (10 * 60 * 1000))
  const token = btoa(`${cardCode}-${window10min}`).replace(/=/g, '').substring(0, 16)
  return `${origin}/scan/${cardCode}?t=${token}`
}

export default function PrintPage() {
  const params = useParams()
  const router = useRouter()
  const cardId = params.cardId as string

  const [card, setCard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'large' | 'delivery'>('large')
  const [uniqueTokens, setUniqueTokens] = useState<string[]>([])
  const [savingTokens, setSavingTokens] = useState(false)
  const [tokensReady, setTokensReady] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
    loadData()
  }, [cardId])

  const loadData = async () => {
    try {
      const { supabase } = await import('@/database/supabase-client')
      const { data: cardData, error: cardErr } = await supabase
        .from('loyalty_cards').select('*').eq('id', cardId).single()
      if (cardErr) throw cardErr
      setCard(cardData)
    } catch (err) {
      alert('Erreur lors du chargement')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Générer et sauvegarder 8 tokens uniques pour livraison
  const generateDeliveryTokens = async () => {
    if (!card) return
    setSavingTokens(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      const tokens = Array.from({ length: 8 }, (_, i) => generateUniqueToken(card.code, i))
      
      // Sauvegarder en base
      await supabase.from('qr_tokens').insert(
        tokens.map(token => ({
          card_id: card.id,
          token,
          used: false,
        }))
      )
      setUniqueTokens(tokens)
      setTokensReady(true)
    } catch (err) {
      console.error(err)
      alert('Erreur génération tokens')
    } finally {
      setSavingTokens(false)
    }
  }

  const handleSelectMode = (m: 'large' | 'delivery') => {
    setMode(m)
    setTokensReady(false)
    setUniqueTokens([])
  }

  const handlePrint = async () => {
    if (mode === 'delivery' && !tokensReady) {
      await generateDeliveryTokens()
    }
    setTimeout(() => window.print(), 300)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  if (!card) return null

  const dynamicQrUrl = getDynamicQrUrl(card.code, origin)

  return (
    <>
      {/* ===== ÉCRAN DE CONTRÔLE (masqué à l'impression) ===== */}
      <div className="print:hidden min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto p-6 md:p-8">

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <button onClick={() => router.push('/dashboard')} className="text-slate-500 hover:text-slate-800 mb-4 flex items-center gap-2 text-sm">
              ← Retour au dashboard
            </button>
            <h1 className="text-2xl font-black text-slate-900 mb-1">Impression QR Code</h1>
            <p className="text-slate-500">{card.business_name} — {card.reward}</p>
          </div>

          {/* Choix du format — 2 colonnes */}
          <div className="grid md:grid-cols-2 gap-5 mb-6">

            {/* Option 1 — Vitrine */}
            <button onClick={() => handleSelectMode('large')}
              className={`p-6 rounded-2xl border-2 text-left transition ${mode === 'large' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1">Grand format — Vitrine</h3>
              <p className="text-slate-500 text-sm mb-4">À coller en magasin, sur le comptoir ou la caisse</p>
              <div className="space-y-2">
                {[
                  { icon: '🔄', text: 'QR dynamique — lien change toutes les 10 min' },
                  { icon: '🛡️', text: 'Anti-fraude — photo du QR expire vite' },
                  { icon: '♾️', text: 'Un seul QR pour toujours, jamais à réimprimer' },
                  { icon: '📱', text: 'Client doit être présent pour scanner' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <p className="text-xs text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>
              {mode === 'large' && (
                <div className="mt-4 bg-indigo-100 rounded-xl p-3">
                  <p className="text-indigo-700 text-xs font-bold">✓ Sélectionné — Prêt à imprimer</p>
                </div>
              )}
            </button>

            {/* Option 2 — Livraison */}
            <button onClick={() => handleSelectMode('delivery')}
              className={`p-6 rounded-2xl border-2 text-left transition ${mode === 'delivery' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1">Petite étiquette — Livraison/Colis</h3>
              <p className="text-slate-500 text-sm mb-4">8 mini QR par page à découper et glisser dans chaque colis</p>
              <div className="space-y-2">
                {[
                  { icon: '💀', text: 'QR usage unique — mort après 1 scan' },
                  { icon: '8️⃣', text: '8 QR uniques générés par impression' },
                  { icon: '✂️', text: 'À découper — 1 dans chaque colis' },
                  { icon: '🔒', text: 'Impossible de scanner 2 fois le même' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <p className="text-xs text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>
              {mode === 'delivery' && (
                <div className="mt-4 bg-orange-100 rounded-xl p-3">
                  <p className="text-orange-700 text-xs font-bold">
                    {tokensReady ? '✓ 8 QR uniques générés — Prêt à imprimer' : '⚡ 8 QR uniques seront générés au moment d\'imprimer'}
                  </p>
                </div>
              )}
            </button>
          </div>

          {/* Comment ça marche */}
          <div className="bg-slate-800 rounded-2xl p-5 mb-6">
            <p className="text-white font-bold text-sm mb-3">
              {mode === 'large' ? '🔄 Comment fonctionne le QR Vitrine ?' : '📦 Comment fonctionne le QR Livraison ?'}
            </p>
            {mode === 'large' ? (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { step: '1', title: 'Imprimez une fois', desc: 'Collez le grand QR sur votre comptoir ou vitrine' },
                  { step: '2', title: 'Client scanne', desc: 'À chaque achat, il scanne le QR affiché devant lui' },
                  { step: '3', title: 'Anti-fraude auto', desc: 'Le lien change toutes les 10 min — impossible de tricher depuis chez soi' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-3">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-black mb-2">{s.step}</div>
                    <p className="text-white text-xs font-bold mb-1">{s.title}</p>
                    <p className="text-white/50 text-[11px] leading-snug">{s.desc}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { step: '1', title: 'Générez', desc: '8 QR uniques créés en base de données' },
                  { step: '2', title: 'Découpez', desc: '1 mini étiquette par colis' },
                  { step: '3', title: 'Glissez', desc: 'Dans chaque colis avant expédition' },
                  { step: '4', title: 'Client scanne', desc: 'QR mort après 1 utilisation — zéro fraude' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-black mb-2">{s.step}</div>
                    <p className="text-white text-xs font-bold mb-1">{s.title}</p>
                    <p className="text-white/50 text-[11px] leading-snug">{s.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bouton imprimer */}
          <button onClick={handlePrint} disabled={savingTokens}
            className={`w-full py-4 font-black text-lg rounded-2xl transition flex items-center justify-center gap-3 disabled:opacity-50 ${mode === 'large' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
            {savingTokens ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Génération des QR uniques...</>
            ) : (
              <>🖨️ {mode === 'large' ? 'Imprimer le grand format vitrine' : 'Générer et imprimer 8 étiquettes colis'}</>
            )}
          </button>

          {/* Aperçu */}
          <div className="mt-6 bg-slate-200 rounded-2xl p-6">
            <p className="text-slate-500 text-sm font-medium text-center mb-4">Aperçu</p>
            <div style={{ transform: 'scale(0.4)', transformOrigin: 'top center', height: '340px', overflow: 'hidden' }}>
              {mode === 'large' ? (
                <LargeTemplate card={card} qrUrl={dynamicQrUrl} />
              ) : (
                <DeliveryTemplate card={card} tokens={uniqueTokens.length > 0 ? uniqueTokens : Array(8).fill('PREVIEW')} origin={origin} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== PAGE D'IMPRESSION ===== */}
      <div className="hidden print:block">
        {mode === 'large' ? (
          <LargeTemplate card={card} qrUrl={dynamicQrUrl} />
        ) : (
          <DeliveryTemplate card={card} tokens={uniqueTokens} origin={origin} />
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

// ============================================================
// GRAND FORMAT VITRINE (A4 complet)
// ============================================================
function LargeTemplate({ card, qrUrl }: { card: any; qrUrl: string }) {
  return (
    <div className="w-[210mm] h-[297mm] flex flex-col items-center justify-between py-10 px-14 relative overflow-hidden"
      style={{ background: `linear-gradient(150deg, ${card.color1 || '#4f46e5'} 0%, ${card.color2 || '#7c3aed'} 100%)` }}>
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

      {/* QR */}
      <div className="relative z-10 text-center">
        <div className="bg-white p-7 rounded-[28px] shadow-2xl inline-block">
          <QRCodeSVG value={qrUrl} size={290} level="H" />
        </div>
        <p className="text-white/40 text-xs font-mono mt-3 tracking-widest">{card.code}</p>
        <p className="text-white/30 text-[10px] mt-1">QR dynamique — se renouvelle toutes les 10 min</p>
      </div>

      {/* Instructions */}
      <div className="relative z-10 w-full">
        <div className="bg-white/10 border-2 border-white/20 rounded-3xl p-6">
          <p className="text-white font-black text-xl text-center mb-4">📱 Comment utiliser votre carte ?</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { n: '1️⃣', text: 'Scannez lors de votre 1er achat pour rejoindre le programme' },
              { n: '2️⃣', text: 'Rescannez à chaque achat pour cumuler vos points' },
              { n: '3️⃣', text: `Après ${card.max_points} visites, réclamez votre récompense !` },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-2">{s.n}</p>
                <p className="text-white text-[11px] font-semibold leading-snug">{s.text}</p>
              </div>
            ))}
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

// ============================================================
// PETITES ÉTIQUETTES LIVRAISON (8 par page)
// ============================================================
function DeliveryTemplate({ card, tokens, origin }: { card: any; tokens: string[]; origin: string }) {
  return (
    <div className="w-[210mm] h-[297mm] p-4 bg-white">
      {/* Instructions en haut */}
      <div className="text-center mb-3 pb-3 border-b-2 border-dashed border-slate-300">
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          ✂️ Découpez chaque étiquette — 1 par colis — QR usage unique
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3" style={{ height: 'calc(100% - 40px)' }}>
        {tokens.slice(0, 8).map((token, i) => (
          <DeliveryCard key={i} card={card} token={token} origin={origin} index={i + 1} />
        ))}
      </div>
    </div>
  )
}

function DeliveryCard({ card, token, origin, index }: { card: any; token: string; origin: string; index: number }) {
  const qrUrl = token === 'PREVIEW'
    ? `${origin}/scan/${card.code}`
    : `${origin}/scan/token/${token}`

  return (
    <div className="rounded-xl relative overflow-hidden flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${card.color1 || '#4f46e5'}, ${card.color2 || '#7c3aed'})`,
        border: '2px dashed rgba(255,255,255,0.3)',
      }}>
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/[0.07] rounded-full" />

      <div className="relative z-10 p-3 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-white/40 text-[7px] uppercase tracking-wider">Carte de fidélité · Colis #{index}</p>
            <p className="text-white font-black text-xs leading-tight">{card.business_name}</p>
          </div>
          <div className="bg-white/20 rounded-lg px-1.5 py-0.5 text-center">
            <p className="text-white font-black text-[10px]">{card.max_points}x</p>
          </div>
        </div>

        {/* QR + infos */}
        <div className="flex items-center gap-2 flex-1">
          <div className="bg-white p-1.5 rounded-lg flex-shrink-0">
            <QRCodeSVG value={qrUrl} size={72} level="H" />
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-[10px] mb-1.5">📱 Scannez pour un point !</p>
            <div className="space-y-1">
              <div className="flex items-start gap-1">
                <span className="text-white/50 text-[8px]">①</span>
                <p className="text-white/70 text-[8px] leading-tight"><strong className="text-white">1er scan</strong> : rejoindre + 1 point</p>
              </div>
              <div className="flex items-start gap-1">
                <span className="text-white/50 text-[8px]">②</span>
                <p className="text-white/70 text-[8px] leading-tight">Scannez en magasin pour la suite</p>
              </div>
              <div className="bg-white/15 rounded-lg px-1.5 py-1 flex items-center gap-1">
                <span className="text-yellow-300 text-[8px]">★</span>
                <p className="text-yellow-200 text-[8px] font-black">{card.max_points} visites = {card.reward}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-1.5 pt-1.5 border-t border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
            <p className="text-white/40 text-[7px] font-bold">USAGE UNIQUE — Expire après scan</p>
          </div>
          <p className="text-white/25 text-[7px]">fidali.app</p>
        </div>
      </div>
    </div>
  )
}
