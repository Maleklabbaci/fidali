'use client'

import { useState } from 'react'

const Field = ({ label, ...props }: any) => (
  <div>
    <label className="block text-xs text-white/30 mb-1.5">{label}</label>
    <input {...props} className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition" />
  </div>
)

export default function SettingsPage() {
  const [saved, setSaved] = useState<string | null>(null)

  const save = (section: string) => {
    setSaved(section)
    setTimeout(() => setSaved(null), 2000)
  }

  const plans = [
    { name: 'Starter', price: 'Gratuit', cards: '1 carte', clients: '50 clients', color: 'text-white/60' },
    { name: 'Pro', price: '4 500 DA / mois', cards: '5 cartes', clients: 'Illimité', color: 'text-blue-400' },
    { name: 'Premium', price: '9 000 DA / mois', cards: 'Illimité', clients: 'Illimité', color: 'text-violet-400' },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        <p className="text-sm text-white/30 mt-0.5">Configuration de la plateforme</p>
      </div>

      {/* General */}
      <section className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <p className="text-sm font-semibold text-white/70">Général</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nom de la plateforme" type="text" defaultValue="Fidali" />
            <Field label="Email de contact" type="email" defaultValue="contact@fidali.dz" />
          </div>
          <Field label="URL de la plateforme" type="text" defaultValue="https://fidali.dz" />
          <div className="flex justify-end pt-1">
            <button onClick={() => save('general')}
              className="px-5 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-white/90 transition">
              {saved === 'general' ? '✓ Sauvegardé' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </section>

      {/* Payment info */}
      <section className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <p className="text-sm font-semibold text-white/70">Informations de paiement</p>
          <p className="text-xs text-white/25 mt-0.5">Affichées aux commerçants lors du règlement</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <Field label="Numéro CCP" type="text" defaultValue="00799999XX clé XX" />
          <Field label="Numéro BaridiMob" type="text" defaultValue="00799999XXXXXXXXXX" />
          <Field label="Nom du bénéficiaire" type="text" defaultValue="Fidali DZ" />
          <div className="flex justify-end pt-1">
            <button onClick={() => save('payment')}
              className="px-5 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-white/90 transition">
              {saved === 'payment' ? '✓ Sauvegardé' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </section>

      {/* Plans (read-only overview) */}
      <section className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <p className="text-sm font-semibold text-white/70">Tarification</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {plans.map((p, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className={`text-sm font-semibold ${p.color}`}>{p.name}</p>
                <span className="text-xs text-white/25">{p.cards} · {p.clients}</span>
              </div>
              <span className="text-sm text-white/60 font-medium">{p.price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Danger zone */}
      <section className="bg-red-500/[0.03] border border-red-500/[0.12] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-red-500/[0.08]">
          <p className="text-sm font-semibold text-red-400/80">Zone dangereuse</p>
        </div>
        <div className="px-6 py-5 divide-y divide-red-500/[0.06] space-y-0">
          {[
            { label: 'Mode maintenance', desc: "Désactive l'accès commerçants", btn: 'Activer', style: 'text-amber-400 hover:bg-amber-500/10' },
            { label: 'Réinitialiser les statistiques', desc: 'Remet tous les compteurs à zéro', btn: 'Réinitialiser', style: 'text-red-400 hover:bg-red-500/10' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-white/70">{item.label}</p>
                <p className="text-xs text-white/25 mt-0.5">{item.desc}</p>
              </div>
              <button className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${item.style}`}>
                {item.btn}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
