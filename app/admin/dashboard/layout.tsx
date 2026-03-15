'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const NAV = [
  { icon: '📊', label: "Accueil", path: '/admin/dashboard' },
  { icon: '👥', label: 'Commerçants', path: '/admin/dashboard/merchants' },
  { icon: '💳', label: 'Paiements', path: '/admin/dashboard/payments' },
  { icon: '📈', label: 'Stats', path: '/admin/dashboard/stats' },
  { icon: '⚙️', label: 'Réglages', path: '/admin/dashboard/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [paymentCount, setPaymentCount] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('admin')
    if (!stored) { router.push('/admin'); return }
    setAdmin(JSON.parse(stored))
  }, [router])

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const res = await fetch('/api/admin/badges')
        if (res.ok) {
          const { pending, payments } = await res.json()
          setPendingCount(pending || 0)
          setPaymentCount(payments || 0)
        }
      } catch {}
    }
    loadBadges()
    const id = setInterval(loadBadges, 15000)
    return () => clearInterval(id)
  }, [])

  if (!admin) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-700 border-t-white rounded-full animate-spin" />
    </div>
  )

  const currentPage = NAV.find(n => n.path === pathname)
  const getBadge = (path: string) => {
    if (path === '/admin/dashboard/merchants') return pendingCount
    if (path === '/admin/dashboard/payments') return paymentCount
    return 0
  }

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Header Mobile */}
      <header className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">F</span>
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900">Fidali Admin</h1>
              <p className="text-xs text-slate-500">{currentPage?.label}</p>
            </div>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex-col z-40">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">F</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">Fidali</h1>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.path
            const badge = getBadge(item.path)
            return (
              <button key={item.path} onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {badge > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-slate-600 font-bold text-xs">{(admin.name || admin.email || 'A')[0].toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{admin.name || admin.email}</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem('admin'); router.push('/admin') }}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Menu Mobile Overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setMenuOpen(false)}>
          <div className="bg-white w-64 h-full p-4 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-slate-600 font-bold text-xs">{(admin.name || admin.email || 'A')[0].toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{admin.name || 'Admin'}</p>
                  <p className="text-xs text-slate-500">{admin.email}</p>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-1">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-1">
              {NAV.map((item) => {
                const active = pathname === item.path
                const badge = getBadge(item.path)
                return (
                  <button key={item.path} onClick={() => { router.push(item.path); setMenuOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                      active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}>
                    <span className="text-lg">{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {badge > 0 && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        active ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
            <button onClick={() => { localStorage.removeItem('admin'); router.push('/admin') }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition border-t border-slate-200 pt-4 mt-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pb-20 lg:pb-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <div className="grid grid-cols-5 gap-1 p-2">
          {NAV.map((item) => {
            const active = pathname === item.path
            const badge = getBadge(item.path)
            return (
              <button key={item.path} onClick={() => router.push(item.path)}
                className={`relative flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition ${
                  active ? 'bg-slate-900' : 'hover:bg-slate-100'
                }`}>
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
                <span className={`text-xl ${active ? '' : 'grayscale opacity-60'}`}>{item.icon}</span>
                <span className={`text-xs font-medium ${active ? 'text-white' : 'text-slate-600'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

    </div>
  )
}
