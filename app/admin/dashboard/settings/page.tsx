'use client'

import { useState, useEffect } from 'react'

const Field = ({ label, hint, ...props }: any) => (
  <div>
    <label className="block text-xs text-white/40 mb-1.5">{label}</label>
    <input {...props} className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition" />
    {hint && <p className="text-[11px] text-white/20 mt-1">{hint}</p>}
  </div>
)

const Section = ({ title, icon, children }: any) => (
  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
      <span>{icon}</span>
      <p className="text-sm font-semibold text-white/70">{title}</p>
    </div>
    <div className="px-6 py-5 space-y-4">{children}</div>
  </div>
)

const Toggle = ({ value, onChange, labelOn, labelOff, colorOn = 'bg-indigo-500' }: any) => (
  <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
    <p className="text-sm font-semibold text-white">{value ? labelOn : labelOff}</p>
    <button onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${value ? colorOn : 'bg-white/10'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? 'left-7' : 'left-1'}`} />
    </button>
  </div>
)

const SaveBtn = ({ onClick, saving, saved }: any) => (
  <div className="flex justify-end pt-2">
    <button onClick={onClick} disabled={saving}
      className={`px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${saved ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-white/90'}`}>
      {saving ? 'Sauvegarde...' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
    </button>
  </div>
)

export default function SettingsPage() {
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState<string | null>(null)
  const [saved, setSaved]       = useState<string | null>(null)
  const [toast, setToast]       = useState<string | null>(null)

  const [prices, setPrices]     = useState({ pro: 2500, premium: 5000 })
  const [limits, setLimits]     = useState({
    starter: { cards: 1,   clients: 50 },
    pro:     { cards: 5,   clients: 500 },
    premium: { cards: 999, clients: 99999 },
  })
  const [contact, setContact]   = useState({ email: 'contact@fidali.dz', phone: '' })
  const [pwForm, setPwForm]     = useState({ current: '', newPw: '', confirm: '' })
  const [pwError, setPwError]   = useState('')
  const [maintenance, setMaintenance]       = useState(false)
  const [maintenanceMsg, setMaintenanceMsg] = useState('La plateforme est en maintenance. Revenez bientôt.')
  const [globalMsg, setGlobalMsg]           = useState('')
  const [globalMsgActive, setGlobalMsgActive] = useState(false)

  useEffect(() => { loadSettings() }, [])

  const loadSettings = async () => {
    try {
      const stored = localStorage.getItem('admin')
      const adminId = stored ? JSON.parse(stored)?.id : ''
      const res = await fetch('/api/admin/data?type=settings', { headers: { 'x-admin-id': adminId } })
      const json = await res.json()
      const data = json.data
      if (!data) return
      const get = (key: string) => data.find((r: any) => r.key === key)?.value

      const pp = get('plan_prices')
      if (pp) setPrices({ pro: pp.pro || 2500, premium: pp.premium || 5000 })

      const pl = get('plan_limits')
      if (pl) setLimits({
        starter: pl.starter || { cards: 1, clients: 50 },
        pro:     pl.pro     || { cards: 5, clients: 500 },
        premium: pl.premium || { cards: 999, clients: 99999 },
      })

      const ct = get('contact')
      if (ct) setContact(ct)

      const mn = get('maintenance')
      if (mn) { setMaintenance(mn.active || false); setMaintenanceMsg(mn.message || '') }

      const gm = get('global_message')
      if (gm) { setGlobalMsg(gm.text || ''); setGlobalMsgActive(gm.active || false) }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const upsert = async (key: string, value: any) => {
    const stored = localStorage.getItem('admin')
    const adminId = stored ? JSON.parse(stored)?.id : ''
    const res = await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'x-admin-id': adminId, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_settings', key, value })
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
  }

  const showSaved = (s: string) => { setSaved(s); setTimeout(() => setSaved(null), 2500) }
  const showToast = (m: string) => { setToast(m);  setTimeout(() => setToast(null),  3000) }

  const saveSection = async (key: string, value: any, label: string) => {
    setSaving(key)
    try { await upsert(key === 'prices' ? 'plan_prices' : key === 'limits' ? 'plan_limits' : key, value); showSaved(key); showToast(label) }
    catch { showToast('❌ Erreur de sauvegarde') }
    finally { setSaving(null) }
  }

  const savePassword = async () => {
    setPwError('')
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) return setPwError('Tous les champs sont requis')
    if (pwForm.newPw.length < 8) return setPwError('Minimum 8 caractères')
    if (pwForm.newPw !== pwForm.confirm) return setPwError('Les mots de passe ne correspondent pas')
    setSaving('password')
    try {
      const { supabase } = await import('@/database/supabase-client')
      const adminEmail = JSON.parse(localStorage.getItem('admin') || '{}')?.email || ''
      const { data: valid } = await supabase.rpc('verify_admin_password', { p_email: adminEmail, p_password: pwForm.current })
      if (!valid) { setPwError('Mot de passe actuel incorrect'); return }
      const { error } = await supabase.rpc('update_admin_password', { p_email: adminEmail, p_new_password: pwForm.newPw })
      if (error) throw error
      setPwForm({ current: '', newPw: '', confirm: '' })
      showToast('🔒 Mot de passe mis à jour !')
    } catch (e: any) { setPwError(e.message || 'Erreur') }
    finally { setSaving(null) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-3xl">

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#0f0f12] border border-white/10 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-xl animate-in">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        <p className="text-sm text-white/30 mt-0.5">Configuration globale de la plateforme Fidali</p>
      </div>

      {/* 1. PRIX */}
      <Section title="Prix des plans" icon="💰">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Starter</label>
            <div className="px-3.5 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm text-white/30">Gratuit</div>
          </div>
          <Field label="Pro (DA/mois)" type="number" min="0"
            value={prices.pro}
            onChange={(e: any) => setPrices(p => ({ ...p, pro: e.target.value }))} />
          <Field label="Premium (DA/mois)" type="number" min="0"
            value={prices.premium}
            onChange={(e: any) => setPrices(p => ({ ...p, premium: e.target.value }))} />
        </div>
        <p className="text-[11px] text-white/20">S'affichent sur la page de tarifs et dans la page d'upgrade commerçant.</p>
        <SaveBtn onClick={() => saveSection('prices', { starter: 0, pro: Number(prices.pro), premium: Number(prices.premium) }, '💰 Prix mis à jour')}
          saving={saving === 'prices'} saved={saved === 'prices'} />
      </Section>

      {/* 2. LIMITES */}
      <Section title="Limites des plans" icon="📊">
        <div className="space-y-5">
          {(['starter', 'pro', 'premium'] as const).map(plan => (
            <div key={plan}>
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">{plan}</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Cartes max" type="number" min="1"
                  value={limits[plan].cards}
                  onChange={(e: any) => setLimits(l => ({ ...l, [plan]: { ...l[plan], cards: Number(e.target.value) } }))} />
                <Field label="Clients max" type="number" min="1"
                  hint={plan === 'premium' ? '99999 = illimité' : ''}
                  value={limits[plan].clients}
                  onChange={(e: any) => setLimits(l => ({ ...l, [plan]: { ...l[plan], clients: Number(e.target.value) } }))} />
              </div>
            </div>
          ))}
        </div>
        <SaveBtn onClick={() => saveSection('limits', limits, '📊 Limites mises à jour')}
          saving={saving === 'limits'} saved={saved === 'limits'} />
      </Section>

      {/* 3. CONTACT */}
      <Section title="Informations de contact" icon="📧">
        <Field label="Email de contact" type="email" value={contact.email}
          onChange={(e: any) => setContact(c => ({ ...c, email: e.target.value }))} />
        <Field label="Téléphone (optionnel)" type="tel" value={contact.phone} placeholder="0555 00 00 00"
          onChange={(e: any) => setContact(c => ({ ...c, phone: e.target.value }))} />
        <SaveBtn onClick={() => saveSection('contact', contact, '📧 Contact mis à jour')}
          saving={saving === 'contact'} saved={saved === 'contact'} />
      </Section>

      {/* 4. MOT DE PASSE */}
      <Section title="Changer le mot de passe admin" icon="🔒">
        <Field label="Mot de passe actuel" type="password" value={pwForm.current} placeholder="••••••••"
          onChange={(e: any) => setPwForm(f => ({ ...f, current: e.target.value }))} />
        <Field label="Nouveau mot de passe" type="password" value={pwForm.newPw} placeholder="••••••••" hint="Minimum 8 caractères"
          onChange={(e: any) => setPwForm(f => ({ ...f, newPw: e.target.value }))} />
        <Field label="Confirmer" type="password" value={pwForm.confirm} placeholder="••••••••"
          onChange={(e: any) => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
        {pwError && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">❌ {pwError}</div>
        )}
        <SaveBtn onClick={savePassword} saving={saving === 'password'} saved={saved === 'password'} />
      </Section>

      {/* 5. MAINTENANCE */}
      <Section title="Mode maintenance" icon="🚫">
        <Toggle
          value={maintenance} onChange={setMaintenance}
          labelOn="🔴 Plateforme en maintenance — commerçants bloqués"
          labelOff="🟢 Plateforme en ligne — tout fonctionne"
          colorOn="bg-red-500"
        />
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Message affiché aux commerçants</label>
          <textarea value={maintenanceMsg} onChange={e => setMaintenanceMsg(e.target.value)} rows={2}
            className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition resize-none" />
        </div>
        <SaveBtn onClick={() => saveSection('maintenance', { active: maintenance, message: maintenanceMsg }, maintenance ? '🚫 Maintenance activée' : '✅ Plateforme en ligne')}
          saving={saving === 'maintenance'} saved={saved === 'maintenance'} />
      </Section>

      {/* 6. MESSAGE GLOBAL */}
      <Section title="Message global aux commerçants" icon="📢">
        <Toggle
          value={globalMsgActive} onChange={setGlobalMsgActive}
          labelOn="🟢 Message actif — affiché dans tous les dashboards"
          labelOff="⚫ Message désactivé"
        />
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Contenu du message</label>
          <textarea value={globalMsg} onChange={e => setGlobalMsg(e.target.value)} rows={3}
            placeholder="Ex: 🎉 Nouvelle fonctionnalité disponible ! Découvrez les étiquettes de livraison..."
            className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition resize-none" />
        </div>
        <p className="text-[11px] text-white/20">Ce message apparaît en bannière jaune dans le dashboard de chaque commerçant.</p>
        <SaveBtn onClick={() => saveSection('global_message', { active: globalMsgActive, text: globalMsg }, globalMsgActive ? '📢 Message activé' : '📢 Message désactivé')}
          saving={saving === 'globalMsg'} saved={saved === 'globalMsg'} />
      </Section>

    </div>
  )
}
