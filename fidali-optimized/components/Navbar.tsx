'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'

interface NavbarProps {
  mode: 'landing' | 'dashboard' | 'admin' | 'join' | 'wallet'
  onOpenAuth?: () => void
  onLogout?: () => void
  onGoHome?: () => void
}

export function Navbar({ mode, onOpenAuth, onLogout, onGoHome }: NavbarProps) {
  const merchant = useStore(s => s.getCurrentMerchant())
  const isDark = mode === 'dashboard' || mode === 'admin'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[999] h-[60px] px-4 md:px-8 flex items-center justify-between transition-all duration-300 ${
      isDark
        ? 'bg-dark-4/97 border-b border-white/[0.08] backdrop-blur-lg'
        : 'bg-surface/95 border-b border-brand-orange/[0.08] backdrop-blur-lg'
    }`}>
      {/* Left */}
      <div className="flex items-center gap-2">
        <button
          onClick={onGoHome}
          className="font-display text-2xl text-brand-orange flex items-center gap-1.5 cursor-pointer"
        >
          Fida<span className={isDark ? 'text-white' : 'text-dark'}>li</span>
          <div className="w-[7px] h-[7px] rounded-full bg-brand-orange animate-pulse-dot" />
        </button>
      </div>

      {/* Center links (landing only) */}
      {mode === 'landing' && (
        <ul className="hidden md:flex gap-6 list-none">
          <li><a href="#comment" className="no-underline text-dark font-bold text-sm hover:text-brand-orange transition-colors">Comment ça marche</a></li>
          <li><a href="#creer" className="no-underline text-dark font-bold text-sm hover:text-brand-orange transition-colors">Créer une carte</a></li>
          <li><a href="#tarifs" className="no-underline text-dark font-bold text-sm hover:text-brand-orange transition-colors">Tarifs</a></li>
        </ul>
      )}

      {/* Right */}
      <div className="flex items-center gap-2">
        {mode === 'landing' && (
          <>
            <button
              onClick={() => onOpenAuth?.()}
              className="px-4 py-2 rounded-[10px] font-bold text-sm border-2 border-gray-200 bg-transparent text-dark hover:border-brand-orange hover:text-brand-orange transition-all cursor-pointer"
            >
              Connexion
            </button>
            <button
              onClick={() => onOpenAuth?.()}
              className="px-4 py-2 rounded-[10px] font-bold text-sm bg-brand-orange text-white shadow-lg shadow-brand-orange/35 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-orange/45 transition-all cursor-pointer border-none"
            >
              Essai Gratuit 🚀
            </button>
          </>
        )}

        {(mode === 'dashboard' || mode === 'admin') && merchant && (
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] rounded-[10px] bg-gradient-to-br from-brand-orange to-brand-orange-light text-white flex items-center justify-center font-extrabold text-sm">
              {merchant.name.charAt(0)}
            </div>
            <span className="hidden md:inline font-bold text-sm text-white">
              {merchant.business}
            </span>
            {mode === 'admin' && (
              <span className="bg-brand-red text-white px-2 py-0.5 rounded-md text-[10px] font-extrabold">
                ADMIN
              </span>
            )}
            <button
              onClick={onLogout}
              className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-[12px] font-bold text-white/40 hover:border-brand-red hover:text-brand-red transition-all cursor-pointer"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
