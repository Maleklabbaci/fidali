'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { SECTORS } from '@/types'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onLogin: (email: string, password: string) => void
  onSignup: (data: { name: string; business: string; sector: string; phone: string; email: string; password: string }) => void
  error?: string
}

export function AuthModal({ open, onClose, onLogin, onSignup, error }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [sName, setSName] = useState('')
  const [sBiz, setSBiz] = useState('')
  const [sSector, setSSector] = useState('restaurant')
  const [sPhone, setSPhone] = useState('')
  const [sEmail, setSEmail] = useState('')
  const [sPass, setSPass] = useState('')

  const handleLogin = () => {
    if (!loginEmail || !loginPass) return
    onLogin(loginEmail, loginPass)
  }

  const handleSignup = () => {
    if (!sName || !sBiz || !sEmail || !sPass) return
    if (sPass.length < 6) return
    onSignup({ name: sName, business: sBiz, sector: sSector, phone: sPhone, email: sEmail, password: sPass })
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') action()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="font-display text-xl text-center mb-1">
        {tab === 'login' ? 'Connexion 🔑' : 'Inscription 🚀'}
      </h2>
      <p className="text-center text-gray-400 text-sm font-medium mb-4">
        {tab === 'login' ? 'Accédez à votre espace' : 'Créez votre compte commerçant'}
      </p>

      {/* Tabs */}
      <div className="flex rounded-[10px] bg-gray-100 p-[3px] mb-4">
        <button
          onClick={() => setTab('login')}
          className={`flex-1 py-2 text-center font-bold text-sm rounded-lg border-none cursor-pointer transition-all ${
            tab === 'login' ? 'bg-brand-orange text-white shadow-md' : 'bg-transparent text-gray-400'
          }`}
        >
          Connexion
        </button>
        <button
          onClick={() => setTab('signup')}
          className={`flex-1 py-2 text-center font-bold text-sm rounded-lg border-none cursor-pointer transition-all ${
            tab === 'signup' ? 'bg-brand-orange text-white shadow-md' : 'bg-transparent text-gray-400'
          }`}
        >
          Inscription
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-brand-red text-xs font-semibold text-center p-2 bg-red-50 rounded-lg border border-red-100 mb-3">
          ⚠️ {error}
        </div>
      )}

      {/* Login */}
      {tab === 'login' && (
        <div>
          <div className="mb-3">
            <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Email</label>
            <input
              type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
              onKeyDown={e => handleKeyDown(e, handleLogin)}
              placeholder="votre@email.com"
              className="w-full p-2.5 px-3.5 border-2 border-gray-200 rounded-[10px] font-semibold text-sm outline-none focus:border-brand-orange focus:bg-white transition-all bg-gray-50"
            />
          </div>
          <div className="mb-3">
            <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Mot de passe</label>
            <input
              type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)}
              onKeyDown={e => handleKeyDown(e, handleLogin)}
              placeholder="••••••••"
              className="w-full p-2.5 px-3.5 border-2 border-gray-200 rounded-[10px] font-semibold text-sm outline-none focus:border-brand-orange focus:bg-white transition-all bg-gray-50"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full p-3 rounded-[10px] bg-brand-orange text-white font-extrabold text-sm border-none cursor-pointer shadow-lg shadow-brand-orange/35 hover:-translate-y-0.5 hover:shadow-xl transition-all mt-1"
          >
            Se connecter →
          </button>
        </div>
      )}

      {/* Signup */}
      {tab === 'signup' && (
        <div>
          <div className="p-2.5 px-3.5 rounded-[10px] text-xs font-semibold mb-3 bg-green-50 text-green-700 border border-green-100">
            💡 Pour tous les commerçants — Restaurants, boutiques, salons, e-commerce...
          </div>

          <div className="mb-3">
            <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Votre nom</label>
            <input type="text" value={sName} onChange={e => setSName(e.target.value)} placeholder="Votre nom complet"
              className="w-full p-2.5 px-3.5 border-2 border-gray-200 rounded-[10px] font-semibold text-sm outline-none focus:border-brand-orange focus:bg-white transition-all bg-gray-50" />
          </div>

          <div className="mb-3">
            <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Nom du commerce</label>
            <input type="text" value={sBiz} onChange={e => setSBiz(e.target.value)} placeholder="Mon Commerce 🏪"
              className="w-full p-2.5 px-3.5 border-2 border-gray-200 rounded-[10px] font-semibold text-sm outline-none focus:border-brand-orange focus:bg-white transition-all bg-gray-50" />
          </div>

          <div className="mb-3">
            <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Secteur d'activité</label>
            <select value={sSector} onChange={e => setSSector(e.target.value)}
              className="w-full p-2.5 px-3.5 border-2 border-gray-200 rounded-[10px] font-semibold text-sm outline-none focus:border-brand-orange focus:bg-white transition-all bg-gray-50">
              {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Téléphone</label>
            <input type="tel" value={sPhone} onChange={e => setSPhone(e.target.value)} placeholder="0555 XX XX XX"
              className="w-full p-2.5 px-3.5 border-2 border-gray-200 rounded-[10px] font-semibold text-sm outline-none focus:border-brand-orange focus:bg-white transition-all bg-gray-50" />
          </div>

          <div className="mb-3">
            <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Email</label>
            <input type="email" value={sEmail} onChange={e => setSEmail(e.target.value)} placeholder="votre@email.com"
              onKeyDown={e => handleKeyDown(e, handleSignup)}
              className="w-full p-2.5 px-3.5 border-2 border-gray-200 rounded-[10px] font-semibold text-sm outline-none focus:border-brand-orange focus:bg-white transition-all bg-gray-50" />
          </div>

          <div className="mb-3">
            <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Mot de passe</label>
            <input type="password" value={sPass} onChange={e => setSPass(e.target.value)} placeholder="Min. 6 caractères"
              onKeyDown={e => handleKeyDown(e, handleSignup)}
              className="w-full p-2.5 px-3.5 border-2 border-gray-200 rounded-[10px] font-semibold text-sm outline-none focus:border-brand-orange focus:bg-white transition-all bg-gray-50" />
          </div>

          <button
            onClick={handleSignup}
            className="w-full p-3 rounded-[10px] bg-brand-orange text-white font-extrabold text-sm border-none cursor-pointer shadow-lg shadow-brand-orange/35 hover:-translate-y-0.5 hover:shadow-xl transition-all mt-1"
          >
            Créer mon compte 🎉
          </button>
        </div>
      )}
    </Modal>
  )
}
