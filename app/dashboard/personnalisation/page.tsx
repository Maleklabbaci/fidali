'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const BRAND_COLORS = [
  '#6C3FE8', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
  '#1E293B', '#0F172A',
]

const FONTS = [
  { value: 'default', label: 'Par défaut', css: 'system-ui' },
  { value: 'modern', label: 'Modern', css: 'DM Sans, sans-serif' },
  { value: 'elegant', label: 'Élégant', css: 'Playfair Display, serif' },
  { value: 'bold', label: 'Bold', css: 'Montserrat, sans-serif' },
]

export default function PersonnalisationPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    business_name: '',
    welcome_message: '',
    brand_color: '#6C3FE8',
    accent_color: '#F59E0B',
    font_style: 'default',
    logo_url: '',
    cover_message: '',
    reward_emoji: '🎁',
  })

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)

    // Check plan access — Pro ou Premium uniquement
    if (m.plan === 'starter' || !m.plan) {
      router.push('/dashboard')
      return
    }

    setForm(prev => ({
      ...prev,
      business_name: m.business_name || '',
      welcome_message: m.welcome_message || '',
      brand_color: m.brand_color || '#6C3FE8',
      accent_color: m.accent_color || '#F59E0B',
      font_style: m.font_style || 'default',
      logo_url: m.logo_url || '',
      cover_message: m.cover_message || '',
      reward_emoji: m.reward_emoji || '🎁',
    }))
    setLoading(false)
  }, [router])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Image max 2MB'); return }

    setUploading(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      const ext = file.name.split('.').pop()
      const path = `logos/${merchant.id}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('merchant-assets').upload(path, file, { upsert: true })
      if (error) throw error
      const { data: urlData } = supabase.storage.from('merchant-assets').getPublicUrl(path)
      setForm(prev => ({ ...prev, logo_url: urlData.publicUrl }))
    } catch (err) {
      console.error(err)
      alert('Erreur upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      const { error } = await supabase.from('merchants').update({
        business_name: form.business_name,
        welcome_message: form.welcome_message,
        brand_color: form.brand_color,
        accent_color: form.accent_color,
        font_style: form.font_style,
        logo_url: form.logo_url,
        cover_message: form.cover_message,
        reward_emoji: form.reward_emoji,
        updated_at: new Date().toISOString(),
      }).eq('id', merchant.id)

      if (error) throw error

      // Update localStorage
      const updated = { ...merchant, ...form }
      localStorage.setItem('merchant', JSON.stringify(updated))
      sessionStorage.setItem('merchant', JSON.stringify(updated))
      setMerchant(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const EMOJIS = ['🎁', '⭐', '🏆', '💎', '🎉', '🔥', '💰', '🌟', '🎯', '❤️', '🍕', '☕']

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  const selectedFont = FONTS.find(f => f.value === form.font_style) || FONTS[0]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-800">Personnalisation</h1>
            <p className="text-xs text-slate-400">Plan {merchant?.plan} — accès complet</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
          {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sauvegarde...</>
            : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid lg:grid-cols-[1fr_360px] gap-8">

        {/* LEFT — Settings */}
        <div className="space-y-6">

          {/* Identité */}
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-700">Identité de marque</p>
              <p className="text-xs text-slate-400 mt-0.5">Ce que vos clients voient sur la carte et le scan</p>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Logo */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
                    {form.logo_url
                      ? <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      : <span className="text-2xl">🏪</span>
                    }
                  </div>
                  <div>
                    <button onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition">
                      {uploading ? 'Upload...' : 'Choisir une image'}
                    </button>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG · max 2MB · carré recommandé</p>
                    {form.logo_url && (
                      <button onClick={() => setForm(p => ({ ...p, logo_url: '' }))} className="text-xs text-red-400 hover:text-red-600 mt-1">Supprimer</button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
              </div>

              {/* Nom commercial */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nom affiché sur la carte</label>
                <input type="text" value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))}
                  maxLength={40}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              {/* Message de bienvenue */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Message de bienvenue</label>
                <textarea value={form.welcome_message} onChange={e => setForm(p => ({ ...p, welcome_message: e.target.value }))}
                  rows={2} maxLength={120} placeholder="Ex: Bienvenue chez nous ! Collectez des points à chaque visite."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                <p className="text-xs text-slate-400 mt-1">{form.welcome_message.length}/120</p>
              </div>

              {/* Message sur la carte */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Slogan / Message sur la carte</label>
                <input type="text" value={form.cover_message} onChange={e => setForm(p => ({ ...p, cover_message: e.target.value }))}
                  maxLength={50} placeholder="Ex: Votre fidélité récompensée ✨"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </section>

          {/* Couleurs */}
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-700">Couleurs</p>
              <p className="text-xs text-slate-400 mt-0.5">Couleur principale et accent de votre marque</p>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-3">Couleur principale</label>
                <div className="flex flex-wrap gap-2.5">
                  {BRAND_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(p => ({ ...p, brand_color: c }))}
                      className={`w-8 h-8 rounded-full transition-all ${form.brand_color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                  <div className="relative">
                    <input type="color" value={form.brand_color} onChange={e => setForm(p => ({ ...p, brand_color: e.target.value }))}
                      className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 cursor-pointer appearance-none" title="Couleur personnalisée" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-3">Couleur accent</label>
                <div className="flex flex-wrap gap-2.5">
                  {BRAND_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(p => ({ ...p, accent_color: c }))}
                      className={`w-8 h-8 rounded-full transition-all ${form.accent_color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                  <input type="color" value={form.accent_color} onChange={e => setForm(p => ({ ...p, accent_color: e.target.value }))}
                    className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 cursor-pointer" />
                </div>
              </div>
            </div>
          </section>

          {/* Typographie */}
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-700">Typographie</p>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                {FONTS.map(f => (
                  <button key={f.value} onClick={() => setForm(p => ({ ...p, font_style: f.value }))}
                    className={`px-4 py-3 rounded-xl border text-left transition ${form.font_style === f.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}>
                    <p className="text-sm font-semibold text-slate-700" style={{ fontFamily: f.css }}>{f.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: f.css }}>Aa Bb Cc 123</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Emoji récompense */}
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-700">Emoji récompense</p>
              <p className="text-xs text-slate-400 mt-0.5">Affiché quand un client atteint sa récompense</p>
            </div>
            <div className="px-6 py-5">
              <div className="flex flex-wrap gap-3">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setForm(p => ({ ...p, reward_emoji: e }))}
                    className={`w-10 h-10 text-xl rounded-xl transition-all ${form.reward_emoji === e ? 'bg-indigo-100 ring-2 ring-indigo-400 scale-110' : 'bg-slate-100 hover:bg-slate-200'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT — Preview */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Aperçu carte</p>

          {/* Card preview */}
          <div className="rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/50"
            style={{ background: `linear-gradient(135deg, ${form.brand_color}, ${form.accent_color})`, fontFamily: selectedFont.css }}>
            <div className="p-6">
              {/* Top */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  {form.logo_url
                    ? <img src={form.logo_url} className="w-10 h-10 rounded-xl object-cover bg-white/20" alt="logo" />
                    : <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg">🏪</div>
                  }
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">{form.business_name || 'Votre commerce'}</p>
                    <p className="text-white/60 text-[10px]">Carte de fidélité</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.24M16.39 7.39l1.42-1.42M6.6 19.4l-1.42 1.42M4 12H2m4.39-5.39L4.97 5.19M19.03 18.81l1.42 1.42" />
                  </svg>
                </div>
              </div>

              {/* Points preview */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/70 text-xs">Progression</span>
                  <span className="text-white text-xs font-bold">6 / 10 pts</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full">
                  <div className="h-2 bg-white rounded-full w-[60%]" />
                </div>
              </div>

              {/* Slogan */}
              {form.cover_message && (
                <p className="text-white/70 text-[11px] text-center italic mb-2">{form.cover_message}</p>
              )}

              {/* Bottom */}
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-[10px] font-mono">CLIENT · 00001</span>
                <span className="text-2xl">{form.reward_emoji}</span>
              </div>
            </div>
          </div>

          {/* Welcome message preview */}
          {form.welcome_message && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 mb-2">Message de bienvenue</p>
              <p className="text-sm text-slate-700" style={{ fontFamily: selectedFont.css }}>{form.welcome_message}</p>
            </div>
          )}

          {/* Plan badge */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">
              {merchant?.plan === 'premium' ? '★' : 'P'}
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-700">Plan {merchant?.plan}</p>
              <p className="text-[11px] text-indigo-400">Personnalisation complète activée</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
