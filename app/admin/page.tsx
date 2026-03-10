'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
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
      const { loginAdmin } = await import('@/database/supabase-client')
      const result = await loginAdmin(email, password)

      if (result.success) {
        localStorage.setItem('admin', JSON.stringify(result.admin))
        router.push('/admin/dashboard')
      } else {
        setError(result.error || 'Erreur de connexion')
      }
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🛡️
            </div>
            <h1 className="text-2xl font-extrabold text-white">Admin Fidali</h1>
            <p className="text-gray-500 mt-1">Accès réservé aux administrateurs</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                placeholder="admin@fidali.dz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold text-lg hover:from-red-500 hover:to-rose-500 transition disabled:opacity-50"
            >
              {loading ? '⏳ Connexion...' : '🔐 Connexion Admin'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-gray-600 hover:text-gray-400 text-sm transition">
              ← Retour au site
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
