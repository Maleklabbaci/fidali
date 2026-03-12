'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function AvisPage() {
  const params = useParams()
  const code = params.code as string

  const [card, setCard] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadData()
  }, [code])

  const loadData = async () => {
    try {
      const { supabase } = await import('@/database/supabase-client')

      const { data: cardData } = await supabase
        .from('loyalty_cards')
        .select('*, merchants(*)')
        .eq('code', code)
        .eq('is_active', true)
        .single()

      if (!cardData) { setError('Commerce introuvable'); setLoading(false); return }
      setCard(cardData)

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('card_id', cardData.id)
        .order('created_at', { ascending: false })

      setReviews(reviewsData || [])

      const stored = localStorage.getItem('fidali_client')
      if (stored) {
        const client = JSON.parse(stored)
        setName(client.name || '')
      }
    } catch (err) {
      console.error(err)
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (rating === 0) { setError('Sélectionnez une note'); return }
    if (!name.trim()) { setError('Entrez votre nom'); return }
    setError('')
    setSubmitting(true)

    try {
      const { supabase } = await import('@/database/supabase-client')

      let clientId = null
      const stored = localStorage.getItem('fidali_client')
      if (stored) {
        const client = JSON.parse(stored)
        clientId = client.id
      }

      const { error: insertError } = await supabase.from('reviews').insert({
        merchant_id: card.merchant_id,
        card_id: card.id,
        client_id: clientId,
        client_name: name.trim(),
        rating,
        comment: comment.trim() || null,
      })

      if (insertError) { setError('Erreur: ' + insertError.message); return }

      await supabase.from('activities').insert({
        merchant_id: card.merchant_id,
        type: 'review',
        description: `⭐ ${name.trim()} a laissé un avis ${rating}/5${comment.trim() ? ': "' + comment.trim().slice(0, 50) + '..."' : ''}`,
      })

      setSubmitted(true)
      loadData()
    } catch (err) {
      setError('Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0'

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rev) => rev.rating === r).length,
    pct: reviews.length > 0 ? (reviews.filter((rev) => rev.rating === r).length / reviews.length) * 100 : 0,
  }))

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return "À l'instant"
    if (s < 3600) return `il y a ${Math.floor(s / 60)} min`
    if (s < 86400) return `il y a ${Math.floor(s / 3600)}h`
    if (s < 604800) return `il y a ${Math.floor(s / 86400)} jour${Math.floor(s / 86400) > 1 ? 's' : ''}`
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg className={`w-full h-full ${filled ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error && !card) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm max-w-sm w-full">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-slate-800 font-bold">{error}</p>
          <p className="text-slate-400 text-xs mt-2">Ce commerce n&apos;existe pas ou n&apos;est plus actif</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-lg max-w-sm w-full">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Merci pour votre avis !</h2>
          <p className="text-slate-400 text-sm mb-2">Votre retour aide <strong>{card?.business_name}</strong> à s&apos;améliorer</p>
          <div className="flex justify-center gap-1 my-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="w-8 h-8">
                <StarIcon filled={s <= rating} />
              </div>
            ))}
          </div>
          {comment && (
            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <p className="text-sm text-slate-600 italic">&ldquo;{comment}&rdquo;</p>
            </div>
          )}
          <button
            onClick={() => { setSubmitted(false); setRating(0); setComment('') }}
            className="text-sm text-indigo-600 hover:underline font-medium"
          >
            ← Voir les avis
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header commerce */}
      <div
        className="relative overflow-hidden px-5 pt-10 pb-8"
        style={{ background: `linear-gradient(135deg, ${card?.color1 || '#4f46e5'}, ${card?.color2 || '#7c3aed'})` }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/[0.05] rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/[0.05] rounded-full" />

        <div className="relative z-10 max-w-lg mx-auto text-center text-white">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            {card?.business_name?.[0]?.toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold">{card?.business_name}</h1>
          <p className="text-white/60 text-sm mt-1">Donnez votre avis</p>

          {reviews.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="w-4 h-4">
                    <StarIcon filled={s <= Math.round(Number(avgRating))} />
                  </div>
                ))}
              </div>
              <span className="text-sm font-bold">{avgRating}</span>
              <span className="text-white/50 text-xs">({reviews.length} avis)</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-4 relative z-10">

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-1">⭐ Votre expérience</h2>
          <p className="text-xs text-slate-400 mb-5">Comment évaluez-vous {card?.business_name} ?</p>

          {/* Étoiles */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="group relative"
              >
                <div className={`w-12 h-12 transition-transform ${(hoverRating || rating) >= star ? 'scale-110' : 'scale-100 hover:scale-105'}`}>
                  <svg
                    className={`w-full h-full transition-colors ${(hoverRating || rating) >= star ? 'text-amber-400 drop-shadow-md' : 'text-slate-200'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p className="text-center text-sm font-semibold mb-5" style={{
              color: rating <= 2 ? '#ef4444' : rating === 3 ? '#f59e0b' : '#10b981'
            }}>
              {['', '😞 Très décevant', '😕 Décevant', '😐 Correct', '😊 Très bien', '🤩 Excellent !'][rating]}
            </p>
          )}

          {/* Nom */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Votre nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Marie D."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Commentaire */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Votre commentaire <span className="text-slate-300 font-normal">(optionnel)</span></label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
            />
            <p className="text-[10px] text-slate-300 text-right mt-1">{comment.length}/500</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs font-medium px-4 py-2.5 rounded-xl mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-200 text-sm"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Envoi...
              </span>
            ) : (
              'Envoyer mon avis ⭐'
            )}
          </button>
        </div>

        {/* Résumé des notes */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-4xl font-extrabold text-slate-900">{avgRating}</p>
                <div className="flex gap-0.5 justify-center my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="w-3.5 h-3.5">
                      <StarIcon filled={s <= Math.round(Number(avgRating))} />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400">{reviews.length} avis</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {ratingCounts.map((r) => (
                  <div key={r.stars} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-3 text-right">{r.stars}</span>
                    <div className="w-3 h-3"><StarIcon filled /></div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 w-5">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Liste des avis */}
        {reviews.length > 0 && (
          <div className="space-y-3 pb-8">
            <h3 className="text-sm font-bold text-slate-800">💬 Avis récents</h3>
            {(showAll ? reviews : reviews.slice(0, 5)).map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-sm transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-violet-400 rounded-full flex items-center justify-center text-[11px] font-bold text-white">
                      {review.client_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{review.client_name}</p>
                      <p className="text-[10px] text-slate-400">{timeAgo(review.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className="w-3.5 h-3.5">
                        <StarIcon filled={s <= review.rating} />
                      </div>
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-600 leading-relaxed ml-[46px]">{review.comment}</p>
                )}
                {review.response && (
                  <div className="ml-[46px] mt-3 bg-indigo-50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-indigo-600 mb-1">💬 Réponse du commerçant</p>
                    <p className="text-xs text-slate-600">{review.response}</p>
                  </div>
                )}
              </div>
            ))}

            {reviews.length > 5 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
              >
                Voir les {reviews.length - 5} autres avis →
              </button>
            )}
          </div>
        )}

        {reviews.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center mb-8">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm font-bold text-slate-700">Soyez le premier à donner votre avis !</p>
            <p className="text-xs text-slate-400 mt-1">Votre retour est précieux</p>
          </div>
        )}
      </div>
    </div>
  )
}
