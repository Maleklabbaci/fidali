'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'

const STAR_COUNT = 5

export default function PublicCardPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()

  const [card, setCard] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [memberCount, setMemberCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' })
  const [reviewSending, setReviewSending] = useState(false)
  const [reviewSent, setReviewSent] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (slug) loadCard(slug as string)
  }, [slug])

  const loadCard = async (s: string) => {
    try {
      const { supabase } = await import('@/database/supabase-client')

      const { data: cardData } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('public_slug', s)
        .eq('is_active', true)
        .single()

      if (!cardData) { setLoading(false); return }
      setCard(cardData)

      // Nombre de membres
      const { count } = await supabase
        .from('client_cards')
        .select('id', { count: 'exact', head: true })
        .eq('card_id', cardData.id)
      setMemberCount(count || 0)

      // Avis
      const { data: reviewsData } = await supabase
        .from('card_reviews')
        .select('*')
        .eq('card_id', cardData.id)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(10)
      setReviews(reviewsData || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const cardUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/scan/${card?.code}`
    : ''

  const pageUrl = typeof window !== 'undefined'
    ? window.location.href
    : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`🎁 Rejoins ma carte de fidélité ${card?.business_name} sur Fidali !\n${pageUrl}`)}`, '_blank')
  }

  const handleInstagram = () => {
    navigator.clipboard.writeText(pageUrl)
    alert('Lien copié ! Colle-le dans ta bio Instagram ou ta story.')
  }

  const handleJoin = () => {
    router.push(`/scan/${card?.code}`)
  }

  const handleSubmitReview = async () => {
    if (!reviewForm.name.trim() || !card) return
    setReviewSending(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      await supabase.from('card_reviews').insert({
        card_id: card.id,
        client_name: reviewForm.name.trim(),
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim() || null,
      })
      setReviewSent(true)
      setShowReviewForm(false)
      loadCard(slug as string)
    } catch (e) {
      console.error(e)
    } finally {
      setReviewSending(false)
    }
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  if (!card) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl mb-4">🔍</p>
      <h1 className="text-xl font-bold text-slate-800">Page introuvable</h1>
      <p className="text-slate-400 text-sm mt-2">Cette carte n'existe pas ou a été désactivée.</p>
    </div>
  )

  const gradientBg = `linear-gradient(135deg, ${card.color1 || '#6C3FE8'}, ${card.color2 || '#F59E0B'})`

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero avec couleurs de la carte */}
      <div className="relative overflow-hidden" style={{ background: gradientBg }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
        </div>
        <div className="relative max-w-lg mx-auto px-6 pt-12 pb-10 text-center">

          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-xl">
            {card.logo_url
              ? <img src={card.logo_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-4xl">{card.logo_emoji || '🏪'}</span>
            }
          </div>

          <h1 className="text-2xl font-extrabold text-white mb-1">{card.business_name}</h1>
          {card.slogan && <p className="text-white/70 text-sm italic mb-3">{card.slogan}</p>}

          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5">
              <span className="text-white text-xs font-semibold">👤 {memberCount} membres</span>
            </div>
            {avgRating && (
              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5">
                <span className="text-white text-xs font-semibold">⭐ {avgRating}/5</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-lg mx-auto px-5 py-6 space-y-5">

        {/* CTA Rejoindre */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-center">
          <p className="text-slate-500 text-sm mb-1">Rejoignez le programme</p>
          <p className="text-lg font-extrabold text-slate-800 mb-1">{card.reward || 'Récompense offerte'}</p>
          <p className="text-slate-400 text-xs mb-5">Gagnez {card.points_per_visit || 1} point{(card.points_per_visit || 1) > 1 ? 's' : ''} par visite · Récompense à {card.max_points} points</p>
          <button
            onClick={handleJoin}
            className="w-full py-4 text-white font-bold text-base rounded-2xl shadow-lg transition-all active:scale-95"
            style={{ background: gradientBg }}
          >
            {card.reward_emoji || '🎁'} Rejoindre la carte
          </button>
        </div>

        {/* QR Code stylé */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Scanner pour rejoindre</p>

          {/* QR avec logo Fidali au centre */}
          <div ref={qrRef} className="relative w-fit mx-auto">
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-100">
              <QRCode
                value={cardUrl}
                size={200}
                level="H"
                fgColor={card.color1 || '#6C3FE8'}
              />
              {/* Logo Fidali au centre du QR */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center shadow-md overflow-hidden border-2 border-white"
                style={{ background: gradientBg }}
              >
                <img src="/logo-white.png" alt="Fidali" className="w-7 h-7 object-contain" />
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-3 font-mono">{card.code}</p>
        </div>

        {/* Partage */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Partager cette page</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleCopy}
              className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition active:scale-95"
            >
              <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-lg">
                {copied ? '✓' : '🔗'}
              </div>
              <span className="text-xs font-semibold text-slate-600">{copied ? 'Copié !' : 'Copier'}</span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition active:scale-95"
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-lg">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <span className="text-xs font-semibold text-emerald-700">WhatsApp</span>
            </button>
            <button
              onClick={handleInstagram}
              className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-pink-50 hover:bg-pink-100 transition active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg overflow-hidden"
                style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
              <span className="text-xs font-semibold text-pink-700">Instagram</span>
            </button>
          </div>
        </div>

        {/* Avis */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-800">Avis clients</p>
              {avgRating && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {'⭐'.repeat(Math.round(Number(avgRating)))} {avgRating}/5 · {reviews.length} avis
                </p>
              )}
            </div>
            {!reviewSent && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
              >
                + Laisser un avis
              </button>
            )}
          </div>

          {/* Formulaire avis */}
          {showReviewForm && (
            <div className="mb-5 p-4 bg-slate-50 rounded-2xl space-y-3">
              <input
                type="text"
                placeholder="Votre prénom"
                value={reviewForm.name}
                onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Note</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      onClick={() => setReviewForm(p => ({ ...p, rating: s }))}
                      className={`text-2xl transition-transform ${s <= reviewForm.rating ? 'scale-110' : 'grayscale opacity-40'}`}
                    >⭐</button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Votre commentaire (optionnel)"
                value={reviewForm.comment}
                onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <button
                onClick={handleSubmitReview}
                disabled={reviewSending || !reviewForm.name.trim()}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {reviewSending ? 'Envoi...' : 'Envoyer mon avis'}
              </button>
            </div>
          )}

          {reviewSent && (
            <div className="mb-4 p-3 bg-emerald-50 rounded-xl text-center">
              <p className="text-sm text-emerald-700 font-semibold">✓ Merci pour votre avis !</p>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-4">Soyez le premier à laisser un avis !</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={r.id || i} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: gradientBg }}>
                    {r.client_name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{r.client_name}</p>
                      <p className="text-xs text-amber-500">{'⭐'.repeat(r.rating)}</p>
                    </div>
                    {r.comment && <p className="text-xs text-slate-500 mt-0.5">{r.comment}</p>}
                    <p className="text-[10px] text-slate-300 mt-1">
                      {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Fidali */}
        <div className="text-center pb-6">
          <p className="text-xs text-slate-300">Propulsé par</p>
          <img src="/logo.png" alt="Fidali" className="w-8 h-8 object-contain mx-auto mt-1 opacity-40" />
          <p className="text-xs text-slate-300 mt-0.5 font-semibold">Fidali</p>
        </div>
      </div>
    </div>
  )
}
