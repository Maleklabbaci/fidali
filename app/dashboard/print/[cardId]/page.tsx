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
  const generateDeliveryTokens = async (): Promise<boolean> => {
    if (!card) return false
    setSavingTokens(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      const tokens = Array.from({ length: 8 }, (_, i) => generateUniqueToken(card.code, i))

      // Sauvegarder en base — on vérifie l'erreur explicitement
      const { error } = await supabase.from('qr_tokens').insert(
        tokens.map(token => ({
          card_id: card.id,
          token,
          used: false,
        }))
      )

      if (error) {
        console.error('Erreur Supabase qr_tokens:', error)
        alert('Erreur lors de la génération des QR codes : ' + error.message + '

Vérifiez que la table "qr_tokens" existe dans votre base Supabase (voir database/schema.sql).')
        return false
      }

      setUniqueTokens(tokens)
      setTokensReady(true)
      return true
    } catch (err) {
      console.error(err)
      alert('Erreur inattendue lors de la génération des QR codes.')
      return false
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
      const success = await generateDeliveryTokens()
      if (!success) return  // Bloquer l'impression si la sauvegarde a échoué
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

          {/* Choix du format — 2 colonnes premium */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">

            {/* ========== OPTION 1 : VITRINE ========== */}
            <button onClick={() => handleSelectMode('large')}
              className={`group relative overflow-hidden p-8 rounded-3xl border-2 text-left transition-all duration-300 ${
                mode === 'large' 
                  ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-2xl shadow-indigo-100 scale-[1.02]' 
                  : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xl'
              }`}>
              
              {/* Badge sélectionné */}
              {mode === 'large' && (
                <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                  SÉLECTIONNÉ
                </div>
              )}
              
              {/* Icône + Badge */}
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  mode === 'large' ? 'bg-indigo-600' : 'bg-indigo-100 group-hover:bg-indigo-200'
                }`}>
                  <span className={`text-3xl ${mode === 'large' ? '' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                    🏪
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-slate-900 text-xl">Grand Format</h3>
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">VITRINE</span>
                  </div>
                  <p className="text-slate-500 text-sm">QR dynamique pour affichage en magasin</p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-5">
                {[
                  { icon: '🔄', title: 'QR Dynamique', desc: 'Lien change toutes les 10 min' },
                  { icon: '🛡️', title: 'Anti-Fraude', desc: 'Photo du QR expire rapidement' },
                  { icon: '♾️', title: 'Permanent', desc: 'Un seul QR pour toujours' },
                  { icon: '📱', title: 'Présence', desc: 'Client doit être là pour scanner' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 group/item">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      mode === 'large' ? 'bg-white' : 'bg-slate-50 group-hover/item:bg-indigo-50'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-bold text-sm">{item.title}</p>
                      <p className="text-slate-500 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Statut */}
              <div className={`rounded-2xl p-4 border-2 border-dashed ${
                mode === 'large' 
                  ? 'bg-white border-indigo-300' 
                  : 'bg-slate-50 border-slate-200 group-hover:border-indigo-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${mode === 'large' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                    <p className={`text-xs font-bold ${mode === 'large' ? 'text-indigo-700' : 'text-slate-500'}`}>
                      {mode === 'large' ? '✓ Prêt à imprimer' : 'Cliquez pour activer'}
                    </p>
                  </div>
                  <span className="text-lg">📄</span>
                </div>
              </div>
            </button>

            {/* ========== OPTION 2 : LIVRAISON ========== */}
            <button onClick={() => handleSelectMode('delivery')}
              className={`group relative overflow-hidden p-8 rounded-3xl border-2 text-left transition-all duration-300 ${
                mode === 'delivery' 
                  ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-2xl shadow-orange-100 scale-[1.02]' 
                  : 'border-slate-200 bg-white hover:border-orange-200 hover:shadow-xl'
              }`}>
              
              {/* Badge sélectionné */}
              {mode === 'delivery' && (
                <div className="absolute top-4 right-4 bg-orange-600 text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse" />
                  SÉLECTIONNÉ
                </div>
              )}
              
              {/* Icône + Badge */}
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  mode === 'delivery' ? 'bg-orange-600' : 'bg-orange-100 group-hover:bg-orange-200'
                }`}>
                  <span className={`text-3xl ${mode === 'delivery' ? '' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                    📦
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-slate-900 text-xl">Mini Étiquettes</h3>
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">COLIS</span>
                  </div>
                  <p className="text-slate-500 text-sm">8 QR uniques à découper pour livraisons</p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-5">
                {[
                  { icon: '💀', title: 'Usage Unique', desc: 'Mort après 1 seul scan' },
                  { icon: '8️⃣', title: '8 QR Uniques', desc: 'Générés à chaque impression' },
                  { icon: '✂️', title: 'À Découper', desc: '1 étiquette dans chaque colis' },
                  { icon: '🔒', title: 'Sécurisé', desc: 'Impossible de réutiliser' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 group/item">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      mode === 'delivery' ? 'bg-white' : 'bg-slate-50 group-hover/item:bg-orange-50'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-bold text-sm">{item.title}</p>
                      <p className="text-slate-500 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Statut */}
              <div className={`rounded-2xl p-4 border-2 border-dashed ${
                mode === 'delivery' 
                  ? 'bg-white border-orange-300' 
                  : 'bg-slate-50 border-slate-200 group-hover:border-orange-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${mode === 'delivery' ? (tokensReady ? 'bg-green-500 animate-pulse' : 'bg-orange-500 animate-pulse') : 'bg-slate-300'}`} />
                    <p className={`text-xs font-bold ${mode === 'delivery' ? 'text-orange-700' : 'text-slate-500'}`}>
                      {mode === 'delivery' 
                        ? (tokensReady ? '✓ 8 QR générés' : '⚡ Génération au clic') 
                        : 'Cliquez pour activer'}
                    </p>
                  </div>
                  <span className="text-lg">✂️</span>
                </div>
              </div>
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
              <div className="grid grid-cols-3 gap-3">
                {[
                  { step: '1', title: 'Imprimez 8 QR', desc: 'Découpez chaque étiquette et glissez 1 par colis' },
                  { step: '2', title: 'Client reçoit', desc: 'Il trouve le QR dans son colis et le scanne' },
                  { step: '3', title: 'Point ajouté', desc: 'Le QR meurt après usage — impossible de réutiliser' },
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

          {/* Bouton imprimer premium */}
          <button onClick={handlePrint} disabled={savingTokens}
            className={`w-full group relative overflow-hidden rounded-2xl p-6 font-black text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'large'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300'
                : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300'
            }`}>
            
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <div className="relative z-10 flex items-center justify-center gap-3">
              {savingTokens ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-white">Génération des QR...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span className="text-white">
                    {mode === 'large' 
                      ? '🖨️ Imprimer le Grand Format Vitrine' 
                      : (tokensReady ? '🖨️ Imprimer les 8 Étiquettes' : '⚡ Générer 8 QR et Imprimer')}
                  </span>
                </>
              )}
            </div>
          </button>

          {/* Aperçu premium */}
          <div className="mt-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 border border-slate-200 shadow-inner">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-900 font-black text-sm">Aperçu avant impression</p>
                  <p className="text-slate-500 text-xs">
                    {mode === 'large' ? 'Format A4 — 210×297mm' : 'Page 8 étiquettes — À découper'}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                mode === 'large' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {mode === 'large' ? '🏪 VITRINE' : '📦 COLIS'}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
