'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ApiKey {
  id: string
  merchant_id: string
  name: string
  key_prefix: string
  key_hash: string
  full_key?: string // only shown once at creation
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

export default function ApiPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyRevealed, setNewKeyRevealed] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [confirmRevoke, setConfirmRevoke] = useState<ApiKey | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState<'keys' | 'docs'>('keys')

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)
    if (m.plan !== 'premium') { router.push('/dashboard'); return }
    loadKeys(m.id)
  }, [router])

  const loadKeys = async (merchantId: string) => {
    try {
      const { supabase } = await import('@/database/supabase-client')
      const { data } = await supabase
        .from('api_keys')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      setKeys(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const generateKey = () => {
    // Utiliser crypto.getRandomValues() — cryptographiquement sûr (contrairement à Math.random())
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const randomBytes = new Uint8Array(40)
    crypto.getRandomValues(randomBytes)
    const result = Array.from(randomBytes).map(b => chars[b % chars.length]).join('')
    return `fid_live_${result}`
  }

  const hashKey = async (key: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(key)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleCreate = async () => {
    if (!newKeyName.trim()) return
    setCreating(true)
    try {
      const { supabase } = await import('@/database/supabase-client')
      const fullKey = generateKey()
      const hash = await hashKey(fullKey)
      const prefix = fullKey.substring(0, 16)

      const { data, error } = await supabase.from('api_keys').insert({
        merchant_id: merchant.id,
        name: newKeyName.trim(),
        key_prefix: prefix,
        key_hash: hash,
        is_active: true,
      }).select().maybeSingle()

      if (error) throw error

      setKeys(prev => [{ ...data, full_key: fullKey }, ...prev])
      setNewKeyRevealed(fullKey)
      setShowCreate(false)
      setNewKeyName('')
      showToast('Clé API créée ✓')
    } catch (e) {
      console.error(e)
      showToast('Erreur lors de la création', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async () => {
    if (!confirmRevoke) return
    setRevoking(confirmRevoke.id)
    try {
      const { supabase } = await import('@/database/supabase-client')
      await supabase.from('api_keys').update({ is_active: false }).eq('id', confirmRevoke.id)
      setKeys(prev => prev.filter(k => k.id !== confirmRevoke.id))
      showToast('Clé révoquée')
      setConfirmRevoke(null)
    } catch (e) {
      console.error(e)
      showToast('Erreur lors de la révocation', 'error')
    } finally {
      setRevoking(null)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return 'maintenant'
    if (s < 3600) return `${Math.floor(s / 60)}m`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    if (s < 2592000) return `${Math.floor(s / 86400)}j`
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://votre-domaine.com'

  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/points/add',
      desc: 'Ajouter des points à un client',
      body: `{\n  "card_code": "CAFE001",\n  "phone": "0550123456",\n  "points": 1\n}`,
      response: `{\n  "success": true,\n  "points": 5,\n  "max_points": 10,\n  "reward_reached": false\n}`,
    },
    {
      method: 'GET',
      path: '/api/v1/client/:phone',
      desc: 'Récupérer les infos d\'un client',
      body: null,
      response: `{\n  "name": "Amine B.",\n  "points": 5,\n  "max_points": 10,\n  "cards": [...]\n}`,
    },
    {
      method: 'POST',
      path: '/api/v1/reward/redeem',
      desc: 'Valider une récompense',
      body: `{\n  "card_code": "CAFE001",\n  "phone": "0550123456"\n}`,
      response: `{\n  "success": true,\n  "reward": "Café offert",\n  "points_reset": true\n}`,
    },
    {
      method: 'GET',
      path: '/api/v1/card/:code/stats',
      desc: 'Stats d\'une carte',
      body: null,
      response: `{\n  "clients": 42,\n  "visits_today": 8,\n  "rewards_given": 15\n}`,
    },
  ]

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-800">API & Intégrations</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-100 text-amber-700">Premium</span>
              {keys.length} clé{keys.length > 1 ? 's' : ''} active{keys.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5">
          <span className="text-base leading-none">+</span> Nouvelle clé
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6">
        <div className="flex gap-1 max-w-3xl mx-auto">
          {(['keys', 'docs'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              {tab === 'keys' ? '🔑 Clés API' : '📖 Documentation'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* ONGLET CLÉS */}
        {activeTab === 'keys' && (
          <>
            {/* Clé nouvellement créée — à copier */}
            {newKeyRevealed && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Clé créée — copiez-la maintenant !</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Elle ne sera plus visible après cette page.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-xl px-4 py-3">
                  <code className="flex-1 text-xs font-mono text-slate-700 break-all">{newKeyRevealed}</code>
                  <button onClick={() => copyToClipboard(newKeyRevealed, 'new')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${copiedKey === 'new' ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                    {copiedKey === 'new' ? '✓ Copié' : 'Copier'}
                  </button>
                </div>
                <button onClick={() => setNewKeyRevealed(null)}
                  className="mt-3 text-xs text-emerald-600 hover:text-emerald-800 transition">
                  J'ai copié ma clé ✓
                </button>
              </div>
            )}

            {/* Liste des clés */}
            {keys.length === 0 && !newKeyRevealed ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-4xl mb-3">🔑</p>
                <p className="text-base font-bold text-slate-700">Aucune clé API</p>
                <p className="text-sm text-slate-400 mt-1 mb-5">Crée une clé pour intégrer Fidali dans ton logiciel ou site</p>
                <button onClick={() => setShowCreate(true)}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
                  + Créer ma première clé
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {keys.map(key => (
                  <div key={key.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-base shrink-0">🔑</div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{key.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <code className="text-xs font-mono text-slate-400">{key.key_prefix}…</code>
                            <span className="text-slate-200">·</span>
                            <span className="text-xs text-slate-400">
                              {key.last_used_at ? `Utilisée ${timeAgo(key.last_used_at)}` : 'Jamais utilisée'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                        <button onClick={() => setConfirmRevoke(key)}
                          className="ml-2 p-2 hover:bg-red-50 rounded-lg transition text-slate-400 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                      <span>Créée le {new Date(key.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info sécurité */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <p className="text-xs font-bold text-amber-700">Garde ta clé secrète</p>
                <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                  Ne partage jamais ta clé API publiquement. Si elle est compromise, révoque-la immédiatement et crée-en une nouvelle. Chaque clé donne un accès complet à tes données.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ONGLET DOCUMENTATION */}
        {activeTab === 'docs' && (
          <div className="space-y-5">

            {/* Authentification */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-700">🔐 Authentification</p>
              </div>
              <div className="px-5 py-4 space-y-3">
                <p className="text-sm text-slate-600">Ajoute ta clé API dans le header de chaque requête :</p>
                <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                  <code className="text-xs text-emerald-400 font-mono whitespace-pre">{`Authorization: Bearer fid_live_xxxxxxxxxxxx`}</code>
                </div>
                <p className="text-xs text-slate-400">Base URL : <code className="font-mono text-indigo-600">{BASE_URL}/api/v1</code></p>
              </div>
            </div>

            {/* Endpoints */}
            {endpoints.map((ep, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-lg text-[11px] font-bold ${ep.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-slate-700">{ep.path}</code>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <p className="text-sm text-slate-600">{ep.desc}</p>
                  {ep.body && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-1.5">Body (JSON)</p>
                      <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                        <code className="text-xs text-slate-300 font-mono whitespace-pre">{ep.body}</code>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-1.5">Réponse</p>
                    <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                      <code className="text-xs text-emerald-400 font-mono whitespace-pre">{ep.response}</code>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Exemple complet */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-700">💡 Exemple complet (JavaScript)</p>
              </div>
              <div className="px-5 py-4">
                <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                  <code className="text-xs text-slate-300 font-mono whitespace-pre">{`const response = await fetch('${BASE_URL}/api/v1/points/add', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer fid_live_VOTRE_CLE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    card_code: 'CAFE001',
    phone: '0550123456',
    points: 1
  })
})

const data = await response.json()
console.log(data) // { success: true, points: 5, ... }`}</code>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Modal créer clé */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">Nouvelle clé API</p>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Nom de la clé <span className="text-slate-400 font-normal">(pour t'en souvenir)</span>
              </label>
              <input type="text" value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                placeholder="Ex: Caisse principale, Site e-commerce…"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
              <p className="text-xs text-slate-400 mt-2">La clé complète ne sera affichée qu'une seule fois après création.</p>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition">
                Annuler
              </button>
              <button onClick={handleCreate} disabled={creating || !newKeyName.trim()}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {creating
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Génération...</>
                  : '🔑 Générer la clé'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation révocation */}
      {confirmRevoke && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <p className="text-base font-bold text-slate-800 mb-2">Révoquer cette clé ?</p>
            <p className="text-sm text-slate-500 mb-1">
              <strong>{confirmRevoke.name}</strong> sera immédiatement désactivée.
            </p>
            <p className="text-xs text-red-500 mb-5">Toutes les intégrations qui l'utilisent cesseront de fonctionner.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRevoke(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition">
                Annuler
              </button>
              <button onClick={handleRevoke} disabled={!!revoking}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50">
                {revoking ? 'Révocation…' : 'Révoquer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
