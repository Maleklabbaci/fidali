'use client'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold">⚙️ Paramètres</h2>
        <p className="text-gray-500 text-sm">Configuration de la plateforme</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* General */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            🌐 Général
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom de la plateforme</label>
              <input
                type="text"
                defaultValue="Fidali"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email de contact</label>
              <input
                type="email"
                defaultValue="contact@fidali.dz"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-sm font-bold hover:from-red-500 hover:to-rose-500 transition">
              Sauvegarder
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            💎 Tarification
          </h3>
          <div className="space-y-4">
            {[
              { plan: 'Starter', price: 0, cards: 1, clients: 50 },
              { plan: 'Pro', price: 4500, cards: 5, clients: -1 },
              { plan: 'Premium', price: 9000, cards: -1, clients: -1 },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                <div>
                  <span className="font-bold text-sm">{p.plan}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {p.cards === -1 ? '∞' : p.cards} cartes • {p.clients === -1 ? '∞' : p.clients} clients
                  </span>
                </div>
                <span className="text-sm font-bold text-green-400">
                  {p.price === 0 ? 'Gratuit' : `${p.price.toLocaleString()} DA`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment info */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            💳 Infos de paiement
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">CCP</label>
              <input
                type="text"
                defaultValue="00799999XX clé XX"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">BaridiMob</label>
              <input
                type="text"
                defaultValue="00799999XXXXXXXXXX"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-sm font-bold hover:from-red-500 hover:to-rose-500 transition">
              Sauvegarder
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-red-400">
            ⚠️ Zone dangereuse
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Mode maintenance</p>
                <p className="text-xs text-gray-500">Désactive l&apos;accès aux commerçants</p>
              </div>
              <button className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition">
                Activer
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Réinitialiser les stats</p>
                <p className="text-xs text-gray-500">Remet tous les compteurs à zéro</p>
              </div>
              <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition">
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
