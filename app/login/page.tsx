'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { loginMerchant } = await import('@/database/supabase-client')
      const result = await loginMerchant(email, password)

      if (result.success) {
        localStorage.setItem('merchant', JSON.stringify(result.merchant))
        router.push('/dashboard')
      } else {
        setError(result.error || 'Erreur de connexion')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">🎯 Fidali</h1>
          <p className="text-gray-500 mt-2">Connectez-vous à votre espace</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? '⏳ Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            onClick={() => router.push('/signup')}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Pas encore inscrit ? Créer un compte
          </button>
          <br />
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}
