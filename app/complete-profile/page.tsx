'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

const BUSINESS_TYPES = [
  { value: 'cafe', label: '☕ Café', },
  { value: 'restaurant', label: '🍕 Restaurant', },
  { value: 'salon', label: '💇‍♀️ Salon de coiffure / beauté', },
  { value: 'boulangerie', label: '🥖 Boulangerie / Pâtisserie', },
  { value: 'boutique', label: '🛍️ Boutique / Magasin', },
  { value: 'pharmacie', label: '💊 Pharmacie', },
  { value: 'salle_sport', label: '💪 Salle de sport', },
  { value: 'spa', label: '🧖‍♀️ Spa / Hammam', },
  { value: 'lavage_auto', label: '🚗 Lavage auto', },
  { value: 'epicerie', label: '🏪 Épicerie / Superette', },
  { value: 'librairie', label: '📚 Librairie / Papeterie', },
  { value: 'fleuriste', label: '💐 Fleuriste', },
  { value: 'pressing', label: '👔 Pressing / Blanchisserie', },
  { value: 'autre', label: '🏢 Autre', },
]

const CITIES = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida',
  'Batna', 'Sétif', 'Sidi Bel Abbès', 'Biskra', 'Tébessa',
  'Tlemcen', 'Béjaïa', 'Tizi Ouzou', 'Djelfa', 'Bordj Bou Arréridj',
  'Skikda', 'Chlef', 'Médéa', 'Mostaganem', 'Mascara',
  'Ouargla', 'Ghardaïa', 'Jijel', 'Relizane', 'M\'sila',
  'Tiaret', 'El Oued', 'Laghouat', 'Bouira', 'Boumerdès',
  'Tipaza', 'Ain Defla', 'Khenchela', 'Souk Ahras', 'Mila',
  'Autre',
]

export default function CompleteProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    businessName: '',
    businessType: '',
    businessTypeOther: '',
    businessAddress: '',
    city: '',
  })

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push('/login')
        return
      }
      setUser(u)

      // Vérifier si le profil existe déjà
      try {
        const profileDoc = await getDoc(doc(db, 'merchantProfiles', u.uid))
        if (profileDoc.exists()) {
          const data = profileDoc.data()
          if (data.status === 'approved') {
            router.push('/dashboard')
            return
          }
          if (data.status === 'pending') {
            setSuccess(true)
            setLoading(false)
            return
          }
        }
      } catch (e) {
        console.error(e)
      }

      // Pré-remplir le nom depuis le compte
      setForm(prev => ({
        ...prev,
        fullName: u.displayName || '',
      }))
      setLoading(false)
    })
    return () => unsub()
  }, [router])

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateStep1 = () => {
    if (!form.fullName.trim()) return 'Entrez votre nom complet'
    if (form.fullName.trim().length < 3) return 'Le nom doit contenir au moins 3 caractères'
    if (!form.phone.trim()) return 'Entrez votre numéro de téléphone'
    // Format algérien : 05/06/07 + 8 chiffres
    const phoneClean = form.phone.replace(/\s/g, '')
    if (!/^(0[567]\d{8}|\+213[567]\d{8})$/.test(phoneClean)) {
      return 'Numéro invalide (ex: 0555 12 34 56)'
    }
    return ''
  }

  const validateStep2 = () => {
    if (!form.businessName.trim()) return 'Entrez le nom de votre commerce'
    if (form.businessName.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères'
    if (!form.businessType) return 'Sélectionnez le type de commerce'
    if (form.businessType === 'autre' && !form.businessTypeOther.trim()) {
      return 'Précisez le type de votre commerce'
    }
    return ''
  }

  const validateStep3 = () => {
    if (!form.businessAddress.trim()) return 'Entrez l\'adresse de votre commerce'
    if (form.businessAddress.trim().length < 5) return 'L\'adresse doit être plus précise'
    if (!form.city) return 'Sélectionnez votre ville'
    return ''
  }

  const nextStep = () => {
    let err = ''
    if (step === 1) err = validateStep1()
    if (step === 2) err = validateStep2()
    if (err) {
      setError(err)
      return
    }
    setStep(s => s + 1)
    setError('')
  }

  const prevStep = () => {
    setStep(s => s - 1)
    setError('')
  }

  const handleSubmit = async () => {
    const err = validateStep3()
    if (err) {
      setError(err)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const profileData = {
        uid: user.uid,
        email: user.email,
        fullName: form.fullName.trim(),
        phone: form.phone.replace(/\s/g, ''),
        businessName: form.businessName.trim(),
        businessType: form.businessType === 'autre' ? form.businessTypeOther.trim() : form.businessType,
        businessTypeLabel: form.businessType === 'autre'
          ? form.businessTypeOther.trim()
          : BUSINESS_TYPES.find(b => b.value === form.businessType)?.label || form.businessType,
        businessAddress: form.businessAddress.trim(),
        city: form.city,
        status: 'pending',
        createdAt: serverTimestamp(),
      }

      // Sauvegarder dans merchantProfiles
      await setDoc(doc(db, 'merchantProfiles', user.uid), profileData)

      // Aussi dans adminRequests pour que l'admin voie la demande
      await setDoc(doc(db, 'adminRequests', user.uid), {
        ...profileData,
        type: 'new_merchant',
        read: false,
      })

      setSuccess(true)
    } catch (e: any) {
      console.error(e)
      setError('Erreur lors de l\'envoi. Réessayez.')
    } finally {
      setSubmitting(false)
    }
  }

  // Format phone number as user types
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 4) return digits
    if (digits.length <= 6) return `${digits.slice(0, 4)} ${digits.slice(4)}`
    if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`
    return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ═══ Success screen ═══
  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">

          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-2xl font-black text-white mb-3">Demande envoyée !</h1>

          <p className="text-white/40 leading-relaxed mb-8">
            Votre profil est en cours de vérification par notre équipe.
            Vous recevrez une confirmation très bientôt.
          </p>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-8 text-left">
            <h3 className="text-sm font-bold text-white/60 mb-3">Récapitulatif</h3>
            <div className="space-y-2">
              {[
                { l: 'Nom', v: form.fullName || '—' },
                { l: 'Téléphone', v: form.phone || '—' },
                { l: 'Commerce', v: form.businessName || '—' },
                { l: 'Ville', v: form.city || '—' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-[12px] text-white/25">{item.l}</span>
                  <span className="text-[12px] text-white/60 font-medium">{item.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[12px] text-white/20">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            En attente de validation par l&apos;administrateur
          </div>

          <button
            onClick={() => {
              auth.signOut()
              router.push('/go')
            }}
            className="mt-8 text-[13px] text-white/30 hover:text-white/60 transition-colors"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    )
  }

  // ═══ Form ═══
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Fidali" className="w-12 h-12 rounded-xl object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">Complétez votre profil</h1>
          <p className="text-white/30 text-sm">
            Ces informations sont nécessaires pour activer votre compte commerçant.
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-500 ${
                step >= s
                  ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-white/[0.05] text-white/20 border border-white/[0.08]'
              }`}>
                {step > s ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-[2px] rounded-full transition-all duration-500 ${
                  step > s ? 'bg-violet-500' : 'bg-white/[0.06]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step labels */}
        <div className="flex justify-between mb-8 px-2">
          {['Identité', 'Commerce', 'Adresse'].map((label, i) => (
            <span key={i} className={`text-[10px] uppercase tracking-wider font-bold transition-colors ${
              step === i + 1 ? 'text-violet-400' : 'text-white/15'
            }`}>
              {label}
            </span>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-sm">

          {/* ─── STEP 1 : Identité ─── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] text-white/40 uppercase tracking-wider font-bold mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="Mohamed Benali"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/15 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-white/40 uppercase tracking-wider font-bold mb-2">
                  Numéro de téléphone *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                    <span className="text-[14px]">🇩🇿</span>
                    <span className="text-white/30 text-[13px] font-medium">+213</span>
                    <div className="w-px h-4 bg-white/10 ml-1" />
                  </div>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', formatPhone(e.target.value))}
                    placeholder="0555 12 34 56"
                    maxLength={14}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-[110px] pr-4 py-3 text-white placeholder:text-white/15 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all text-[14px]"
                  />
                </div>
                <p className="text-[10px] text-white/15 mt-1.5 ml-1">
                  Format : 05XX XX XX XX ou 06XX XX XX XX
                </p>
              </div>
            </div>
          )}

          {/* ─── STEP 2 : Commerce ─── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] text-white/40 uppercase tracking-wider font-bold mb-2">
                  Nom du commerce *
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  placeholder="Café du Port"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/15 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-white/40 uppercase tracking-wider font-bold mb-2">
                  Type de commerce *
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                  {BUSINESS_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => updateField('businessType', type.value)}
                      className={`text-left px-3 py-2.5 rounded-xl border transition-all duration-300 text-[12px] ${
                        form.businessType === type.value
                          ? 'bg-violet-500/15 border-violet-500/30 text-white'
                          : 'bg-white/[0.02] border-white/[0.05] text-white/40 hover:bg-white/[0.04] hover:border-white/[0.1]'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {form.businessType === 'autre' && (
                <div>
                  <label className="block text-[11px] text-white/40 uppercase tracking-wider font-bold mb-2">
                    Précisez *
                  </label>
                  <input
                    type="text"
                    value={form.businessTypeOther}
                    onChange={(e) => updateField('businessTypeOther', e.target.value)}
                    placeholder="Ex: Librairie, Bijouterie..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/15 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all text-[14px]"
                  />
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 3 : Adresse ─── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] text-white/40 uppercase tracking-wider font-bold mb-2">
                  Adresse du commerce *
                </label>
                <textarea
                  value={form.businessAddress}
                  onChange={(e) => updateField('businessAddress', e.target.value)}
                  placeholder="Rue Didouche Mourad, n°45, Alger Centre"
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/15 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all text-[14px] resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-white/40 uppercase tracking-wider font-bold mb-2">
                  Ville / Wilaya *
                </label>
                <div className="grid grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => updateField('city', city)}
                      className={`px-2 py-2 rounded-lg border transition-all duration-300 text-[11px] font-medium ${
                        form.city === city
                          ? 'bg-violet-500/15 border-violet-500/30 text-white'
                          : 'bg-white/[0.02] border-white/[0.05] text-white/30 hover:bg-white/[0.04] hover:text-white/50'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Récap rapide */}
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 mt-4">
                <p className="text-[10px] text-white/25 uppercase tracking-wider font-bold mb-2">Récapitulatif</p>
                <div className="space-y-1.5">
                  {[
                    { l: '👤', v: form.fullName },
                    { l: '📞', v: form.phone },
                    { l: '🏪', v: form.businessName },
                    { l: '📍', v: `${form.city}${form.businessAddress ? ` — ${form.businessAddress.slice(0, 30)}...` : ''}` },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px]">{r.l}</span>
                      <span className="text-[11px] text-white/50">{r.v || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-[12px] text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <button onClick={prevStep}
                className="text-[13px] text-white/30 hover:text-white/60 transition-colors font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Retour
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button onClick={nextStep}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold rounded-xl text-[13px] hover:opacity-90 transition-all shadow-lg shadow-violet-500/20 flex items-center gap-1">
                Suivant
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl text-[13px] hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    Envoyer la demande
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-white/10 mt-6">
          Vos données sont sécurisées et ne seront jamais partagées.
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}
