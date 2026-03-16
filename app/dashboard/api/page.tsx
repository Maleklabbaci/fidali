'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ApiKey {
  id: string
  merchant_id: string
  name: string
  key_prefix: string
  key_hash: string
  full_key?: string
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

const PLATFORMS = [
  { id: 'html',        name: 'HTML',          icon: '🌐' },
  { id: 'wordpress',   name: 'WordPress',     icon: '📝' },
  { id: 'shopify',     name: 'Shopify',       icon: '🛍️' },
  { id: 'woocommerce', name: 'WooCommerce',   icon: '🛒' },
  { id: 'wix',         name: 'Wix',           icon: '✨' },
  { id: 'squarespace', name: 'Squarespace',   icon: '⬛' },
  { id: 'webflow',     name: 'Webflow',       icon: '🔷' },
  { id: 'react',       name: 'React / Next',  icon: '⚛️' },
  { id: 'prestashop',  name: 'PrestaShop',    icon: '🏪' },
  { id: 'autre',       name: 'Autre',         icon: '📦' },
]

function getInstructions(platform: string, cardCode: string) {
  const code = `<script src="https://fidali.vercel.app/widget.js" \n        data-card="${cardCode}" \n        data-key="VOTRE_CLE_API"></script>`

  const all: Record<string, any> = {
    html: {
      title: 'Site HTML',
      steps: [
        'Ouvrez le fichier HTML de votre site (ex: index.html)',
        'Trouvez la balise </body> à la fin du fichier',
        'Collez le code juste AVANT </body>',
        'Sauvegardez et publiez',
      ],
      code: `<!-- Fidali - Carte de fidélité -->\n${code}\n</body>`,
    },
    wordpress: {
      title: 'WordPress',
      steps: [
        'Installez le plugin "Insert Headers and Footers" (ou "WPCode")',
        'Allez dans Réglages → Insert Headers and Footers',
        'Collez le code dans "Scripts in Footer"',
        'Sauvegardez',
      ],
      code,
      alt: `// Ou dans functions.php :\nadd_action('wp_footer', function() { ?>\n${code}\n<?php });`,
    },
    shopify: {
      title: 'Shopify',
      steps: [
        'Allez dans Boutique en ligne → Thèmes',
        'Cliquez sur Actions → Modifier le code',
        'Ouvrez theme.liquid',
        'Collez le code juste avant </body>',
        'Sauvegardez',
      ],
      code: `{% comment %} Fidali {% endcomment %}\n${code}`,
    },
    woocommerce: {
      title: 'WooCommerce',
      steps: [
        'Installez le plugin "Insert Headers and Footers"',
        'Collez le code widget dans "Footer Scripts"',
        'Pour les points auto après achat, ajoutez le code PHP',
        'Sauvegardez',
      ],
      code,
      alt: `// Dans functions.php :\nadd_action('woocommerce_thankyou', 'fidali_pts', 10, 1);\nfunction fidali_pts($order_id) {\n    $order = wc_get_order($order_id);\n    $phone = $order->get_billing_phone();\n    $name = $order->get_billing_first_name();\n    ?>\n    <script>\n    if (window.fidaliAddPoints) {\n        fidaliAddPoints(\n            '<?php echo esc_js($phone); ?>',\n            '<?php echo esc_js($name); ?>',\n            1\n        );\n    }\n    </script>\n    <?php\n}`,
    },
    wix: {
      title: 'Wix',
      steps: [
        'Allez dans Paramètres du site',
        'Cliquez sur Avancé → Code personnalisé',
        'Cliquez sur "+ Ajouter un code"',
        'Collez le code, choisissez "Body - end" et "Toutes les pages"',
        'Appliquez',
      ],
      code,
    },
    squarespace: {
      title: 'Squarespace',
      steps: [
        'Allez dans Paramètres → Avancé → Injection de code',
        'Collez le code dans la section "Footer"',
        'Sauvegardez',
      ],
      code,
      note: 'Disponible uniquement avec un plan Business ou Commerce.',
    },
    webflow: {
      title: 'Webflow',
      steps: [
        'Allez dans Project Settings',
        'Cliquez sur Custom Code',
        'Collez dans "Footer Code"',
        'Publiez',
      ],
      code,
    },
    react: {
      title: 'React / Next.js / Vite',
      steps: [
        'Option 1 : Ajoutez dans index.html avant </body>',
        'Option 2 : Utilisez useEffect dans votre composant',
      ],
      code,
      alt: `// Dans App.tsx :\nimport { useEffect } from 'react'\n\nuseEffect(() => {\n  const s = document.createElement('script')\n  s.src = 'https://fidali.vercel.app/widget.js'\n  s.setAttribute('data-card', '${cardCode}')\n  s.setAttribute('data-key', 'VOTRE_CLE_API')\n  document.body.appendChild(s)\n  return () => { document.body.removeChild(s) }\n}, [])`,
    },
    prestashop: {
      title: 'PrestaShop',
      steps: [
        'Allez dans Apparence → Positions',
        'Ajoutez au hook "displayFooter"',
        'Ou modifiez footer.tpl',
        'Collez le code avant </body>',
      ],
      code,
    },
    autre: {
      title: 'Autre plateforme',
      steps: [
        'Trouvez l\'option "Code personnalisé" ou "Footer scripts"',
        'Collez le code dans la section footer',
        'Sauvegardez et publiez',
      ],
      code,
      note: 'Ce code fonctionne sur n\'importe quel site. Placez-le avant </body>.',
    },
  }
  return all[platform] || all.autre
}

export default function ApiPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyRevealed, setNewKeyRevealed] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [confirmRevoke, setConfirmRevoke] = useState<ApiKey | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState<'widget' | 'keys' | 'docs'>('widget')
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [selectedCard, setSelectedCard] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('merchant') || sessionStorage.getItem('merchant')
    if (!stored) { router.push('/login'); return }
    const m = JSON.parse(stored)
    setMerchant(m)
    if (m.plan !== 'premium') { router.push('/dashboard'); return }
    loadData(m.id)
  }, [router])

  const loadData = async (merchantId: string) => {
    try {
      const { supabase } = await import('@/database/supabase-client')
      const [keysRes, cardsRes] = await Promise.all([
        supabase.from('api_keys').select('*').eq('merchant_id', merchantId).eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('loyalty_cards').select('id, code, business_name, max_points, reward').eq('merchant_id', merchantId).eq('is_active', true),
      ])
      setKeys(keysRes.data || [])
      setCards(cardsRes.data || [])
      if (cardsRes.data && cardsRes.data.length > 0) {
        setSelectedCard(cardsRes.data[0].code)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const randomBytes = new Uint8Array(40)
    crypto.getRandomValues(randomBytes)
    return `fid_live_${Array.from(randomBytes).map(b => chars[b % chars.length]).join('')}`
  }

  const hashKey = async (key: string) => {
    const data = new TextEncoder().encode(key)
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
      const { data, error } = await supabase.from('api_keys').insert({
        merchant_id: merchant.id, name: newKeyName.trim(),
        key_prefix: fullKey.substring(0, 16), key_hash: hash, is_active: true,
      }).select().maybeSingle()
      if (error) throw error
      setKeys(prev => [{ ...data, full_key: fullKey }, ...prev])
      setNewKeyRevealed(fullKey)
      setShowCreate(false)
      setNewKeyName('')
      showToast('Clé API créée ✓')
    } catch (e) { console.error(e); showToast('Erreur', 'error') }
    finally { setCreating(false) }
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
    } catch (e) { console.error(e); showToast('Erreur', 'error') }
    finally { setRevoking(null) }
  }

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return 'maintenant'
    if (s < 3600) return `${Math.floor(s / 60)}m`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    return `${Math.floor(s / 86400)}j`
  }

  const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://fidali.vercel.app'
  const instructions = selectedPlatform ? getInstructions(selectedPlatform, selectedCard) : null

  const endpoints = [
    { method: 'POST', path: '/api/v1/auto-points', desc: 'Auto-inscription + ajout de points', body: `{\n  "card_code": "CAFE001",\n  "phone": "0550123456",\n  "name": "Amine B.",\n  "points": 1\n}`, response: `{\n  "success": true,\n  "new_client": true,\n  "points": 1,\n  "max_points": 10,\n  "reward_reached": false\n}` },
    { method: 'POST', path: '/api/v1/points/add', desc: 'Ajouter des points (client existant)', body: `{\n  "card_code": "CAFE001",\n  "phone": "0550123456",\n  "points": 1\n}`, response: `{\n  "success": true,\n  "points": 5,\n  "max_points": 10\n}` },
    { method: 'GET', path: '/api/v1/client/:phone', desc: 'Infos d\'un client', body: null, response: `{\n  "name": "Amine B.",\n  "cards": [{\n    "points": 5,\n    "max_points": 10,\n    "reward": "Café offert"\n  }]\n}` },
    { method: 'POST', path: '/api/v1/reward/redeem', desc: 'Valider une récompense', body: `{\n  "card_code": "CAFE001",\n  "phone": "0550123456"\n}`, response: `{\n  "success": true,\n  "reward": "Café offert"\n}` },
    { method: 'GET', path: '/api/v1/card/:code/stats', desc: 'Stats d\'une carte', body: null, response: `{\n  "clients": 42,\n  "visits_today": 8,\n  "rewards_given": 15\n}` },
  ]

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">

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
          {([['widget', '🔗 Widget'], ['keys', '🔑 Clés API'], ['docs', '📖 Documentation']] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* ═══════ ONGLET WIDGET ═══════ */}
        {activeTab === 'widget' && (
          <>
            {/* Info */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-purple-800 mb-1">🎯 Widget Fidélité — 1 ligne de code</h3>
              <p className="text-xs text-purple-600 leading-relaxed">
                Ajoutez un programme de fidélité à votre site en 1 minute. Le widget détecte automatiquement les formulaires de commande et ajoute des points à vos clients.
              </p>
            </div>

            {/* Étape 1 : Carte */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</div>
                <p className="text-sm font-bold text-slate-700">Choisissez votre carte</p>
              </div>
              {cards.length === 0 ? (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-amber-700 text-xs font-medium">⚠️ Créez d{"'"}abord une carte fidélité</p>
                  <a href="/dashboard" className="text-amber-600 text-xs underline">Créer une carte →</a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cards.map(c => (
                    <button key={c.id} onClick={() => setSelectedCard(c.code)}
                      className={`text-left p-3 rounded-xl border transition text-sm ${selectedCard === c.code ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                      <p className="font-bold text-slate-800">{c.business_name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">Code : {c.code} · {c.max_points} pts → {c.reward}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Étape 2 : Plateforme */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</div>
                <p className="text-sm font-bold text-slate-700">Votre plateforme</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => setSelectedPlatform(p.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition ${selectedPlatform === p.id ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                    <span className="text-xl">{p.icon}</span>
                    <span className="text-[10px] text-slate-500 font-medium text-center leading-tight">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Étape 3 : Instructions */}
            {instructions && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">3</div>
                  <p className="text-sm font-bold text-slate-700">Installation — {instructions.title}</p>
                </div>

                {/* Steps */}
                <div className="space-y-2 mb-5">
                  {instructions.steps.map((step: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-xs text-slate-600">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Code */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Code à copier</p>
                  <button onClick={() => copy(instructions.code, 'widget')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${copiedKey === 'widget' ? 'bg-emerald-500 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                    {copiedKey === 'widget' ? '✓ Copié !' : '📋 Copier'}
                  </button>
                </div>
                <pre className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                  <code className="text-xs text-emerald-400 font-mono whitespace-pre">{instructions.code}</code>
                </pre>

                {/* Alternative */}
                {instructions.alt && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Méthode alternative</p>
                      <button onClick={() => copy(instructions.alt, 'alt')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${copiedKey === 'alt' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        {copiedKey === 'alt' ? '✓ Copié !' : '📋 Copier'}
                      </button>
                    </div>
                    <pre className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                      <code className="text-xs text-blue-400 font-mono whitespace-pre">{instructions.alt}</code>
                    </pre>
                  </div>
                )}

                {/* Note */}
                {instructions.note && (
                  <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-blue-600 text-xs">💡 {instructions.note}</p>
                  </div>
                )}
              </div>
            )}

            {/* Personnalisation */}
            {selectedPlatform && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-sm font-bold text-slate-700 mb-3">🎨 Personnalisation (optionnel)</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 text-slate-400 font-bold uppercase">Attribut</th>
                        <th className="text-left py-2 text-slate-400 font-bold uppercase">Options</th>
                        <th className="text-left py-2 text-slate-400 font-bold uppercase">Défaut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr><td className="py-2"><code className="text-indigo-600">data-position</code></td><td className="py-2 text-slate-500">bottom-right, bottom-left, top-right, top-left</td><td className="py-2 text-slate-400">bottom-right</td></tr>
                      <tr><td className="py-2"><code className="text-indigo-600">data-color</code></td><td className="py-2 text-slate-500">Couleur hex (#e11d48, #000...)</td><td className="py-2 text-slate-400">#9333ea</td></tr>
                      <tr><td className="py-2"><code className="text-indigo-600">data-auto</code></td><td className="py-2 text-slate-500">true / false (détection auto)</td><td className="py-2 text-slate-400">true</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Preview */}
            {selectedPlatform && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-sm font-bold text-slate-700 mb-3">👁️ Aperçu</p>
                <div className="bg-slate-100 rounded-xl p-8 relative min-h-[180px] flex items-center justify-center">
                  <p className="text-slate-400 text-sm">Votre site web</p>
                  <div style={{
                    position: 'absolute', bottom: 16, right: 16,
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #9333ea, #db2777)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(147,51,234,0.4)',
                    fontSize: 22, animation: 'pulse 2s ease-in-out infinite',
                  }}>🎯</div>
                </div>
                <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
              </div>
            )}
          </>
        )}

        {/* ═══════ ONGLET CLÉS ═══════ */}
        {activeTab === 'keys' && (
          <>
            {newKeyRevealed && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Clé créée — copiez-la maintenant !</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Elle ne sera plus visible après.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-xl px-4 py-3">
                  <code className="flex-1 text-xs font-mono text-slate-700 break-all">{newKeyRevealed}</code>
                  <button onClick={() => copy(newKeyRevealed, 'new')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${copiedKey === 'new' ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                    {copiedKey === 'new' ? '✓ Copié' : 'Copier'}
                  </button>
                </div>
                <button onClick={() => setNewKeyRevealed(null)} className="mt-3 text-xs text-emerald-600 hover:text-emerald-800 transition">
                  J{"'"}ai copié ma clé ✓
                </button>
              </div>
            )}

            {keys.length === 0 && !newKeyRevealed ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-4xl mb-3">🔑</p>
                <p className="text-base font-bold text-slate-700">Aucune clé API</p>
                <p className="text-sm text-slate-400 mt-1 mb-5">Créez une clé pour utiliser le widget et l{"'"}API</p>
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
                            <span className="text-xs text-slate-400">{key.last_used_at ? `Utilisée ${timeAgo(key.last_used_at)}` : 'Jamais utilisée'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                        <button onClick={() => setConfirmRevoke(key)} className="ml-2 p-2 hover:bg-red-50 rounded-lg transition text-slate-400 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <p className="text-xs font-bold text-amber-700">Gardez vos clés secrètes</p>
                <p className="text-xs text-amber-600 mt-1">Ne partagez jamais vos clés API publiquement. Si compromise, révoquez-la immédiatement.</p>
              </div>
            </div>
          </>
        )}

        {/* ═══════ ONGLET DOCS ═══════ */}
        {activeTab === 'docs' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-700">🔐 Authentification</p>
              </div>
              <div className="px-5 py-4 space-y-3">
                <p className="text-sm text-slate-600">Ajoutez votre clé API dans le header :</p>
                <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                  <code className="text-xs text-emerald-400 font-mono">Authorization: Bearer fid_live_xxxxxxxxxxxx</code>
                </div>
                <p className="text-xs text-slate-400">Base URL : <code className="font-mono text-indigo-600">{BASE_URL}/api/v1</code></p>
              </div>
            </div>

            {endpoints.map((ep, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-lg text-[11px] font-bold ${ep.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{ep.method}</span>
                  <code className="text-sm font-mono text-slate-700">{ep.path}</code>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <p className="text-sm text-slate-600">{ep.desc}</p>
                  {ep.body && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-1.5">Body</p>
                      <pre className="bg-slate-900 rounded-xl p-4 overflow-x-auto"><code className="text-xs text-slate-300 font-mono whitespace-pre">{ep.body}</code></pre>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-1.5">Réponse</p>
                    <pre className="bg-slate-900 rounded-xl p-4 overflow-x-auto"><code className="text-xs text-emerald-400 font-mono whitespace-pre">{ep.response}</code></pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal créer clé */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">Nouvelle clé API</p>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-400">✕</button>
            </div>
            <div className="px-6 py-5">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nom de la clé</label>
              <input type="text" value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                placeholder="Ex: Widget site, Caisse..."
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition">Annuler</button>
              <button onClick={handleCreate} disabled={creating || !newKeyName.trim()}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
                {creating ? 'Génération...' : '🔑 Générer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal révoquer */}
      {confirmRevoke && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <p className="text-base font-bold text-slate-800 mb-2">Révoquer cette clé ?</p>
            <p className="text-sm text-slate-500 mb-1"><strong>{confirmRevoke.name}</strong> sera désactivée.</p>
            <p className="text-xs text-red-500 mb-5">Les intégrations qui l{"'"}utilisent cesseront de fonctionner.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRevoke(null)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition">Annuler</button>
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
