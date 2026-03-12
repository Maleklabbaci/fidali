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
        setError(result.error || 'Identifiants incorrects')
      }
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-5">
            <span className="text-black font-black text-lg">F</span>
          </div>
          <h1 className="text-xl font-bold text-white">Fidali Admin</h1>
          <p className="text-sm text-white/30 mt-1">Accès réservé</p>
        </div>

        {/* Form */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="admin@fidali.dz"
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition" />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-white/90 transition disabled:opacity-40 mt-2">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <div className="mt-5 text-center">
          <a href="/" className="text-xs text-white/20 hover:text-white/40 transition">← Retour au site</a>
        </div>
      </div>
    </div>
  )
}
