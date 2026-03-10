'use client'

import React from 'react'

interface UpgradeFunnelProps {
  isOpen: boolean
  onClose: () => void
}

export const UpgradeFunnel: React.FC<UpgradeFunnelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-2">Passez à Pro 🚀</h2>
        <p className="text-gray-500 mb-6">
          Débloquez toutes les fonctionnalités pour votre programme de fidélité.
        </p>
        <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
          <li>✅ Clients illimités</li>
          <li>✅ Personnalisation avancée</li>
          <li>✅ Statistiques détaillées</li>
          <li>✅ Support prioritaire</li>
        </ul>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Plus tard
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
            Upgrader maintenant
          </button>
        </div>
      </div>
    </div>
  )
}
