'use client'

import { useState } from 'react'

export default function JoinPage() {
  const [cardCode, setCardCode] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { joinCard } = await import('@/database/supabase-client')
      const res = await joinCard(cardCode, name, phone)

      if (res.success === false) {
        setError(res.error || 'Erreur')
      } else {
        setResult(res)
        setStep(3)
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📱</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Rejoindre une carte</h1>
          <p className="text-gray-500 mt-1">Entrez le code de la carte de fidélité</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <input
              type="text"
              value={cardCode}
              onChange={(e) => setCardCode(e.target.value.toUpperCase())}
              placeholder="CODE DE LA CARTE"
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button
              onClick={() => cardCode.length >= 3 && setStep(2)}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition"
            >
              Continuer →
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="bg-green-50 px-4 py-2 rounded-xl text-center">
              <span className="font-bold text-green-800">Code : {cardCode}</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Votre nom"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="06 00 00 00 00"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? '⏳ Inscription...' : '✅ Rejoindre'}
            </button>
          </form>
        )}

        {step === 3 && result && (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-xl font-bold text-gray-900">Bienvenue !</h2>
            <p className="text-gray-600">Vous avez rejoint la carte avec succès.</p>
            <button
              onClick={() => { setStep(1); setCardCode(''); setName(''); setPhone('') }}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
            >
              Rejoindre une autre carte
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  )
}
