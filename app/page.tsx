'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-white">🎯 Fidali</h1>
        <button
          onClick={() => router.push('/login')}
          className="px-5 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-medium"
        >
          Connexion
        </button>
      </nav>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-32">
        <div className="text-6xl mb-6">💳</div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Carte de fidélité digitale
        </h2>
        <p className="text-xl text-white/80 mb-10 max-w-xl">
          Créez votre programme de fidélité en quelques clics.
          Vos clients collectent des points depuis leur téléphone.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-bold text-lg hover:bg-gray-100 transition shadow-xl"
          >
            🏪 Espace Commerçant
          </button>
          <button
            onClick={() => router.push('/join')}
            className="px-8 py-4 bg-white/20 text-white border-2 border-white/40 rounded-2xl font-bold text-lg hover:bg-white/30 transition"
          >
            📱 Rejoindre une carte
          </button>
        </div>
      </main>

      {/* Features */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comment ça marche ?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎨',
                title: 'Créez votre carte',
                desc: 'Personnalisez les couleurs, la récompense et les règles de points.',
              },
              {
                icon: '📲',
                title: 'Partagez le QR Code',
                desc: 'Vos clients scannent et rejoignent votre programme en 2 secondes.',
              },
              {
                icon: '🎁',
                title: 'Fidélisez vos clients',
                desc: 'Ils collectent des points à chaque visite et gagnent des récompenses.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tarifs simples
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                plan: 'Starter',
                price: 'Gratuit',
                features: ['1 carte de fidélité', 'Jusqu\'à 50 clients', 'Statistiques basiques'],
                cta: 'Commencer',
                highlight: false,
              },
              {
                plan: 'Pro',
                price: '4 500 DA/mois',
                features: ['5 cartes de fidélité', 'Clients illimités', 'Statistiques avancées', 'Support prioritaire'],
                cta: 'Essayer Pro',
                highlight: true,
              },
              {
                plan: 'Premium',
                price: '9 000 DA/mois',
                features: ['Cartes illimitées', 'Clients illimités', 'API & intégrations', 'Support dédié'],
                cta: 'Contacter',
                highlight: false,
              },
            ].map((tier, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 text-center ${
                  tier.highlight
                    ? 'bg-blue-600 text-white shadow-2xl scale-105'
                    : 'bg-white text-gray-900 shadow-lg'
                }`}
              >
                <h4 className="text-lg font-bold mb-2">{tier.plan}</h4>
                <div className="text-3xl font-extrabold mb-6">{tier.price}</div>
                <ul className="space-y-2 mb-8 text-sm">
                  {tier.features.map((f, j) => (
                    <li key={j} className={tier.highlight ? 'text-white/90' : 'text-gray-600'}>
                      ✅ {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/login')}
                  className={`w-full py-3 rounded-xl font-bold transition ${
                    tier.highlight
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white/60 text-center py-8 text-sm">
        <p>© 2025 Fidali — Programme de fidélité digital 🇩🇿</p>
      </footer>
    </div>
  )
}
