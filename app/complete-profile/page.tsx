'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar',
  'Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger',
  'Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma',
  'Constantine','Médéa','Mostaganem',"M'Sila",'Mascara','Ouargla','Oran','El Bayadh',
  'Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued',
  'Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent',
  'Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar','Ouled Djellal','Béni Abbès',
  'In Salah','In Guezzam','Touggourt','Djanet','El M\'Ghair','El Menia',
]

const BUSINESS_TYPES = [
  { value: 'cafe',         label: '☕ Café / Salon de thé' },
  { value: 'restaurant',   label: '🍕 Restaurant' },
  { value: 'boulangerie',  label: '🥖 Boulangerie / Pâtisserie' },
  { value: 'salon',        label: '💇 Salon de coiffure / Beauté' },
  { value: 'boutique',     label: '🛍️ Boutique / Magasin' },
  { value: 'pharmacie',    label: '💊 Pharmacie' },
  { value: 'sport',        label: '💪 Salle de sport' },
  { value: 'spa',          label: '🧖 Spa / Hammam' },
  { value: 'lavage',       label: '🚗 Lavage auto' },
  { value: 'epicerie',     label: '🏪 Épicerie / Superette' },
  { value: 'librairie',    label: '📚 Librairie / Papeterie' },
  { value: 'pressing',     label: '👔 Pressing' },
  { value: 'autre',        label: '🏢 Autre' },
]

const HOW_HEARD = [
  'Bouche à oreille', 'Réseaux sociaux (Facebook / Instagram)',
  'Un ami commerçant', 'Google / Internet',
  'Publicité', 'Autre',
]

const USE_FOR = [
  'Fidéliser mes clients réguliers',
  'Augmenter le nombre de visites',
  'Remplacer mes cartes papier',
  'Suivre mes clients et statistiques',
  'Tout ça à la fois',
]

export default function CompleteProfilePage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    businessName: '',
    businessType: '',
    businessAddress: '',
    wilaya: '',
    howHeard: '',
    useFor: '',
  })

  useEffect(() => {
  const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
  if (!stored) { router.push('/login'); return }
  const m = JSON.parse(stored)
  setMerchant(m)
  setForm(f => ({ ...f, fullName: m.name || '', businessName: m.business_name || '' }))

  const checkProfile = async () => {
    try {
      const { getMerchantProfile } = await import('@/database/supabase-client')
      const profile = await getMerchantProfile(m.id)
      
      // ✅ Si "incomplete" ou pas de profil → rester sur cette page (ne rien faire)
      if (!profile || profile.status === 'incomplete') return  // ← AJOUTÉ
      
      // Seulement rediriger si le profil est VRAIMENT soumis/traité
      if (profile.status === 'active' || profile.status === 'approved') router.push('/dashboard')
      else if (profile.status === 'pending') router.push('/dashboard/pending')
      else if (profile.status === 'suspended') router.push('/dashboard/suspended')
      else if (profile.status === 'rejected') router.push('/dashboard/pending?rejected=1')
    } catch {}
  }
  checkProfile()
}, [router])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const { supabase } = await import('@/database/supabase-client')

      // Soumettre le profil complet
      const { error: err } = await supabase.from('merchant_profiles').upsert({
        merchant_id: merchant.id,
        full_name: form.fullName,
        phone: form.phone,
        business_name: form.businessName,
        business_type: form.businessType,
        business_address: form.businessAddress,
        city: form.wilaya,
        how_heard: form.howHeard,
        use_for: form.useFor,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      }, { onConflict: 'merchant_id' })

      if (err) throw err

      // Mettre à jour le statut du merchant
      await supabase.from('merchants').update({ status: 'pending' }).eq('id', merchant.id)

      // Notifier l'admin via messages
      await supabase.from('messages').insert({
        merchant_id: merchant.id,
        subject: '🆕 Nouveau commerçant à valider',
        content: `${form.fullName} — ${form.businessName} (${form.businessType}) · ${form.wilaya}\nTéléphone: ${form.phone}\nAdresse: ${form.businessAddress}\nComment il a entendu parler de Fidali: ${form.howHeard}\nUtilisation prévue: ${form.useFor}`,
        status: 'unread',
      })

      router.push('/dashboard/pending')
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  const Field = ({ label, children }: any) => (
    <div>
      <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  )

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '11px 14px', fontSize: 14, color: 'white', outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
  } as any

  const selectStyle = { ...inputStyle, cursor: 'pointer' }

  const canNext1 = form.fullName && form.phone && form.businessName && form.businessType
  const canNext2 = form.wilaya && form.businessAddress
  const canSubmit = form.howHeard && form.useFor

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, #0f0f14 0%, #1a1025 100%)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
        input:focus, select:focus, textarea:focus { border-color: rgba(147,51,234,0.6) !important; }
        option { background: #1a1025; color: white; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Logo + progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="Fidali" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'contain' }} />
            <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>Fidali</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{ width: 28, height: 4, borderRadius: 2, background: s <= step ? 'linear-gradient(90deg, #9333ea, #db2777)' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 28, marginBottom: 12 }}>

          {/* Étape 1 — Infos de base */}
          {step === 1 && (
            <>
              <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 6, fontFamily: "'DM Serif Display', serif" }}>
                Votre profil
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24 }}>
                Dites-nous qui vous êtes et votre commerce
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Nom complet *">
                  <input style={inputStyle} value={form.fullName} onChange={e => setForm(f => ({...f, fullName: e.target.value}))} placeholder="Mohamed Amine Benali" />
                </Field>
                <Field label="Numéro de téléphone *">
                  <input style={inputStyle} type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="05xx xx xx xx" />
                </Field>
                <Field label="Nom du commerce *">
                  <input style={inputStyle} value={form.businessName} onChange={e => setForm(f => ({...f, businessName: e.target.value}))} placeholder="Café El Baraka" />
                </Field>
                <Field label="Type de commerce *">
                  <select style={selectStyle} value={form.businessType} onChange={e => setForm(f => ({...f, businessType: e.target.value}))}>
                    <option value="">Sélectionner...</option>
                    {BUSINESS_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </Field>
              </div>
              <button onClick={() => setStep(2)} disabled={!canNext1}
                style={{ width: '100%', marginTop: 24, padding: 14, borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, background: canNext1 ? 'linear-gradient(135deg, #9333ea, #db2777)' : 'rgba(255,255,255,0.08)', color: canNext1 ? 'white' : 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}>
                Continuer →
              </button>
            </>
          )}

          {/* Étape 2 — Localisation */}
          {step === 2 && (
            <>
              <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 6, fontFamily: "'DM Serif Display', serif" }}>
                Votre localisation
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24 }}>
                Où se trouve votre commerce ?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Wilaya *">
                  <select style={selectStyle} value={form.wilaya} onChange={e => setForm(f => ({...f, wilaya: e.target.value}))}>
                    <option value="">Sélectionner votre wilaya...</option>
                    {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </Field>
                <Field label="Adresse du commerce *">
                  <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={form.businessAddress} onChange={e => setForm(f => ({...f, businessAddress: e.target.value}))} placeholder="Rue, quartier, ville..." />
                </Field>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>
                  ← Retour
                </button>
                <button onClick={() => setStep(3)} disabled={!canNext2}
                  style={{ flex: 2, padding: 14, borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, background: canNext2 ? 'linear-gradient(135deg, #9333ea, #db2777)' : 'rgba(255,255,255,0.08)', color: canNext2 ? 'white' : 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}>
                  Continuer →
                </button>
              </div>
            </>
          )}

          {/* Étape 3 — Questions finales */}
          {step === 3 && (
            <>
              <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 6, fontFamily: "'DM Serif Display', serif" }}>
                Dernières questions
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24 }}>
                Aidez-nous à mieux vous connaître
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Comment avez-vous entendu parler de Fidali ? *">
                  <select style={selectStyle} value={form.howHeard} onChange={e => setForm(f => ({...f, howHeard: e.target.value}))}>
                    <option value="">Sélectionner...</option>
                    {HOW_HEARD.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </Field>
                <Field label="Pour quoi voulez-vous utiliser Fidali ? *">
                  <select style={selectStyle} value={form.useFor} onChange={e => setForm(f => ({...f, useFor: e.target.value}))}>
                    <option value="">Sélectionner...</option>
                    {USE_FOR.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </Field>
              </div>

              {error && (
                <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13 }}>
                  ❌ {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>
                  ← Retour
                </button>
                <button onClick={handleSubmit} disabled={!canSubmit || submitting}
                  style={{ flex: 2, padding: 14, borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, background: (canSubmit && !submitting) ? 'linear-gradient(135deg, #9333ea, #db2777)' : 'rgba(255,255,255,0.08)', color: (canSubmit && !submitting) ? 'white' : 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}>
                  {submitting ? 'Envoi...' : '🚀 Soumettre mon dossier'}
                </button>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>
          Étape {step}/3 — Vos données sont sécurisées 🔒
        </p>
      </div>
    </div>
  )
}
