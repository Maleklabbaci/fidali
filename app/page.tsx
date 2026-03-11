'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [merchantCount, setMerchantCount] = useState(0)

  useEffect(() => {
    // Animation compteur
    let count = 0
    const interval = setInterval(() => {
      count += Math.ceil(Math.random() * 5)
      if (count >= 150) { count = 150; clearInterval(interval) }
      setMerchantCount(count)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* ========== NAVBAR ========== */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              F
            </div>
            <span className="text-xl font-extrabold text-gray-900">Fidali</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition">
              Fonctionnalités
            </a>
            <a href="#how" className="text-sm text-gray-500 hover:text-gray-900 transition">
              Fonctionnement
            </a>
            <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition">
              Tarifs
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Se connecter
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition"
            >
              Commencer
            </button>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-sm text-blue-700 font-medium mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Programme de fidélité digital
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
            Fidélisez vos clients,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              simplement.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Remplacez les cartes papier par une solution digitale élégante.
            Vos clients collectent des points en scannant un QR code.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={() => router.push('/signup')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl text-lg font-bold hover:opacity-90 transition shadow-xl shadow-blue-500/25"
            >
              🚀 Créer mon programme
            </button>
            <button
              onClick={() => router.push('/join')}
              className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl text-lg font-bold hover:bg-gray-200 transition"
            >
              📱 Je suis client
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="flex -space-x-2">
              {['👨‍🍳', '💇', '🧁', '☕'].map((e, i) => (
                <div key={i} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm border-2 border-white">
                  {e}
                </div>
              ))}
            </div>
            <span>Utilisé par <strong className="text-gray-600">{merchantCount}+</strong> commerçants</span>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-gray-500">
              Une plateforme complète, conçue pour les commerçants algériens.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎨',
                title: 'Carte personnalisable',
                desc: 'Choisissez vos couleurs, votre récompense et vos règles de points.',
              },
              {
                icon: '📱',
                title: 'QR Code intelligent',
                desc: 'Un simple scan suffit. Fonctionne sur tous les téléphones, sans app.',
              },
              {
                icon: '🔒',
                title: 'Validation sécurisée',
                desc: 'Chaque visite doit être confirmée par vous. Anti-fraude intégré.',
              },
              {
                icon: '📊',
                title: 'Tableau de bord',
                desc: 'Suivez vos clients, points et récompenses en temps réel.',
              },
              {
                icon: '🔔',
                title: 'Notifications live',
                desc: 'Alerte instantanée quand un client scanne votre QR code.',
              },
              {
                icon: '🎁',
                title: 'Récompenses auto',
                desc: 'Points max atteints = récompense débloquée automatiquement.',
              },
            ].map((feat, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-gray-500">3 étapes simples pour démarrer</p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Créez votre carte',
                desc: 'Inscrivez-vous et configurez votre carte de fidélité en 2 minutes.',
                icon: '🃏',
              },
              {
                step: '2',
                title: 'Affichez le QR Code',
                desc: 'Imprimez ou affichez le QR code dans votre commerce.',
                icon: '📲',
              },
              {
                step: '3',
                title: 'Validez les visites',
                desc: 'Vos clients scannent, vous confirmez. Les points s\'accumulent !',
                icon: '✅',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {item.icon} {item.title}
                  </h3>
                  <p className="text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Commencez gratuitement
            </h2>
            <p className="text-lg text-gray-500">
              Pas d&apos;engagement. Évoluez quand vous êtes prêt.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: 'Gratuit',
                period: 'pour toujours',
                features: ['1 carte de fidélité', '50 clients max', 'QR Code', 'Dashboard basique'],
                cta: 'Commencer',
                popular: false,
              },
              {
                name: 'Pro',
                price: '4 500',
                period: 'DA / mois',
                features: [
                  '5 cartes de fidélité',
                  'Clients illimités',
                  'Statistiques avancées',
                  'Support prioritaire',
                  'Personnalisation complète',
                  'Export PDF',
                ],
                cta: 'Choisir Pro',
                popular: true,
              },
              {
                name: 'Premium',
                price: '9 000',
                period: 'DA / mois',
                features: [
                  'Cartes illimitées',
                  'Tout illimité',
                  'API & intégrations',
                  'Support dédié',
                  'Multi-branches',
                  'Rapports avancés',
                ],
                cta: 'Choisir Premium',
                popular: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-6 shadow-sm relative ${
                  plan.popular ? 'border-2 border-blue-500 shadow-xl scale-105' : 'border border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ⭐ Populaire
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500 ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/signup')}
                  className={`w-full py-3 rounded-xl font-bold transition ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Prêt à fidéliser vos clients ?
          </h2>
          <p className="text-lg text-gray-500 mb-8">
            Créez votre programme de fidélité en moins de 2 minutes.
          </p>
          <button
            onClick={() => router.push('/signup')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl text-lg font-bold hover:opacity-90 transition shadow-xl shadow-blue-500/25"
          >
            🚀 Créer mon programme gratuitement
          </button>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-sm font-bold">
                  F
                </div>
                <span className="text-lg font-bold">Fidali</span>
              </div>
              <p className="text-gray-400 text-sm">
                La solution de fidélité digitale pour les commerçants algériens.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-3 text-sm">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Tarifs</a></li>
                <li><a href="#how" className="hover:text-white transition">Comment ça marche</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 text-sm">Accès</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/login" className="hover:text-white transition">Se connecter</a></li>
                <li><a href="/signup" className="hover:text-white transition">S&apos;inscrire</a></li>
                <li><a href="/join" className="hover:text-white transition">Espace client</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 text-sm">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 contact@fidali.dz</li>
                <li>📱 0555 XX XX XX</li>
                <li>📍 Algérie</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Fidali. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
