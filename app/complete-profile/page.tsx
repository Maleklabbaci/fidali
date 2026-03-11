'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const BUSINESS_TYPES = [
  { value: 'cafe', label: '☕ Café' },
  { value: 'restaurant', label: '🍕 Restaurant' },
  { value: 'salon', label: '💇‍♀️ Salon de coiffure / beauté' },
  { value: 'boulangerie', label: '🥖 Boulangerie / Pâtisserie' },
  { value: 'boutique', label: '🛍️ Boutique / Magasin' },
  { value: 'pharmacie', label: '💊 Pharmacie' },
  { value: 'salle_sport', label: '💪 Salle de sport' },
  { value: 'spa', label: '🧖‍♀️ Spa / Hammam' },
  { value: 'lavage_auto', label: '🚗 Lavage auto' },
  { value: 'epicerie', label: '🏪 Épicerie / Superette' },
  { value: 'librairie', label: '📚 Librairie / Papeterie' },
  { value: 'fleuriste', label: '💐 Fleuriste' },
  { value: 'pressing', label: '👔 Pressing / Blanchisserie' },
  { value: 'autre', label: '🏢 Autre' },
]

const CITIES = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida',
  'Batna', 'Sétif', 'Sidi Bel Abbès', 'Biskra', 'Tébessa',
  'Tlemcen', 'Béjaïa', 'Tizi Ouzou', 'Djelfa', 'Bordj Bou Arréridj',
  'Skikda', 'Chlef', 'Médéa', 'Mostaganem', 'Mascara',
  'Ouargla', 'Ghardaïa', 'Jijel', 'Relizane', "M'sila",
  'Tiaret', 'El Oued', 'Laghouat', 'Bouira', 'Boumerdès',
  'Tipaza', 'Ain Defla', 'Khenchela', 'Souk Ahras', 'Mila',
  'Autre',
]

export default function CompleteProfilePage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
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
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) {
      router.push('/login')
      return
    }

    const m = JSON.parse(stored)
    setMerchant(m)

    const checkProfile = async () => {
      try {
        const { getMerchantProfile } = await import('@/database/supabase-client')
        const profile = await getMerchantProfile(m.id)

        if (profile) {
          if (profile.status === 'approved') {
            router.push('/dashboard')
            return
          }
          if (profile.status === 'pending') {
            setForm({
              fullName: profile.full_name || '',
              phone: profile.phone || '',
              businessName: profile.business_name || '',
              businessType: profile.business_type || '',
              businessTypeOther: '',
              businessAddress: profile.business_address || '',
              city: profile.city || '',
            })
            setSuccess(true)
          }
        } else {
          setForm(prev => ({
            ...prev,
            fullName: m.name || m.business_name || '',
          }))
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }

    checkProfile()
  }, [router])

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 4) return digits
    if (digits.length <= 6) return `${digits.slice(0, 4)} ${digits.slice(4)}`
    if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`
    return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`
  }

  const validateStep1 = () => {
    if (!form.fullName.trim()) return 'Entrez votre nom complet'
    if (form.fullName.trim().length < 3) return 'Le nom doit contenir au moins 3 caractères'
    if (!form.phone.trim()) return 'Entrez votre numéro de téléphone'
    const phoneClean = form.phone.replace(/\s/g, '')
    if (!/^(0[567]\d{8}|\+213[567]\d{8})$/.test(phoneClean)) {
      return 'Numéro invalide (ex: 0555 12 34 56)'
    }
    return ''
  }

  const validateStep2 = () => {
    if (!form.businessName.trim()) return 'Entrez le nom de votre commerce'
    if (!form.businessType) return 'Sélectionnez le type de commerce'
    if (form.businessType === 'autre' && !form.businessTypeOther.trim()) {
      return 'Précisez le type de votre commerce'
    }
    return ''
  }

  const validateStep3 = () => {
    if (!form.businessAddress.trim()) return "Entrez l'adresse de votre commerce"
    if (form.businessAddress.trim().length < 5) return "L'adresse doit être plus précise"
    if (!form.city) return 'Sélectionnez votre ville'
    return ''
  }

  const nextStep = () => {
    let err = ''
    if (step === 1) err = validateStep1()
    if (step === 2) err = validateStep2()
    if (err) { setError(err); return }
    setStep(s => s + 1)
    setError('')
  }

  const prevStep = () => {
    setStep(s => s - 1)
    setError('')
  }

  const handleSubmit = async () => {
    const err = validateStep3()
    if (err) { setError(err); return }

    setSubmitting(true)
    setError('')

    try {
      const { createMerchantProfile } = await import('@/database/supabase-client')

      const businessTypeLabel = form.businessType === 'autre'
        ? form.businessTypeOther.trim()
        : BUSINESS_TYPES.find(b => b.value === form.businessType)?.label || form.businessType

      const result = await createMerchantProfile({
        merchant_id: merchant.id,
        email: merchant.email,
        full_name: form.fullName.trim(),
        phone: form.phone.replace(/\s/g, ''),
        business_name: form.businessName.trim(),
        business_type: form.businessType === 'autre' ? form.businessTypeOther.trim() : form.businessType,
        business_type_label: businessTypeLabel,
        business_address: form.businessAddress.trim(),
        city: form.city,
      })

      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || "Erreur lors de l'envoi")
      }
    } catch (e: any) {
      console.error(e)
      setError("Erreur lors de l'envoi. Réessayez.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée !</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Votre profil est en cours de vérification. Vous recevrez une confirmation très bientôt.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-3">Récapitulatif</p>
            <div className="space-y-2">
              {[
                { l: 'Nom', v: form.fullName },
                { l: 'Téléphone', v: form.phone },
                { l: 'Commerce', v: form.businessName },
                { l: 'Ville', v: form.city },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-xs text-gray-400">{item.l}</span>
                  <span className="text-xs text-gray-700 font-medium">{item.v || '—'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg py-2 px-3 border border-amber-200">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            En attente de validation par l&apos;administrateur
          </div>
          <button onClick={() => router.push('/go')} className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Fidali" className="w-12 h-12 rounded-xl object-contain mx-auto mb-3" />
          <h1 className="text-xl font-bold text-gray-900 mb-1">Complétez votre profil</h1>
          <p className="text-gray-400 text-sm">Informations nécessaires pour activer votre compte</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}>
                {step > s ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : s}
              </div>
              {s < 3 && <div className={`w-10 h-[2px] rounded-full transition-all ${step > s ? 'bg-blue-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="flex justify-between mb-6 px-4">
          {['Identité', 'Commerce', 'Adresse'].map((label, i) => (
            <span key={i} className={`text-[10px] uppercase tracking-wider font-bold transition-colors ${
              step === i + 1 ? 'text-blue-600' : 'text-gray-300'
            }`}>{label}</span>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nom complet *</label>
                <input type="text" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="Mohamed Benali"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Numéro de téléphone *</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                    <span className="text-sm">🇩🇿</span>
                    <span className="text-gray-400 text-xs font-medium">+213</span>
                    <div className="w-px h-4 bg-gray-200 ml-0.5" />
                  </div>
                  <input type="tel" value={form.phone} onChange={(e) => updateField('phone', formatPhone(e.target.value))}
                    placeholder="0555 12 34 56" maxLength={14}
                    className="w-full pl-[100px] pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">Format : 05XX XX XX XX ou 06XX XX XX XX</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nom du commerce *</label>
                <input type="text" value={form.businessName} onChange={(e) => updateField('businessName', e.target.value)}
                  placeholder="Café du Port"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Type de commerce *</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-[260px] overflow-y-auto pr-1">
                  {BUSINESS_TYPES.map((type) => (
                    <button key={type.value} type="button" onClick={() => updateField('businessType', type.value)}
                      className={`text-left px-3 py-2.5 rounded-lg border transition-all text-xs ${
                        form.businessType === type.value
                          ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}>{type.label}</button>
                  ))}
                </div>
              </div>
              {form.businessType === 'autre' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Précisez *</label>
                  <input type="text" value={form.businessTypeOther} onChange={(e) => updateField('businessTypeOther', e.target.value)}
                    placeholder="Ex: Bijouterie, Opticien..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Adresse du commerce *</label>
                <textarea value={form.businessAddress} onChange={(e) => updateField('businessAddress', e.target.value)}
                  placeholder="Rue Didouche Mourad, n°45, Alger Centre" rows={3}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Ville / Wilaya *</label>
                <div className="grid grid-cols-3 gap-1 max-h-[180px] overflow-y-auto pr-1">
                  {CITIES.map((city) => (
                    <button key={city} type="button" onClick={() => updateField('city', city)}
                      className={`px-2 py-2 rounded-lg border transition-all text-[11px] font-medium ${
                        form.city === city
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}>{city}</button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">Récapitulatif</p>
                <div className="space-y-1.5">
                  {[
                    { l: '👤', v: form.fullName },
                    { l: '📞', v: form.phone },
                    { l: '🏪', v: form.businessName },
                    { l: '📍', v: `${form.city}${form.businessAddress ? ` — ${form.businessAddress.slice(0, 30)}...` : ''}` },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px]">{r.l}</span>
                      <span className="text-xs text-gray-600">{r.v || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <button type="button" onClick={prevStep}
                className="text-sm text-gray-400 hover:text-gray-600 transition font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Retour
              </button>
            ) : <div />}

            {step < 3 ? (
              <button type="button" onClick={nextStep}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-1">
                Suivant
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg text-sm hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2">
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

        <p className="text-center text-[10px] text-gray-300 mt-4">
          Vos données sont sécurisées et ne seront jamais partagées.
        </p>
      </div>
    </div>
  )
}
