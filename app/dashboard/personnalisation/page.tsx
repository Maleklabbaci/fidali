'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const PALETTE = [
  '#6C3FE8', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#8B5CF6', '#06B6D4', '#F97316', '#1E293B',
  '#DC2626', '#059669', '#0EA5E9', '#D97706', '#7C3AED',
]

const LOGO_EMOJIS = ['🏪', '☕', '🍕', '💇', '🏋️', '👗', '💊', '🛒', '🍔', '🎂', '🚗', '📱', '💎', '🌿', '🎯', '🌸', '🍜', '🥐', '🧁', '🍣']
const REWARD_EMOJIS = ['🎁', '⭐', '🏆', '💎', '🎉', '🔥', '💰', '🌟', '❤️', '🎊', '🍀', '🎖️', '🥇', '✨', '🦋']

const FONT_STYLES = [
  { id: 'default',  label: 'Default',  font: 'font-sans',   desc: 'Propre et lisible' },
  { id: 'modern',   label: 'Modern',   font: 'font-mono',   desc: 'Tech & minimaliste' },
  { id: 'elegant',  label: 'Élégant',  font: 'font-serif',  desc: 'Chic & raffiné' },
  { id: 'bold',     label: 'Bold',     font: 'font-sans',   desc: 'Fort & impactant' },
]

interface Form {
  business_name: string
  slogan: string
  color1: string
  color2: string
  logo_emoji: string
  logo_url: string
  welcome_message: string
  reward: string
  reward_emoji: string
  font_style: string
  points_per_visit: number
  max_points: number
}

export default function PersonnalisationPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [merchant, setMerchant] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('identite')

  const [form, setForm] = useState<Form>({
    business_name: '',
    slogan: '',
    color1: '#6C3FE8',
    color2: '#F59E0B',
    logo_emoji: '🏪',
    logo_url: '',
    welcome_message: '',
    reward: '',
    reward_emoji: '🎁',
    font_style: 'default',
    points_per_visit: 1,
    max_points: 10,
  })

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)
    if (m.plan === 'starter' || !m.plan) { router.push('/dashboard'); return }
    loadCards(m.id)
  }, [router])

  const loadCards = async (merchantId: string) => {
    try {
      const { getMyCards } = await import('@/database/supabase-client')
      const data = await getMyCards(merchantId)
      const list = Array.isArray(data) ? data : []
      setCards(list)
      if (list.length > 0) applyCard(list[0])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const applyCard = (card: any) => {
    setSelectedCard(card)
    setSaved(false)
    setForm({
      business_name:    card.business_name   || '',
      slogan:           card.slogan          || '',
      color1:           card.color1          || '#6C3FE8',
      color2:           card.color2          || '#F59E0B',
      logo_emoji:       card.logo_emoji      || '🏪',
      logo_url:         card.logo_url        || '',
      welcome_message:  card.welcome_message || '',
      reward:           card.reward          || '',
      reward_emoji:     card.reward_emoji    || '🎁',
      font_style:       card.font_style      || 'default',
      points_per_visit: card.points_per_visit || 1,
      max_points:       card.max_points      || 10,
    })
  }

  // Compresse et redimensionne une image côté client avant upload
  // Résultat : toujours <= ~50 Ko, peu importe la taille originale
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const MAX = 400 // px max (largeur et hauteur)
        let { width, height } = img
        if (width > height) {
          if (width > MAX) { height = Math.round(height * MAX / width); width = MAX }
        } else {
          if (height > MAX) { width = Math.round(width * MAX / height); height = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          blob => blob ? resolve(blob) : reject(new Error('Compression échouée')),
          'image/webp',
          0.82 // qualité 82% → bon compromis qualité/poids
        )
      }
      img.onerror = reject
      img.src = url
    })
  }

  const handleLogoUpload = async (file: File) => {
    if (!file || !selectedCard) return
    setUploadingLogo(true)
    try {
      const { supabase } = await import('@/database/supabase-client')

      // Compression avant upload — transforme n'importe quel fichier en ~50Ko max
      const compressed = await compressImage(file)
      const path = `logos/${selectedCard.id}-${Date.now()}.webp`

      const { error: upErr } = await supabase.storage.from('merchant-assets').upload(path, compressed, {
        upsert: true,
        contentType: 'image/webp',
      })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('merchant-assets').getPublicUrl(path)
      set('logo_url', data.publicUrl)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'upload du logo")
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSave = async () => {
    if (!selectedCard) return
    setSaving(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      const { error } = await supabase.from('loyalty_cards').update({
        business_name:    form.business_name,
        slogan:           form.slogan,
        color1:           form.color1,
        color2:           form.color2,
        logo_emoji:       form.logo_emoji,
        logo_url:         form.logo_url,
        welcome_message:  form.welcome_message,
        reward:           form.reward,
        reward_emoji:     form.reward_emoji,
        font_style:       form.font_style,
        points_per_visit: form.points_per_visit,
        max_points:       form.max_points,
        updated_at:       new Date().toISOString(),
      }).eq('id', selectedCard.id)

      if (error) throw error

      const updated = { ...selectedCard, ...form }
      setCards(prev => prev.map(c => c.id === selectedCard.id ? updated : c))
      setSelectedCard(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const set = (key: keyof Form, val: any) => setForm(p => ({ ...p, [key]: val }))

  const fontClass = FONT_STYLES.find(f => f.id === form.font_style)?.font || 'font-sans'
  const fontWeight = form.font_style === 'bold' ? 'font-extrabold' : 'font-bold'

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  if (cards.length === 0) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">💳</div>
        <p className="text-lg font-bold text-slate-800">Aucune carte créée</p>
        <p className="text-sm text-slate-400 mt-1 mb-6">Crée d'abord une carte de fidélité avant de la personnaliser</p>
        <button onClick={() => router.push('/dashboard/create-card')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
          + Créer une carte
        </button>
      </div>
    </div>
  )

  const sections = [
    { id: 'identite',   icon: '🏷️', label: 'Identité' },
    { id: 'couleurs',   icon: '🎨', label: 'Couleurs' },
    { id: 'typo',       icon: '✍️', label: 'Typographie' },
    { id: 'messages',   icon: '💬', label: 'Messages' },
    { id: 'recompense', icon: '🎁', label: 'Récompense' },
    { id: 'points',     icon: '⚡', label: 'Points' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-slate-100 rounded-lg transition shrink-0">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-800">Personnalisation+</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${merchant?.plan === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                {merchant?.plan}
              </span>
              {cards.length} carte{cards.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving || !selectedCard}
          className={`px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2 shrink-0 ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
          {saving
            ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sauvegarde...</>
            : saved
              ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>Sauvegardé</>
              : 'Sauvegarder'}
        </button>
      </div>

      {/* Sélecteur de carte (si > 1) */}
      {cards.length > 1 && (
        <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-5xl mx-auto">
            {cards.map(card => (
              <button key={card.id} onClick={() => applyCard(card)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition shrink-0 ${
                  selectedCard?.id === card.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                <span>{card.logo_emoji || '🏪'}</span>
                <span className="max-w-[120px] truncate">{card.business_name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contenu */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 sm:gap-8 items-start">

          {/* LEFT — Éditeur */}
          <div className="space-y-2">

            {/* Nav sections */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4">
              {sections.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                    activeSection === s.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}>
                  <span>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>

            {/* IDENTITÉ */}
            {activeSection === 'identite' && (
              <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <SectionHeader icon="🏷️" title="Identité de la carte" />
                <div className="px-6 py-5 space-y-5">

                  {/* Logo upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Logo (image)</label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                        {form.logo_url
                          ? <img src={form.logo_url} alt="logo" className="w-full h-full object-cover" />
                          : <span className="text-2xl">{form.logo_emoji}</span>
                        }
                      </div>
                      <div className="flex-1">
                        <input ref={fileRef} type="file" accept="image/*" className="hidden"
                          onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                        <button onClick={() => fileRef.current?.click()} disabled={uploadingLogo}
                          className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition disabled:opacity-50">
                          {uploadingLogo ? '⏳ Upload en cours…' : '📁 Choisir une image'}
                        </button>
                        {form.logo_url && (
                          <button onClick={() => set('logo_url', '')}
                            className="w-full mt-1.5 px-3 py-1.5 text-xs text-red-500 hover:text-red-700 transition">
                            ✕ Supprimer l'image
                          </button>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1.5">PNG, JPG · Stocké dans Supabase Storage</p>
                      </div>
                    </div>
                  </div>

                  {/* Emoji */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                      Emoji / Icône <span className="text-slate-400 font-normal">(affiché si pas d'image)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {LOGO_EMOJIS.map(e => (
                        <button key={e} onClick={() => set('logo_emoji', e)}
                          className={`w-9 h-9 text-xl rounded-xl transition-all ${form.logo_emoji === e ? 'bg-indigo-100 ring-2 ring-indigo-400 scale-110' : 'bg-slate-100 hover:bg-slate-200'}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nom affiché sur la carte</label>
                    <input type="text" value={form.business_name} onChange={e => set('business_name', e.target.value)}
                      maxLength={40} placeholder="Ex: Café Amine, Pizzeria La Roma…"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  {/* Slogan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Slogan / Message sur la carte</label>
                    <input type="text" value={form.slogan} onChange={e => set('slogan', e.target.value)}
                      maxLength={60} placeholder="Ex: Chaque visite vous rapproche d'un cadeau…"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
                    <p className="text-xs text-slate-400 mt-1">{form.slogan.length}/60</p>
                  </div>
                </div>
              </section>
            )}

            {/* COULEURS */}
            {activeSection === 'couleurs' && (
              <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <SectionHeader icon="🎨" title="Couleurs de la carte" />
                <div className="px-6 py-5 space-y-6">
                  {([
                    { label: 'Couleur principale', key: 'color1' },
                    { label: 'Couleur accent', key: 'color2' },
                  ] as const).map(({ label, key }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-semibold text-slate-500">{label}</label>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full border border-slate-200" style={{ backgroundColor: form[key] }} />
                          <span className="text-xs text-slate-400 font-mono">{form[key]}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2.5 items-center">
                        {PALETTE.map(c => (
                          <button key={c} onClick={() => set(key, c)}
                            className={`w-7 h-7 rounded-full transition-all ${form[key] === c ? 'ring-2 ring-offset-2 ring-slate-500 scale-110' : 'hover:scale-110'}`}
                            style={{ backgroundColor: c }} />
                        ))}
                        <label className="relative cursor-pointer">
                          <div className="w-7 h-7 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs hover:border-slate-400 transition">+</div>
                          <input type="color" value={form[key]} onChange={e => set(key, e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                        </label>
                      </div>
                    </div>
                  ))}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Aperçu du dégradé</p>
                    <div className="h-10 rounded-xl" style={{ background: `linear-gradient(135deg, ${form.color1}, ${form.color2})` }} />
                  </div>
                </div>
              </section>
            )}

            {/* TYPOGRAPHIE */}
            {activeSection === 'typo' && (
              <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <SectionHeader icon="✍️" title="Style typographique" />
                <div className="px-6 py-5">
                  <div className="grid grid-cols-2 gap-3">
                    {FONT_STYLES.map(f => (
                      <button key={f.id} onClick={() => set('font_style', f.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${form.font_style === f.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                        <p className={`text-xl mb-1 ${f.font} ${f.id === 'bold' ? 'font-extrabold' : 'font-bold'} ${form.font_style === f.id ? 'text-indigo-700' : 'text-slate-700'}`}>Aa</p>
                        <p className={`text-sm font-semibold ${form.font_style === f.id ? 'text-indigo-700' : 'text-slate-700'}`}>{f.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 bg-slate-50 rounded-xl p-4">
                    <p className={`text-slate-700 text-sm ${fontClass} ${form.font_style === 'bold' ? 'font-extrabold' : 'font-semibold'}`}>
                      {form.business_name || 'Votre Commerce'} — Aperçu
                    </p>
                    <p className={`text-slate-400 text-xs mt-0.5 ${fontClass}`}>
                      {form.slogan || 'Votre slogan ici…'}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* MESSAGES */}
            {activeSection === 'messages' && (
              <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <SectionHeader icon="💬" title="Messages client" />
                <div className="px-6 py-5">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Message de bienvenue <span className="text-slate-400 font-normal">(vu au scan)</span>
                  </label>
                  <textarea value={form.welcome_message} onChange={e => set('welcome_message', e.target.value)}
                    rows={4} maxLength={120} placeholder="Ex: Bienvenue chez nous ! Gagnez des points à chaque visite 🎉"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  <p className="text-xs text-slate-400 mt-1">{form.welcome_message.length}/120</p>
                </div>
              </section>
            )}

            {/* RÉCOMPENSE */}
            {activeSection === 'recompense' && (
              <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <SectionHeader icon="🎁" title="Récompense" />
                <div className="px-6 py-5 space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Description</label>
                    <input type="text" value={form.reward} onChange={e => set('reward', e.target.value)}
                      maxLength={60} placeholder="Ex: Café offert ☕, -20% sur commande…"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                      Emoji récompense <span className="text-slate-400 font-normal">(affiché quand le client gagne)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {REWARD_EMOJIS.map(e => (
                        <button key={e} onClick={() => set('reward_emoji', e)}
                          className={`w-11 h-11 text-2xl rounded-xl transition-all ${form.reward_emoji === e ? 'bg-indigo-100 ring-2 ring-indigo-400 scale-110' : 'bg-slate-100 hover:bg-slate-200'}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-3xl">{form.reward_emoji}</span>
                    <div>
                      <p className="text-xs font-semibold text-amber-700">Aperçu notification client</p>
                      <p className="text-sm text-amber-600 mt-0.5">{form.reward || 'Votre récompense ici'}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* POINTS */}
            {activeSection === 'points' && (
              <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <SectionHeader icon="⚡" title="Règle de points" />
                <div className="px-6 py-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Points par visite</label>
                      <input type="number" value={form.points_per_visit} min={1} max={100}
                        onChange={e => set('points_per_visit', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Points pour récompense</label>
                      <input type="number" value={form.max_points} min={1} max={1000}
                        onChange={e => set('max_points', parseInt(e.target.value) || 10)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-indigo-600 mb-3">Parcours client</p>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {Array.from({ length: Math.min(Math.ceil(form.max_points / form.points_per_visit), 12) }, (_, i) => (
                        <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${i < 3 ? 'bg-indigo-500 text-white' : 'bg-indigo-200 text-indigo-500'}`}>
                          {i < 3 ? '✓' : i + 1}
                        </div>
                      ))}
                      {Math.ceil(form.max_points / form.points_per_visit) > 12 && (
                        <span className="text-xs text-indigo-400 mx-1">…</span>
                      )}
                      <div className="w-9 h-9 rounded-full bg-amber-400 text-white flex items-center justify-center text-lg shrink-0 ml-1">
                        {form.reward_emoji}
                      </div>
                    </div>
                    <p className="text-xs text-indigo-500 mt-3">
                      Il faut <strong>{Math.ceil(form.max_points / form.points_per_visit)} visites</strong> pour obtenir la récompense
                    </p>
                  </div>
                </div>
              </section>
            )}

          </div>

          {/* RIGHT — Aperçu live */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aperçu en direct</p>

            {/* Card */}
            <div className={`rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/40 ${fontClass}`}
              style={{ background: `linear-gradient(135deg, ${form.color1}, ${form.color2})` }}>
              <div className="p-6">
                {/* Top */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                      {form.logo_url
                        ? <img src={form.logo_url} alt="" className="w-full h-full object-cover" />
                        : <span className="text-2xl">{form.logo_emoji}</span>
                      }
                    </div>
                    <div>
                      <p className={`text-white text-sm leading-tight ${fontWeight}`}>
                        {form.business_name || 'Votre Commerce'}
                      </p>
                      <p className="text-white/50 text-[10px] mt-0.5">Carte de fidélité</p>
                    </div>
                  </div>
                  <span className="text-white/30 text-[9px] font-mono mt-1 shrink-0">{selectedCard?.code || '•••••'}</span>
                </div>

                {/* Slogan */}
                {form.slogan && (
                  <p className="text-white/70 text-[11px] mb-4 italic">{form.slogan}</p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-white/60 text-xs">Progression</span>
                    <span className="text-white text-xs font-bold">4 / {form.max_points} pts</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full">
                    <div className="h-2 bg-white/80 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((4 / Math.max(form.max_points, 1)) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Reward */}
                {form.reward && (
                  <div className="bg-white/15 rounded-xl px-3 py-2.5 flex items-center gap-2.5 mb-4">
                    <span className="text-xl">{form.reward_emoji}</span>
                    <div>
                      <p className="text-white/60 text-[10px]">Récompense</p>
                      <p className="text-white text-xs font-semibold">{form.reward}</p>
                    </div>
                  </div>
                )}

                {/* Bottom */}
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-[9px] font-mono">FIDALI</span>
                  <span className="text-white/40 text-[9px]">{form.points_per_visit} pt/visite</span>
                </div>
              </div>
            </div>

            {/* Welcome preview */}
            {form.welcome_message && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Message de bienvenue</p>
                <p className="text-sm text-slate-600 leading-relaxed">{form.welcome_message}</p>
              </div>
            )}

            {/* Plan badge */}
            <div className={`rounded-2xl p-4 flex items-center gap-3 ${merchant?.plan === 'premium' ? 'bg-amber-50 border border-amber-100' : 'bg-indigo-50 border border-indigo-100'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg shrink-0 ${merchant?.plan === 'premium' ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                {merchant?.plan === 'premium' ? '★' : 'P'}
              </div>
              <div>
                <p className={`text-xs font-bold capitalize ${merchant?.plan === 'premium' ? 'text-amber-700' : 'text-indigo-700'}`}>
                  Plan {merchant?.plan}
                </p>
                <p className={`text-[11px] ${merchant?.plan === 'premium' ? 'text-amber-500' : 'text-indigo-400'}`}>
                  Personnalisation complète activée
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
      <span className="text-lg">{icon}</span>
      <p className="text-sm font-bold text-slate-700">{title}</p>
    </div>
  )
}
